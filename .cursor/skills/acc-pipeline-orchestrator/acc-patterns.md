# ACC Patterns — typologyUpgrade (Console-verified)

> Staging ACC v8에서 Phase 0 디버깅으로 확인된 패턴. schema Export 전까지 **추측 xpath 금지**.  
> **공식 문서 URL·탐색:** Agent 1 → [acc-reference-index.md](../acc-reference-validator/acc-reference-index.md) (Algorithm 2 lookup first).

## nms:typologyRuleRel (NmsTypologyRuleRel)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| Write insert/delete attrs | `typology-id`, **`rule-id`** | `typologyRule-id` → `iRuleId=0`, duplicate key |
| DB columns | `iTypologyId`, `iRuleId` | — |
| Link verify (queryDef) | `nms:typologyRule` count: `[typologies/typology/@id]` + `@id=ruleId` | `condition sql=` (Managed Cloud **XTK-170016** 금지) |
| queryDef expr | **Write만** `typology-id` / `rule-id` | **`@typology-id` in queryDef** → parser `@typology`−`id` → **XTK-170036** |
| | | `[@rule-id]` on typologyRuleRel select |
| | | typologyRuleRel xpath guess |

## nms:typologyRule (typologies collection)

| Layer | Correct | Wrong |
|-------|---------|-------|
| InputForm | `xpath="typologies"`, link `typology` | — |
| count WHERE | `[typologies/typology/@id]=typoId` + `@id=ruleId` | `[typologies/@typology-id]` may parse but return 0 |
| get select | `typologies` → `typology/@id` only (link verify fallback) | `@typology-id` in node expr |
| **list linked typo ids** | `nms:typology` TYLgu% select `@id` + each `typologyRule` count `[typologies/typology/@id]` | typologyRuleRel queryDef · `@typology-id` · `typology/@id` get |

## nms:typology

- **No** `/rules/@typologyRule-id` path on typology schema (uploaded `typology.xml` has no rules collection)

## nms:typologyRule (Pressure Write)

- `@forceOnPrepareMessage` (not `@forceOnPrepare`)
- `@validity=0` for Frequency 0
- `businessRanking/@periodRanking` — schema **timespan = seconds (double)** on Write; UI displays suffix units
- `@activeForecast`, `<weightFormula>`

### ACC timespan — UI suffix vs Write (periodRanking, validity, …)

| UI suffix | Unit | Seconds |
|-----------|------|---------|
| `s` | 초 | 1 |
| `m` | 분 | 60 |
| `h` | 시 | 3,600 |
| `d` | 일 | 86,400 |
| `w` | 주 | 604,800 |

| periodDays | UI equivalent | Write `periodRanking` |
|------------|---------------|------------------------|
| 7 | `7d` | `604800` |
| 1 | `1d` | `86400` |
| 14 | `14d` | `1209600` |

Write with `"7d"` string → Pressure tab **BAS-010042** (not valid double). Use `periodDays × 86400`.

### nms:typologyRule — contextFilter / deliveryFilter (UI conditionlist)

| Layer | Correct | Wrong (UI symptom) |
|-------|---------|-------------------|
| condition | `bool-operator="AND"` + **full** `expr="@LGU_TARGET_TYPE_M_NO = 32"` | `expr="@field" operator="=" value="32"` only → Operator/Value **empty** in UI |
| humanCond | `Query: 유형마스터번호 equal to 32` | missing → query summary blank |
| contextFilter | `contextType="2"` (Delivery) + where + humanCond | `contextType` All / filter missing |
| deliveryFilter | same where + humanCond under `businessRanking` | Application only, no Limit deliveries |

## nms:typologyRule — folder link (queryDef vs Write)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| queryDef **select** node | `[folder/@id]` alias `@folder-id` | `@folder-id` in node expr → **XTK-170036** Attribute 'folder' unknown |
| queryDef **where** | `[folder/@id]!=0` or `[@folder-id]!=0` | `@folder-id` in node expr only (where OK per delivery.xml) |
| xtk.session.Write | `folder-id={id}` on `<typologyRule/>` | — |
| form xpath | `[@folder-id]` | — |

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
| `<preSave>` | ❌ | **XSV** `Element 'preSave' unknown (xtk:form)` — factory 예시 없음 |
| `<postSave>` | ✅ | Factory `campaign/default/inputForm/delivery.xml:6618-6651` — **persist 후** side effect |
| `<preDelete>` | ❌ | **XSV** — factory 예시 없음 |
| `<postDelete>` | ❌ | Factory 예시 없음 |

Save: `<leave>` schema SOAP `ValidateBeforeSave` (duplicate) → persist → `<postSave>` SyncFromForm.

Delete (Explorer): navtree `<command>` + `hiddenCommands="adbdelete"` → `DeleteWithRuleSync`.  
Form 버튼 `DeleteWithRuleSync` = Rule+fatigue 삭제 (폼 닫힘). `PreDeleteRuleSync`는 navtree/command·DeleteWithRuleSync 내부에서 호출.

### lgu:LGU_TARGET_TYPE_FATIGUE_M — form soapCall param types (Console-verified)

> **Entity attribute `type="long"` ≠ SOAP `<param type>`**. form param은 **schema `<method>` signature** 와 일치.  
> log #67·#77: `long`/`int` mismatch → `The 'long' type … does not match … ('int')`.  
> **신규 soapCall 추가 시 log #67·#76·#77 grep 필수** — `docs/log/log.md`만으로는 재발 방지 안 됨.

| soapCall | param | form `<param type>` | schema method param |
|----------|-------|---------------------|---------------------|
| ValidateBeforeSave | messageType | `byte` | `byte` |
| ValidateBeforeSave | @LGU_TARGET_TYPE_M_NO | **`int`** (not long) | **`int`** |
| ValidateBeforeSave | @id | `int` | `int` |
| SyncFromForm / DeleteWithRuleSync | @id | `int` | `int` |

Reference: `default/inputForm/delivery.xml` — `@id` soapCall always `type="int"`.

**readOnlyExpr:** `<form>` / `<container>` only — **not** `<input>`. Pattern: `<container readOnlyExpr="@managedBySync=true"><input xpath="..."/></container>` (`delivery.xml:1699`).

## nms:delivery — hasDeliveryContent (OOTB form gap, lguMMS)

| Layer | Correct | Wrong (observed) |
|-------|---------|------------------|
| `@hasDeliveryContent` expr | include `EV(@messageType,'lguMMS') and [content/lguMMS/source/MSG]!='' and SENDER` | OOTB only checks html/text/sms or `@messageType > other`(120) — **lguMMS=101 fails** |
| UI symptom | Content filled → Prepare wizard proceeds | **"The delivery content has not been entered yet"** while MSG/SENDER in DB |
| Fix (UI) | `default/inputForm/delivery.xml` **4×** hasDeliveryContent `set expr` (Import nms:delivery form) | 미Import 시 `actionMode=2` → PrepareTarget only |
| Fix (WF/server) | `lguTypologyPressureAdapter.js` preTarget: **contactDate + extraction materialize** (live+DB) | Pressure arbitration; extractionExpr alone **무효** |
| Diag | Delivery journal + Export typologyRule XML | Test `lguTest*` JS **Repo 삭제** (2026-09-14) — `04_Console_JS_Cleanup.md` §4-6 |
| WF PrepareMessage (Test only) | OOTB full Prepare on STG; Test WF often PrepareTarget-only | typology postTarget `PrepareMessageImpl` → **wkDlv corruption** |
| Console PrepareMessage | typology **외부** only if needed | **no** typology rule; **no** `load(id,true)` |
| STG Control rule | preTarget `applyTypologyPressureAdapter` only | contactDate materialize; no content; no postTarget PrepareMessage |

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
| Prepare scheduling | preTarget: **contactDate + extraction materialize** (live + DB) | extractionExpr alone **무효** for Pressure |
| Prepare lib scope | scheduling expr/date only — **no** template target/SENDER copy | SSOT template = layout shell; WF target + UI Save |
| lguMMS SENDER/MSG | **delivery component** UI select + MSG 입력 후 **Save** | template 복사 전제 → 운영 흐름과 불일치 |
| TEST SENDER fallback | delivery SENDER blank + model 에 값 있을 때만 | template 필수 가정 금지 |
| Schema attrs (delivery.xml) | `@deliveryCode`, `@isModel`, `@messageType` | `@model-id` (없음) |

## ACC JavaScript codes — E4X @ access (Console-verified)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| `delivery.@id` | **top-level function** or `prototype.method` | `{ resolve: function(d) { return d.@id; } }` object literal → **JST-310000 invalid XML name** |
| lib pattern | config object + `lguPressureAdapterResolveDeliveryId()` standalone | methods with `.@` inside `var lib = { fn: function(){} }` |
| WF/Console diag script | `queryDef` + `del.properties.@toDeliver` (select `[properties/@toDeliver]`) | `nms.delivery.load` + `d.properties.toDeliver` → **JST-310000 invalid XML name** |
| broadLog iterate | `res.broadLogRcp.@address` or `for each (var bl in res.broadLogRcp)` | `rows[i]` array index → **bl is undefined** |

## ACC JavaScript codes — naming (Console-verified)

| Layer | Correct | Wrong |
|-------|---------|-------|
| Internal name | **`lguTypologyPressureAdapter.js`** (`.js` 포함) | `lguTypologyPressureAdapter` → `JST-310003` load 실패 |
| loadLibrary | `loadLibrary("lgu:lguTypologyPressureAdapter.js")` | `.js` 생략 시 환경별 load 실패 |

## ACC JavaScript codes — line endings (Console-verified)

| Layer | Correct | Wrong (observed failure) |
|-------|---------|---------------------------|
| Line ending | **LF only** (`\n`) | CRLF → Import/eval quirks |
| Blank lines | Paragraph breaks only (1 blank max between functions) | **Blank line after every line** → `SCR-160012` |
| Docstring | Contiguous `/** ... */` block | Empty lines inside docstring block |
| Line count sanity | ~300 lines for `lguTypologyPressureAdapter.js` | ~500+ lines = per-line blank artifact |

**Agent 1 + Agent 2 must run R13 / dimension F before PASS.**
