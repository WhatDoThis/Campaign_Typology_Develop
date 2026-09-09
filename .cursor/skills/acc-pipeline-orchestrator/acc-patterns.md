# ACC Patterns — typologyUpgrade (Console-verified)

> Staging ACC v8에서 Phase 0 디버깅으로 확인된 패턴. schema Export 전까지 **추측 xpath 금지**.  
> **공식 문서 URL·탐색:** Agent 1 → [acc-reference-index.md](../acc-reference-validator/acc-reference-index.md) (Algorithm 2 lookup first).

## nms:typologyRuleRel (NmsTypologyRuleRel)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| Write insert/delete attrs | `typology-id`, **`rule-id`** | `typologyRule-id` → `iRuleId=0`, duplicate key |
| DB columns | `iTypologyId`, `iRuleId` | — |
| Link verify (queryDef) | `nms:typologyRule` count/get: `[typologies/typology/@id]` | `condition sql=` (Managed Cloud **XTK-170016** 금지) |
| | | `@typology-id` in select expr |
| | | typologyRuleRel xpath guess |

## nms:typologyRule (typologies collection)

| Layer | Correct | Wrong |
|-------|---------|-------|
| InputForm | `xpath="typologies"`, link `typology` | — |
| count WHERE | `[typologies/typology/@id]=typoId` + `@id=ruleId` | `[typologies/@typology-id]` may parse but return 0 |
| get select | `typologies` → `typology/@id` only | `@typology-id` in node expr |

## nms:typology

- **No** `/rules/@typologyRule-id` path on typology schema (uploaded `typology.xml` has no rules collection)

## nms:typologyRule (Pressure Write)

- `@forceOnPrepareMessage` (not `@forceOnPrepare`)
- `@validity=0` for Frequency 0
- `businessRanking/@periodRanking`, `@activeForecast`, `<weightFormula>`

## ACC E4X queryDef

```javascript
var cond = "@name='" + name + "'";  // variable only
<condition expr={cond}/>
```

- Prefer `operation="select"` + `for each` over `getIfExists` for `.@id`
- Rule delete test: `_key="@name"`

## Phase 0 test constants

- `TYPOLOGY_LABEL = "TYPO_FATIGUE_EMAIL"`
- Internal name: `wooTypoFatigueEmail`
- Test rule: `wooRuleEmailPhase0Test`

## Schema exports (repo)

- `campaign/default/schema/typology.xml`
- `campaign/default/schema/typologyRule.xml`
- `campaign/default/schema/typologyRuleRel.xml` — **placeholder; Console Export로 교체**

## Input form lifecycle (factory-verified)

| Tag | Supported | Reference |
|-----|-----------|-----------|
| `<enter>` / `<leave>` | ✅ | Adobe docs; validation·context prep |
| `<postSave>` | ✅ | Factory `campaign/default/inputForm/delivery.xml:6618-6651` — **persist 후** side effect |
| `<postDelete>` | ❌ | Factory 예시 없음 — schema SOAP `DeleteWithRuleSync` 사용 |

Save sync: `<postSave>` + `syncCapFromForm(@id)`.

Delete: Explorer 표준 Delete(cap만). Rule+ cap 동시 삭제는 schema SOAP `DeleteWithRuleSync` — form UI 버튼 없음(운영 혼란 방지).

**readOnlyExpr:** `<form>` / `<container>` only — **not** `<input>`. Pattern: `<container readOnlyExpr="@managedBySync=true"><input xpath="..."/></container>` (`delivery.xml:1699`).

## nms:delivery — hasDeliveryContent (OOTB form gap, lguMMS)

| Layer | Correct | Wrong (observed) |
|-------|---------|------------------|
| `@hasDeliveryContent` expr | include `EV(@messageType,'lguMMS') and [content/lguMMS/source/MSG]!='' and SENDER` | OOTB only checks html/text/sms or `@messageType > other`(120) — **lguMMS=101 fails** |
| UI symptom | Content filled → Prepare wizard proceeds | **"The delivery content has not been entered yet"** while MSG/SENDER in DB |
| Fix (UI) | `default/inputForm/delivery.xml` **4×** hasDeliveryContent `set expr` (Import nms:delivery form) | 미Import 시 `actionMode=2` → PrepareTarget only |
| Fix (WF/server) | `lguEnsureDeliveryScheduling.js` preTarget: lguMMS MSG → `content/sms/source` mirror | OOTB PrepareMessage reads sms CDATA; nested lguMMS MSG ignored → state 15, broadLog 0 |
| Diag | `lguTestDeliveryPrepareDiag(id)` — check `smsSource len` | Test Console only |
| WF PrepareMessage (Test only) | Typology **postTarget** `ensureDeliveryPrepareMessageForTypology(delivery)` — in-memory delivery, **no WF js6** | delivery component loading → `vars.deliveryId` unavailable; STG rule **미배포** |
| Console PrepareMessage test | `lguTestRunDeliveryPrepareMessage(id)` — queryDef get, **no** `nms.delivery.load(id,true)` | STG Import 불필요 |
| STG Control rule | preTarget `ensureDeliveryPrepareForTypology` only | scheduling + content mirror; no postTarget PrepareMessage |

## nms:delivery — SSOT template resolve (schema export verified)

> Source: `default/schema/delivery.xml` — `@model-id`, `@deliveryModel-id`, `@recurringDelivery-id` **없음**.  
> Form xpaths(`inputForm/delivery.xml`)에만 등장 — queryDef select **금지** (XTK-170036).

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| SSOT template role | layout shell only (channel form, typology) | target/SENDER copy from template |
| Control rule entry | `return true` after patch calls | missing return → **Rule detected a problem** |
| WF component detect | `[@workflow-id]`, `[operation/@id]` (xtk:job inherit) | — |
| queryDef FK / link | `[mapping/@id]`, `[@mapping-id]` in node expr | `@mapping-id` in node expr → **XTK-170036** Attribute 'mapping' unknown |
| delivery properties | `[properties/@toDeliver]` (label "Messages to send") | `[properties/@toSend]` → **XTK-170036** Attribute 'toSend' unknown |
| getIfExists nms:delivery | `var row = q.ExecuteQuery(); row.@id` | `res.delivery.@id` → **빈 필드** (래퍼 없음) |
| lib auto-exec | WF: `loadLibrary` + `diagFn(id)` only | lib bottom `diagFn(id)` + WF call → **로그 2회** |
| Prepare scheduling | preTarget: **live** `delivery.scheduling.contactDate=getCurrentDate()` + DB `formatDate` Write | DB만 Write → Pressure **No contact date**; raw Date Write → TIM-030009 |
| Prepare lib scope | scheduling expr/date only — **no** template target/SENDER copy | SSOT template = layout shell; WF target + UI Save |
| lguMMS SENDER/MSG | **delivery component** UI select + MSG 입력 후 **Save** | template 복사 전제 → 운영 흐름과 불일치 |
| TEST SENDER fallback | delivery SENDER blank + model 에 값 있을 때만 | template 필수 가정 금지 |
| Schema attrs (delivery.xml) | `@deliveryCode`, `@isModel`, `@messageType` | `@model-id` (없음) |

## ACC JavaScript codes — E4X @ access (Console-verified)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| `delivery.@id` | **top-level function** or `prototype.method` | `{ resolve: function(d) { return d.@id; } }` object literal → **JST-310000 invalid XML name** |
| lib pattern | config object + `lguPrepareResolveDeliveryId()` standalone | methods with `.@` inside `var lib = { fn: function(){} }` |
| WF/Console diag script | `queryDef` + `del.properties.@toDeliver` (select `[properties/@toDeliver]`) | `nms.delivery.load` + `d.properties.toDeliver` → **JST-310000 invalid XML name** |
| broadLog iterate | `res.broadLogRcp.@address` or `for each (var bl in res.broadLogRcp)` | `rows[i]` array index → **bl is undefined** |

## ACC JavaScript codes — naming (Console-verified)

| Layer | Correct | Wrong |
|-------|---------|-------|
| Internal name | **`lguEnsureDeliveryScheduling.js`** (`.js` 포함) | `lguEnsureDeliveryScheduling` → `JST-310003` load 실패 |
| loadLibrary | `loadLibrary("lgu:lguEnsureDeliveryScheduling.js")` | `.js` 생략 시 환경별 load 실패 |

## ACC JavaScript codes — line endings (Console-verified)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| Line ending | **LF only** (`\n`) | CRLF → Import/eval quirks |
| Blank lines | Paragraph breaks only (1 blank max between functions) | **Blank line after every line** → `SCR-160012` |
| Docstring | Contiguous `/** ... */` block | Empty lines inside docstring block |
| Line count sanity | ~250 lines for `lguEnsureDeliveryScheduling.js` | ~500+ lines = per-line blank artifact |

**Agent 1 + Agent 2 must run R13 / dimension F before PASS.**
