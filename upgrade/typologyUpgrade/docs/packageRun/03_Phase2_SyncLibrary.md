# Phase 2 — Sync Library

## 2-1. JS Import

```
Administration > Configuration > JavaScript codes
  Namespace: lgu
  Name: lguFatigueRuleSync
  Import: typologyUpgrade/js/lguFatigueRuleSync.js
```

| 체크 | Test | Stage |
|------|:----:|:-----:|
| loadLibrary 오류 없음 | ☐ | ☐ |

---

## 2-2. syncFatigue 테스트

Console Execute:

```javascript
loadLibrary('lgu:lguFatigueRuleSync');
// fatigue row id 확인 후:
syncFatigue(<id>);
```

| 확인 | Console |
|------|---------|
| Rule Label / Quantity / Period | Typology management |
| AREA filter | `@LGU_TARGET_TYPE_M_NO` |
| Typologies 탭 | TYPO_FATIGUE_EMAIL linked |
| `@lastSyncStatus` | OK |

---

## 2-3. syncAll

```javascript
loadLibrary('lgu:lguFatigueRuleSync');
syncAll();
```

| 체크 | Test | Stage |
|------|:----:|:-----:|
| managed 2행 sync | ☐ | ☐ |
| non-RLSmsMms Rule 미변경 | ☐ | ☐ |
