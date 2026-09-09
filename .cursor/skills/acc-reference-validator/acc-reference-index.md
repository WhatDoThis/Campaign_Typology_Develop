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

### KB / Limits

| URL | Title | Topics / Keywords |
|-----|-------|-------------------|
| https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-28003 | QueryDef 10k limit | lineCount, WF JavaScript |

---

## Project-local references

| Path | Purpose |
|------|---------|
| `.cursor/skills/acc-pipeline-orchestrator/acc-patterns.md` | Console-verified xpath/FK/ACC quirks (schema export 전 **우선**) |
| `campaign/default/schema/typology*.xml` | typology / typologyRule / typologyRuleRel schema export |
| `default/schema/delivery.xml` | nms:delivery srcSchema export — `@deliveryCode`, `@isModel`; FK attrs 없음 |
| `default/inputForm/delivery.xml` | OOTB delivery form — xpathsToLoad (form-only xpath ≠ schema) |
| `upgrade/typologyUpgrade/js/*.js` | LGU typologyUpgrade Console JS |
| `upgrade/schema/delivery_*.xml` | LGU delivery schema extensions |
| `upgrade/form/deliveryCustomMMS.xml` | MMS form — SENDER, target type |
| `upgrade/docs/03_Delivery_Prepare.md` | SSOT template, Prepare checklist |
| `upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md` | Control rule, loadLibrary, Phase 3 |

---

## Changelog (Agent 1 delta log)

| Date | Change | Source |
|------|--------|--------|
| 2026-09-09 | Initial index — queryDef, Write, typology, recurring delivery, acc-patterns cross-refs | Session + Experience League |
| 2026-09-09 | `@model-id` 제거 → `@deliveryModel-id` / `@recurringDelivery-id` | Console XTK-170036 |
| 2026-09-09 | deliveryModel-id도 schema 없음 → `@deliveryCode`+`@isModel=1` SSOT lookup | default/schema/delivery.xml |
| 2026-09-09 | PrepareMessage, postTarget/ruleStep, queryDef get, broadLogRcp count, load/JST-310000 | Apply rules + Data APIs + campaign-api + acc-patterns |
