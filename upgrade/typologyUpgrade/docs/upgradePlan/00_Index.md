# 구현 설계 (Upgrade Plan)

**목표:** `lgu:LGU_TARGET_TYPE_FATIGUE_M` CRUD만으로 채널·유형별 Pressure Rule 생성/수정/비활성/삭제.  
**범위:** `RLSmsMms*` prefix Rule만 관리.

---

## 문서

| # | 문서 | 내용 |
|---|------|------|
| 1 | [01_DataModel.md](01_DataModel.md) | 스키마 · fatigue↔Rule 매핑 |
| 2 | [02_SyncLibrary.md](02_SyncLibrary.md) | `lguFatigueRuleSync.js` API |
| 3 | [03_Implementation_Phases.md](03_Implementation_Phases.md) | Phase 로드맵 · 완료 기준 |

**Console 실행:** [packageRun/00_Index.md](../packageRun/00_Index.md)

---

## 아키텍처

```
lgu:LGU_TARGET_TYPE_M (Stage 마스터 — cap 컬럼 없음)
        │ UI linkListChoice (FK 없음)
        ▼
lgu:LGU_TARGET_TYPE_FATIGUE_M (피로도 cap · Rule sync SSOT)
        │ Save / Delete / Sync WF
        ▼
lguFatigueRuleSync.js
        │ RLSmsMms* guard
        ▼
nms:typologyRule + Typology RuleRel
        ▼
lgu:delivery @LGU_TARGET_TYPE_M_NO → Prepare (OOTB Pressure)
```

---

## Repo

| 경로 | 역할 |
|------|------|
| `../schema/LGU_TARGET_TYPE_FATIGUE_M.xml` | 피로도 관리 스키마 |
| `form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml` | 운영 UI |
| `navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml` | Explorer |
| `js/lguFatigueRuleSync.js` | sync 라이브러리 |
