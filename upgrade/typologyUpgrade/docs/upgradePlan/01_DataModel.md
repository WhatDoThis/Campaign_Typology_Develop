# 1. 데이터 모델 · 필드 매핑

## 1-1. 스키마 역할

| schema | 역할 | FK |
|--------|------|-----|
| `lgu:LGU_TARGET_TYPE_M` | Stage 타겟유형 마스터 (`@NO`, `@TYPE_DETAIL`) | — |
| `lgu:LGU_TARGET_TYPE_FATIGUE_M` | 피로도 cap · Rule sync 운영 | **없음** — NO·TYPE_DETAIL 값 복사 |
| `lgu:delivery` | 발송 시 `@LGU_TARGET_TYPE_M_NO` 스냅샷 | **없음** |

---

## 1-2. `lgu:LGU_TARGET_TYPE_FATIGUE_M`

### 타겟유형 참조

| attribute | type | 용도 |
|-----------|------|------|
| `@LGU_TARGET_TYPE_M_NO` | long | 마스터 `@NO` 복사. **0 = 채널 TOTAL** |
| `@TYPE_DETAIL` | string(200) | 마스터 `@TYPE_DETAIL` 복사 · UI 표시 |

### Sync identity

| attribute | type | 용도 |
|-----------|------|------|
| `@ruleInternalName` | string(64) | ↔ `nms:typologyRule/@name` (`RLSmsMms*` 필수) |
| `@typologyInternalName` | string(64) | 연결 Typology `@name` |
| `@messageType` | byte | Delivery `@messageType` (0=Email) |
| `@executionOrder` | long | Rule order |
| `@managedBySync` | boolean | JS sync 대상 (default true) |
| `@lastSyncAt` | datetime | ops |
| `@lastSyncStatus` | string(512) | OK / ERROR |

### Cap values

| attribute | Pressure Rule |
|-----------|---------------|
| `@capCount` | `businessRanking/@threshold` |
| `@periodDays` | `businessRanking/@periodRanking` → `{N}d` |
| `@active` | `@active` |
| `@label` | `@label` |

### Unique key

```
(@messageType, @LGU_TARGET_TYPE_M_NO)
(@ruleInternalName)
```

### ruleInternalName 규칙

```
RLSmsMms + Suffix

예: RLSmsMmsAll, RLSmsMmsType2
```

---

## 1-3. Delivery · Pressure Rule filter

Delivery Typology 탭에서 타겟유형 선택 → `@LGU_TARGET_TYPE_M_NO` 저장.

**영역 Rule (유형 NO = 2 예시):**

```xml
<where>
  <condition expr="@LGU_TARGET_TYPE_M_NO" operator="=" value="2"/>
</where>
```

Application + Limit deliveries **동일 조건**.

**TOTAL (`@LGU_TARGET_TYPE_M_NO = 0`):** contextFilter / deliveryFilter **없음**.

---

## 1-4. Input form · navtree

| UI | xpath / 동작 |
|----|--------------|
| 타겟유형 선택 | linkListChoice `lgu:LGU_TARGET_TYPE_M` → `@LGU_TARGET_TYPE_M_NO`, `@TYPE_DETAIL` |
| Cap | `@capCount`, `@periodDays`, `@messageType` |
| Sync 상태 | `@lastSyncStatus`, `@lastSyncAt` (read-only) |
| Save | postSave → `syncFatigueFromForm(@id)` |

---

## 1-5. Typology (수동 1회)

채널별 Typology는 자동 생성하지 않음. `@typologyInternalName`에 기존 Typology name 지정.

| Channel | Typology (예) |
|---------|---------------|
| Email | `TYPO_FATIGUE_EMAIL` (Internal name 확인) |

Rule sync 시 Typology Rules 목록에 rel 추가 (있으면 skip).
