# 100세그먼트 분리 발송 — 오케스트레이션 가이드

Adobe Campaign에서 **세그먼트마다 발송을 나누고**, 각 발송에 **콘텐츠(딥링크, MMS 이미지, 제목/본문 등)를 자동으로 넣는** 설계다.  
커스텀 API 채널의 콘텐츠 xpath는 `01_CustomChannelSetup.md`, `02_CustomChannelContract.md`를 따른다.

구현 코드가 아니라, **표가 무엇을 들고 워크플로가 어떤 순서로 도는지**를 적는다.

---

## 1. 이 설계가 하는 일

대상자는 세그먼트 약 100종류로 나뉜다. 세그먼트마다 문구·딥링크·이미지(MMS)가 다르고, **발송도 세그먼트마다 따로** 만든다. 콘솔에는 세그먼트별 Delivery가 보이며, 성공/실패·승인·재처리를 그 단위로 본다.

| 말 | 뜻 |
|---|---|
| 세그먼트 100개 | 대상 묶음 100종류 |
| 스플릿 100개 | 그 100종류를 **발송 100건**으로 나눔 |
| 콘텐츠 자동 적용 | 세그먼트 키로 스펙 표를 찾아 제목·URL·이미지를 Delivery에 넣음 |

한 사람이 여러 세그먼트에 동시에 들어가면, 스펙 `priority`가 더 작은(먼저인) **한 세그먼트만** 보낸다.

구성은 이렇게 고정한다.

- **채널마다 오케스트레이터 워크플로 1개.** 그 워크플로가 다음에 보낼 세그먼트를 슬롯(기본 2~3개)만큼 고른다.
- 고른 세그먼트마다 **템플릿을 복사해 Delivery 1건**을 만들고, 만드는 순간에 스펙 값을 콘텐츠 xpath에 넣는다.
- 보내는 순서는 스펙의 `priority` 숫자다.
- 한 주기에 100건을 다 시작하지 않는다. 빈 슬롯만 채우고, 끝난 Delivery를 다음 주기에 마감한 뒤 자리를 연다.

---

## 2. 용어

| 이 문서 말 | 캠페인 | 의미 |
|---|---|---|
| 세그먼트 | 대상 조건/키 | “이 사람들”의 이름. 예: `VIP`, `SLEEP30` |
| 세그먼트 키 | `segmentKey` | 스펙·멤버·잡을 잇는 문자열 |
| 스펙 | `cus:segmentSendSpec` | 채널·템플릿·문구·우선순위를 적어 둔 표. 세그먼트당 1행 |
| 멤버 | `cus:segmentMember` 또는 수신자 속성 | 그 세그먼트로 보낼 사람 |
| 잡 | `cus:sendJob` | 이 배치·이 세그의 발송이 어디쯤인지 추적 |
| Delivery | `nms:delivery` | 캠페인이 분석·발송하는 **발송 1건** |
| 템플릿 | Delivery template | 채널·라우팅·폼 뼈대. 문구는 비워 두고 찍을 때 스펙으로 채움 |
| 워크플로 | Workflow | Query, JS 등을 순서대로 실행하는 자동화 |
| 오케스트레이터 | 채널당 워크플로 1개 | 그 채널에서 세그를 고르고 Delivery를 만듦 |
| 시그널 | External signal | 다른 워크플로를 한 번 깨움 |
| 스케줄러 | Scheduler | 주기적으로 워크플로를 켬. 이 설계의 본선 주기는 **15분 이상** |
| 슬롯 | 동시 발송 한도 | 한 채널에서 한꺼번에 굴리는 Delivery 수. 기본 2~3 |
| Enrich | Enrichment | 멤버 행에 스펙 행을 붙임 |
| CreateFromModel | JS API | 템플릿을 복사해 새 Delivery를 만듦 |
| PrepareAndStart | Delivery 동작 | 대상 계산 + 콘텐츠 준비 + 발송 시작 |

---

## 3. 워크플로 지도

역할이 다른 워크플로만 둔다. LMS+MMS면 **WF-A + WF-B + WF-C = 3개**다.

| ID | 이름 | 개수 | 하는 일 | 켜지는 때 |
|---|---|---:|---|---|
| **WF-Prep** | 분배·준비 | 1 | Advisor 데이터·콘텐츠·잡 pending 저장 | Targeting Advisor 입고 / 운영 Run |
| **WF-B** | LMS 오케스트레이터 | 1 | LMS 세그의 Delivery를 만들고 보낸다 | WF-Prep 시그널(선택), 15분+ 스케줄 |
| **WF-C** | MMS 오케스트레이터 | 1 | MMS만. 순서는 WF-B와 같음 | 동일 |
| **WF-D** | 그 외 채널 | 채널당 1 | 이메일 등. 순서는 WF-B와 같음 | 동일 |

연동은 두 가지다.

1. WF-Prep이 끝난 뒤 WF-B/C에 **External signal** (없어도 됨. 스케줄만으로 돌아감)
2. WF-B/C가 **스펙·멤버·잡 테이블**과 **Delivery 상태**를 읽음

WF-B와 WF-C는 서로를 호출하지 않는다. 각자 `channel`이 맞는 행만 본다.

```
[ 외부 파일 / ETL ]
        │
        ▼
[ WF-Prep 분배·준비 ]
        │
        ├─► 멤버 테이블에 명단 기록
        │
        └─► (선택) 시그널 1회
                │
        ┌───────┴───────┐
        ▼               ▼
[ WF-B LMS ]      [ WF-C MMS ]
        │               │
        └───────┬───────┘
                │
                ├─► 스펙 / 멤버 / 잡 테이블 읽기·쓰기
                │   (같은 표, channel로 구분)
                │
                └─► nms:delivery 생성
```

시그널은 없어도 된다. WF-B/C는 스케줄러로 스스로 깨어 잡을 마감하고 다음 세그를 올린다.

---

## 4. 전체 로직 흐름

한 추출 배치 기준이다.

```
 1. 오늘 보낼 대상이 캠페인 밖으로 준비됨
                    │
                    ▼
 2. WF-Prep가 멤버 적재
    (recipientId + segmentKey + extractBatchId)
                    │
                    ▼
 3. 오케스트레이터를 지금 깨울까?
           ┌────────┴────────┐
           │ 시그널          │ 스케줄만
           ▼                 ▼
  WF-B / WF-C         다음 주기까지 대기
  External signal
           │                 │
           └────────┬────────┘
                    ▼
 4. 채널 오케스트레이터 시작
    (이미 실행 중이면 종료)
                    │
                    ▼
 5. 이 채널에서 진행 중인 잡 수를 셈
                    │
                    ▼
 6. 빈 슬롯이 있나?   (슬롯 = 2~3 − 진행 중)
           ┌────────┴────────┐
           │ 없음            │ 있음
           ▼                 ▼
    이번 주기 종료    7. 아직 안 보낸 세그를
                      priority 작은 숫자부터 N개
                             │
                             ▼
                      8. 세그마다 Delivery 생성
                         템플릿 복사
                         스펙 문구/URL 주입
                         그 세그 멤버만 대상
                             │
                             ▼
                      9. PrepareAndStart
                         잡에 deliveryId, state=started
                             │
                             ▼
                     10. 다음 주기:
                         Delivery가 finished/error면 잡 마감
                             │
                             └──► 다시 5번
```

### 4.1 시간 예 — LMS, 슬롯 2, 세그 5개

우선순위 A=1, B=2, C=3, D=4, E=5. 스케줄 15분.

| 시각 | 하는 일 | 진행 중 Delivery | 잡 |
|---|---|---|---|
| 10:00 | A, B 시작 | A, B | A/B = started |
| 10:15 | A 끝, B 진행. 빈 슬롯 1 → C 시작 | B, C | A=finished, B/C=started |
| 10:30 | B, C 끝. 빈 슬롯 2 → D, E 시작 | D, E | … |
| 10:45 | D, E 끝 | 없음 | 전원 finished |

---

## 5. 데이터

워크플로는 아래 표를 본다. 수신자에 이미 `segmentKey`가 있으면 멤버 테이블은 생략할 수 있다.

### 5.1 스펙 — `cus:segmentSendSpec`

이 세그를 어떤 채널·템플릿·문구로 보낼지.

| 필드 | 예 | 역할 |
|---|---|---|
| `segmentKey` | `VIP` | 조인 키 |
| `channel` | `lms` / `mms` | 어느 오케스트레이터가 가져가나 |
| `priority` | `10` | 작을수록 먼저 |
| `active` | `true` | 끄면 이번 배치에서 제외 |
| `templateId` | 템플릿 내부 이름 | CreateFromModel 대상 |
| `deeplinkUrl` | `https://…` | Delivery 콘텐츠 |
| `mmsImageUrl` | `https://…/img.jpg` | MMS일 때 |
| `subject` / `body` | 문구 | 제목·본문 |
| `windowStart` / `windowEnd` | 09:00~20:00 | 창 밖이면 고르지 않음 |
| `maxConcurrent` | `2` | 이 채널 슬롯. 채널 기본값으로 통일해도 됨 |
| `lastStartedAt` | 일시 | 같은 `priority`일 때 오래 안 보낸 쪽 먼저 |

처리량·affinity는 Delivery 템플릿, typology, MTA affinity에 둔다.

### 5.2 멤버 — `cus:segmentMember`

| 필드 | 예 | 역할 |
|---|---|---|
| `recipientId` | 수신자 PK | 누구 |
| `segmentKey` | `VIP` | 어느 스펙과 붙나 |
| `extractBatchId` | `20260903-01` | 오늘 추출 회차. 같은 회차를 두 번 돌려도 안전하게 하는 단위 |
| `eligible` | `true` | 제외 플래그 |

### 5.3 잡 — `cus:sendJob`

| 필드 | 예 | 역할 |
|---|---|---|
| `jobId` | 자동 | 한 줄 |
| `extractBatchId` | `20260903-01` | 어느 추출과 짝인가 |
| `segmentKey` | `VIP` | 어느 세그인가 |
| `channel` | `lms` | 어느 오케스트레이터가 만들었나 |
| `deliveryId` | Delivery PK | 캠페인 발송 객체 |
| `state` | 아래 | 지금 어디인가 |
| `errorMsg` | 텍스트 | Prepare 실패 원인 |

```
pending → preparing → started → finished
                              ↘ error
```

| state | 의미 |
|---|---|
| `pending` | 이 배치에서 보내야 하고, 아직 Delivery 없음 |
| `preparing` | CreateFromModel / Prepare 중 |
| `started` | PrepareAndStart 성공, 발송 중 |
| `finished` | Delivery가 끝났고 로그가 닫힘 |
| `error` | 이 세그만 실패. 다른 세그는 계속 |

그 채널 오케스트레이터만 `pending` → `preparing`으로 바꾼다.

### 5.4 표가 붙는 방식

```
 cus:segmentSendSpec          cus:segmentMember
 (스펙, 세그당 1행)            (누구를 그 세그로)
        │                            │
        │ segmentKey                 │ segmentKey
        │                            │ extractBatchId
        └────────────┬───────────────┘
                     ▼
              cus:sendJob
              (이 배치·이 세그 진행)
                     │
                     │ deliveryId
                     ▼
              nms:delivery
              (캠페인 발송 1건)
```

한 발송을 읽으면 **누구(멤버) + 무슨 문구(스펙) + 진행(잡) + 캠페인 객체(Delivery)** 가 한 줄로 이어진다.

---

## 6. WF-Prep — 분배·준비

Advisor/Targeting 데이터와 (선택) 콘텐츠를 표에 넣는다. 발송하지 않는다.  
`04_SegmentSplit_Explanation.md` 3장 흐름 참고.

### 6.1 언제 켜나

- 외부 파일 도착 (File collector)
- 일 배치 스케줄
- 상류 ETL 완료 시그널

가지마다 Scheduler는 1개만 둔다.

### 6.2 활동 순서

```
 Start / Scheduler / External signal
                    │
                    ▼
         이미 이 워크플로가 실행 중인가?
           ┌────────┴────────┐
           │ 예              │ 아니오
           ▼                 ▼
          End         파일 로드 또는 Query
                             │
                             ▼
                      검증: recipientId / segmentKey
                      빈 값 제거
                             │
                             ▼
                      Dedup: 같은 배치·같은 사람+세그
                             │
                             ▼
                      멤버 Upsert
                      extractBatchId, eligible=true
                             │
                             ▼
                      스펙 active=true 세그마다
                      sendJob pending 1행
                             │
                             ▼
                      오케스트레이터를 지금 깨울까?
           ┌────────┴────────┐
           │ 예              │ 아니오
           ▼                 ▼
  WF-B, WF-C에          End
  External signal
           │
           └──────► End
```

잡은 WF-A에서 미리 만드는 것을 기본으로 한다. 오케스트레이터가 나중에 만들어도 동작은 같다.

### 6.3 이 워크플로가 하는 일

| 함 | 하지 않음 |
|---|---|
| 멤버 적재 | Delivery 생성 |
| 잡 `pending` 생성 | 문구 주입 |
| 선택 시그널 | 채널별 발송 |

### 6.4 실패

파일 형식 오류·필수 키 누락이면 WF-A만 실패로 알리고 시그널을 보내지 않는다.  
반만 적재된 배치를 오케스트레이터가 집으면 빈 세그 또는 이전 잔여와 섞인다.

Workflow Supervisor 그룹으로 메일을 받는다.

### 6.5 시그널 Comment

시그널 활동 Advanced 탭 Comment에 호출 출처를 적는다.  
예: `호출: WF-A 적재 완료 / 대상: WF-B LMS`.

---

## 7. WF-B — LMS 오케스트레이터

LMS 채널의 오케스트레이터 1개.  
멤버와 스펙을 보고 빈 슬롯만큼 Delivery를 만들며, 이미 시작한 Delivery가 끝났으면 잡을 닫는다.

### 7.1 언제 켜나

- **Scheduler** (본선): 15분 이상. 마감·다음 세그. pending 없으면 빈 Run 스킵.
- **External signal** (선택): WF-Prep 끝 → 즉시 1 Run. pending 체크 생략 가능.

시그널만 있고 스케줄이 없으면 첫 슬롯 후 멈출 수 있다.  
한 가지에 Scheduler 두 개 직렬 금지.

### 7.2 활동 순서 (입구 + 본문)

Scheduler와 Signal은 **같은 입구**로 합친다. `04` 4~5장 참고.

```
 [Scheduler] ──┐
               ├──► ① isRunning? ──예──► End
 [Signal]   ───┘         │ 아니오
                         ▼
                   isRunning = true
                         │
               ② Scheduler 경로만:
                  pending 잡 있음? ──없음──► isRunning=false → End
                         │
               (Signal 경로는 ② 생략)
                         ▼
               ③ 발송 허용 시간? ──아니오──► isRunning=false → End
                         ▼
               ④ started Delivery → 잡 마감
                         ▼
               ⑤ Query + Enrich (멤버 + 스펙 + contentMaster)
                         ▼
               ⑥ JavaScript (7.3)
                         ▼
               isRunning = false → End
```

Run은 **PrepareAndStart 후 End**. MTA 발송 완료까지 Wait 하지 않는다.

### 7.3 JavaScript

1. **가드**  
   `channel != lms` 행은 무시. `extractBatchId`가 비었으면 종료.

2. **슬롯**  
   이 채널 잡 중 `started` 또는 `preparing` 개수 = `running`.  
   `slots = maxConcurrent - running`.  
   `slots <= 0`이면 종료.

3. **세그 선택**  
   이번 배치에서 아직 `preparing` / `started` / `finished`가 아닌 LMS 세그.  
   정렬: `priority` 오름차순, 같으면 `lastStartedAt` 오래된 순.  
   위에서 `slots`개.

4. **세그마다 Delivery 1건**  
   한 세그가 실패해도 다음 세그로 간다.

   - 잡이 없으면 `pending`을 만들고 바로 `preparing`
   - 같은 `extractBatchId + segmentKey`가 이미 `preparing` / `started` / `finished`면 건너뜀
   - 멤버 0명이면 Delivery를 만들지 않음
   - `nms.delivery.CreateFromModel(templateId)`
   - 스펙 + **contentMaster**의 subject, body, deeplinkUrl 등을 Delivery xpath에 넣음
   - 대상을 그 세그 멤버로 한정
   - `PrepareAndStart`
   - 잡에 `deliveryId`, `state = started`. 스펙 `lastStartedAt` 갱신

5. **로그**  
   고른 키, deliveryId, 건너뛴 이유를 남긴다. 매 수신자 행마다 `logInfo`를 쓰지 않는다.

### 7.4 이 워크플로가 하는 일

| 함 | 하지 않음 |
|---|---|
| LMS 잡 마감 | MMS Delivery 생성 |
| LMS Delivery 생성·시작 | 멤버 원본 파일 파싱 |
| 스펙 → 콘텐츠 주입 | 다른 채널 워크플로에 시그널 |
| 슬롯·우선순위 계산 | |

### 7.5 콘텐츠가 붙는 위치

채널당 템플릿은 1~소수. 세그먼트 문구는 스펙에 있다.

```
템플릿 (채널, 라우팅, 폼)
  + 스펙 한 행 (제목, 본문, 딥링크, 이미지)
  = 이번 세그의 Delivery
```

넣는 시점: **CreateFromModel 직후**, 또는 Automated delivery의 initialization script.

커스텀 Bulk 채널은 스키마에 선언된 xpath만 Prepare가 part로 만든다.  
스펙 필드와 delivery xpath 대조표를 미리 고정한다 (`02_CustomChannelContract.md` C2).

### 7.6 실패 시

| 상황 | 동작 |
|---|---|
| 세그 C Prepare 실패 | 잡 C = error. 다음 슬롯에서 D, E 진행 |
| Delivery는 시작됐으나 커넥터 오류 | 잡는 `started` 유지. 다음 주기에 Delivery 상태를 다시 봄 |
| 멤버 0 | Delivery 없음. 건너뛴 이유만 로그 |
| WF-B 전체 예외 | Supervisor 알림. 이미 `started`인 Delivery는 캠페인이 계속 보냄. 다음 주기는 마감부터 |

---

## 8. WF-C — MMS 오케스트레이터

순서는 7장과 같다. 다른 값만 바꾼다.

| 항목 | WF-B LMS | WF-C MMS |
|---|---|---|
| 스펙 필터 | `channel = lms` | `channel = mms` |
| 템플릿 | LMS 템플릿 | MMS 템플릿 |
| 주입 필드 | 제목, 본문, 딥링크 | + `mmsImageUrl` |
| 슬롯 | LMS `maxConcurrent` | MMS `maxConcurrent`. 이미지가 무거우면 2 |
| 시그널 | `signalLmsOrch` | `signalMmsOrch` |

워크플로는 Duplicate로 만든다.

```
  멤버 테이블          스펙 (channel=mms)
       │                      │
       └──────────┬───────────┘
                  ▼
           [ WF-C 활동 = 7.2와 동일 ]
                  │
          ┌───────┴───────┐
          ▼               ▼
   잡 (channel=mms)   MMS Delivery
```

테이블은 공유하고 행은 `channel`로 가른다.  
같은 마케팅 묶음을 LMS와 MMS로 모두 보내면 스펙을 두 행으로 두거나 키를 `VIP_LMS` / `VIP_MMS`로 나눈다. 한 행이 두 채널을 겸하지 않는다.

---

## 9. WF-D — 그 외 채널

이메일·푸시 등도 “세그먼트 = Delivery 1건”이면 WF-B를 채널당 한 번 더 복제한다.

---

## 10. 워크플로 연동

```
시간
 │
 │  WF-A 적재
 │    ├─► 멤버: 오늘 명단 Upsert
 │    ├─► 잡: 세그별 pending
 │    └─► (선택) WF-B, WF-C에 External signal
 │
 │  WF-B LMS                    WF-C MMS
 │  (서로 호출하지 않음)         (WF-B와 동일, MMS만)
 │    │
 │    ├─► 잡: started 건의 Delivery 상태 조회
 │    ├─► nms:delivery 상태가 finished/error면 잡 마감
 │    ├─► 멤버 + 스펙 Enrich
 │    ├─► Delivery 생성 (CreateFromModel + 콘텐츠 주입 + Start)
 │    └─► 잡: deliveryId, state=started
 │
 ▼
```

- 호출: A → B, A → C (시그널을 쓸 때). B와 C 사이 없음. B → A 없음.
- 공유: 테이블과 Delivery `@state`.
- 마감: 다음 스케줄이 Delivery 상태를 읽어 잡을 닫고, 빈 슬롯에 다음 세그를 올린다.

---

## 11. 슬롯으로 세그를 고르는 예

이번 배치 LMS: A(1), B(2), C(3), D(4). `maxConcurrent = 2`.

**1회차** — 진행 0, 슬롯 2 → A, B 시작  
**2회차** — A 끝, B 진행, 슬롯 1 → C 시작  
**3회차** — B, C 끝, 슬롯 2 → D 시작

같은 `priority`면 `lastStartedAt`이 비었거나 오래된 세그를 먼저 넣는다.

---

## 12. Run vs Delivery · 보호 2중

**WF Run**과 **Delivery(MTA) 발송**은 별개다. Run #1이 End해도 Delivery는 `started`로 계속 발송된다.  
동일 워크플로 정의에 Run이 여러 개 뜰 수 있다. Adobe: *A single workflow can have several executions running at the same time* ([Monitor workflow execution](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/monitoring-workflows/monitor-workflow-execution)).

| 잠금 | 수단 | 막는 것 |
|---|---|---|
| Run | `instance.vars.isRunning` | 동시 Run 2개가 표/JS 동시 처리 |
| 세그 | sendJob `preparing/started/finished` | 같은 세그 Delivery 중복 |

---

## 13. 운영 규칙

| 규칙 | 내용 |
|---|---|
| 중첩 실행 금지 | 이전 런이 안 끝났으면 즉시 End. 두 실행이 같은 `pending`을 집지 않게 한다 |
| 사람당 세그 1개 | 적재 또는 Enrich 전에 `priority`가 작은 스펙을 승자로 남긴다 |
| 같은 배치 재실행 | `extractBatchId + segmentKey`가 이미 `preparing` / `started` / `finished`면 Delivery를 다시 만들지 않는다 |
| 빈 대상 | 멤버 0명이면 Delivery를 만들지 않는다 |
| 실패 단위 | Prepare 실패는 그 세그 잡만 `error`. 워크플로 전체를 멈추지 않는다 |
| 템플릿 | 채널당 1~소수. 문구는 스펙 |
| 관측 | Supervisor 메일. 로그에 segmentKey, jobId, deliveryId. 잡 `error`와 Delivery Audit를 같이 본다 |

프로덕션에서는 interim population 보관, SQL 로그 상시 ON, `Execute in the engine`을 쓰지 않는다.

---

## 14. 공식 출처

이 설계의 주기·동시 실행·복제 방식은 아래를 따른다.

- [Workflow best practices](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/introduction/workflow-best-practices) — 동시 워크플로, 캠페인 동시 처리, Scheduler 가지당 1, 시그널 Comment, Duplicate, Supervisor
- [Scheduler](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/wf-activities/flow-control-activities/scheduler) — 주기 15분 이상, 중첩 실행
- [Monitor workflow execution — Preventing simultaneous multiple executions](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/monitoring-workflows/monitor-workflow-execution)
- [Coordinate data updates](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/use-cases/data-management/coordinate-data-updates)
- 커스텀 채널 xpath: `02_CustomChannelContract.md`

---

## 15. 구현 전 확인

1. 세그먼트 키 100개와 채널·우선순위·문구가 스펙에 들어갈 수 있는가  
2. LMS/MMS 템플릿과 delivery 콘텐츠 xpath가 준비됐는가 (`01` / `02`)  
3. 한 사람이 여러 세그에 있을 때 승자 규칙을 고객이 봤는가  
4. 채널당 슬롯(2~3)과 스케줄(15분 이상)을 발송 창·예상 건수와 맞춰 보았는가  
5. WF-A가 실패하면 시그널을 보내지 않는가  
