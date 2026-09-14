# ACC Reference Index

> **Agent 1 전용 카탈로그.** Algorithm 2(빠른 조회)는 **이 파일을 먼저** 검색한다.  
> Algorithm 1(탐색)으로 새 URL/패턴을 찾으면 **이 파일에 행 추가** 후 orchestrator 검수 리포트에 delta 기록.

**Maintainer:** `acc-reference-validator`  
**Last bulk update:** 2026-09-09  
**Related:** [../acc-pipeline-orchestrator/acc-patterns.md](../acc-pipeline-orchestrator/acc-patterns.md) (Console-verified, 프로젝트 우선)

---

## Index lookup (Algorithm 2)

| 키워드 / 토픽 | 1차 참조 | 용도 요약 |
|---------------|----------|-----------|
| `queryDef`, `ExecuteQuery`, `getIfExists`, `select`, `count` | [Data oriented APIs](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/data-oriented-apis) | queryDef XML 구조, operation 종류, ExecuteQuery 반환 |
| `queryDef` JS 예제, `for each`, `condition expr` | [SOAP methods in JavaScript](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/soap-methods-in-javascript) | `xtk.queryDef.create` + ExecuteQuery 루프 패턴 |
| `queryDef` WF 예제, `where`, `orderBy` | [JavaScript in workflows](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/advanced-management/javascript-in-workflows) | WF JS activity 내 queryDef 작성 |
| `queryDef` `lineCount`, 10000 limit | [QueryDef 10k KB](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-28003) | 대량 select 시 lineCount 필수 |
| `xtk.session.Write`, persist, `_operation` | [Data oriented APIs — Write](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/data-oriented-apis) | insert/update/delete, XML entity Write |
| `loadLibrary`, JS codes cache | [loadLibrary API](https://experienceleague.adobe.com/developer/campaign-api/api/f-loadLibrary.html) | typology/WF에서 라이브러리 로드; cache=false 시 logon 필요 |
| JavaScript codes 관리 | [Work with JavaScript codes (v8)](https://experienceleague.adobe.com/en/docs/campaign-web/v8/conf/javascript-codes) | Administration > JavaScript codes, namespace:name |
| Control typology rule, `delivery` 객체, Code tab | [Configure control rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/control-rules) | Prepare 전 JavaScript; `delivery.properties`, logWarning |
| Typology / Pressure / Filtering 개요 | [Work with typologies (v8)](https://experienceleague.adobe.com/en/docs/campaign-web/v8/conf/typologies) | Rule 종류, Prepare 단계 exclusion |
| `logWarning`, typology rule 로그 | [logWarning API](https://experienceleague.adobe.com/developer/campaign-api/api/f-logWarning.html) | delivery journal / typology rule 로그 |
| Recurring delivery, WF clone, template occurrence | [Recurring delivery](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/wf-activities/action-activities/recurring-delivery) | 실행마다 새 delivery instance; campaign-specific template |
| WF Delivery control, Prepare | [Delivery control](https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/wf-activities/action-activities/delivery-control) | Prepare/start/pause delivery from WF |
| SOAP method library, schema namespace | [Implementing SOAP methods](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/implementing-soap-methods) | JavaScript Code entity = method library |
| SSOT template, `@deliveryCode`, `@isModel` | [acc-patterns.md § nms:delivery](../acc-pipeline-orchestrator/acc-patterns.md) | schema export — FK attrs 없음, code+isModel lookup |
| `default/schema/delivery.xml` | Project-local | nms:delivery OOTB schema — xpath 검증 SSOT |
| E4X `@`, object literal, JST-310000 | [acc-patterns.md § E4X @ access](../acc-pipeline-orchestrator/acc-patterns.md) | `.@id`는 top-level/prototype만 |
| JS Internal name `.js`, loadLibrary | [acc-patterns.md § JS naming](../acc-pipeline-orchestrator/acc-patterns.md) | Console Internal name에 `.js` 필수 |
| typologyRuleRel, `rule-id`, `typology-id` | [acc-patterns.md § typologyRuleRel](../acc-pipeline-orchestrator/acc-patterns.md) | Write FK, link verify xpath |
| Pressure rule fields | [acc-patterns.md § typologyRule](../acc-pipeline-orchestrator/acc-patterns.md) | forceOnPrepareMessage, validity, businessRanking |
| Input form `<enter>`, `<postSave>`, `<button>` | [acc-patterns.md § Input form](../acc-pipeline-orchestrator/acc-patterns.md) | xtk:form lifecycle |
| JS line endings, SCR-160012 | [acc-patterns.md § line endings](../acc-pipeline-orchestrator/acc-patterns.md) | LF only, blank line artifact |
| `nms.delivery.PrepareMessage`, PrepareMessageImpl | [nms:delivery schema methods](https://experienceleague.adobe.com/developer/campaign-api/api/s-nms-delivery.html) + `default/schema/delivery.xml` | Message personalization; xtk:job mechanism; `nms.delivery.create(el)` → PrepareMessageImpl |
| typology `postTarget`, `@ruleStep`, After targeting | [Apply typology rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/apply-rules) + `default/schema/typologyRule.xml` `@ruleStep` enum | Control rule phase after targeting; `toDeliver` known; maps UI "After targeting" |
| `queryDef` `operation="get"` | [Data oriented APIs — get operation](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/data-oriented-apis) | Single-record retrieve; error if missing; prefer over `nms.delivery.load` in Console JS |
| `nms:broadLogRcp` `operation="count"`, `@count` | [Data oriented APIs — count operation](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/data-oriented-apis) | `[@delivery-id]` filter; ExecuteQuery returns `@count` or number |
| `nms.delivery.load`, JST-310000 load too many arguments | [load API](https://experienceleague.adobe.com/developer/campaign-api/api/f-load.html) + [acc-patterns § E4X](../acc-pipeline-orchestrator/acc-patterns.md) | Single `key` param only; `load(id,true)` → JST-310000; use queryDef get + PrepareMessage(del) |
| `[@linkedDelivery-id]`, linked delivery skip PrepareMessage | OOTB `js/delivery.js` Prepare + [acc-patterns § hasDeliveryContent](../acc-pipeline-orchestrator/acc-patterns.md) | OOTB skips PrepareMessage when linkedDelivery-id set; typology guard mirrors |
| `thresholdLink`, linked dimension, Count messages on linked dimension | [Configure pressure rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) + `default/schema/typologyRule.xml` + `default/typologyRule/typologyRule_InputForm.xml` | `businessRanking/@thresholdLink`; pathEdit `useLink11Path="true"` — link path to related dimension (household, visitor), not same-schema scalar |
| `useGrouping`, thresholdLink checkbox uncheck | `default/typologyRule/typologyRule_InputForm.xml` (OOTB form export) + [Configure pressure rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) | Checkbox binds **`/tmp/@useGrouping`** (volatile); `<enter>` sets it from `@thresholdLink!=''` only — **no postSave/leave** clears `@thresholdLink` on uncheck. Persisted attr remains until Write/delete/recreate. Not documented as Adobe defect. |
| Pressure targeting dimension vs delivery mapping | [Configure pressure rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) | Rule `@schema` must match delivery mapping targeting dimension; address field (@mobilePhone) is separate from count key |
| Target mapping address vs broadLog keys | [Target mapping](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/use-a-custom-recipient-table/target-mapping) + `default/js/delivery.js` `@BLKeys` | Mapping sets address xpath for send; broadLogRcpKeys from mapping storage — pressure counts via broadLog/forecast logs keyed to targeting entity |
| `XTK-170036`, Unable to parse expression | [ka-14701](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-14701) + [Troubleshooting for Marketers](https://experienceleague.adobe.com/en/docs/campaign-standard-learn/tutorials/strategy/troubleshooting-for-marketers) + [ka-14146](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-14146) | Generic XTK expression parse failure — missing package/field, renamed expr, or **incomplete filter clause** (trailing `AND` / empty operand). Not specific to empty filter shells. |
| `XTK-170037`, binary operator missing operand | [ka-14146](https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-14146) | Incomplete filter expression — e.g. `like` without pattern; often co-occurs with XTK-170036 on malformed multi-AND assembly. |
| Pressure rule empty `contextFilter` / `deliveryFilter` shell | [Configure pressure rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) + `default/schema/typologyRule.xml` | **Valid OOTB** — default counts all messages; `<where filteringSchema="…"/>` without `<condition>` is normal Console export. Does **not** inherently cause XTK-170036 (Console-verified STG v8.9). |
| Pressure broadLog count predicates | [Configure pressure rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) + [Tables to maintain — NmsBroadLogRcp](https://experienceleague.adobe.com/en/docs/campaign-classic/using/monitoring-campaign-classic/database-maintenance/tables-to-maintain) | Prepare/arbitration counts sent+forecast logs (`[@delivery-id]`, `[@failureReason]`, `[@targetCode]='__MAIN__'` are OOTB broadLog filters). User rule filters merge **after** base predicates via `where/condition/@expr`. |
| `where/condition` `@expr` / `@boolOperator` | [condition element (schema ref)](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/schema-reference/elements-attributes/condition) + [Define filter conditions](https://experienceleague.adobe.com/en/docs/campaign-classic/using/getting-started/creating-queries/defining-filter-conditions) | Each `<condition>` needs complete `@expr`; multiple conditions default-AND. Empty/malformed `@expr` → trailing `AND` parse error (XTK-170036). Prefer `bool-operator="AND"` + full expr in typologyRule Write (acc-patterns). |
| `thresholdLink` same-schema scalar misuse | [Configure pressure rules — linked dimension](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) + `typologyRule_InputForm.xml` `useLink11Path="true"` | Official: linked **table** (visitor, household). `@thresholdLink` non-empty enables grouping (`/tmp/@useGrouping`). Same-schema `@field` (e.g. `@CUST_ID`) ≠ linked dimension — may alter broadLog count query path vs rules without `thresholdLink`. |
| `nms:tmpBroadcast`, `@delivery-id`, PrepareTargetImpl | [Restrict PI view — tmpBroadcast schema](https://experienceleague.adobe.com/en/docs/campaign/campaign-v8/developer/schemas-forms/restrict-pi-view) + `default/schema/delivery.xml` `@delivery-id` sort expr + [64-bit schemas](https://experienceleague.adobe.com/en/docs/experience-cloud/campaign/technotes/64-bit-tables) | **Working schema** “Delivery messages being prepared” during analysis; pressure count may join `[nms:tmpBroadcast:@delivery-id]` to current delivery when grouping/`thresholdLink` active — distinct from trailing-`AND` empty-filter bug. |
| `PrepareTargetImpl`, `nms:delivery` analysis | `default/schema/delivery.xml` method + [Apply typology rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/apply-rules) | Target count + arbitration (step 3 Pressure); XSV-350122 = process stopped wrapper when inner expr/method fails. |
| `XSV-350122`, Prepare hard stop | User Test v6.7 build 9396 vs STG v8.9 build 9836 evidence + [Apply typology rules](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/apply-rules) | Generic “process stopped” after `PrepareTargetImpl` failure; same malformed pressure filter may **warn** on STG (DLV-490119) but **hard-stop** on Test 6.7 — severity delta, not different Rule XML requirement for baseline. |
| Customer/account fatigue (not recipient id) | [About data model](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/data-model/about-data-model) + [Target mapping](https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/use-a-custom-recipient-table/target-mapping) + [Configure pressure rules — linked dimension](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) | Official paths: (A) **linked table** via `thresholdLink` + `useLink11Path` (visitor, household/contact — **link xpath**, not same-schema `@field`); (B) **customer as targeting dimension** via custom target mapping (pressure counts per entity without thresholdLink); (C) per-recipient default when `thresholdLink` empty. No doc for `@CUST_ID` scalar in `thresholdLink`. |
| LGU Rank A `thresholdLink` canonical (Test v7 9396) | `uplus:recipient` link `LGU_CUSTOMER_MAPPING` + `lgu:LGU_CUSTOMER_MAPPING` + [Configure pressure rules — linked dimension](https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules) + `typologyRule_InputForm.xml` `useLink11Path` | **Persisted** `businessRanking/@thresholdLink="LGU_CUSTOMER_MAPPING"` (recipient **link element name** only). **Invalid:** `@CUST_ID_T`, `LGU_CUSTOMER_MAPPING/@CUST_ID_T`, UI attr label "고객번호 TEST". Join key `@CUST_ID_T` lives in link `<join>` — not in `thresholdLink` string. Scalar/attr path → malformed broadLog+tmpBroadcast filter → XTK-170036/037 trailing AND → XSV-350122 on Test 6.7. |

---

## Official Adobe Documentation (by domain)

### API & Scripting

| URL | Title | Topics / Keywords |
|-----|-------|-------------------|
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/data-oriented-apis | Data oriented APIs | Write, ExecuteQuery, queryDef schema |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/soap-methods-in-javascript | SOAP methods in JavaScript | xtk.queryDef.create, namespace objects |
| https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/advanced-management/javascript-in-workflows | JavaScript in workflows | queryDef where/orderBy, WF patterns |
| https://experienceleague.adobe.com/developer/campaign-api/api/f-loadLibrary.html | loadLibrary | typology rule, workflow, cache |
| https://experienceleague.adobe.com/developer/campaign-api/api/f-logWarning.html | logWarning | typology rule, delivery log |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/api/implementing-soap-methods | Implementing SOAP methods | JavaScript Code library entity |

### Typology & Delivery

| URL | Title | Topics / Keywords |
|-----|-------|-------------------|
| https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/control-rules | Configure control rules | Control rule JS, delivery object, Prepare |
| https://experienceleague.adobe.com/en/docs/campaign-web/v8/conf/typologies | Work with typologies | Pressure, Filtering, Prepare exclusion |
| https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/wf-activities/action-activities/recurring-delivery | Recurring delivery | WF template occurrence, clone behavior |
| https://experienceleague.adobe.com/en/docs/campaign/automation/workflows/wf-activities/action-activities/delivery-control | Delivery control | Prepare, start delivery from WF |
| https://experienceleague.adobe.com/en/docs/campaign-web/v8/conf/javascript-codes | JavaScript codes (v8) | Administration, reusable functions |
| https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/apply-rules | Apply typology rules | ruleStep phases, postTarget, execution order |
| https://experienceleague.adobe.com/developer/campaign-api/api/s-nms-delivery.html | nms:delivery schema | PrepareMessage, PrepareTarget, load, save |
| https://experienceleague.adobe.com/developer/campaign-api/api/f-load.html | load (generic schema) | Single-key entity load; typology rule context |
| https://experienceleague.adobe.com/en/docs/campaign/automation/campaign-optimization/pressure-rules | Configure pressure rules | thresholdLink / linked dimension, threshold, period, broadLog counting |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/use-a-custom-recipient-table/target-mapping | Target mapping | Targeting dimension, address mapping, broadLog schema generation |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/schema-reference/elements-attributes/condition | condition element (schema ref) | `@expr`, `@boolOperator`, filter AND/OR assembly |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/getting-started/creating-queries/defining-filter-conditions | Define filter conditions | AND/OR/EXCEPT linking; incomplete condition → parse errors |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/monitoring-campaign-classic/database-maintenance/tables-to-maintain | Tables to maintain | NmsBroadLogRcp — pressure count source table |
| https://experienceleague.adobe.com/en/docs/campaign/campaign-v8/developer/schemas-forms/restrict-pi-view | Restrict PI view (tmpBroadcast sample) | nms:tmpBroadcast extendedSchema — messages being prepared |
| https://experienceleague.adobe.com/en/docs/experience-cloud/campaign/technotes/64-bit-tables | 64-bit schemas technote | nms:tmpBroadcast / tmpMarketingPressure message-id |
| https://experienceleague.adobe.com/en/docs/campaign-classic/using/configuring-campaign-classic/data-model/about-data-model | About data model | households, accounts as targeting dimension; not recipient-centric |

### KB / Limits

| URL | Title | Topics / Keywords |
|-----|-------|-------------------|
| https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-28003 | QueryDef 10k limit | lineCount, WF JavaScript |
| https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-14701 | XTK-170036 parse expression | Missing package/field — generic parse failure |
| https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-14146 | XTK-170036 / XTK-170037 incomplete AND | Trailing AND, `like` missing operand — malformed filter assembly |

---

## Project-local references

| Path | Purpose |
|------|---------|
| `.cursor/skills/acc-pipeline-orchestrator/acc-patterns.md` | Console-verified xpath/FK/ACC quirks (schema export 전 **우선**) |
| `campaign/default/schema/typology*.xml` | typology / typologyRule / typologyRuleRel schema export |
| `default/schema/delivery.xml` | nms:delivery srcSchema export — `@deliveryCode`, `@isModel`; FK attrs 없음 |
| `default/inputForm/delivery.xml` | OOTB delivery form — xpathsToLoad (form-only xpath ≠ schema) |
| `upgrade/typologyUpgrade/js/*.js` | LGU fatigue Rule sync Console JS |
| `upgrade/typologySetup/js/lguTypologyPressureAdapter.js` | LGU Pressure Adapter (운영) |
| `upgrade/typologySetup/docs/04_Console_JS_Cleanup.md` | Console JS 삭제 이력 · Test archive Repo 제거 (2026-09-14) |
| `upgrade/shared/schema/delivery_*.xml` | LGU delivery schema extensions (공통) |
| `upgrade/typologySetup/form/deliveryCustomMMS.xml` | MMS form — SENDER, target type |
| `upgrade/typologySetup/docs/03_Delivery_Prepare.md` | SSOT template, Prepare checklist |
| `upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md` | Control rule, loadLibrary, Phase 3 |
| `default/schema/recipient_uplus.xml` | uplus:recipient `@CUST_ID_T` + link `LGU_CUSTOMER_MAPPING` → `lgu:LGU_CUSTOMER_MAPPING` |
| `upgrade/shared/schema/LGU_CUSTOMER_MAPPING.xml` | Rank A pressure linked-dimension table (PK `@CUST_ID_T`) |
| `lguFatigueRuleSync.js` `PRESSURE_THRESHOLD_LINK` | Operational — Write `thresholdLink=LGU_CUSTOMER_MAPPING`; UI Count link = link element only |

---

## Changelog (Agent 1 delta log)

| Date | Change | Source |
|------|--------|--------|
| 2026-09-09 | Initial index — queryDef, Write, typology, recurring delivery, acc-patterns cross-refs | Session + Experience League |
| 2026-09-09 | `@model-id` 제거 → `@deliveryModel-id` / `@recurringDelivery-id` | Console XTK-170036 |
| 2026-09-09 | deliveryModel-id도 schema 없음 → `@deliveryCode`+`@isModel=1` SSOT lookup | default/schema/delivery.xml |
| 2026-09-09 | PrepareMessage, postTarget/ruleStep, queryDef get, broadLogRcp count, load/JST-310000 | Apply rules + Data APIs + campaign-api + acc-patterns |
| 2026-09-11 | thresholdLink, linked dimension, pressure targeting vs mapping address | Configure pressure rules + typologyRule schema/form + target mapping |
| 2026-09-11 | XTK-170036/037, empty filter shells valid, broadLog count, condition @expr, thresholdLink scalar misuse | ka-14701 + ka-14146 + pressure rules + condition schema ref + tables-to-maintain + user STG export evidence |
| 2026-09-11 | nms:tmpBroadcast pressure join, PrepareTargetImpl, XSV-350122 vs DLV-490119 severity (Test 6.7 vs STG 8.9) | restrict-pi-view + delivery.xml + 64-bit tables + user Prepare logs iteration 2 |
| 2026-09-11 | useGrouping checkbox one-way bind — uncheck does not clear persisted @thresholdLink | typologyRule_InputForm.xml OOTB export + pressure-rules (linked dimension optional) |
| 2026-09-11 | Customer/account fatigue — linked table vs targeting dimension vs thresholdLink scalar (@CUST_ID unsupported) | about-data-model + target-mapping + pressure-rules Maximum number of messages (iteration 1) |
| 2026-09-14 | Test lguTest* archive removed from repo; operational thresholdLink via lguFatigueRuleSync | 04_Console_JS_Cleanup §4-6 + Rank A PASS |
| 2026-09-11 | LGU Rank A canonical thresholdLink=`LGU_CUSTOMER_MAPPING`; invalid @CUST_ID_T / link/@attr / UI label "고객번호 TEST"; Test v7 9396 XTK-170036+tmpBroadcast→XSV-350122 | recipient_uplus.xml + LGU_CUSTOMER_MAPPING.xml + pressure-rules + typologyRule_InputForm + user Prepare logs (orchestrator iter 1) |
