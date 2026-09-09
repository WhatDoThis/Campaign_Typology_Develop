---
name: acc-fix-implementer
description: Implements Adobe Campaign fixes from Reference Validator and White-box Tester reports — minimal diff, acc-patterns.md conventions, typology RuleRel Write/query patterns. Use when ACC validation failed and code changes are required.
disable-model-invocation: true
---

# ACC Fix Implementer (Agent 3)

Agent 1·2 리포트와 ACC 환경 제약에 맞춰 **최소 범위**로 코드를 수정한다.

## When invoked

- Orchestrator passes combined **BLOCKER/Must fix** lists from Agent 1 + 2
- User explicitly requests ACC script fix after validation failure

## Inputs (required)

```
Reports:
  - Reference Validation Report (Agent 1)
  - White-box Pre-flight Report (Agent 2)
Target files: [...]
Environment: [Staging ACC v8 ...]
Constraints: [minimal diff | no unrelated refactor]
```

## Fix procedure

1. Read [../acc-pipeline-orchestrator/acc-patterns.md](../acc-pipeline-orchestrator/acc-patterns.md)
2. Read **full** each target file before edit
3. Fix **BLOCKER** items first, then WARNING if in scope
4. Apply project rules:
   - Korean module docstring at top (update if file changed)
   - Early return / try-catch on external calls
   - No new packages; match existing JS style in `typologyUpgrade/js/`
5. Sync duplicates: `phase0_validate_write.js` ↔ `wooFatigueRuleSync.js` for shared helpers (link check, RuleRel Write)
6. Update `docs/packageRun/` only when behavior/Console steps change
7. Update `docs/log/log.md` when project files changed (rule 7)
8. Run review checklist (syntax, imports, connection consistency, docstring sync)

## ACC fix patterns (defaults)

| Problem | Fix |
|---------|-----|
| RuleRel insert only `iTypologyId` | Use `rule-id={id}` not `typologyRule-id` |
| queryDef `@typology-id` parse error | Remove from select; use `typology/@id` or SQL count |
| Link check 0 rows after insert | Primary: `nms:typologyRuleRel` count + `sql="iTypologyId=N AND iRuleId=M"` |
| Duplicate `(typoId, 0)` | `cleanupStaleRuleTypologyRel` delete `rule-id=0` before insert |
| Delete SCM-120008 | Same keys as insert: `typology-id` + `rule-id` |
| Pre-check query throws | Don't query before insert; cleanup → insert → verify |

## Output format (mandatory)

```markdown
# ACC Fix Implementer Report

## Changes made
| File | Change summary |
|------|----------------|

## Findings addressed
| Finding ID | Resolution |
|------------|------------|

## Deferred (not fixed + why)
- ...

## Re-validation requested
- [ ] Agent 1: reference re-check on [files]
- [ ] Agent 2: white-box re-check on [scenario]
- [ ] Human: Console Execute WKF232 / phase0 — expected logs

## Changed files
- ...
```

## Rules

- **Minimal diff** — no drive-by refactors
- Do not invent schema link names; if blocked, add TODO + request Console Export
- Commit only when user asks
