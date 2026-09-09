# 패키지 실행 (Console Runbook)

**패키지:** `upgrade/typologyUpgrade/`  
**설계:** [upgradePlan/00_Index.md](../upgradePlan/00_Index.md)  
**전제:** [1차 구축](../../docs/00_README.md) — `lgu:delivery`, Typology Email 피로도

---

## Phase 순서

| Phase | 문서 | Console |
|-------|------|---------|
| **0** | [01_Phase0_GoldenTemplate.md](01_Phase0_GoldenTemplate.md) | Rule Export · Write 검증 |
| **1** | [02_Phase1_Console_Import.md](02_Phase1_Console_Import.md) | schema · form · navtree · seed |
| **2** | [03_Phase2_SyncLibrary.md](03_Phase2_SyncLibrary.md) | JS · syncFatigue |
| **3** | [04_Phase3_Triggers.md](04_Phase3_Triggers.md) | postSave · WF · Delete |
| **4** | [05_Phase4_Verification.md](05_Phase4_Verification.md) | Prepare 회귀 |

---

## Repo ↔ Console

| Repo | Console |
|------|---------|
| `../schema/LGU_TARGET_TYPE_M.xml` | Data schemas → Import → Update DB |
| `../schema/LGU_TARGET_TYPE_FATIGUE_M.xml` | Import → Update DB |
| `../schema/delivery_uplus.xml` | Import → Update DB |
| `../schema/delivery_lgu.xml` | Import → Update DB |
| `form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml` | Input forms |
| `navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml` | Navigation → **재시작** |
| `../form/delivery_inputForm.xml` | Input forms `lgu:delivery` |
| `js/lguFatigueRuleSync.js` | JavaScript codes `lgu` |
| `js/migrate_fatigue_rows.js` | 1회 Execute |
| `js/phase0_validate_write.js` | Phase 0 Execute |
| `js/syncAll_scheduled.js` | Technical WF |
