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

> **Console Internal name:** 파일명과 동일하게 **`.js` 포함** (예: `lguTypologyPressureAdapter.js`).  
> `loadLibrary("lgu:…")` 도 동일한 이름 사용.

| Internal name (Console) | Repo file | STG / PRD | Test |
|----------------------|-----------|:---------:|:----:|
| `lguTypologyPressureAdapter.js` | `typologySetup/js/lguTypologyPressureAdapter.js` | ✅ | ✅ |

> Test `lguTest*` JS — Console **삭제 완료**. Repo: `typologySetup/js/_archive/test/` ([04_Console_JS_Cleanup.md](../../../typologySetup/docs/04_Console_JS_Cleanup.md))

채널 추가: `lguTypologyPressureAdapterLib.CHANNEL_MESSAGE_TYPES` 에 `@messageType` byte append.

### Typology rule — STG / PRD

| 필드 | 값 |
|------|-----|
| Label | `[LGU] Typology Pressure Adapter` |
| Internal name | `RLCtrlTypologyPressureAdapter` |
| Rule type | **Control** |
| Channel | 대상 채널 (예: `[LGU] SMS/MMS` 101) — **채널별 rule 권장** |
| Phase | **At the start of targeting** |
| Execution order | **1** (Pressure rules 보다 앞) |

**Code** 탭:

```javascript
loadLibrary("lgu:lguTypologyPressureAdapter.js");
applyTypologyPressureAdapter(delivery);
return true;
```

### ~~Typology rule — Test only~~ (Console 삭제 완료)

> `RLCtrlEnsureSender_TEST`, content mirror rule, `RLEnsurePrepareMsg` — Console **삭제 완료** (2026-09-10).  
> 이력·코드: [04_Console_JS_Cleanup.md](../../../typologySetup/docs/04_Console_JS_Cleanup.md) §4-4

### 동작 (공통 lib)

| 대상 | 조건 | 동작 |
|------|------|------|
| WF component | `CHANNEL_MESSAGE_TYPES` 포함, `workflow-id` 또는 `operation-id` > 0 | Context 생성 |
| Scheduling | contactDate / extraction 비어 있음 | live+DB materialize (Pressure arbitration) |
| extractionExpr / contactDateExpr / content | — | **건드리지 않음** |
| SSOT template | component 아님 | **skip** |
| 이미 값 있음 | — | **skip** |

**전제:** SSOT template — Target Query + scheduling(또는 expr blank). **SENDER/MSG** 는 component UI select·입력 후 Save.

| 체크 | Test | Stage |
|------|:----:|:-----:|
| `RLCtrlTypologyPressureAdapter` + Typology link | ☐ | ☐ |
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
