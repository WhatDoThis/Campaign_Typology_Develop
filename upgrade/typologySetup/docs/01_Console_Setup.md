# 1. Console 구축 — 스키마 · form · 피로도 UI

---

## 1-1. 스키마

```
Administration > Configuration > Data schemas
```

| 순서 | Import | schema |
|------|--------|--------|
| 1 | `typologyUpgrade/schema/LGU_TARGET_TYPE_M.xml` | `lgu:LGU_TARGET_TYPE_M` |
| 2 | `typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml` | `lgu:LGU_TARGET_TYPE_FATIGUE_M` |
| 3 | `shared/schema/delivery_uplus.xml` | `uplus:delivery` (content/* 레거시) |
| 4 | `shared/schema/delivery_lgu.xml` | `lgu:delivery` (messageType, 피로도·성공지표) |
| 5 | `shared/schema/deliveryMapping_uplus.xml` | `uplus:deliveryMapping` (`@custmms`, `@lgu_mms`) |
| 6 | `shared/schema/deliveryMapping_lgu.xml` | `lgu:deliveryMapping` (`@lguMMS`) |
| 7 | `typologyUpgrade/schema/typologyRule.xml` | `lgu:typologyRule` (Pressure Rule 채널 enum) |

Save → **Tools > Advanced > Update database structure**

> **JavaScript codes Internal name:** Repo 파일명과 동일 — **`.js` 접미사 포함**  
> (예: `lguTypologyPressureAdapter.js`, `loadLibrary("lgu:lguTypologyPressureAdapter.js")`)

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

**패키지:** `typologyUpgrade/` — [packageRun/02_Phase1_Console_Import.md](../../typologyUpgrade/docs/packageRun/02_Phase1_Console_Import.md)

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
Input forms → Import typologySetup/form/deliveryCustomMMS.xml
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
1. Data schemas → Import shared/schema/deliveryMapping_uplus.xml → namespace uplus 확인 → Save
2. Data schemas → Import shared/schema/deliveryMapping_lgu.xml   → namespace lgu 확인 → Save
3. Tools → Advanced → Update database structure
4. nms:deliveryMapping Preview → custmms, lgu_mms, lguMMS Attributes 확인
5. (선택) mapping schema Preview 로 확인 — Test diag JS 는 Console 삭제 완료 ([04_Console_JS_Cleanup.md](04_Console_JS_Cleanup.md))
6. nms:deliveryMapping → @lgu_mms 아래 @lguMMS pathEdit inline 추가 (typologySetup/form/deliveryMapping_lgu_hook.xml)
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

`typologySetup/form/delivery_inputForm.xml` — **현재 nms:delivery ref 미사용**. Email 등 추후 채널 확장 시 lib 조각으로만 보관.

---

## 1-5. JavaScript codes — Import (운영만)

```
Administration > Configuration > JavaScript codes
```

| Internal name | Repo | Label | 용도 |
|---------------|------|-------|------|
| `lguTypologyPressureAdapter.js` | `typologySetup/js/` | [LGU] Typology Pressure Adapter | Control rule — contactDate + extraction materialize |
| `lguFatigueRuleSync.js` | `typologyUpgrade/js/` | — | 피로도 Rule sync |
| `custom_lms_mms.js` | `shared/js/` | — | External account delivery connector |
| `deliveryCustomizing.js` | `typologySetup/js/` | — | MMS form lib |

**Control rule (STG/PRD/Test):**

```javascript
loadLibrary("lgu:lguTypologyPressureAdapter.js");
applyTypologyPressureAdapter(delivery);
return true;
```

> **Test `lguTest*` · 레거시 JS · Test Typology rule** — Console **삭제 완료** (2026-09-10).  
> 상세: [04_Console_JS_Cleanup.md](04_Console_JS_Cleanup.md)
