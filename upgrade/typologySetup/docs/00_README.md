# Email 피로도 — 구축 매뉴얼 (ACC v7/v8 · mid-sourcing)

OOTB **Pressure Rule** + **Typology** + LGU 타겟유형·피로도 관리.

---

## 문서

| # | 문서 | 내용 |
|---|------|------|
| 1 | [01_Console_Setup.md](01_Console_Setup.md) | 스키마 · form · 피로도 UI |
| 2 | [02_Typology_Rules.md](02_Typology_Rules.md) | Typology + Pressure Rule |
| 3 | [03_Delivery_Prepare.md](03_Delivery_Prepare.md) | Template · Prepare · 운영 |
| 4 | [04_Console_JS_Cleanup.md](04_Console_JS_Cleanup.md) | Console JS 삭제 이력 (완료) |

Typology Rule 필드: [05_TypologyRule_FatigueTutorial.md](../../../docs/05_TypologyRule_FatigueTutorial.md)

**피로도 sync 패키지:** [typologyUpgrade/docs/README.md](../../typologyUpgrade/docs/README.md)  
**공통 delivery 스키마:** [shared/README.md](../../shared/README.md)

---

## 구축 순서

```
1. 스키마 Import + Update DB (마스터 · 피로도 · delivery)
2. 피로도 UI (form + navtree + Folder)
3. Delivery form — **MMS:** `deliveryCustomMMS` / **nms:delivery:** default 유지
4. Typology + Rule (수동 1회 또는 sync)
5. typologyUpgrade Phase 0~4
6. 테스트 Recipient → Prepare → Exclusions
```

---

## Repo

| 패키지 | 주요 파일 | Console |
|--------|-----------|---------|
| `shared/` | `schema/delivery_*.xml`, `js/custom_lms_mms.js` | delivery · mapping · connector |
| `typologyUpgrade/` | fatigue schema · form · sync JS | 피로도 CRUD · Rule sync |
| `typologySetup/` | `form/deliveryCustomMMS.xml`, `js/lguTypologyPressureAdapter.js` | MMS form · Pressure Adapter |
| `typologySetup/form/delivery_inputForm.xml` | (선택 lib — nms ref 미사용) | — |

---

## 아키텍처

| 항목 | 구현 |
|------|------|
| 타겟유형 마스터 | `lgu:LGU_TARGET_TYPE_M` (`@NO`, `@TYPE_DETAIL`) |
| 피로도 cap SSOT | `lgu:LGU_TARGET_TYPE_FATIGUE_M` |
| Delivery 식별 | `@LGU_TARGET_TYPE_M_NO` + `@TYPE_DETAIL` (FK 없음) |
| 채널 total | `@LGU_TARGET_TYPE_M_NO = 0` → Rule filter 없음 |
| 유형별 cap | Rule filter `@LGU_TARGET_TYPE_M_NO = {NO}` |
| cap → Rule | `lguFatigueRuleSync.js` |
| 집계 키 | Recipient `@customerNo` (OOTB) |

---

## Pressure 전제

| 항목 | 설정 | 미설정 시 |
|------|------|-----------|
| Contact date | `GetDate()` | Pressure 미적용 |
| Extraction date | `GetDate()` | Prepare 타이밍 어긋남 |
| Typology | Email fatigue Typology | Rule 미적용 |
| `@LGU_TARGET_TYPE_M_NO` | Delivery Typology 탭 | 유형 Rule 미적용 |

**Re-apply at personalization** ✓

---

## 운영 Quantity (SMS/MMS · sync 후)

| Rule | Period | Quantity | Filter |
|------|--------|----------|--------|
| RLSmsMmsAll | 7d | **10** | 없음 |
| RLSmsMmsType2 | 7d | **2** | `@LGU_TARGET_TYPE_M_NO = 2` |

fatigue form에서 `@capCount` 변경 → Save → Rule 자동 반영.
