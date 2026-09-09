# Golden Rule XML templates

Phase 0 Console Export 산출물을 `*.golden.xml` 로 저장.

| 파일 | Rule 유형 |
|------|-----------|
| `pressureRule_total.template.xml` | 채널 TOTAL — filter 없음 |
| `pressureRule_area.template.xml` | 유형별 — `@LGU_TARGET_TYPE_M_NO` filter |

`lguFatigueRuleSync.buildPressureRuleXml()` 은 cap 행 값으로 Rule XML 을 동적 생성.
