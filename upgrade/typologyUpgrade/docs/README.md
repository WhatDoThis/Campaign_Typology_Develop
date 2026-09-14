# typologyUpgrade

**패키지:** `upgrade/typologyUpgrade/`  
**목적:** `lgu:LGU_TARGET_TYPE_FATIGUE_M` CRUD → Pressure Rule 자동 sync

---

## 문서

| 폴더 | 용도 |
|------|------|
| [upgradePlan/](upgradePlan/00_Index.md) | 설계 · 데이터 모델 · API |
| [packageRun/](packageRun/00_Index.md) | Console Import · Execute 절차 |

**1차 구축:** [typologySetup/docs/00_README.md](../../typologySetup/docs/00_README.md)  
**공통 스키마:** [shared/README.md](../../shared/README.md)

---

## Repo 구조

```
typologyUpgrade/
  schema/LGU_TARGET_TYPE_M.xml
  schema/LGU_TARGET_TYPE_FATIGUE_M.xml
  schema/typologyRule.xml
  form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml
  navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml
  js/lguFatigueRuleSync.js      ← Console JavaScript codes (library)
  js/syncAll_scheduled.js       ← Technical WF reconcile (optional)
  js/templates/                 ← Rule XML reference only
  docs/
```

**Delivery 확장 (`@LGU_TARGET_TYPE_M_NO`):** [shared/schema/delivery_lgu.xml](../../shared/schema/delivery_lgu.xml)
