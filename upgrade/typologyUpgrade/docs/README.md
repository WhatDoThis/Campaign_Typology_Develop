# typologyUpgrade

**패키지:** `upgrade/typologyUpgrade/`  
**목적:** `lgu:LGU_TARGET_TYPE_FATIGUE_M` CRUD → Pressure Rule 자동 sync

---

## 문서

| 폴더 | 용도 |
|------|------|
| [upgradePlan/](upgradePlan/00_Index.md) | 설계 · 데이터 모델 · API |
| [packageRun/](packageRun/00_Index.md) | Console Import · Execute 절차 |

**1차 구축:** [../docs/00_README.md](../docs/00_README.md)

---

## Repo 구조

```
typologyUpgrade/
  form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml
  navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml
  js/lguFatigueRuleSync.js
  js/migrate_fatigue_rows.js
  js/phase0_validate_write.js
  js/syncAll_scheduled.js
  js/templates/
  docs/
```

**스키마 (upgrade/schema/):**

- `LGU_TARGET_TYPE_M.xml` — 타겟유형 마스터 (Stage, read-only 운영)
- `LGU_TARGET_TYPE_FATIGUE_M.xml` — 피로도 cap · Rule sync
- `delivery.xml` — `@LGU_TARGET_TYPE_M_NO`, `@TYPE_DETAIL`
