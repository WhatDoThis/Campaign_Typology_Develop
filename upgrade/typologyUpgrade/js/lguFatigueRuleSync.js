/**
 * lgu.lguFatigueRuleSync.js (타겟유형 피로도 ↔ Pressure Rule sync)
 * ================================================================
 * lgu:LGU_TARGET_TYPE_FATIGUE_M CRUD → nms:typologyRule Write. RLSmsMms* prefix만 관리.
 *
 * [Main Functions]
 * ===========
 * - syncFatigue / syncAll: fatigue row → Rule insertOrUpdate + Typology link
 * - syncFatigueDelete: managed Rule 삭제 + RuleRel unlink
 * - deleteFatigueWithRuleSync: fatigue+Rule 삭제 (schema SOAP DeleteWithRuleSync)
 * - syncFatigueFromForm: form postSave hook entry
 * - syncAllScheduled: Technical WF entry
 *
 * [Dependencies]
 * =========
 * - lgu:LGU_TARGET_TYPE_FATIGUE_M, nms:typologyRule, nms:typologyRuleRel, nms:typology
 * ACC E4X: queryDef condition expr 는 변수에 담아 {var} 로만 전달.
 */

loadLibrary("xtk:shared/common.js");

var RULE_NAME_PREFIX = "RLSmsMms";
var DEFAULT_WEIGHT = "5";
var DEFAULT_VALIDITY = "0";
var BOXING_UNIT_NONE = "0";
var THRESHOLD_TYPE_CONSTANT = "0";
var PERIOD_SUFFIX = "d";
var TOTAL_TARGET_TYPE_NO = "0";

var FATIGUE_SCHEMA = "lgu:LGU_TARGET_TYPE_FATIGUE_M";
var FATIGUE_ELEMENT = "LGU_TARGET_TYPE_FATIGUE_M";

// 0. [query helpers]
function condIdEquals(id) {
  return "@id=" + String(id);
}

function condNameEquals(name) {
  return "@name='" + String(name) + "'";
}

function condLabelEquals(label) {
  return "@label='" + String(label) + "'";
}

function parseQueryCount(cntRes) {
  if (cntRes === undefined || cntRes === null) {
    return 0;
  }
  if (typeof cntRes === "number") {
    return cntRes;
  }
  var c = cntRes.@count;
  if (c !== undefined && c !== null && String(c) !== "") {
    return Number(c);
  }
  return Number(String(cntRes));
}

function matchTypologyRelItem(rel, typologyId) {
  if (!rel) {
    return false;
  }
  var target = String(typologyId);
  var fk = rel.@["typology-id"];
  if (fk !== undefined && fk !== null && String(fk) === target) {
    return true;
  }
  if (rel.typology && rel.typology.@id && String(rel.typology.@id) === target) {
    return true;
  }
  return false;
}

function isRuleTypologyLinkedViaRuleCount(typologyId, ruleId) {
  var condRule = condIdEquals(ruleId);
  var condTypo = "[typologies/typology/@id]=" + String(typologyId);
  var qCount = xtk.queryDef.create(
    <queryDef schema="nms:typologyRule" operation="count">
      <where>
        <condition expr={condRule}/>
        <condition expr={condTypo}/>
      </where>
    </queryDef>
  );
  return parseQueryCount(qCount.ExecuteQuery()) > 0;
}

function isRuleTypologyLinkedViaGet(typologyId, ruleId) {
  var condRule = condIdEquals(ruleId);
  var targetTypo = String(typologyId);
  var qGet = xtk.queryDef.create(
    <queryDef schema="nms:typologyRule" operation="get">
      <select>
        <node expr="@id"/>
        <node expr="typologies">
          <node expr="typology/@id"/>
        </node>
      </select>
      <where><condition expr={condRule}/></where>
    </queryDef>
  );
  var rule = qGet.ExecuteQuery().typologyRule;
  if (!rule || !rule.typologies) {
    return false;
  }
  for each (var rel in rule.typologies) {
    if (matchTypologyRelItem(rel, targetTypo)) {
      return true;
    }
  }
  return false;
}

function getRowId(row) {
  if (!row) {
    return null;
  }
  var id = row.@id;
  if (id === undefined || id === null || String(id) === "") {
    return null;
  }
  return String(id);
}

function queryFirstRow(schema, collectionName, whereCond) {
  var q = xtk.queryDef.create(
    <queryDef schema={schema} operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@name"/>
      </select>
      <where><condition expr={whereCond}/></where>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  for each (var row in res[collectionName]) {
    return row;
  }
  return null;
}

// 1. [guard]
function isManagedRuleName(name) {
  if (!name) {
    return false;
  }
  return String(name).indexOf(RULE_NAME_PREFIX) === 0;
}

// 2.
function assertManagedRule(name) {
  if (!isManagedRuleName(name)) {
    throw "lguFatigueRuleSync.assertManagedRule: name must start with '"
      + RULE_NAME_PREFIX + "': " + name;
  }
}

// 3.
function isFatigueManaged(row) {
  if (!row || !row.@id) {
    return false;
  }
  if (row.@managedBySync === false || String(row.@managedBySync) === "0"
      || String(row.@managedBySync) === "false") {
    return false;
  }
  return isManagedRuleName(String(row.@ruleInternalName));
}

// 4. [query]
function loadFatigueById(fatigueId) {
  var condId = condIdEquals(fatigueId);
  var q = xtk.queryDef.create(
    <queryDef schema={FATIGUE_SCHEMA} operation="get">
      <select>
        <node expr="@id"/>
        <node expr="@label"/>
        <node expr="@active"/>
        <node expr="@capCount"/>
        <node expr="@periodDays"/>
        <node expr="@LGU_TARGET_TYPE_M_NO"/>
        <node expr="@TYPE_DETAIL"/>
        <node expr="@messageType"/>
        <node expr="@ruleInternalName"/>
        <node expr="@typologyInternalName"/>
        <node expr="@executionOrder"/>
        <node expr="@managedBySync"/>
      </select>
      <where>
        <condition expr={condId}/>
      </where>
    </queryDef>
  );
  return q.ExecuteQuery()[FATIGUE_ELEMENT];
}

// 5.
function loadRuleByName(name) {
  var row = queryFirstRow("nms:typologyRule", "typologyRule", condNameEquals(name));
  if (!row || !getRowId(row)) {
    return null;
  }
  return row;
}

// 6.
function loadTypologyByName(name) {
  var row = queryFirstRow("nms:typology", "typology", condNameEquals(name));
  if (!row || !getRowId(row)) {
    return null;
  }
  return row;
}

// 7.
function loadTypologyRef(ref) {
  if (!ref || String(ref) === "") {
    return null;
  }
  var row = loadTypologyByName(ref);
  if (row && getRowId(row)) {
    return row;
  }
  var q = xtk.queryDef.create(
    <queryDef schema="nms:typology" operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@name"/>
        <node expr="@label"/>
      </select>
      <where><condition expr={condLabelEquals(ref)}/></where>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  for each (var typoRow in res.typology) {
    if (getRowId(typoRow)) {
      return typoRow;
    }
  }
  return null;
}

// 8.
function isRuleTypologyLinked(typologyId, ruleId) {
  try {
    if (isRuleTypologyLinkedViaRuleCount(typologyId, ruleId)) {
      return true;
    }
  } catch (eCount) {
    logWarning("isRuleTypologyLinked.ruleCount: " + eCount);
  }
  try {
    return isRuleTypologyLinkedViaGet(typologyId, ruleId);
  } catch (eGet) {
    logWarning("isRuleTypologyLinked.get: " + eGet);
  }
  return false;
}

// 9.
function deleteRuleTypologyRel(typologyId, ruleId) {
  xtk.session.Write(
    <typologyRuleRel _operation="delete"
                     typology-id={String(typologyId)}
                     rule-id={String(ruleId)}
                     xtkschema="nms:typologyRuleRel"/>
  );
}

// 10.
function insertRuleTypologyRel(typologyId, ruleId) {
  xtk.session.Write(
    <typologyRuleRel _operation="insert"
                     typology-id={String(typologyId)}
                     rule-id={String(ruleId)}
                     xtkschema="nms:typologyRuleRel"/>
  );
}

// 11. [build]
function buildPeriod(row) {
  return String(row.@periodDays) + PERIOD_SUFFIX;
}

// 12.
function buildTargetTypeWhere(targetTypeNo) {
  if (targetTypeNo === undefined || targetTypeNo === null) {
    return null;
  }
  var noStr = String(targetTypeNo);
  if (noStr === "" || noStr === TOTAL_TARGET_TYPE_NO) {
    return null;
  }
  return <where>
    <condition expr="@LGU_TARGET_TYPE_M_NO" operator="=" value={noStr}/>
  </where>;
}

// 13.
function resolveFatigueLabel(row) {
  if (row.@label && String(row.@label) !== "") {
    return String(row.@label);
  }
  return String(row.@ruleInternalName);
}

// 14.
function buildPressureRuleXml(row) {
  assertManagedRule(String(row.@ruleInternalName));
  var targetTypeNo = row.@LGU_TARGET_TYPE_M_NO;
  var targetWhere = buildTargetTypeWhere(targetTypeNo);
  var isActive = !(row.@active === false || String(row.@active) === "0"
                   || String(row.@active) === "false");

  var rule = <typologyRule _operation="insertOrUpdate" _key="@name"
                           active={isActive ? "true" : "false"}
                           forceOnPrepareMessage="true"
                           label={resolveFatigueLabel(row)}
                           messageType={String(row.@messageType)}
                           name={String(row.@ruleInternalName)}
                           order={String(row.@executionOrder)}
                           ruleType="businessRanking"
                           schema="nms:recipient"
                           validity={DEFAULT_VALIDITY}
                           xtkschema="nms:typologyRule"/>;

  if (targetWhere) {
    rule.appendChild(<contextFilter>{targetWhere}</contextFilter>);
  }

  var ranking = <businessRanking activeForecast="true"
                                 boxingUnit={BOXING_UNIT_NONE}
                                 periodRanking={buildPeriod(row)}
                                 threshold={String(row.@capCount)}
                                 thresholdType={THRESHOLD_TYPE_CONSTANT}>
    <weightFormula>{DEFAULT_WEIGHT}</weightFormula>
  </businessRanking>;
  if (targetWhere) {
    ranking.appendChild(<deliveryFilter>{targetWhere}</deliveryFilter>);
  }
  rule.appendChild(ranking);
  return rule;
}

// 15. [persist]
function writeRule(ruleXml) {
  assertManagedRule(String(ruleXml.@name));
  xtk.session.Write(ruleXml);
}

// 16.
function linkRuleToTypology(ruleId, typologyRef) {
  if (!ruleId || !typologyRef) {
    throw "linkRuleToTypology: ruleId and typologyRef required";
  }
  var typo = loadTypologyRef(typologyRef);
  var typoId = getRowId(typo);
  if (!typoId) {
    throw "linkRuleToTypology: typology not found (name or label): " + typologyRef;
  }
  if (isRuleTypologyLinked(typoId, ruleId)) {
    logInfo("linkRuleToTypology: already linked typoId=" + typoId + " ruleId=" + ruleId);
    return typoId;
  }
  insertRuleTypologyRel(typoId, ruleId);
  logInfo("linkRuleToTypology: linked ruleId=" + ruleId + " typo="
    + typo.@name + " (id=" + typoId + ")");
  return typoId;
}

// 17.
function unlinkRuleFromTypology(ruleId, typologyRef) {
  if (!ruleId || !typologyRef) {
    return;
  }
  var typo = loadTypologyRef(typologyRef);
  var typoId = getRowId(typo);
  if (!typoId) {
    logWarning("unlinkRuleFromTypology: typology not found: " + typologyRef);
    return;
  }
  if (!isRuleTypologyLinked(typoId, ruleId)) {
    return;
  }
  deleteRuleTypologyRel(typoId, ruleId);
  logInfo("unlinkRuleFromTypology: removed typoId=" + typoId + " ruleId=" + ruleId);
}

// 18.
function updateFatigueSyncStatus(fatigueId, ok, msg) {
  var status = ok ? "OK" : "ERROR: " + String(msg);
  var updateXml = <LGU_TARGET_TYPE_FATIGUE_M _operation="update" id={fatigueId}
                    lastSyncAt={getCurrentDate()}
                    lastSyncStatus={status}
                    xtkschema={FATIGUE_SCHEMA}/>;
  xtk.session.Write(updateXml);
}

// 19. [sync]
function syncFatigue(fatigueId) {
  try {
    var row = loadFatigueById(fatigueId);
    if (!row || !row.@id) {
      throw "syncFatigue: row not found id=" + fatigueId;
    }
    if (!isFatigueManaged(row)) {
      logInfo("syncFatigue: skip (not managed) id=" + fatigueId);
      return "SKIP";
    }
    if (!row.@typologyInternalName || String(row.@typologyInternalName) === "") {
      throw "syncFatigue: typologyInternalName required";
    }
    writeRule(buildPressureRuleXml(row));
    var rule = loadRuleByName(String(row.@ruleInternalName));
    var ruleId = getRowId(rule);
    if (!ruleId) {
      throw "syncFatigue: rule not found after write: " + row.@ruleInternalName;
    }
    linkRuleToTypology(ruleId, String(row.@typologyInternalName));
    updateFatigueSyncStatus(fatigueId, true, "");
    return "OK";
  } catch (e) {
    logError("syncFatigue: " + e);
    try {
      updateFatigueSyncStatus(fatigueId, false, e);
    } catch (e2) {
      logError("syncFatigue.updateFatigueSyncStatus: " + e2);
    }
    throw e;
  }
}

// 20.
function syncFatigueDelete(ruleInternalName, typologyInternalName) {
  try {
    assertManagedRule(ruleInternalName);
    var rule = loadRuleByName(ruleInternalName);
    var ruleId = getRowId(rule);
    if (!ruleId) {
      logInfo("syncFatigueDelete: rule not found " + ruleInternalName);
      return;
    }
    if (!isManagedRuleName(String(rule.@name))) {
      throw "syncFatigueDelete: abort — name guard failed";
    }
    if (typologyInternalName) {
      unlinkRuleFromTypology(ruleId, typologyInternalName);
    }
    xtk.session.Write(
      <typologyRule _operation="delete" _key="@name"
                    name={String(rule.@name)}
                    xtkschema="nms:typologyRule"/>
    );
    logInfo("syncFatigueDelete: deleted rule " + ruleInternalName);
  } catch (e) {
    logError("syncFatigueDelete: " + e);
    throw e;
  }
}

// 21.
function deleteFatigueWithRuleSync(fatigueId) {
  try {
    var row = loadFatigueById(fatigueId);
    if (!row || !row.@id) {
      throw "deleteFatigueWithRuleSync: row not found id=" + fatigueId;
    }
    var ruleName = String(row.@ruleInternalName);
    var typoName = row.@typologyInternalName ? String(row.@typologyInternalName) : null;
    if (isFatigueManaged(row) && isManagedRuleName(ruleName)) {
      syncFatigueDelete(ruleName, typoName);
    } else {
      logInfo("deleteFatigueWithRuleSync: skip rule delete (not managed) id=" + fatigueId);
    }
    xtk.session.Write(
      <LGU_TARGET_TYPE_FATIGUE_M _operation="delete" id={fatigueId}
                                 xtkschema={FATIGUE_SCHEMA}/>
    );
    logInfo("deleteFatigueWithRuleSync: deleted fatigue id=" + fatigueId);
  } catch (e) {
    logError("deleteFatigueWithRuleSync: " + e);
    throw e;
  }
}

// 22. schema SOAP
function lgu_LGU_TARGET_TYPE_FATIGUE_M_DeleteWithRuleSync(fatigueId) {
  deleteFatigueWithRuleSync(fatigueId);
}

// 23.
function syncFatigueDeleteFromForm(ruleInternalName, typologyInternalName) {
  if (!isManagedRuleName(String(ruleInternalName))) {
    logInfo("syncFatigueDeleteFromForm: skip non-managed " + ruleInternalName);
    return;
  }
  syncFatigueDelete(String(ruleInternalName),
    typologyInternalName ? String(typologyInternalName) : null);
}

// 24.
function syncAll() {
  var condManaged = "@managedBySync=1";
  var q = xtk.queryDef.create(
    <queryDef schema={FATIGUE_SCHEMA} operation="select">
      <select>
        <node expr="@id"/>
      </select>
      <where>
        <condition expr={condManaged}/>
      </where>
    </queryDef>
  );
  var rows = q.ExecuteQuery()[FATIGUE_ELEMENT];
  var count = 0;
  for each (var row in rows) {
    syncFatigue(row.@id);
    count++;
  }
  logInfo("syncAll: done count=" + count);
  return count;
}

// 25.
function syncFatigueFromForm(fatigueId) {
  return syncFatigue(fatigueId);
}

// 26.
function syncAllScheduled() {
  return syncAll();
}
