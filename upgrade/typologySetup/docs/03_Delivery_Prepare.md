# 3. Delivery Template · Prepare · 운영

---

## 3-1. Delivery Template (필수)

```
Delivery templates > Properties
```

### Typology 탭

| 섹션 | 필드 | Template 값 |
|------|------|-------------|
| Typology | Typology | SMS/MMS fatigue Typology |
| Pressure parameters | Weight type | `Constant` |
| | Delivery weight | `5` |
| 캠페인 유형 | (MMS form에서 지정) | **비움** |
| Capacity settings | 전체 | 비움 |

### Target · Scheduling

| 항목 | SSOT template (레이아웃) | WF component |
|------|-------------------------|--------------|
| **Target population** | 비움 | WF upstream targeting |
| **Scheduling expr** | `GetDate()` × 2 (권장) | clone 시 누락 가능 |
| **contactDateTimeZone** | `Asia/Seoul` (권장) | Control rule preTarget 패치 |

OOTB WF clone 은 scheduling 을 **복사하지 않음**.  
`lguTypologyPressureAdapter` 는 **contactDate + extraction materialize** (live + DB) — Typology **Pressure arbitration** 용.  
extractionExpr / contactDateExpr / content / SENDER / target — **건드리지 않음**.

> 상세: [04_Phase3_Triggers.md](../../typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md) §3-4

**Save** (template — scheduling 은 Write 후 Resources 불필요 Save 금지)

### 발신번호 (SENDER) · MSG — component 에서 입력

Template(DM473) 은 **비어 있어도 됨**. WF 로 component 생성 후 **delivery UI** 에서:

1. `[LGU] SMS/MMS` 탭 — **SENDER** select box 선택
2. **MSG** 입력
3. **Save** (Prepare 전 필수)

| 환경 | SENDER |
|------|--------|
| **STG / PRD** | Delivery UI Save — Control rule SENDER patch **없음** |
| **Test** | UI Save — SENDER fallback rule **Console 삭제 완료** ([04_Console_JS_Cleanup.md](04_Console_JS_Cleanup.md)) |

---

## 3-2. 테스트 Delivery

Template에서 New delivery (Channel `[LGU] SMS/MMS`):

### Typology 탭 (OOTB)

Typology · Weight · Capacity settings — **default 그대로**.

### MMS 콘텐츠 / 유형 (`deliveryCustomMMS`)

| 필드 | All 테스트 | Type2 테스트 |
|------|-----------|-------------|
| 타겟유형 | **미선택** | **NO = 2** |

### Scheduling

Extraction / Contact = **`GetDate()`**

**Save** → **Prepare**

---

## 3-3. Prepare 결과

| 상태 | 의미 |
|------|------|
| Target ready + Messages **0** | cap 제외 **정상** |
| Target ready + **1 message(s) waiting** + UI **content not entered** | **PrepareTarget만** 실행됨 — `hasDeliveryContent=false` (lguMMS 미인식). Console `nms:delivery` form Import 후 **전체 Prepare** 재실행 |
| Audit — RLSmsMmsAll / Type2 excluded | Rule 동작 |
| Excluded by arbitration | Pressure cap 초과 |

### targetReady에서 멈출 때 (DM521 등)

OOTB `hasDeliveryContent` 는 `@messageType > other`(120) 또는 html/sms 경로만 본다. **lguMMS=101** 은 해당 없음.

| 증상 | 원인 | 조치 |
|------|------|------|
| `Analysis … (N message(s) waiting)` 후 state **15** | UI가 `actionMode=2` → `PrepareTarget`만 호출 | `default/inputForm/delivery.xml` hasDeliveryContent **4곳**(main enter + Send 3곳) Console Import |
| **The delivery content has not been entered yet** | form expr 가 lguMMS MSG/SENDER 미인식 | Import 후 delivery **닫았다가 재오픈** → Send → Analyze (**Prepare**, not target-only) |
| 정상 완료 | state **25/45**, broadLog ≥ 1 | — |

### WF Prepare — form 과 별개 경로

Campaign/Recurring **WF** 는 `nms:delivery` input form 을 거치지 않음.  
OOTB campaign WF delivery activity 는 **PrepareTarget 만** 수행하는 경우가 많음 → journal 이 `Analysis … (N message(s) waiting)` 에서 **끝** (PrepareMessage 로그 없음).

| 단계 | journal / diag | 의미 |
|------|----------------|------|
| preTarget | `typologyPressureAdapter: patched … live=yes contactDate=…` | Pressure arbitration OK |
| PrepareTarget 끝 | `Analysis … (1 message(s) waiting)` | state **15**, broadLog **0** (TEST WF) |
| PrepareMessage | *(로그 없음)* | **WF 가 호출 안 함** (TEST) / OOTB (STG) |

| 조치 | Console / Typology |
|------|---------------------|
| contactDate materialize | `lguTypologyPressureAdapter.js` — preTarget `applyTypologyPressureAdapter` |
| typology postTarget PrepareMessage | **금지** — PrepareTarget pass 중 `PrepareMessageImpl` → wkDlv 손상 |

> typology **After targeting** rule 에서 `PrepareMessageImpl` 호출 시 `wkdlv_* does not exist` · Counting stuck · delivery 연쇄 생성.  
> Test `lguTest*` JS · PrepareMessage Execute 스크립트 — Console **삭제 완료** ([04_Console_JS_Cleanup.md](04_Console_JS_Cleanup.md)).

### STG 이관 범위

| 항목 | STG Import |
|------|:----------:|
| `lguTypologyPressureAdapter.js` + Control rule | ✅ |

**STG Prepare OK 조건 (발송 전):** journal `typologyPressureAdapter: patched` (또는 unchanged), arbitration 로그, `toDeliver ≥ 1`, OOTB broadLog.  
STG 는 OOTB 가 PrepareMessage·발송까지 처리 — TEST 의 state 15 + broadLog 0 패턴과 **동일하지 않을 수 있음**.

---

## 3-4. 검증 시나리오

| 조건 | 기대 |
|------|------|
| GetDate() + All Qty **10** + 7d 내 10건+ | RLSmsMmsAll excluded |
| GetDate() + `@LGU_TARGET_TYPE_M_NO=2` + 7d 2건+ | RLSmsMmsType2 excluded |
| `@LGU_TARGET_TYPE_M_NO` 비움 | Type2 Rule 미적용 |

---

## 3-5. 운영 체크리스트

| # | 항목 | OK 조건 |
|---|------|---------|
| 1 | Template Typology | SMS/MMS fatigue |
| 2 | WF Target | upstream targeting 설정 |
| 3 | Scheduling | GetDate() × 2 |
| 4 | Control rule | `RLCtrlTypologyPressureAdapter` (STG/PRD/Test 공통) |
| 5 | 타겟유형 | 발송 전 Save (`@LGU_TARGET_TYPE_M_NO`) |
| 6 | Rule Quantity | fatigue와 일치 (All **10**, Type2 **2**) |
| 7 | Re-apply at personalization | ✓ |
| 8 | Prepare Audit | exclusion 확인 |

---

## 3-6. Stage 체크

| 체크 | Test | Stage |
|------|:----:|:-----:|
| Template + GetDate() | ☐ | ☐ |
| Type2 Delivery Prepare | ☐ | ☐ |
| Type2 cap block | ☐ | ☐ |
