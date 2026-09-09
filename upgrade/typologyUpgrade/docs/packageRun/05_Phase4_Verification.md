# Phase 4 — Prepare 검증

**전제:** [03_Delivery_Prepare.md](../../docs/03_Delivery_Prepare.md)

---

## 4-1. Delivery 설정

| 항목 | 값 |
|------|-----|
| Channel | `[LGU] SMS/MMS` |
| Typology | SMS/MMS fatigue Typology |
| Contact / Extraction | `GetDate()` |
| `@LGU_TARGET_TYPE_M_NO` | 시나리오별 (0=All only, 2=Type2) |

---

## 4-2. 시나리오

| # | Delivery | 기대 |
|---|----------|------|
| 1 | All (NO 미지정 또는 0) · 7일 10건 초과 | Exclusion (RLSmsMmsAll) |
| 2 | `@LGU_TARGET_TYPE_M_NO = 2` · 7일 2건 초과 | Exclusion (RLSmsMmsType2) |
| 3 | `@LGU_TARGET_TYPE_M_NO` 비움 | Type2 Rule 미적용 (정책 확인) |

---

## 4-3. 방어

| # | 테스트 | 기대 |
|---|--------|------|
| 1 | non-RLSmsMms Rule 변경 → syncAll | **변경 안 됨** |
| 2 | `@managedBySync=false` | sync skip |
| 3 | Re-apply at personalization ✓ | Prepare 후 재판정 |

---

## 4-4. Sign-off

| 체크 | Test | Stage |
|------|:----:|:-----:|
| Phase 0~3 | ☐ | ☐ |
| Prepare 3 시나리오 | ☐ | ☐ |
