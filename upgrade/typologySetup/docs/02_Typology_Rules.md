# 2. Typology · Pressure Rule

**경로:** `Administration > Campaign management > Typology management`  
**전제:** Campaign Optimization 패키지 · Channel `[LGU] SMS/MMS`

---

## 2-1. Typology

| 필드 | 값 |
|------|-----|
| Label | (환경 Typology — 예: SMS/MMS fatigue) |
| Internal name | fatigue `@typologyInternalName` 에 입력 |

sync JS는 `@name` 우선, 없으면 `@label` fallback lookup.

---

## 2-2. Rule 2개 (SMS/MMS · sync seed)

| Rule name | Label | Order | Quantity | Filter |
|-----------|-------|-------|----------|--------|
| `RLSmsMmsAll` | [LGU] SMS/MMS Type All | 10 | 10 / 7d | **없음** (채널 전체) |
| `RLSmsMmsType2` | [LGU] SMS/MMS Type 2 | 20 | 2 / 7d | `@LGU_TARGET_TYPE_M_NO = 2` |

**Channel:** `[LGU] SMS/MMS` (`@messageType = 101`)  
**공통:** Pressure · Active ✓ · Frequency `0s` · Re-apply at personalization ✓ · Provisional calendar ✓ · Threshold Constant

> Rule은 `lguFatigueRuleSync`가 fatigue 행에서 생성·유지. 수동 Console 편집 **금지** (`RLSmsMms*`).

---

## 2-3. Type 2 filter (Application + Limit deliveries 동일)

```
Query: 유형마스터번호 (@LGU_TARGET_TYPE_M_NO)
Operator: equal to
Value: 2
```

TOTAL (`RLSmsMmsAll`): Application / Limit **비움**.

---

## 2-4. fatigue ↔ Rule

| fatigue row | Pressure Rule |
|-------------|---------------|
| `@periodDays` | Period considered (`7d`) |
| `@capCount` | Threshold (10 / 2) |
| `@LGU_TARGET_TYPE_M_NO` | Application + Limit filter (0이면 없음) |
| `@messageType` | Channel (`101`) |

---

## 2-5. 체크

| 체크 | Test | Stage |
|------|:----:|:-----:|
| Typology + `RLSmsMms*` 2개 | ☐ | ☐ |
| Re-apply ✓ · Provisional ✓ | ☐ | ☐ |
| Type2 filter `@LGU_TARGET_TYPE_M_NO = 2` | ☐ | ☐ |

→ [03_Delivery_Prepare.md](03_Delivery_Prepare.md)
