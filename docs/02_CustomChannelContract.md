# Bulk + Call Script 최소 계약

대상: 커스텀 API 채널 (`Delivery mode = Bulk`, Connector = Call Script).  
세팅 순서: `01_CustomChannelSetup.md`. 이 문서는 **엔진이 서로 맞춰야 하는 이름·시그니처**만 적는다.

필드 이름(`source`, `subject`, `content2` 등)은 채널마다 다르다. Adobe가 그 이름을 강제하지 않는다.  
계약은 “이 xpath / 이 함수 / 이 속성명이 같아야 한다”이다.

공식 공통 순서: 스키마 → External account → Delivery template.  
API 채널 추가: delivery 추가 속성, 화면(폼), (채널에 따라) target mapping, JS.  
출처: [Custom channels](https://experienceleague.adobe.com/en/docs/campaign/campaign-v8/send/other-channels/custom-channel)

---

## 계약이 끊기면

| 끊긴 계약 | 증상 |
|---|---|
| C1 `messageType` | External account / 템플릿 Channel 목록에 없음 |
| C2 delivery 추가 속성 | Prepare가 part를 못 만듦 → Call Script 미호출, Audit 빈칸, `logInfo` 없음 |
| C3 폼 xpath ≠ C2 | 콘솔에서 값을 넣어도 스키마 경로에 안 붙음 |
| C4 mapping `@name` ≠ `messageType` `@name` | `message/@address`, broadLog `@address` 빈칸 |
| C5 JS 3함수 / `<messages>` | 스크립트 로드 실패, 또는 발송 후 상태 미갱신 |
| C6 Routing + Bulk + Call Script + JS | 커넥터가 안 붙거나 SMPP 경로로 감 |
| C7 템플릿 Routing | 다른 계정으로 나감 |
| C8 `mta` | 딜리버리만 생기고 발송 프로세스 없음 |

---

## C1. 채널 식별 (`messageType`)

**언제 필수:** 새 채널을 만들 때.  
**언제 생략:** 기존 채널(예: Mobile (SMS))을 재사용할 때.

공식: `nms:delivery` 확장으로 `messageType` enumeration에 값을 추가한다.

최소 XML (이름·숫자는 예시. 인스턴스의 기존 `value`와 겹치면 안 됨):

```xml
<srcSchema extendedSchema="nms:delivery" name="delivery" namespace="cus">
  <enumeration name="messageType">
    <value label="Custom API" name="cusApi" value="80"/>
  </enumeration>
</srcSchema>
```

| 항목 | 최소 조건 |
|---|---|
| enumeration `@name` | 반드시 `messageType` (기존 enum 확장) |
| `value/@name` | 이후 **C4 속성명, C6 Channel**이 이 문자열을 씀 |
| `value/@value` | `byte`, 기존 값과 중복 금지. 콘솔 `nms:delivery`의 `messageType`을 보고 빈 번호를 고른다 |
| `value/@label` | 콘솔 표시명. 엔진 키는 `@name` |

OOTB에서 자주 쓰이는 값(ACS 데이터모델 기준, Classic도 동일 계열): email `0`, sms `1`, paper `3`, push `40`. 인스턴스마다 패키지가 더 있을 수 있으니 **로컬 enum이 우선**이다.

---

## C2. Delivery 추가 속성 (콘텐츠·파라미터 모델)

공식: *extend the Delivery schema with all additional properties required for the custom channel.*

이게 이번 테스트에서 로그가 안 나오던 지점이다. Prepare는 **스키마에 선언된 xpath만** 딜리버리 객체/`mData`/part로 만든다.  
폼에만 있고 스키마에 없으면 값이 증발하고, part가 안 나와 Call Script가 호출되지 않는다.

### 엔진이 요구하는 것

1. JS 또는 폼이 읽고 쓰는 **모든 xpath를 `nms:delivery` 확장에 선언**한다.
2. 콘텐츠는 SQL 컬럼이 아니라 XML로 두는 것이 맞다. 저장은 테이블 `mData`이고, 문서는 스키마 구조를 따른다.  
   출처: [Database mapping — XML fields](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/schema-reference/database-mapping)

### 최소 노드 수

- 컨테이너 1개 + 그 채널이 실제로 쓰는 리프 N개.
- 스모크 테스트(본문 없이 `logInfo`만)여도, 템플릿/폼이 쓰는 콘텐츠 경로가 있으면 **그 경로는 선언해야** part가 생긴다.
- Adobe가 `source` / `subject` / `content2`를 요구하지 않는다. 필요한 필드만 넣는다.

최소 형태 (필드명은 예시):

```xml
<element name="delivery">
  <element name="channelContent" type="ANY" xml="true">
    <element name="body" type="CDATA"/>
  </element>
</element>
```

JS에서 읽을 때: `deliveryPart` 안의 같은 경로(개인화 후 값).  
공식 Web UI 미리보기 예도 채널 파라미터를 `[WebpushParameters/@richMediaOptions]`처럼 **선언된 xpath**로만 조회한다.

### 속성 — 최소 vs 아님

출처: [element](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/schema-reference/elements-attributes/element)

| 속성 | 최소? | 역할 |
|---|---|---|
| `name` | **예** | xpath 조각. 폼·JS와 동일해야 함 |
| `type` | **예** | 직렬화 방식. 컨테이너=`ANY`, 긴 본문/개인화=`CDATA` 또는 `memo`/`html` |
| `xml="true"` | 콘텐츠면 **사실상 예** | `mData` XML 저장. 없으면 typed 필드는 SQL 컬럼이 됨 → `Update database structure` 필요 |
| `xmlChildren="true"` | 선택 | 자식까지 XML 문서로 강제 저장 |
| `label` | 콘솔용 | 엔진 계약 아님 |
| `length` | `string` SQL일 때 | XML `CDATA`에는 해당 없음 |
| `required` | 폼 표시용 | Prepare 계약 아님 |
| `localizable` | **아님** | `@label` 번역 수집(내부 i18n). 개인화/part와 무관 |
| `default` | **아님** | XTK 기본값. `default="' '"`는 공백 한 칸 관례일 뿐. 템플릿이 값을 넣으면 불필요 |

`type="html"`은 CDATA로 저장하고 콘솔에 HTML 편집기를 붙인다. 일반 텍스트 본문은 `CDATA`면 충분하다.

저장 후 스키마 재생성. **SQL 필드가 생긴 경우에만** `Tools > Advanced > Update database structure`.

---

## C3. 입력면 (폼 / Screen edition)

계약: **폼 xpath = C2 `name` 경로.**

- Client Console: `Administration > Configuration > Input forms` → `nms:delivery`
- Web UI: Delivery 스키마 Screen edition (공식 API 추가 단계)

스키마만 있고 폼이 없으면 콘솔에서 값을 못 넣는다.  
패키지/SOAP로 `mData`를 직접 넣으면 폼 없이도 엔진은 동작할 수 있다. 운영 입력에는 폼이 최소 조건이다.

미리보기 JSSP는 공식상 **optional**. 발송 계약 아님.

---

## C4. 주소 (새 `messageType`일 때만)

기존 SMS 채널을 재사용하면 기본 target mapping의 모바일 주소를 쓴다. 이 절은 생략.

새 채널이면 아래가 한 세트다. Adobe 커뮤니티에서 확인된 이름 계약:

> deliveryMapping에 추가하는 attribute **이름이 `messageType`의 `@name`과 같아야** 한다.

| 단계 | 최소 조건 |
|---|---|
| `nms:deliveryMapping` 확장 | `<attribute name="cusApi" .../>` — `cusApi`는 C1 `value/@name`과 **완전 동일** |
| deliveryMapping 폼 | 같은 이름 입력칸 |
| Target mapping | recipient 필드(예: `@mobilePhone`)를 그 속성에 연결 |
| 템플릿 | 그 target mapping을 사용 (C7) |

결과 계약: part의 `message/@address`, broadLog `@address`에 그 값이 들어간다.  
여기가 비면 커넥터까지는 가도 번호가 없다.

---

## C5. Call Script JS

Experience League에 Call Script 함수 스펙 페이지는 없다. 제품이 로드하는 심볼이 계약이다.

위치: `Administration > Configuration > JavaScript codes`  
C6 Connector가 **그 엔티티**를 가리킨다. MTA는 로컬 디스크 파일이 아니라 인스턴스 JS 코드를 로드한다.

### 로드 계약

- 파일 최상단에서 예외가 나면 함수가 등록되지 않는다.
- `loadLibrary` / `NL.require`는 이 커넥터의 최소 조건이 **아니다**. MTA child 컨텍스트에서 실패하면 본문까지 못 간다.
- 같은 이름 함수를 두 번 선언하지 않는다.

### 심볼 계약 (3개 모두 존재)

```javascript
function processDeliveryPart(deliveryPart) { ... }
function getStatus(xml) { ... }
function getMessages(xml) { ... }
```

`getStatus` / `getMessages`는 동기 상태 폴링용. 안 써도 **빈 `<messages/>`를 반환하는 함수는 있어야** 로더가 통과한다.

### 반환 계약 (`processDeliveryPart`)

반환은 E4X XML.

```xml
<messages successOnSent="true">
  <message id="123"/>
</messages>
```

| 항목 | 최소 조건 |
|---|---|
| 루트 | `<messages>` |
| `message/@id` | part의 `message/@id`와 동일. 상태 갱신에 필요 |
| `successOnSent="true"` | 반환된 메시지를 sent로 처리. 스모크에서 사용 |

스모크 최소본 (API 호출 없음):

```javascript
function processDeliveryPart(deliveryPart) {
  var msgs = <messages successOnSent="true"/>;
  for each (var m in deliveryPart.message)
    msgs.appendChild(<message id={m.@id}/>);
  logInfo(deliveryPart.toXMLString());
  return msgs;
}
function getStatus(xml) { return <messages/>; }
function getMessages(xml) { return <messages/>; }
```

본문/발신번호는 `deliveryPart`에서 **C2 xpath**로 읽는다. 스키마에 없는 노드는 여기에도 없다.

---

## C6. External account

`Administration > Platform > External accounts`

| 항목 | 최소 값 |
|---|---|
| Type | Routing |
| Channel | C1의 채널 (`value/@name`에 해당하는 목록 항목) |
| Delivery mode | **Bulk** (커스텀 API). External은 파일/외부 추출 |
| Enabled | 켜짐 |
| Connector | Call Script |
| JavaScript | C5 엔티티 |

공식: External = 커스텀 외부, Bulk = 커스텀 API.

---

## C7. Delivery template

| 항목 | 최소 조건 |
|---|---|
| Routing | C6 계정 |
| Target mapping | C4에서 쓴 매핑 (SMS 재사용이면 기본 모바일 매핑) |
| 콘텐츠 | C2 경로에 값이 있음 (폼 또는 기본값) |

Properties > General > Routing이 C6이 아니면 이 문서의 커넥터는 실행되지 않는다.

---

## C8. 런타임

| 프로세스 | 최소? |
|---|---|
| `mta` | **예** |
| `syslogd` | 로그를 보려면 예 |
| `stat` | `mta`에 `statServerAddress`가 있을 때만 |

`nlserver pdump`로 확인. Call Script `logInfo`는 딜리버리 Audit이 아니라 **`mtachild.log`**.

SMS 패키지, SMPP, SMS affinity, Deploy wizard 기본 SMS 계정은 이 경로의 최소 조건이 **아니다**.

---

## 한 장 체크

새 채널 기준. `(재사용)`은 SMS 등 기존 `messageType`을 쓸 때 건너뛴다.

1. `(새 채널)` C1 `messageType.@name` 결정, 빈 `value` 번호
2. C2에 JS/폼이 쓰는 xpath만 선언. 콘텐츠는 `xml="true"` / `ANY` / `CDATA`
3. 스키마 재생성. SQL이 생겼으면 DB 업데이트
4. C3 폼 xpath = C2
5. `(새 채널)` C4 mapping 속성명 = C1 `@name` → recipient 주소 연결
6. C5 세 함수, 소스 최상단 throw 없음, `message/@id` 에코
7. C6 Routing / Bulk / Call Script / C5 / Enabled
8. C7 Routing=C6, mapping=C4, 콘텐츠 채움
9. C8 `mta` (+ 필요 시 `stat`) → Recurring / Delivery
10. 확인: Prepare Audit에 part, `mtachild.log`에 `processDeliveryPart`, broadLog `@address`

---

## 계약이 아닌 것

- `localizable="true"`, `default="' '"`
- 특정 콘텐츠 필드명 세트
- Mobile (SMS) 패키지, Extended SMPP, SMS affinity
- Preview JSSP
- `loadLibrary` / `NL.require`
- 템플릿을 `Send to mobiles`에서 복제하는 것
