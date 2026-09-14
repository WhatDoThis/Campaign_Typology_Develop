# 4. Console JavaScript codes — 삭제 이력

**상태:** Console 정리 **완료** (2026-09-10)  
**범위:** Test · 레거시 · 중복 JS codes + Test 전용 Typology rule

---

## 4-1. Console 유지 (운영)

| Internal name | Repo | STG/PRD | Test | 용도 |
|---------------|------|:-------:|:----:|------|
| `lguTypologyPressureAdapter.js` | `typologySetup/js/` | ✅ | ✅ | Control rule — contactDate + extraction materialize |
| `lguFatigueRuleSync.js` | `typologyUpgrade/js/` | ✅ | ✅ | 피로도 cap → Pressure Rule sync |
| `custom_lms_mms.js` | `shared/js/` | ✅ | ✅ | External account delivery connector |
| `deliveryCustomizing.js` | `typologySetup/js/` | ✅ | ✅ | MMS form lib (byte length 등) |

**Control rule (STG/PRD/Test 공통):**

```javascript
loadLibrary("lgu:lguTypologyPressureAdapter.js");
applyTypologyPressureAdapter(delivery);
return true;
```

---

## 4-2. Console 삭제 완료 — Test 전용 JS

셋업 검증용. STG/PRD Import **금지**. Console 에서 **삭제 완료**.

| Internal name | Label | 삭제 사유 | Repo |
|---------------|-------|-----------|------|
| `lguTestDeliveryPrepareDiag.js` | [LGU TEST] Delivery Prepare Diag | 진단 전용 — 셋업 완료 | `_archive/test/` |
| `lguTestRunDeliveryPrepareMessage.js` | [LGU TEST] Run Delivery Prepare Message | WF PrepareMessage 격리 검증 | `_archive/test/` |
| `lguTestDeliveryMappingSchema.js` | [LGU TEST] Delivery Mapping Schema | mapping schema dump | `_archive/test/` |
| `lguTestListDeliveryMessageTypes.js` | [LGU TEST] List Delivery Message Types | messageType enum dump | `_archive/test/` |
| `lguTestInsertRecipients.js` | [LGU TEST] Insert Recipients | 테스트 Recipient 삽입 | `_archive/test/` |
| `lguTestEnsureDeliverySenderFromModel.js` | [LGU TEST] Ensure Delivery Sender From Model | Test SENDER fallback | `_archive/test/` |
| `lguTestEnsureDeliveryContentMirror.js` | [LGU TEST] Ensure Delivery Content Mirror | MSG→sms/source mirror | `_archive/test/` |
| `lguTestEnsureDeliverySchedulingMaterialize.js` | [LGU TEST] Ensure Delivery Scheduling Materialize | main lib alias (별도 rule 불필요) | `_archive/test/` |

> ~~Repo `_archive/test/`~~ — **2026-09-14 삭제** (§4-6). Console Import **금지**.

---

## 4-3. Console 삭제 완료 — 레거시 rename 대상

신규 `lguTest*` 로 대체 후 Console 에서 **삭제 완료**.

| 삭제된 Internal name | 대체 (당시) | 최종 상태 |
|--------------------|-------------|-----------|
| `lguRunDeliveryPrepareMessage.js` | `lguTestRunDeliveryPrepareMessage.js` | 둘 다 Console 삭제 |
| `validate_delivery_prepare_diag.js` | `lguTestDeliveryPrepareDiag.js` | 둘 다 Console 삭제 |
| `validate_delivery_prepareMessage.js` | *(중복)* | Console 삭제 |
| `validate_deliveryMapping_schema.js` | `lguTestDeliveryMappingSchema.js` | 둘 다 Console 삭제 |
| `list_delivery_messageTypes.js` | `lguTestListDeliveryMessageTypes.js` | 둘 다 Console 삭제 |
| `insert_test_recipients.js` | `lguTestInsertRecipients.js` | 둘 다 Console 삭제 |
| `lguEnsureDeliverySenderFromModel_TEST.js` | `lguTestEnsureDeliverySenderFromModel.js` | 둘 다 Console 삭제 |
| `lguEnsureDeliveryScheduling.js` | `lguTypologyPressureAdapter.js` | 구버전 Console 삭제, 신규명만 유지 |

---

## 4-4. Console 삭제 완료 — Test 전용 Typology rule

| Internal name | Label | 삭제 사유 |
|---------------|-------|-----------|
| `RLCtrlEnsureSender_TEST` | [LGU TEST] Ensure Sender | STG/PRD 미배포; Test SENDER fallback |
| `RLCtrlEnsureContentMirror_TEST` | *(optional)* | content mirror Test 부록 |
| `RLEnsurePrepareMsg` | *(PrepareMessage in typology)* | postTarget PrepareMessage → wkDlv 손상 |

**유지 rule:** `RLCtrlTypologyPressureAdapter` — `[LGU] Typology Pressure Adapter` (Control, order 1)

---

## 4-5. 운영 영향

| 항목 | 영향 |
|------|------|
| Pressure arbitration | **없음** — `lguTypologyPressureAdapter.js` 유지 |
| 피로도 Rule sync | **없음** — `lguFatigueRuleSync.js` 유지 |
| Delivery Prepare (STG) | **없음** — OOTB PrepareMessage 경로 |
| MMS 발송 | **없음** — `custom_lms_mms.js` + UI Save 흐름 |

---

## 4-6. Repo 정리 (2026-09-14) — Test JS archive **삭제**

Rank A 검증 완료 후 일회성 Test JS는 Repo에서 **제거**. Console에도 Import **금지**.

| 삭제된 Repo 파일 | 용도 (일회성) |
|-----------------|---------------|
| `lguTestSeedCustomerMapping.js` | CUST_ID_T backfill · LGU_CUSTOMER_MAPPING seed |
| `lguTestFixPressureRuleThresholdLink.js` | thresholdLink diag/fix |
| `lguTestInsertRecipients.js` | 테스트 recipient insert |
| `lguTestDeliveryPrepareDiag.js` | Prepare 진단 dump |
| `lguTestRunDeliveryPrepareMessage.js` | PrepareMessage 격리 실행 |
| `lguTestDeliveryMappingSchema.js` | mapping schema dump |
| `lguTestListDeliveryMessageTypes.js` | messageType enum dump |
| `lguTestEnsureDeliverySenderFromModel.js` | SENDER fallback Test |
| `lguTestEnsureDeliveryContentMirror.js` | content mirror Test |
| `lguTestEnsureDeliverySchedulingMaterialize.js` | scheduling materialize alias |

**운영 Configuration (유지):** `04-1` 표 + `upgrade/shared/schema/LGU_CUSTOMER_MAPPING.xml` + `default/schema/recipient_uplus.xml` (link) + `lguFatigueRuleSync.js` (`thresholdLink=LGU_CUSTOMER_MAPPING`).

**매핑 데이터 적재:** ETL/WF 또는 운영 배치 — Repo Test JS **없음**.
