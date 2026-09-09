# Adobe Campaign Validation Agents

> **Standing rule:** Adobe Campaign 관련 **모든** 요청·결과는 `acc-pipeline-orchestrator` 경유.  
> Orchestrator는 **항상** `acc-reference-validator`를 default 호출한다.  
> Rule: `.cursor/rules/adobe-acc-orchestrator.mdc`

ACC `typologyUpgrade` 및 Campaign JS/schema 변경 시 사용하는 **4-에이전트 파이프라인**.

## Agents

| # | Skill | Role |
|---|-------|------|
| 1 | `acc-reference-validator` | **Dual-algorithm** 공식 문서 검증 — (2) index 빠른 조회 → (1) 신규 키워드 탐색·index 갱신 → orchestrator 검수 |
| 2 | `acc-whitebox-tester` | 화이트박스 사전 실패 예측·리스크 목록 (수정 없음) |
| 3 | `acc-fix-implementer` | 1·2 리포트 기반 최소 diff 수정 |
| 4 | `acc-pipeline-orchestrator` | **Default entry** — 1+2 병렬 → index delta 검수 → 필요 시 3 → 재검증 |

Skills path: `.cursor/skills/<name>/SKILL.md`

| Resource | Path |
|----------|------|
| ACC 검증 패턴 (Console-verified) | `.cursor/skills/acc-pipeline-orchestrator/acc-patterns.md` |
| **Reference index (Agent 1 catalog)** | `.cursor/skills/acc-reference-validator/acc-reference-index.md` |

## Agent 1 — Dual-algorithm

1. **Algorithm 2 (Fast lookup):** `acc-reference-index.md` + `acc-patterns.md`에서 키워드 매칭 → 기존 URL/경로로 빠르게 검증
2. **Algorithm 1 (Discovery):** MISSING 키워드는 Experience League 검색 → 공식 URL·용도 요약을 **index에 추가** → orchestrator 검수
3. Agent 1은 application code 수정 없음 (index 유지보수만)

## Quick start

Chat에서 예시 (orchestrator가 Agent 1 자동 포함):

```
@acc-pipeline-orchestrator
typologyUpgrade/js/lguEnsureDeliveryScheduling.js 검증.
Error: XTK-170036 [@model-id]. Environment: Test ACC v8.
```

단독 호출 (예외):

```
@acc-reference-validator  ← dual-algorithm + index update 포함
@acc-whitebox-tester      ← orchestrator 없이 white-box만 (명시 시)
@acc-fix-implementer [Agent1+2 리포트]
```

## Orchestrator loop (default)

- Agent 1 + Agent 2 **병렬** (Agent 1 **항상**)
- Orchestrator **index delta 검수** 후 merge
- `MAX_ITERATIONS = 3`
- PASS: Agent1 BLOCKER 없음 + index review OK + Agent2 P1–P2 없음
- FAIL: Agent3 수정 → Agent1+2 재실행

Parent agent는 **Task tool**로 subagent 실행 (병렬 1+2, 순차 3).
