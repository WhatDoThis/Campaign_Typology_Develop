# 초기화 환경 커스텀 채널 세팅 흐름

전제: Campaign 신규 설치, 기본 패키지만 있는 상태.  
대상: Bulk + Call Script (커스텀 API 채널).

엔진이 맞아야 하는 이름·시그니처(최소 계약): `02_CustomChannelContract.md`.

공식 공통 순서: 스키마 → External account → Delivery template.  
Bulk(API)는 delivery 추가 속성, 폼, JS, (새 채널이면) target mapping이 더 필요하다.

---

## 1. 채널 등록 (`messageType`)

`Administration > Configuration > Data schemas`  
`nms:delivery` 확장으로 `messageType` enumeration에 채널 값을 추가한다.

- 새 채널: 필수. External account / 템플릿의 Channel 목록에 나온다.
- 기존 채널(예: Mobile (SMS))을 재사용: 생략.

---

## 2. Delivery 추가 속성

같은 `nms:delivery` 확장에 **이 채널이 쓰는 필드**를 넣는다.  
공식: extend the Delivery schema with all additional properties required for the custom channel.

넣을 대상은 채널마다 다르다.

| 종류 | 역할 | 저장 |
|---|---|---|
| 콘텐츠 본문 | 제목, 본문, 발신번호 등. Prepare가 part를 만들 때 읽음 | 보통 XML (`xml="true"` 또는 `type="ANY"` / `CDATA`) → `mData` |
| 채널 파라미터 | API 키, 미디어 옵션, 전송 모드 등 | XML 또는 SQL |
| 주소가 아닌 운영 필드 | 템플릿/딜리버리 단위 설정 | 폼과 xpath를 맞출 것 |

OOTB 이메일은 `content/html/source`, `content/txt/source`를 쓴다.  
커스텀은 채널이 실제로 읽고 쓰는 xpath를 스키마에 선언해야 한다. 선언 없는 노드는 Prepare/MTA가 part를 못 만든다.

권장 속성:

| 속성 | 필수 | 역할 |
|---|---|---|
| `name` | 예 | xpath 이름 |
| `type` | 예 | `ANY`(자식 컨테이너), `CDATA`(긴 텍스트/개인화), `string`, `html` 등 |
| `xml="true"` / `xmlChildren="true"` | 콘텐츠면 사실상 예 | SQL 컬럼이 아니라 `mData` XML로 저장 |
| `label` | 권장 | 폼/콘솔 표시명 |
| `length` | string일 때 | 최대 길이 |
| `required` | 선택 | 폼에서 필수 |
| `localizable` | **아님** | `@label`을 번역 수집 대상에 넣음 (내부 i18n). 개인화/part 생성과 무관 |
| `default` | **아님** | XTK 기본값. `default="' '"`는 빈칸 한 칸. 노드를 비우지 않으려는 관례일 뿐 |

`localizable="true"`를 빼도 채널은 동작한다.  
`default`를 빼도, 템플릿/딜리버리에서 값을 넣으면 동작한다.

저장 → 스키마 재생성 → `Tools > Advanced > Update database structure` (SQL 필드가 생긴 경우).

---

## 3. 입력 폼

`Administration > Configuration > Input forms` → `nms:delivery`  
(Web UI면 Delivery 스키마 Screen edition)

2번 xpath와 같은 입력 칸. 스키마만 있고 폼이 없으면 값은 안 들어간다.

---

## 4. 주소 매핑 (새 `messageType`일 때)

기존 SMS 채널을 재사용하면 기본 target mapping의 모바일 주소를 쓴다.

새 채널이면:

- `nms:deliveryMapping`에 **messageType과 같은 이름**의 주소 속성을 확장
- deliveryMapping 폼에도 추가
- Target mapping에서 recipient 필드(예: `@mobilePhone`)를 그 속성에 연결

없으면 broadLog `@address`가 비고 커넥터로 번호가 안 넘어간다.

---

## 5. Call Script

`Administration > Configuration > JavaScript codes`

- `processDeliveryPart(deliveryPart)`
- `getStatus(xml)`
- `getMessages(xml)`

`processDeliveryPart`는 part의 `message/@id`를 `<messages>`로 반환한다.  
본문/발신번호는 `deliveryPart` 안에서 2번 스키마 xpath로 읽는다.

---

## 6. External account

`Administration > Platform > External accounts`

| 항목 | 값 |
|---|---|
| Type | Routing |
| Channel | 1번의 채널 |
| Delivery mode | Bulk (커스텀 API) / External (파일·외부) |
| Enabled | 체크 |
| Connector | Call Script |
| JavaScript | 5번 JS |

---

## 7. Delivery template

`Resources > Templates > Delivery templates`

1. 템플릿 생성
2. Properties > General > Routing = 6번
3. Target mapping = 4번에서 쓴 매핑
4. 콘텐츠 탭에서 2번 필드 확인

---

## 8. 서버 프로세스

- `mta` (`statServerAddress`가 있으면 `stat`)
- `syslogd`

`nlserver pdump`로 확인.

---

## 9. 발송

Query → Recurring delivery (7번 템플릿)

확인: 딜리버리 생성, Audit Prepare, `mtachild.log`의 `processDeliveryPart`.

---

## 순서 한 줄

messageType → delivery 추가 속성 → DB 반영 → 폼 → (새 채널) deliveryMapping → JS → Bulk/Call Script 계정 → 템플릿 → mta/stat → Recurring
