# shared — 공통 패키지

**typologySetup** · **typologyUpgrade** 모두에서 Import하는 스키마·JS.

---

## Repo

| 경로 | Console |
|------|---------|
| `schema/delivery_uplus.xml` | `uplus:delivery` — content/* (MMS 레거시) |
| `schema/delivery_lgu.xml` | `lgu:delivery` — lguMMS, `@LGU_TARGET_TYPE_M_NO` |
| `schema/deliveryMapping_uplus.xml` | `uplus:deliveryMapping` — `@custmms`, `@lgu_mms` |
| `schema/deliveryMapping_lgu.xml` | `lgu:deliveryMapping` — `@lguMMS` |
| `schema/LGU_CUSTOMER_MAPPING.xml` | `lgu:LGU_CUSTOMER_MAPPING` — `@CUST_ID_T` Pressure linked dimension |
| `js/custom_lms_mms.js` | `[LGU] SMS/MMS` External account delivery connector |

---

## Import 순서

1. `LGU_CUSTOMER_MAPPING.xml` → `default/schema/recipient_uplus.xml` (link) → Update database structure
2. `delivery_uplus.xml` → `delivery_lgu.xml`
3. `deliveryMapping_uplus.xml` → `deliveryMapping_lgu.xml`
4. Update database structure (delivery/mapping 변경 시)
4. `custom_lms_mms.js` — External account Script 연결

Delivery form·mapping hook: [typologySetup/docs/01_Console_Setup.md](../typologySetup/docs/01_Console_Setup.md) §1-4
