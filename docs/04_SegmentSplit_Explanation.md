# 100세그 분리 발송 — 흐름 & 설명

미팅·공유용. 활동·JS 상세는 `03_SegmentSplitOrchestration.md`.

---

## 1. 한 장 요약

Targeting Advisor → Campaign **표 저장** → 채널별 **오케스트레이터 1개**가 세그마다 Delivery를 **2~3개씩** 순서대로 발송.  
문구는 **콘텐츠 마스터 표**에서 자동 주입.

---

## 2. 전체 흐름

```
Targeting Advisor
        │
        ▼
┌─────────────────┐
│ WF-Prep  분배·준비 │
└────────┬────────┘
         │  시그널 1회 (선택)
    ┌────┴────┐
    ▼         ▼
 WF-B LMS   WF-C MMS   ← 채널당 오케스트레이터 1개
    │         │
    └────┬────┘
         ▼
   nms:delivery (세그당 1건)
```

| 워크플로 | 역할 |
|---|---|
| WF-Prep | Advisor 데이터·콘텐츠·잡 pending 저장 |
| WF-B / WF-C | 잡 큐 처리 → Delivery 생성·발송 |
| WF-D | 그 외 채널 (있을 때 WF-B 복제) |

---

## 3. WF-Prep — 분배·준비

```
Advisor 입고
    │
    ▼
① 실행 중? ──예──► End
    │ 아니오
    ▼
② 멤버 적재 (segmentKey, channel, marketingType …)
    │
    ▼
③ 콘텐츠 입력 → contentMaster 저장
    │
    ▼
④ active 세그마다 sendJob = pending
    │
    ▼
⑤ (선택) WF-B/C 시그널 1회
    │
    ▼
   End
```

| 단계 | 설명 |
|---|---|
| ① | Prep도 중첩 Run 방지 |
| ② | Advisor 페이로드 → `segmentMember`. 고객/가입번호는 수신자 PK 조인 |
| ③ | Delivery 100개 직접 입력 대신, Run 시 UI/파일로 마스터 표에 저장 |
| ④ | 오케스트레이터가 집을 **큐(잡 pending)** |
| ⑤ | 없어도 됨. 15분 스케줄만으로 발송 가능 |

**표 조합 키:** `segmentKey + channel + marketingType` (+ `extractBatchId`)

---

## 4. WF-B/C — 오케스트레이터 입구

Scheduler와 External signal **둘 다 같은 입구**로 합친다.

```
[Scheduler] ──┐
              ├──► ① isRunning? ──예──► End
[Signal]   ───┘         │ 아니오
                          ▼
                    isRunning = true
                          │
              ② Scheduler로 들어온 경우만
                 pending 잡 있음? ──없음──► isRunning=false → End
                          │ 있음
              (Signal은 ② 생략)
                          ▼
                    ③~⑥ 본 처리 (5장)
                          │
                          ▼
                    isRunning = false → End
```

| 단계 | 설명 |
|---|---|
| ① | **Run 잠금.** 이미 돌면 새 Run은 즉시 End (시그널·스케줄 공통) |
| ② | **스케줄만:** 보낼 pending 없으면 빈 Run 안 함 |
| Signal | Prep 직후 **바로 Run**용. ② 생략 |
| Scheduler | **15분+** 본선. 마감·다음 세그·pending 없으면 스킵 |

---

## 5. 오케스트레이터 Run 본문 (한 사이클)

```
③ started Delivery 상태 조회 → finished/error면 잡 마감
    │
    ▼
④ 슬롯 = maxConcurrent − 진행 중 잡 수
    │  (0이면 여기서 종료)
    ▼
⑤ pending 중 priority 상위 N개 세그 선택
    │
    ▼
⑥ 세그마다:
     · 잡 preparing (이미 started/finished면 skip)
     · CreateFromModel + contentMaster → Delivery 주입
     · PrepareAndStart → 잡 started
    │
    ▼
   End  ← MTA 발송 끝까지 Wait 하지 않음
```

| 단계 | 설명 |
|---|---|
| ③ | **Delivery(MTA) 발송**과 **WF Run**은 별개. Run은 짧게 끝남 |
| ④⑤ | 한 Run에 100세그 X. **슬롯(2~3)만** 시작 |
| ⑥ | **세그 잠금.** `preparing/started/finished`면 같은 세그 재생성 안 함 |

---

## 6. Run vs Delivery (꼭 구분)

```
워크플로 정의 (설계도 1개)
    │
    ├─ Run #1  (10:00 Signal)   → JS·PrepareAndStart → End (수 분)
    ├─ Run #2  (10:02 Signal)   → isRunning → End (조용히 종료)
    └─ Run #3  (10:15 Scheduler) → 마감 + 다음 세그 2개

Delivery A, B  →  Run #1 End 후에도 MTA에서 계속 발송 (started)
```

| | WF Run | Delivery 발송 |
|---|---|---|
| 길이 | 짧음 (표·JS·Start) | 길 수 있음 (MTA) |
| 겹침 | isRunning으로 1 Run만 처리 | 슬롯·잡 상태로 관리 |
| End 의미 | **이 Run만** 종료 | 발송 계속 |

---

## 7. 큐 · 보호 3겹

```
[Prep]  pending 잡 적재
           │
           ▼
[Orchestrator Run]
  1겹 Run 잠금      isRunning
  2겹 세그 잠금     job: pending→preparing→started→finished
  3겹 동시 발송     maxConcurrent (슬롯 2~3)
```

---

## 8. 표 4개

| 표 | 내용 | 주요 컬럼 |
|---|---|---|
| segmentMember | 누구 | extractBatchId, segmentKey, channel, marketingType, recipientId |
| segmentSendSpec | 어떻게 | priority, templateId, maxConcurrent, active |
| contentMaster | 무슨 문구 | subject, body, deeplinkUrl, mmsImageUrl |
| sendJob | 진행 | state: pending→preparing→started→finished / error |

```
segmentSendSpec ── segmentKey ── segmentMember
       │                              │
       └──────── sendJob ─────────────┘
                    │
                    └── deliveryId → nms:delivery
```

---

## 9. 전제 · 미정

**Advisor 추정 페이로드:** seg구분, 고객번호/가입번호, channel, marketingType  
**채널×유형:** LMS 안에 업셀·가입 등 여러 유형 → 표 키로 구분  
**콘텐츠:** 분배 Run + contentMaster (Delivery 직접 입력은 예외용)

| 미정 | 후보 |
|---|---|
| Advisor 연동 | 파일 / API |
| 시그널 | 사용(Prep 1회) / 스케줄만 |
| Delivery 유형 필드 | 표시용 여부 |
| 슬롯 | 2 또는 3 |

---

## 10. 시그널 · 공식 근거 (요약)

| 주장 | 공식 |
|---|---|
| 시그널은 공식 기능 | [Workflow best practices](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/introduction/workflow-best-practices) — External signal로 시작 가능 |
| Run 여러 개 가능 | [Monitor workflow execution](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/monitoring-workflows/monitor-workflow-execution) — *A single workflow can have several executions running at the same time* |
| 겹침은 막아야 함 | [Coordinate data updates](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/use-cases/data-management/coordinate-data-updates) — *several executions of a workflow* + isRunning 패턴 |
| 이전 Run task 존재 | [Scheduled overlapping execution](https://experienceleague.adobe.com/en/docs/campaign-standard/using/managing-processes-and-data/executing-a-workflow/scheduled-workflows-execution) — *previous run … still pending* |

---

## 11. 관련 문서

- `03_SegmentSplitOrchestration.md` — WF 활동·JS·운영 규칙
- `01_CustomChannelSetup.md` / `02_CustomChannelContract.md` — LMS/MMS xpath
