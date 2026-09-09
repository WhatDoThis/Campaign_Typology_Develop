# Typology Rule — Console 따라하기 + 필드 레퍼런스

**대상:** Campaign Classic v7/v8 Client Console  
**공식:** [Campaign typologies](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/campaign-typologies) · [Pressure rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules)

---

## 어떤 문서를 보면 되나

| 목적 | 문서 |
|------|------|
| **구축·이관·Prepare** | [upgradeVersion/docs/00_README.md](../upgradeVersion/docs/00_README.md) |
| Typology Rule 화면·필드 의미 | **이 문서** |

---

## Part 1. Console 따라하기 — Pressure Rule 1개 만들기

### 1-1. 화면 열기

```
Administration > Campaign management > Typology management > Typology rules
→ New
```

**Pressure 선택 시 왼쪽 탭 순서:**

```
General  →  Pressure  →  Typologies
```

(`Distributed marketing` 탭은 Central/Local 패키지 있을 때만 — 보통 **SKIP**)

---

### 1-2. General 탭 — 위에서 아래로

| # | Console 화면 필드 | 처음 만들 때 | 설명 |
|---|-------------------|-------------|------|
| 1 | **Label** | 예: `RULE_EMAIL_TOTAL` | Explorer 표시명 |
| 2 | **Internal name** | 자동 생성 OK | 생성 후 변경 어려움 |
| 3 | **Rule type** | **Pressure** | ⚠ Campaign Optimization 패키지 필요 |
| 4 | **Channel** | **Email** | Rule 적용 채널 |
| 5 | **Execution order** | `10` | **작을수록 먼저** (TOTAL→UPSELL→NEWADS: 10→20→21) |
| 6 | **Active** | ✓ | OFF면 Rule 미적용 |

#### Calculation parameters (프레임)

| # | Console 화면 필드 | 권장 | 설명 |
|---|-------------------|------|------|
| 7 | **Re-apply the rule at the start of personalization** | **✓** | GetDate() Delivery + Pressure 중재 **필수** |
| 8 | **Frequency** | `0s` | Rule 계산 결과 캐시 시간. **0 = 야간 재중재까지** |

#### Application conditions

| # | Console 화면 필드 | TOTAL | UPSELL/NEWADS |
|---|-------------------|-------|---------------|
| 9 | **Edit the rule application conditions…** | **열지 않음** (전체 Email) | Delivery filter: `@LGU_TARGET_TYPE_M_NO = {유형 NO}` |

**Application conditions 편집기 (영역 Rule):**

```
Filter conditions
  Expression: @LGU_TARGET_TYPE_M_NO
  Operator:   equal to
  Value:      {마스터 @NO}
```

| # | Console 화면 필드 | 값 |
|---|-------------------|-----|
| 10 | **Description** | SKIP (선택) |

**General 탭 Save는 아직 하지 말고** → 왼쪽 **Pressure** 탭 클릭.

---

### 1-3. Pressure 탭 — 위에서 아래로

#### Targeting dimension

| # | Console 화면 필드 | 값 | 설명 |
|---|-------------------|-----|------|
| 1 | **Targeting dimension** | **Recipient** | Delivery mapping dimension과 일치 |

#### Sliding period (프레임)

| # | Console 화면 필드 | TOTAL | 설명 |
|---|-------------------|-------|------|
| 2 | **Period considered** | `7d` | 집계 기간 |
| 3 | **Period type** | `(no grouping)` | SKIP |
| 4 | **Take the deliveries into account in the provisional calendar** | ✓ | **예약 Delivery** 중재·집계 포함 |

#### Maximum number of messages (프레임)

| # | Console 화면 필드 | TOTAL | UPSELL |
|---|-------------------|-------|--------|
| 5 | **Type of threshold** | Constant | Constant |
| 6 | **Quantity** | `3` | `1` |
| 7 | **Count messages on a linked dimension** | ☐ | ☐ |
| 8 | **Formula** | (Constant면 SKIP) | (Constant면 SKIP) |

#### Default formula for computing delivery weight (프레임)

| # | Console 화면 필드 | 값 |
|---|-------------------|-----|
| 9 | **Weight formula** | `5` (기본) |

#### Messages to count (프레임) — ⚠ Restriction은 **별도 탭 없음**

| # | Console 화면 필드 | TOTAL | UPSELL/NEWADS |
|---|-------------------|-------|---------------|
| 10 | **Edit the query from the targeting dimension…** | SKIP (전체 수신자) | SKIP |
| 11 | **Limit the deliveries…** | SKIP | `@LGU_TARGET_TYPE_M_NO = {유형 NO}` |

**Limit the deliveries 편집기 (영역 Rule):**

```
Filter conditions
  Expression: @LGU_TARGET_TYPE_M_NO
  Operator:   equal to
  Value:      {마스터 @NO}
```

> **Application conditions**(General) vs **Limit the deliveries**(Pressure) — 역할이 다름.  
> - Application: **이 Delivery에 Rule 실행할지**  
> - Limit: **과거 broadLog 집계에 어떤 Delivery 포함할지**  
> 영역 Rule은 **둘 다** 같은 filter 필요.

**Pressure 탭 완료** → 왼쪽 **Typologies** 탭.

---

### 1-4. Typologies 탭

| # | Console 화면 | 값 |
|---|--------------|-----|
| 1 | **Add typologies** | `TYPO_FATIGUE_EMAIL` 선택 |
| 2 | 목록에 표시 확인 | Label / Description |

**Save** → Rule 1개 완료.

---

### 1-5. Rule type별 탭 구성 (한눈에)

| Rule type | 왼쪽 탭 | 패키지 |
|-----------|---------|--------|
| Control | General → Code → Typologies | 기본 |
| Filtering | General → Filter → Typologies | 기본 |
| **Pressure** | General → **Pressure** → Typologies | Campaign Optimization |
| Capacity | General → Capacity → Consumptions → Typologies | Campaign Optimization |
| Offer presentation | General → Offer presentation → Typologies | Interaction |

---

### 1-6. 패키지 없을 때

| 증상 | 조치 |
|------|------|
| Pressure·Capacity type 없음 | [Campaign Optimization 설치](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-15076) |
| Offer presentation 없음 | Offer engine (interaction) 패키지 |

---

## Part 2. 필드 사전 (필요할 때만)

### General — 공통

| 필드 | 설명 |
|------|------|
| Label / Internal name | 표시명 / 시스템 ID |
| Rule type | Control · Filtering · Pressure · Capacity · Offer presentation |
| Channel | 적용 채널 |
| Execution order | 같은 type 내 순서 (작을수록 먼저) |
| Active | ON/OFF |

### General — Control 전용

| 필드 | 설명 |
|------|------|
| Phase | targeting / personalization / analysis 시점 |
| Level | Warning vs Error |

### Calculation parameters (Filtering · Pressure · Capacity)

| 필드 | 설명 |
|------|------|
| Re-apply at personalization | 발송 직전 Rule 재실행 (Weight 중재) |
| Frequency | Rule **계산 결과** 캐시(초). 0 = 야간 재중재까지 |

### Application conditions vs Messages to count

| | Application (General) | Limit deliveries (Pressure) |
|--|----------------------|----------------------------|
| 질문 | 이 Delivery에 Rule **실행**? | 집계에 **어떤 Delivery** 포함? |
| 비우면 | 전체 적용 | 전체 Delivery 집계 |

### Pressure 탭 주요 필드

| 필드 | 설명 |
|------|------|
| Period considered | Sliding period (예: 7d) |
| Provisional calendar | 예약 Delivery 집계·중재 포함 |
| Quantity | Constant threshold (0 = 전체 차단) |
| Weight formula | Delivery 우선순위 기본값 (Delivery Typology Weight로 덮어쓰기 가능) |
| Linked dimension | 가구·세대 단위 통합 cap |

---

## Part 3. 부록 — Q&A 요약

> 채팅에서 질문한 항목 누적. 상세 예시는 채팅 참고.

### Q1. Frequency

**한 줄:** Analysis 후 Rule **제외 결과를 DB에 얼마나 캐시**할지(초).

| 값 | 동작 |
|----|------|
| **0** | 야간 재중재까지 재계산 안 함 |
| **> 0** | 설정 초과 시 Rule 재적용 |
| **43200 미만** | UI 경고 (최소 12h 권장) |

**Period(7d)와 다름** — Period = 이력 조회 기간 / Frequency = **계산 결과** 재사용 시간.

### Q2. Frequency 실무 예

| 예 | Frequency | Re-apply | 상황 |
|----|-----------|----------|------|
| 1 (90%) | 0 | off | 단순 주 3통 제한 |
| 2 | 0 | on | 같은 날 VIP·일반 겹침 → Weight 중재 |
| 3 | 604800 | off | 등급이 주 1회만 변경 |

### Q3. Weight

**Weight 넣는 곳:** Pressure Rule Weight formula **또는** Delivery Properties > Typology > Weight (실무는 후者).

시스템: Period·Threshold·Weight만 보고 **숫자 큰 Delivery** 살림 → Excluded by arbitration.

### Q4. Threshold (Quantity)

**한 줄:** Period 안 **최대 몇 통까지**.

| Type | 설정 |
|------|------|
| Constant | Quantity 숫자 |
| Depends on recipient | Formula (예: `Iif(@vip='Y', 5, 2)`) |

**Quantity 0** = 해당 Period 전체 차단.

Threshold = **몇 통까지** / Weight = **겹치면 누가 이김**.
