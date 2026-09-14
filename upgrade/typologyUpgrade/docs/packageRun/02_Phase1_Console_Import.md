# Phase 1 — Console Import

## 1-1. 스키마

```
Administration > Configuration > Data schemas
```

| 순서 | 파일 | schema |
|------|------|--------|
| 1 | `typologyUpgrade/schema/LGU_TARGET_TYPE_M.xml` | `lgu:LGU_TARGET_TYPE_M` |
| 2 | `typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml` | `lgu:LGU_TARGET_TYPE_FATIGUE_M` |
| 3 | `shared/schema/delivery_uplus.xml` | `uplus:delivery` |
| 4 | `shared/schema/delivery_lgu.xml` | `lgu:delivery` |
| 5 | `typologyUpgrade/schema/typologyRule.xml` | `lgu:typologyRule` |

각 Import → Save → **Tools > Advanced > Update database structure**

| 체크 | Test | Stage |
|------|:----:|:-----:|
| `LGU_TARGET_TYPE_M` 테이블 | ☐ | ☐ |
| `LGU_TARGET_TYPE_FATIGUE_M` 테이블 | ☐ | ☐ |
| `NmsDelivery` — `LGU_TARGET_TYPE_M_NO`, `TYPE_DETAIL` | ☐ | ☐ |

---

## 1-2. 마스터 데이터

Stage `LGU_TARGET_TYPE_M` — 유형 NO **2** 등 실데이터 확인.

---

## 1-3. 피로도 UI

| # | 파일 | Console |
|---|------|---------|
| 1 | `form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml` | Input forms |
| 2 | `navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml` | Navigation → **재시작** |
| 3 | Explorer | Folder → **[LGU] 타겟유형 피로도** |

---

## 1-4. Delivery form

| # | 작업 |
|---|------|
| 1 | `nms:delivery` — ibank hook **없음** (default). 잔존 hook·xpaths 제거 |
| 2 | `typologySetup/form/deliveryCustomMMS.xml` Import → MMS channel form 연결 |
| 3 | MMS Save → `@LGU_TARGET_TYPE_M_NO` · `@TYPE_DETAIL` 확인 |

---

## 1-5. Seed (1회)

`migrate_fatigue_rows.js` — `TYPOLOGY_INTERNAL_NAME` 확인 후 Execute.

| Label | LGU_TARGET_TYPE_M_NO | cap | period | ruleInternalName | messageType |
|-------|----------------------|-----|--------|------------------|-------------|
| [LGU] SMS/MMS Type All | 0 | 10 | 7 | RLSmsMmsAll | 101 |
| [LGU] SMS/MMS Type 2 | 2 | 2 | 7 | RLSmsMmsType2 | 101 |

| 체크 | Test | Stage |
|------|:----:|:-----:|
| fatigue 2행 | ☐ | ☐ |
| Delivery 타겟유형 UI | ☐ | ☐ |
