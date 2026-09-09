# Phase 3 — Triggers · 운영

## 3-1. Form postSave

`LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml` — postSave에 `syncFatigueFromForm` 포함 (Repo 기본).

fatigue 행 Save → Rule 자동 반영 확인.

| 체크 | Test | Stage |
|------|:----:|:-----:|
| capCount 변경 → Rule Quantity | ☐ | ☐ |
| `@lastSyncAt` 갱신 | ☐ | ☐ |

---

## 3-2. DeleteWithRuleSync

Schema method: `lgu:LGU_TARGET_TYPE_FATIGUE_M.DeleteWithRuleSync`

Console test:

```javascript
loadLibrary('lgu:lguFatigueRuleSync');
// deleteFatigueWithRuleSync(<testId>);  // 테스트 행만
```

---

## 3-3. Technical Workflow

| Activity | Script |
|----------|--------|
| JavaScript | `syncAll_scheduled.js` |

일 1회 `syncAll()` reconcile.

| 체크 | Test | Stage |
|------|:----:|:-----:|
| WF 등록 | ☐ | ☐ |

---

## 3-4. Control rule — Prepare auto-patch (공통 · TEST 부록 분리)

OOTB Recurring clone 은 아래를 **복사하지 않음**:

- `extractionExpr` / `contactDateExpr`
- `targets/deliveryTarget` (population Query)
- *(Test only)* `content/lguMMS/source/SENDER` — STG/PRD 는 UI Save 로 충분

**Prepare 시** Control rule 이 SSOT template(`@deliveryCode` + `@isModel=1` + `[operation/@id]=0` → 예: DM473/47293)에서 idempotent Write.  
> `@model-id` / `@deliveryModel-id` / `@recurringDelivery-id` 는 `default/schema/delivery.xml` 에 **없음** — queryDef 사용 금지.  
**delivery 객체마다** `LguDeliveryPrepareContext` 인스턴스 생성 → 동시 Prepare 안전.

### Import (JS codes)

> **Console Internal name:** 파일명과 동일하게 **`.js` 포함** (예: `lguEnsureDeliveryScheduling.js`).  
> `loadLibrary("lgu:…")` 도 동일한 이름 사용.

| Internal name (Console) | Repo file | STG / PRD | Test |
|----------------------|-----------|:---------:|:----:|
| `lguEnsureDeliveryScheduling.js` | `typologyUpgrade/js/lguEnsureDeliveryScheduling.js` | ✅ | ✅ |
| `lguTestEnsureDeliverySenderFromModel.js` | `typologyUpgrade/js/lguTestEnsureDeliverySenderFromModel.js` | ❌ | ✅ |

채널 추가: `lguDeliveryPrepareLib.CHANNEL_MESSAGE_TYPES` 에 `@messageType` byte append.

### Typology rule — STG / PRD

| 필드 | 값 |
|------|-----|
| Label | `[LGU] Ensure delivery prepare` |
| Internal name | `RLCtrlEnsureScheduling` |
| Rule type | **Control** |
| Channel | 대상 채널 (예: `[LGU] SMS/MMS` 101) — **채널별 rule 권장** |
| Phase | **At the start of targeting** |
| Execution order | **1** (Pressure rules 보다 앞) |

**Code** 탭:

```javascript
loadLibrary("lgu:lguEnsureDeliveryScheduling.js");
ensureDeliveryPrepareForTypology(delivery);
return true;
```

> `ensureDeliverySchedulingForTypology` — 하위 호환 alias.

### Typology rule — Test only (SENDER 부록)

STG/PRD Control rule 에 **link 하지 않음**. Test Typology 에만 추가 rule.

| 필드 | 값 |
|------|-----|
| Internal name | `RLCtrlEnsureSender_TEST` |
| Execution order | **0** (RLCtrlEnsureScheduling 보다 앞) |

**Code** 탭 (load 순서: TEST → 공통):

```javascript
loadLibrary("lgu:lguTestEnsureDeliverySenderFromModel.js");
loadLibrary("lgu:lguEnsureDeliveryScheduling.js");
ensureDeliverySenderFromModelForTypology(delivery);
ensureDeliveryPrepareForTypology(delivery);
return true;
```

> Control rule 은 **반드시 `return true`** — lib entry 가 `true` 를 반환해도 rule Code 마지막에 explicit `return true` 권장.  
> SSOT template: `SSOT_TEMPLATE_INTERNAL_NAME: "DM473"` (47293) — duplicate `deliveryCode` 시 47590 등 실험 template 오선택 방지.

### Typology rule — Test only (PrepareMessage, postTarget)

Campaign WF 가 **PrepareTarget 만** 실행할 때 broadLog 0 으로 멈추는 경우.  
**STG/PRD 에 배포하지 않음** — STG OOTB 가 full Prepare 시 PrepareMessage 중복 위험.

| 필드 | 값 |
|------|-----|
| Label | `[LGU TEST] Ensure PrepareMessage` |
| Internal name | `RLCtrlEnsurePrepareMessage_TEST` |
| Rule type | **Control** |
| Channel | 대상 채널 (101) |
| Phase | **At the end of targeting** |
| Execution order | **99** (Pressure rules 뒤) |

**Code** 탭:

```javascript
loadLibrary("lgu:lguEnsureDeliveryScheduling.js");
ensureDeliveryPrepareMessageForTypology(delivery);
return true;
```

> WF JavaScript activity (`vars.deliveryId`) **사용하지 않음** — delivery 컴포넌트 loading 중 다음 activity 로 넘어가지 않음.

### 동작 (공통 lib)

| 대상 | 조건 | 동작 |
|------|------|------|
| WF component | `CHANNEL_MESSAGE_TYPES` 포함, `workflow-id` 또는 `operation-id` > 0 | Context 생성 |
| Target | `deliveryTarget/@nonEmpty=false`, model 에 target 있음 | model `targets` 복사 |
| Scheduling | expr 비어 있음 | Write GetDate()+Seoul |
| SSOT template | component 아님 | **skip** |
| 이미 값 있음 | — | **skip** |

### 동작 (TEST SENDER 부록)

| 대상 | 조건 | 동작 |
|------|------|------|
| SENDER | `SENDER` 비어 있음, model 에 SENDER 있음 | model SENDER 복사 |
| STG/PRD | — | **rule 미배포** (수동 SENDER 덮어쓰기 방지) |

**전제:** SSOT template — Target Query + scheduling(또는 expr blank). **SENDER/MSG** 는 component UI select·입력 후 Save (template 비어 있어도 됨).

| 체크 | Test | Stage |
|------|:----:|:-----:|
| 공통 rule + Typology link | ☐ | ☐ |
| TEST SENDER rule (Test only) | ☐ | ☐ |
| clone → Prepare → Pressure | ☐ | ☐ |

---

## 3-5. 운영 정책

| 작업 | 방법 |
|------|------|
| cap 변경 | fatigue form Save |
| 유형 추가 | fatigue New + 마스터 선택 + sync |
| Rule 수동 편집 | **금지** (RLSmsMms*는 fatigue SSOT) |
| scheduling (component) | **RLCtrlEnsureScheduling** (수동 patch WF 불필요) |
| SSOT template scheduling | Resources template Write (47590 검증 → 47293) |
| 삭제 | DeleteWithRuleSync 또는 syncFatigueDelete |
