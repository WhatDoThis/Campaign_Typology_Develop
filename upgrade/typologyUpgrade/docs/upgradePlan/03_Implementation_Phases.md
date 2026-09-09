# 3. 구현 Phase

| Phase | 목표 | 실행 문서 |
|-------|------|-----------|
| **0** | Golden Rule · Write/RuleRel API | [01_Phase0_GoldenTemplate.md](../packageRun/01_Phase0_GoldenTemplate.md) |
| **1** | 스키마 · form · navtree · seed | [02_Phase1_Console_Import.md](../packageRun/02_Phase1_Console_Import.md) |
| **2** | `lguFatigueRuleSync.js` · sync 검증 | [03_Phase2_SyncLibrary.md](../packageRun/03_Phase2_SyncLibrary.md) |
| **3** | postSave · WF · DeleteWithRuleSync | [04_Phase3_Triggers.md](../packageRun/04_Phase3_Triggers.md) |
| **4** | Prepare 회귀 | [05_Phase4_Verification.md](../packageRun/05_Phase4_Verification.md) |

---

## Phase 1 — seed (SMS/MMS 2행)

| Repo | 내용 |
|------|------|
| `migrate_fatigue_rows.js` | RLSmsMmsAll + RLSmsMmsType2 |

**완료:** fatigue 2행 · `@messageType=101`.

---

## Phase 4 — 검증

Prepare: TOTAL cap 10 · Type2 cap 2 · `@LGU_TARGET_TYPE_M_NO=2` filter.

---

## 운영 Quantity (SMS/MMS)

| Rule | Period | Quantity | Filter |
|------|--------|----------|--------|
| RLSmsMmsAll | 7d | 10 | 없음 |
| RLSmsMmsType2 | 7d | 2 | `@LGU_TARGET_TYPE_M_NO = 2` |
