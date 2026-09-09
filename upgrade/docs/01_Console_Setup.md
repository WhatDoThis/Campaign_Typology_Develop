# 1. Console 구축 — 스키마 · form · 피로도 UI

---

## 1-1. 스키마

```
Administration > Configuration > Data schemas
```

| 순서 | Import | schema |
|------|--------|--------|
| 1 | `schema/LGU_TARGET_TYPE_M.xml` | `lgu:LGU_TARGET_TYPE_M` |
| 2 | `schema/LGU_TARGET_TYPE_FATIGUE_M.xml` | `lgu:LGU_TARGET_TYPE_FATIGUE_M` |
| 3 | `schema/delivery_uplus.xml` | `uplus:delivery` (content/* 레거시) |
| 4 | `schema/delivery_lgu.xml` | `lgu:delivery` (messageType, 피로도·성공지표) |
| 5 | `schema/deliveryMapping_uplus.xml` | `uplus:deliveryMapping` (`@custmms`, `@lgu_mms`) |
| 6 | `schema/deliveryMapping_lgu.xml` | `lgu:deliveryMapping` (`@lguMMS`) |

Save → **Tools > Advanced > Update database structure**

> **JavaScript codes Internal name:** Repo 파일명과 동일 — **`.js` 접미사 포함**  
> (예: `lguEnsureDeliveryScheduling.js`, `loadLibrary("lgu:lguEnsureDeliveryScheduling.js")`)

> **폼 enum:** `deliveryCustomMMS` 발신번호는 `type="sysenum"` 만 사용.  
> `enum="uplus:delivery:sender_list"` **금지** — Console 이 `uplus:delivery` srcSchema 를 직접 로드하려다 XSV-350000 발생.  
> enum 은 스키마 element `enum="sender_list"` 에서 merged `nms:delivery` 로 resolve.

| 체크 | Test | Stage |
|------|:----:|:-----:|
| `LGU_TARGET_TYPE_M` | ☐ | ☐ |
| `LGU_TARGET_TYPE_FATIGUE_M` | ☐ | ☐ |
| `uplus:delivery` — `content/lguMMS`, `custmms`, `lgu_mms` | ☐ | ☐ |
| `lgu:delivery` — `lguMMS`, `@LGU_TARGET_TYPE_M_NO`, `@LGU_SUCCESS_METRIC_M_NO` | ☐ | ☐ |
| `uplus:deliveryMapping` — `@custmms`, `@lgu_mms` | ☐ | ☐ |
| `lgu:deliveryMapping` — `@lguMMS` | ☐ | ☐ |

---

## 1-2. 타겟유형 마스터

Stage `LGU_TARGET_TYPE_M` 데이터 적재 (NO, TYPE_DETAIL).

---

## 1-3. 피로도 관리 UI

**패키지:** `typologyUpgrade/` — [packageRun/02_Phase1_Console_Import.md](../typologyUpgrade/docs/packageRun/02_Phase1_Console_Import.md)

| # | 작업 | 파일 |
|---|------|------|
| 1 | Input form | `typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml` |
| 2 | Navtree | `typologyUpgrade/navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml` → **재시작** |
| 3 | Folder | Explorer → **[LGU] 타겟유형 피로도** |
| 4 | Seed | `migrate_fatigue_rows.js` Execute |

---

## 1-4. Delivery form

### A. `nms:delivery` — **default 유지**

캠페인 유형 입력 UI 는 **nms:delivery 에 넣지 않음**.

Console `nms:delivery` 에 ibank hook 이 남아 있으면 **제거**:

| 제거 대상 |
|-----------|
| `ref="woo:delivery:lib/marketingParameters"` |
| `ref="lgu:delivery:lib/targetType"` |
| `xpathsToLoadOpt` 의 `marketingParameters/*` |
| `xpathsToLoadOpt` 의 `@LGU_TARGET_TYPE_M_NO,@TYPE_DETAIL` |

→ Typology 탭은 OOTB 그대로 (Typology · Weight · Capacity settings).

### B. SMS/MMS — `lgu:deliveryCustomMMS`

```
Input forms → Import form/deliveryCustomMMS.xml
```

MMS Delivery template / channel form 에 `lgu:deliveryCustomMMS` 연결.

### B-2. `nms:delivery` — hasDeliveryContent (lguMMS)

OOTB Prepare wizard 는 `content/html|text|sms` 또는 `@messageType > other`(120) 만 콘텐츠로 인정.  
**lguMMS(101)** 는 해당 없음 → UI **"Content has not been entered yet"** (DB 에 MSG/SENDER 있어도).

```
Input forms → Import default/inputForm/delivery.xml (또는 Console 에 3곳 hasDeliveryContent expr 패치)
```

패치 내용: `@messageType > other` 뒤에  
`or (EV(@messageType,'lguMMS') and [content/lguMMS/source/MSG]!='' and [content/lguMMS/source/SENDER]!='')` 추가 (hasDeliveryContent set expr **4곳**: form main `<enter>` + Send 3곳).

타겟유형 선택 · `@LGU_TARGET_TYPE_M_NO` · `@TYPE_DETAIL` 입력은 **이 form 전용**.

| 체크 | Test | Stage |
|------|:----:|:-----:|
| nms:delivery ibank hook 없음 | ☐ | ☐ |
| MMS Delivery — 타겟유형 선택 | ☐ | ☐ |
| MMS Save 후 NO·TYPE_DETAIL 유지 | ☐ | ☐ |

### C. Target mapping — `uplus:deliveryMapping` + `lgu:deliveryMapping`

mapping attribute 이름 = messageType `@name` 계약.  
`default/inputForm/deliveryMapping.xml` Address 탭: `@custmms`, `@lgu_mms`, `@lguMMS` — **모두 nms form inline** (lib ref 없음).

**uplus:deliveryMapping 복구 + lguMMS 추가:**

```
1. Data schemas → Import schema/deliveryMapping_uplus.xml → namespace uplus 확인 → Save
2. Data schemas → Import schema/deliveryMapping_lgu.xml   → namespace lgu 확인 → Save
3. Tools → Advanced → Update database structure
4. nms:deliveryMapping Preview → custmms, lgu_mms, lguMMS Attributes 확인
5. (선택) `lguTestDeliveryMappingSchema.js` Execute
6. nms:deliveryMapping → @lgu_mms 아래 @lguMMS pathEdit inline 추가 (form/deliveryMapping_lgu_hook.xml)
```

> **주의:** `deliveryMapping_lgu.xml` 을 **uplus** namespace 에 Import 하면 uplus 원본이 덮어써짐.  
> uplus 복구 = `deliveryMapping_uplus.xml` / lgu 추가 = `deliveryMapping_lgu.xml` (namespace 분리).

> **Form — lib 사용 금지:** `lgu:deliveryMapping` Input form Import + ref 는 Input forms 미리보기에서  
> `XML-110013 lguMMS unknown` 유발 (entitySchema=xtk:form, deliveryMapping 문서 컨텍스트 없음).  
> 이미 Import 했다면 **lgu:deliveryMapping form 삭제** + nms inline 으로 교체.

Console **Target mapping** (예: mapRecipient id=1671) → Mapping → Address:

| 필드 | xpath |
|------|-------|
| [ON] LMS/MMS(new) | `@mobilePhone` |
| [ON] LMS/MMS | `@mobilePhone` |
| [LGU] SMS/MMS | `@mobilePhone` |

| 체크 | Test | Stage |
|------|:----:|:-----:|
| uplus `@custmms`, `@lgu_mms` 복구 | ☐ | ☐ |
| lgu `@lguMMS` 추가 | ☐ | ☐ |
| lguMMS Delivery Prepare → broadLog address 채움 | ☐ | ☐ |

### D. (선택) `lgu:delivery` lib

`form/delivery_inputForm.xml` — **현재 nms:delivery ref 미사용**. Email 등 추후 채널 확장 시 lib 조각으로만 보관.

---

## 1-4. JavaScript codes — Import / Delete

```
Administration > Configuration > JavaScript codes
```

### STG / PRD Import (운영)

| Internal name | Label | 용도 |
|---------------|-------|------|
| `lguEnsureDeliveryScheduling.js` | [LGU] Ensure Delivery Scheduling | Control rule preTarget — scheduling expr + contactDate + content mirror |
| `lguFatigueRuleSync.js` | (기존) | 피로도 Rule sync |

> STG 는 OOTB Prepare·발송 경로가 이미 동작 → **`lguTestRunDeliveryPrepareMessage.js` Import 불필요**.

**Control rule (STG/PRD):**

```javascript
loadLibrary("lgu:lguEnsureDeliveryScheduling.js");
ensureDeliveryPrepareForTypology(delivery);
return true;
```

### Test 전용 (`lguTest*` / Label `[LGU TEST] *`)

| Internal name | Label | Execute 예 |
|---------------|-------|------------|
| `lguTestDeliveryPrepareDiag.js` | [LGU TEST] Delivery Prepare Diag | `lguTestDeliveryPrepareDiag(48521)` |
| `lguTestRunDeliveryPrepareMessage.js` | [LGU TEST] Run Delivery Prepare Message | `lguTestRunDeliveryPrepareMessage(48521)` — WF PrepareTarget-only 검증 |
| `lguTestDeliveryMappingSchema.js` | [LGU TEST] Delivery Mapping Schema | `lguTestDeliveryMappingSchema()` |
| `lguTestListDeliveryMessageTypes.js` | [LGU TEST] List Delivery Message Types | `lguTestListDeliveryMessageTypes()` |
| `lguTestInsertRecipients.js` | [LGU TEST] Insert Recipients | `lguTestInsertRecipients()` |
| `lguTestEnsureDeliverySenderFromModel.js` | [LGU TEST] Ensure Delivery Sender From Model | Test Typology rule load only |

### Console에서 삭제

| Internal name | 사유 |
|---------------|------|
| `lguRunDeliveryPrepareMessage.js` | → `lguTestRunDeliveryPrepareMessage.js` (Test 전용) |
| `validate_delivery_prepare_diag.js` | → `lguTestDeliveryPrepareDiag.js` |
| `validate_delivery_prepareMessage.js` | 삭제 (중복) |
| `validate_deliveryMapping_schema.js` | → `lguTestDeliveryMappingSchema.js` |
| `list_delivery_messageTypes.js` | → `lguTestListDeliveryMessageTypes.js` |
| `insert_test_recipients.js` | → `lguTestInsertRecipients.js` |
| `lguEnsureDeliverySenderFromModel_TEST.js` | → `lguTestEnsureDeliverySenderFromModel.js` |
