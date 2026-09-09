---
name: acc-pipeline-orchestrator
description: Orchestrates ACC validation — always runs Reference Validator (dual-algorithm index+discovery) + White-box Tester in parallel, reviews index delta, Fix Implementer on failures, re-validate loop. Default entry for all Adobe Campaign requests.
disable-model-invocation: true
---

# ACC Pipeline Orchestrator (Agent 4)

**모든 ACC 요청의 default 진입점.** Agent 1(Reference Validator)을 **항상** 호출하고, Agent 1의 index delta를 **검수**한 뒤 Agent 2·3와 merge한다.

## When to use

- Adobe Campaign 관련 **모든** 요청 (분석, 오류 로그, JS/schema 수정, typologyUpgrade)
- User says: ACC 검증, Phase 0, typologyUpgrade, Prepare 실패, `@acc-pipeline-orchestrator`

## Pipeline diagram

```
[Scope + keywords from user/error log]
        │
        ├─► Agent 1: acc-reference-validator ──┐
        │     (Alg.2 index → Alg.1 discovery)   │
        │     updates acc-reference-index.md    │
        │                                     ├──► Orchestrator: Index delta review
        └─► Agent 2: acc-whitebox-tester ────┘              │
                        │                                    ▼
            ┌───────────┴───────────┐              Merge findings
            │ BLOCKER or HIGH risk? │
            └───────────┬───────────┘
                   NO   │   YES
                    ▼   │    ▼
                 PASS   │  Agent 3: acc-fix-implementer
                        │    ▼
                        └──► Re-run Agent 1 + 2 (iteration++)
                                    │
                              iteration > MAX?
                                    │
                              PASS or ESCALATE
```

## Orchestration steps

### 0. Prepare

- Collect scope: `git diff` paths or user-listed files under `campaign/`, `upgrade/`
- Extract **keywords** from user message (error codes: `JST-310000`, `XTK-170036`, APIs, xpath)
- Read [acc-patterns.md](acc-patterns.md)
- Set `MAX_ITERATIONS = 3`

### 1. Parallel validation (iteration N) — Agent 1 **필수**

Launch **two Task subagents in one message**. **Agent 1 생략 금지.**

**Task A — Reference Validator (DEFAULT, always)**
```
subagent_type: generalPurpose
description: ACC Reference Validator
prompt:
  Read skill: .cursor/skills/acc-reference-validator/SKILL.md
  Read index: .cursor/skills/acc-reference-validator/acc-reference-index.md
  Full Repository Path: {workspace}
  Scope: {file list}
  Keywords: {error codes, APIs from user message}
  Environment: Staging ACC v8 Managed Cloud
  Schema refs: campaign/default/schema/
  Orchestrator iteration: {N}

  MANDATORY dual-algorithm:
  1. Algorithm 2: Search acc-reference-index.md + acc-patterns.md for all keywords FIRST.
  2. Algorithm 1: WebSearch/WebFetch Experience League ONLY for MISSING/PARTIAL keywords.
  3. Update acc-reference-index.md (Index lookup + Changelog) for each new official ref found.
  4. Validate scope against R1-R16 checklist.
  5. Run R13 line-ending checks on every scoped *.js.

  Output: ACC Reference Validation Report (full template from skill)
  Include: Dual-algorithm summary + Index delta table
  Do NOT fix application code (index maintenance only).
```

**Task B — White-box Tester**
```
subagent_type: generalPurpose
description: ACC White-box Tester
prompt:
  Read skill: .cursor/skills/acc-whitebox-tester/SKILL.md
  Full Repository Path: {workspace}
  Scope: {file list}
  Scenario: {Phase 0.3 RuleRel | Prepare Control rule | syncCap | user scenario}
  Prior logs: {paste if any}
  Output: ACC White-box Pre-flight Report (full template)
  Do NOT fix code.
  MANDATORY: Run dimension F line-ending checks on every scoped *.js.
```

### 1b. Orchestrator — Index delta review (Agent 1 직후)

Agent 1 리포트의 **Index delta** 섹션 검수:

| Check | Action |
|-------|--------|
| URL is experienceleague.adobe.com or developer.campaign-api | APPROVE |
| Summary matches fetched content | APPROVE |
| Duplicate row in index | MERGE or reject duplicate |
| Non-official source only | REJECT — mark UNKNOWN in report |
| Conflicts acc-patterns | Prefer acc-patterns; note in final result |

검수 결과를 **ACC Pipeline Result**의 `Reference index review`에 기록.

### 2. Merge gate

**PASS** when ALL true:
- Agent 1 Verdict: `PASS` or `PASS_WITH_WARNINGS` (no BLOCKER)
- Agent 1 Index delta: **reviewed** (APPROVE or N/A)
- Agent 2 Overall risk: `LOW` or `MEDIUM` without P1–P2 items open

**FAIL → Fix loop** when ANY:
- Agent 1 has BLOCKER
- Agent 2 has P1–P2 predicted failure matching current code

### 3. Fix (Agent 3)

Single Task:
```
subagent_type: generalPurpose
description: ACC Fix Implementer
prompt:
  Read skill: .cursor/skills/acc-fix-implementer/SKILL.md
  Read: acc-patterns.md, acc-reference-index.md (relevant rows)
  Full Repository Path: {workspace}
  Attach full Agent 1 + Agent 2 reports below.
  Target files: {scope}
  Constraints: minimal diff, acc-patterns.md
  Implement BLOCKER + Must fix items.
  Output: ACC Fix Implementer Report
```

### 4. Re-validate

Increment iteration; repeat Step 1 on **changed files only**.

Stop when:
- PASS, or
- `iteration > MAX_ITERATIONS` → **ESCALATE** to user with reports + remaining BLOCKERs

### 5. Final delivery to user

```markdown
# ACC Pipeline Result

## Status: PASS | ESCALATE

## Iterations: N

## Summary
[1–3 sentences]

## Reference index review
- Delta rows: N added/updated
- Review: APPROVED | PARTIAL | REJECTED (reason)

## Agent reports
- Reference: [verdict + dual-algorithm hit rate]
- White-box: [risk level]
- Fix (if any): [files changed]

## Console next step (if PASS)
1. Re-Import changed JS
2. Execute / Prepare
3. Expected: ...

## Remaining human actions
- ...
```

## Invocation shortcuts (parent agent)

| User intent | Action |
|-------------|--------|
| Any ACC request (default) | **Full orchestration — Agent 1 always included** |
| "레퍼런스만 검증" | Task → Agent 1 only (dual-algorithm still mandatory) |
| "화이트박스만" | Task → Agent 2 only (exception to default) |
| "리포트 기준 수정" | Task → Agent 3 with reports |
| "전체 파이프라인" | Full orchestration |

## Rules

- **Always** invoke Agent 1 on ACC scope — no skip except user explicitly requests Agent 2 only
- Always read acc-patterns.md + point Agent 1 at acc-reference-index.md before first iteration
- Review Agent 1 index delta before declaring PASS
- Never skip Agent 1+2 after Agent 3 changes in same pipeline run
- Do not claim Console PASS without user Execute — static validation only
- Prefer `generalPurpose` subagent; use `explore` only for schema file discovery

## Related skills

- [acc-reference-validator](../acc-reference-validator/SKILL.md) + [acc-reference-index.md](../acc-reference-validator/acc-reference-index.md)
- [acc-whitebox-tester](../acc-whitebox-tester/SKILL.md)
- [acc-fix-implementer](../acc-fix-implementer/SKILL.md)
