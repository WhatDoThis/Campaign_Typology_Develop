# 2. JS Sync 라이브러리 (`lguFatigueRuleSync.js`)

**배치:** `typologyUpgrade/js/lguFatigueRuleSync.js`  
**Console namespace:** `lgu`

---

## 2-1. 모듈 구조

```
lguFatigueRuleSync.js
├── guard        isManagedRuleName, isFatigueManaged
├── query        loadFatigueById, loadRuleByName, loadTypologyRef
├── build        buildPressureRuleXml, buildTargetTypeWhere
├── persist      writeRule, linkRuleToTypology, unlinkRuleFromTypology
└── sync API     syncFatigue, syncAll, deleteFatigueWithRuleSync
```

---

## 2-2. Public API

| 함수 | 용도 |
|------|------|
| `syncFatigue(fatigueId)` | 1행 → Rule Write + Typology link |
| `syncAll()` | `@managedBySync=true` 전체 reconcile |
| `syncFatigueFromForm(fatigueId)` | form postSave entry |
| `syncFatigueDelete(ruleName, typoName)` | RLSmsMms* Rule 삭제 + unlink |
| `deleteFatigueWithRuleSync(fatigueId)` | Rule + fatigue row 삭제 |
| `syncAllScheduled()` | Technical WF entry |

**Schema SOAP:** `lgu:LGU_TARGET_TYPE_FATIGUE_M.DeleteWithRuleSync(fatigueId)`

---

## 2-3. buildPressureRuleXml

| Rule 필드 | fatigue row |
|-----------|-------------|
| `@name` | `@ruleInternalName` |
| `@label` | `@label` |
| `@messageType` | `@messageType` |
| `@order` | `@executionOrder` |
| `@active` | `@active` |
| `@forceOnPrepareMessage` | `true` (고정) |
| `@validity` | `0` |
| `businessRanking/@periodRanking` | `{periodDays}d` |
| `businessRanking/@threshold` | `@capCount` |
| `contextFilter` / `deliveryFilter` | `@LGU_TARGET_TYPE_M_NO` (0이면 없음) |

---

## 2-4. 방어 규칙

| 규칙 | 동작 |
|------|------|
| `RLSmsMms*` prefix | managed Rule만 Write/delete |
| `@managedBySync=false` | sync skip |
| Typology missing | throw + `@lastSyncStatus=ERROR` |
| RuleRel | `typology-id` + `rule-id` Write/delete |

---

## 2-5. 트리거

| 이벤트 | 동작 |
|--------|------|
| fatigue form Save | postSave → `syncFatigueFromForm` |
| 일일 WF | `syncAllScheduled()` |
| Explorer Delete | `DeleteWithRuleSync` (관리자) |

---

## 2-6. queryDef 패턴

```javascript
var condId = "@id=" + String(fatigueId);
var q = xtk.queryDef.create(
  <queryDef schema="lgu:LGU_TARGET_TYPE_FATIGUE_M" operation="get">
    <where><condition expr={condId}/></where>
  </queryDef>
);
```

ACC E4X: `condition expr` 는 **변수** `{condId}` 로만 전달.
