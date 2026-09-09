# Phase 0 — Golden Template · Write 검증

**목표:** Staging에서 Write 가능한 Pressure Rule XML 스펙 확정.

---

## 0-1. Console Export

Typology management → Email Pressure Rule 2종 Export:

| 유형 | filter |
|------|--------|
| **TOTAL** | 없음 |
| **AREA** | `@LGU_TARGET_TYPE_M_NO = {마스터 NO}` |

Repo template 참고:

- `js/templates/pressureRule_total.template.xml`
- `js/templates/pressureRule_area.template.xml`

---

## 0-2. Execute

```
JavaScript codes → phase0_validate_write.js → Execute
```

| 체크 | Test | Stage |
|------|:----:|:-----:|
| Phase 0.2 Write/delete PASS | ☐ | ☐ |
| Phase 0.3 RuleRel link PASS | ☐ | ☐ |

**사전 설정:** 스크립트 내 `TYPOLOGY_INTERNAL_NAME` = Console Typology Internal name.

---

## 0-3. Golden checklist

| 항목 | TOTAL | AREA |
|------|:-----:|:----:|
| `forceOnPrepareMessage=true` | ☐ | ☐ |
| `validity=0` | ☐ | ☐ |
| `businessRanking/periodRanking` = `7d` | ☐ | ☐ |
| AREA filter Application = Limit | ☐ | ☐ |
| filter expr = `@LGU_TARGET_TYPE_M_NO` | — | ☐ |
