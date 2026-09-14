/**
 * lgu.lguFatigueRuleSync.js (타겟유형 피로도 ↔ Pressure Rule sync)
 * ================================================================
 * lgu:LGU_TARGET_TYPE_FATIGUE_M CRUD → nms:typologyRule Write. RLLgu* prefix만 관리.
 *
 * [Main Functions]
 * ===========
 * - syncFatigue / syncAll: ensureFatigueMetadata → Rule insertOrUpdate + Typology link
 * - syncFatigueDelete: managed Rule 삭제 + RuleRel unlink
 * - deleteFatigueWithRuleSync: fatigue+Rule 삭제 (schema SOAP DeleteWithRuleSync)
 * - syncFatigueFromForm: form postSave (schema SOAP SyncFromForm)
 * - validateFatigueBeforeSave: form leave — duplicate key 사전 차단
 * - preDeleteFatigueRuleSync: DeleteWithRuleSync 내부 TYR 선삭제
 * - relinkRuleToTypology: Typology 변경 시 기존 RuleRel unlink 후 재연결
 * - diagFatigueSync / repairTypologyRuleFolder: Console 진단·folder-id=0 복구
 * - validateFatigueFromForm / ensureFatigueMetadata: form preSave
 * - buildRuleInternalName / buildDefaultFatigueLabel: RLLgu{Channel}{All|TypeNo}
 * - validateRuleInternalNameAvailable: duplicate Rule name guard
 * - CHANNEL_CONFIG: messageType → suffix · defaultTypology
 * - syncAllScheduled: Technical WF entry
 *
 * [Dependencies]
 * =========
 * - lgu:LGU_TARGET_TYPE_FATIGUE_M, nms:typologyRule, nms:typologyRuleRel, nms:typology
 * - lgu:LGU_CUSTOMER_MAPPING + uplus:recipient/LGU_CUSTOMER_MAPPING link (thresholdLink)
 * ACC E4X: queryDef condition expr 는 변수에 담아 {var} 로만 전달.
 * formatDate(getCurrentDate()) — @lastSyncAt Write (raw Date → TIM-030009).
 */

var RULE_NAME_PREFIX = "RLLgu";
var TYPOLOGY_NAME_PREFIX = "TYLgu";
var DEFAULT_WEIGHT = "5";
var DEFAULT_VALIDITY = "0";
var BOXING_UNIT_NONE = "0";
var THRESHOLD_TYPE_CONSTANT = "0";
var SECONDS_PER_DAY = 86400;
var TARGET_TYPE_FIELD = "@LGU_TARGET_TYPE_M_NO";
var TARGET_TYPE_FIELD_LABEL = "유형마스터번호";
var TOTAL_TARGET_TYPE_NO = "0";
var DEFAULT_MESSAGE_TYPE_SMS_MMS = 101;
var PRESSURE_THRESHOLD_LINK = "LGU_CUSTOMER_MAPPING";

var CHANNEL_CONFIG = {
  "101": {
    suffix: "SmsMms",
    labelPrefix: "[LGU] SMS/MMS",
    defaultTypology: "TYLguSmsMms"
  }
};

var FATIGUE_SCHEMA = "lgu:LGU_TARGET_TYPE_FATIGUE_M";
var FATIGUE_ELEMENT = "LGU_TARGET_TYPE_FATIGUE_M";

// 0. ACC datetime Write — raw Date 객체는 TIM-030009
function lguFatigueAccDateTimeNow() {
  return formatDate(getCurrentDate(), "%4Y-%2M-%2D %2H:%2N:%2S");
}

// 1. [query helpers]
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

function getRuleFolderId(ruleRow) {
  if (!ruleRow) {
    return null;
  }
  var fk = ruleRow.@["folder-id"];
  if (fk !== undefined && fk !== null && String(fk) !== "" && String(fk) !== "0") {
    return String(fk);
  }
  if (ruleRow.@fid !== undefined && ruleRow.@fid !== null
      && String(ruleRow.@fid) !== "" && String(ruleRow.@fid) !== "0") {
    return String(ruleRow.@fid);
  }
  if (ruleRow.folder && ruleRow.folder.@id !== undefined
      && ruleRow.folder.@id !== null && String(ruleRow.folder.@id) !== ""
      && String(ruleRow.folder.@id) !== "0") {
    return String(ruleRow.folder.@id);
  }
  return null;
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

function queryFirstTypologyRuleRow(whereCond) {
  var q = xtk.queryDef.create(
    <queryDef schema="nms:typologyRule" operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@name"/>
        <node alias="@folder-id" expr="[folder/@id]"/>
      </select>
      <where><condition expr={whereCond}/></where>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  for each (var row in res.typologyRule) {
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

function resolveChannelConfig(messageType) {
  var mt = String(messageType);
  if (CHANNEL_CONFIG[mt]) {
    return CHANNEL_CONFIG[mt];
  }
  throw "resolveChannelConfig: unsupported messageType=" + mt
    + " — CHANNEL_CONFIG 에 suffix 추가 필요";
}

function resolveDefaultTypology(messageType) {
  return resolveChannelConfig(messageType).defaultTypology;
}

function resolveChannelLabelPrefix(messageType) {
  return resolveChannelConfig(messageType).labelPrefix;
}

// 2.
function assertManagedRule(name) {
  if (!isManagedRuleName(name)) {
    throw "lguFatigueRuleSync.assertManagedRule: name must start with '"
      + RULE_NAME_PREFIX + "': " + name;
  }
}

// 3.
function fatigueBoolAttr(val, defaultWhenEmpty) {
  if (val === undefined || val === null || String(val) === "") {
    return defaultWhenEmpty !== false;
  }
  if (val === false || val === 0) {
    return false;
  }
  var text = String(val).toLowerCase();
  return text !== "0" && text !== "false" && text !== "n";
}

// 4.
function isFatigueManaged(row) {
  if (!getRowId(row)) {
    return false;
  }
  if (!fatigueBoolAttr(row.@managedBySync, true)) {
    return false;
  }
  return isManagedRuleName(String(row.@ruleInternalName));
}

// 5.
function fatigueSkipReason(row) {
  if (!getRowId(row)) {
    return "missing @id";
  }
  if (!fatigueBoolAttr(row.@managedBySync, true)) {
    return "managedBySync=false";
  }
  var ruleName = row.@ruleInternalName ? String(row.@ruleInternalName) : "";
  if (!isManagedRuleName(ruleName)) {
    return "ruleInternalName='" + ruleName + "' (need RLLgu* prefix)";
  }
  return "unknown";
}

// 6. [query]
function loadFatigueById(fatigueId) {
  var condId = condIdEquals(fatigueId);
  var q = xtk.queryDef.create(
    <queryDef schema={FATIGUE_SCHEMA} operation="select">
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
  var res = q.ExecuteQuery();
  for each (var row in res[FATIGUE_ELEMENT]) {
    return row;
  }
  return null;
}

// 7.
function loadRuleByName(name) {
  var row = queryFirstTypologyRuleRow(condNameEquals(name));
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

// 11. [build] periodRanking — schema type timespan (seconds), not "7d" string (BAS-010042)
function buildPeriodRankingTimespan(row) {
  var days = Number(row.@periodDays);
  if (isNaN(days) || days <= 0) {
    throw "buildPeriodRankingTimespan: periodDays must be > 0";
  }
  return String(Math.round(days * SECONDS_PER_DAY));
}

// 12. Pressure filter — Console conditionlist 호환 (expr 전체 + humanCond)
function buildTargetTypeFilterExpr(targetTypeNo) {
  return TARGET_TYPE_FIELD + " = " + String(targetTypeNo);
}

function buildTargetTypeHumanCond(targetTypeNo) {
  return "Query: " + TARGET_TYPE_FIELD_LABEL + " equal to " + String(targetTypeNo);
}

function buildTargetTypeWhere(targetTypeNo) {
  if (targetTypeNo === undefined || targetTypeNo === null) {
    return null;
  }
  var noStr = String(targetTypeNo);
  if (noStr === "" || noStr === TOTAL_TARGET_TYPE_NO) {
    return null;
  }
  return <where>
    <condition bool-operator="AND" expr={buildTargetTypeFilterExpr(targetTypeNo)}/>
  </where>;
}

function buildTargetTypeContextFilter(targetTypeNo) {
  return <contextFilter contextType="2">
    {buildTargetTypeWhere(targetTypeNo)}
    <humanCond>{buildTargetTypeHumanCond(targetTypeNo)}</humanCond>
  </contextFilter>;
}

function buildTargetTypeDeliveryFilter(targetTypeNo) {
  return <deliveryFilter>
    {buildTargetTypeWhere(targetTypeNo)}
    <humanCond>{buildTargetTypeHumanCond(targetTypeNo)}</humanCond>
  </deliveryFilter>;
}

// 13.
function resolveFatigueLabel(row) {
  if (row.@label && String(row.@label) !== "") {
    return String(row.@label);
  }
  return String(row.@ruleInternalName);
}

// 14.
function resolveTypologyRuleFolderId(row) {
  var msgType = row.@messageType !== undefined ? String(row.@messageType) : "";
  var peerName = buildRuleInternalName(msgType, TOTAL_TARGET_TYPE_NO);
  var peer = loadRuleByName(peerName);
  if (peer) {
    var peerFolder = getRuleFolderId(peer);
    if (peerFolder) {
      return peerFolder;
    }
  }
  var q = xtk.queryDef.create(
    <queryDef schema="nms:typologyRule" operation="select">
      <select>
        <node alias="@fid" expr="[folder/@id]"/>
      </select>
      <where>
        <condition expr={"@name LIKE '" + RULE_NAME_PREFIX + "%' and [folder/@id]!=0"}/>
      </where>
      <orderBy>
        <node expr="@id" sortDesc="false"/>
      </orderBy>
    </queryDef>
  );
  for each (var r in q.ExecuteQuery().typologyRule) {
    if (r.@fid !== undefined && r.@fid !== null && String(r.@fid) !== "0") {
      return String(r.@fid);
    }
  }
  return null;
}

// 15.
function buildPressureRuleXml(row) {
  assertManagedRule(String(row.@ruleInternalName));
  var targetTypeNo = row.@LGU_TARGET_TYPE_M_NO;
  var targetWhere = buildTargetTypeWhere(targetTypeNo);
  var isActive = !(row.@active === false || String(row.@active) === "0"
                   || String(row.@active) === "false");
  var folderId = resolveTypologyRuleFolderId(row);
  if (!folderId) {
    throw "buildPressureRuleXml: typologyRule folder-id unresolved — peer RLLgu* rule with folder required";
  }

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
  if (folderId) {
    rule.@["folder-id"] = folderId;
  }

  if (targetWhere) {
    rule.appendChild(buildTargetTypeContextFilter(targetTypeNo));
  }

  var ranking = <businessRanking activeForecast="true"
                                 boxingUnit={BOXING_UNIT_NONE}
                                 periodRanking={buildPeriodRankingTimespan(row)}
                                 threshold={String(row.@capCount)}
                                 thresholdLink={PRESSURE_THRESHOLD_LINK}
                                 thresholdType={THRESHOLD_TYPE_CONSTANT}>
    <weightFormula>{DEFAULT_WEIGHT}</weightFormula>
  </businessRanking>;
  if (targetWhere) {
    ranking.appendChild(buildTargetTypeDeliveryFilter(targetTypeNo));
  }
  rule.appendChild(ranking);

  var typoRef = row.@typologyInternalName ? String(row.@typologyInternalName) : "";
  var typo = loadTypologyRef(typoRef);
  var typoId = getRowId(typo);
  if (typoId) {
    rule.appendChild(
      <typologies>
        <typology id={typoId}/>
      </typologies>
    );
  }
  return rule;
}

// 16. [persist]
function writeRule(ruleXml) {
  assertManagedRule(String(ruleXml.@name));
  xtk.session.Write(ruleXml);
}

function assertRuleExistsByName(ruleName) {
  var rule = loadRuleByName(ruleName);
  var ruleId = getRowId(rule);
  if (!ruleId) {
    throw "assertRuleExistsByName: typologyRule not found after Write name=" + ruleName;
  }
  return ruleId;
}

// 17.
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

// 18. Rule에 연결된 Typology id — TYLgu* scan + typologyRule count (queryDef @typology-id 금지)
function loadRuleTypologyIds(ruleId) {
  var condTypoScope = "@name LIKE '" + TYPOLOGY_NAME_PREFIX + "%'";
  var q = xtk.queryDef.create(
    <queryDef schema="nms:typology" operation="select">
      <select>
        <node expr="@id"/>
      </select>
      <where><condition expr={condTypoScope}/></where>
    </queryDef>
  );
  var ids = [];
  var res = q.ExecuteQuery();
  for each (var typo in res.typology) {
    var tid = getRowId(typo);
    if (!tid) {
      continue;
    }
    try {
      if (isRuleTypologyLinkedViaRuleCount(tid, ruleId)) {
        ids.push(tid);
      }
    } catch (e) {
      logWarning("loadRuleTypologyIds: link check typoId=" + tid + " " + e);
    }
  }
  return ids;
}

function relinkRuleToTypology(ruleId, typologyRef) {
  if (!ruleId || !typologyRef) {
    throw "relinkRuleToTypology: ruleId and typologyRef required";
  }
  var typo = loadTypologyRef(typologyRef);
  var targetTypoId = getRowId(typo);
  if (!targetTypoId) {
    throw "relinkRuleToTypology: typology not found: " + typologyRef;
  }
  var linkedIds = loadRuleTypologyIds(ruleId);
  for each (var typoId in linkedIds) {
    if (String(typoId) !== String(targetTypoId)) {
      deleteRuleTypologyRel(typoId, ruleId);
      logInfo("relinkRuleToTypology: unlinked typoId=" + typoId + " ruleId=" + ruleId);
    }
  }
  return linkRuleToTypology(ruleId, typologyRef);
}

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

// 19.
function updateFatigueSyncStatus(fatigueId, ok, msg) {
  var status = ok ? String(msg) : "ERROR: " + String(msg);
  var updateXml = <LGU_TARGET_TYPE_FATIGUE_M _operation="update" id={fatigueId}
                    lastSyncAt={lguFatigueAccDateTimeNow()}
                    lastSyncStatus={status}
                    xtkschema={FATIGUE_SCHEMA}/>;
  xtk.session.Write(updateXml);
}

// 20. [sync]
function syncFatigueRow(row, options) {
  options = options || {};
  if (!row || !getRowId(row)) {
    throw "syncFatigueRow: row @id required";
  }
  if (!isFatigueManaged(row)) {
    if (options.forceManaged) {
      throw "syncFatigueRow: not managed — " + fatigueSkipReason(row)
        + " ruleInternalName=" + row.@ruleInternalName
        + " managedBySync=" + row.@managedBySync;
    }
    logWarning("syncFatigueRow: skip (not managed) id=" + getRowId(row)
      + " reason=" + fatigueSkipReason(row));
    return "SKIP";
  }
  if (!row.@typologyInternalName || String(row.@typologyInternalName) === "") {
    throw "syncFatigueRow: typologyInternalName required";
  }
  var ruleName = String(row.@ruleInternalName);
  writeRule(buildPressureRuleXml(row));
  var ruleId = assertRuleExistsByName(ruleName);
  var typoId = relinkRuleToTypology(ruleId, String(row.@typologyInternalName));
  if (!isRuleTypologyLinked(typoId, ruleId)) {
    throw "syncFatigueRow: typology link verify failed ruleId=" + ruleId
      + " typoId=" + typoId + " name=" + ruleName;
  }
  var okMsg = "OK ruleId=" + ruleId + " typoId=" + typoId;
  updateFatigueSyncStatus(getRowId(row), true, okMsg);
  logInfo("syncFatigueRow: " + okMsg + " name=" + ruleName);
  return okMsg;
}

function syncFatigue(fatigueId, options) {
  options = options || {};
  try {
    var row = loadFatigueById(fatigueId);
    if (!row || !row.@id) {
      throw "syncFatigue: row not found id=" + fatigueId;
    }
    return syncFatigueRow(row, options);
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

// 21.
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

// 22.
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

// 23. schema SOAP
function lgu_LGU_TARGET_TYPE_FATIGUE_M_SyncFromForm(fatigueId) {
  syncFatigueFromForm(fatigueId);
}

function lgu_LGU_TARGET_TYPE_FATIGUE_M_ValidateBeforeSave(messageType, targetTypeNo, fatigueId) {
  validateFatigueDuplicateBeforeSave(messageType, targetTypeNo, fatigueId);
}

function lgu_LGU_TARGET_TYPE_FATIGUE_M_PreDeleteRuleSync(fatigueId) {
  preDeleteFatigueRuleSync(fatigueId);
}

function lgu_LGU_TARGET_TYPE_FATIGUE_M_DeleteWithRuleSync(fatigueId) {
  deleteFatigueWithRuleSync(fatigueId);
}

function preDeleteFatigueRuleSync(fatigueId) {
  var rowId = normalizeFatigueIdParam(fatigueId);
  if (!rowId) {
    return;
  }
  var row = loadFatigueById(rowId);
  if (!row || !getRowId(row)) {
    logInfo("preDeleteFatigueRuleSync: row not found id=" + rowId);
    return;
  }
  var ruleName = row.@ruleInternalName ? String(row.@ruleInternalName) : "";
  var typoName = row.@typologyInternalName ? String(row.@typologyInternalName) : null;
  if (!isFatigueManaged(row) || !isManagedRuleName(ruleName)) {
    logInfo("preDeleteFatigueRuleSync: skip (not managed) id=" + rowId
      + " rule=" + ruleName);
    return;
  }
  syncFatigueDelete(ruleName, typoName);
  logInfo("preDeleteFatigueRuleSync: rule deleted id=" + rowId + " rule=" + ruleName);
}

// 24.
function syncFatigueDeleteFromForm(ruleInternalName, typologyInternalName) {
  if (!isManagedRuleName(String(ruleInternalName))) {
    logInfo("syncFatigueDeleteFromForm: skip non-managed " + ruleInternalName);
    return;
  }
  syncFatigueDelete(String(ruleInternalName),
    typologyInternalName ? String(typologyInternalName) : null);
}

// 25.
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
    ensureFatigueMetadata(row.@id);
    syncFatigue(row.@id);
    count++;
  }
  logInfo("syncAll: done count=" + count);
  return count;
}

// 26. [form CRUD — naming · validation]
function buildRuleInternalName(messageType, targetTypeNo) {
  var channelSuffix = resolveChannelConfig(messageType).suffix;
  var noStr = String(targetTypeNo);
  if (noStr === "" || noStr === TOTAL_TARGET_TYPE_NO) {
    return RULE_NAME_PREFIX + channelSuffix + "All";
  }
  return RULE_NAME_PREFIX + channelSuffix + "Type" + noStr;
}

// 27.
function buildDefaultFatigueLabel(messageType, targetTypeNo, typeDetail) {
  var labelPrefix = resolveChannelLabelPrefix(messageType);
  var noStr = String(targetTypeNo);
  if (noStr === "" || noStr === TOTAL_TARGET_TYPE_NO) {
    return labelPrefix + " Type All";
  }
  if (typeDetail && String(typeDetail) !== "") {
    return labelPrefix + " " + String(typeDetail);
  }
  return labelPrefix + " Type " + noStr;
}

function normalizeFatigueIdParam(fatigueId) {
  if (fatigueId === undefined || fatigueId === null || String(fatigueId) === ""
      || String(fatigueId) === "0") {
    return null;
  }
  return String(fatigueId);
}

function countFatigueByMessageTypeAndNo(messageType, targetTypeNo, excludeFatigueId) {
  var msgType = String(messageType);
  var targetNo = String(targetTypeNo);
  var whereExpr = "@messageType=" + msgType + " and @LGU_TARGET_TYPE_M_NO=" + targetNo;
  var excludeId = normalizeFatigueIdParam(excludeFatigueId);
  if (excludeId) {
    whereExpr += " and @id!=" + excludeId;
  }
  var qCount = xtk.queryDef.create(
    <queryDef schema={FATIGUE_SCHEMA} operation="count">
      <where>
        <condition expr={whereExpr}/>
      </where>
    </queryDef>
  );
  return parseQueryCount(qCount.ExecuteQuery());
}

function validateFatigueDuplicateBeforeSave(messageType, targetTypeNo, fatigueId) {
  var msgType = String(messageType);
  var targetNo = targetTypeNo;
  if (targetNo === undefined || targetNo === null || String(targetNo) === "") {
    throw "validateFatigueBeforeSave: 타겟유형을 선택하세요 (채널 All 또는 유형 지정)";
  }
  if (countFatigueByMessageTypeAndNo(msgType, targetNo, fatigueId) > 0) {
    throw "validateFatigueBeforeSave: 이미 등록된 피로도입니다 (채널="
      + msgType + ", 유형 NO=" + String(targetNo)
      + "). 기존 행을 수정하거나 다른 유형을 선택하세요.";
  }
}

function loadFatigueIdByRuleName(ruleName, excludeId) {
  if (!ruleName || String(ruleName) === "") {
    return null;
  }
  var whereExpr = "@ruleInternalName='" + String(ruleName) + "'";
  if (excludeId) {
    whereExpr += " and @id!=" + String(excludeId);
  }
  var q = xtk.queryDef.create(
    <queryDef schema={FATIGUE_SCHEMA} operation="select">
      <select>
        <node expr="@id"/>
      </select>
      <where>
        <condition expr={whereExpr}/>
      </where>
    </queryDef>
  );
  for each (var r in q.ExecuteQuery()[FATIGUE_ELEMENT]) {
    return getRowId(r);
  }
  return null;
}

function validateRuleInternalNameAvailable(messageType, targetTypeNo, fatigueId) {
  var ruleName = buildRuleInternalName(messageType, targetTypeNo);
  var otherFatigueId = loadFatigueIdByRuleName(ruleName, fatigueId);
  if (otherFatigueId) {
    throw "validateFatigueFromForm: Rule internal name already used by fatigue id="
      + otherFatigueId + " (" + ruleName + "). 다른 채널/유형을 선택하세요.";
  }
  var existingRule = loadRuleByName(ruleName);
  if (existingRule && getRowId(existingRule)) {
    var ownerId = loadFatigueIdByRuleName(ruleName, null);
    if (ownerId && String(ownerId) !== String(fatigueId)) {
      throw "validateFatigueFromForm: Rule internal name already exists in typologyRule ("
        + ruleName + "). 기존 Rule을 삭제하거나 다른 유형을 선택하세요.";
    }
  }
  return ruleName;
}

// 28.
function suggestNextExecutionOrder() {
  var q = xtk.queryDef.create(
    <queryDef schema={FATIGUE_SCHEMA} operation="select">
      <select>
        <node expr="Max(@executionOrder)" alias="@maxOrder"/>
      </select>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  var maxOrder = 0;
  for each (var r in res[FATIGUE_ELEMENT]) {
    var v = Number(r.@maxOrder);
    if (!isNaN(v) && v > maxOrder) {
      maxOrder = v;
    }
  }
  return maxOrder + 10;
}

// 29.
function validateFatigueFromForm(fatigueId) {
  var row = loadFatigueById(fatigueId);
  if (!row) {
    throw "validateFatigueFromForm: row not found id=" + fatigueId;
  }
  var targetNo = row.@LGU_TARGET_TYPE_M_NO;
  if (targetNo === undefined || targetNo === null || String(targetNo) === "") {
    throw "validateFatigueFromForm: 타겟유형을 선택하세요 (채널 All 또는 유형 지정)";
  }
  var msgType = String(row.@messageType);
  var typoName = row.@typologyInternalName ? String(row.@typologyInternalName) : "";
  if (typoName === "") {
    typoName = resolveDefaultTypology(msgType);
  }
  if (!loadTypologyByName(typoName)) {
    throw "validateFatigueFromForm: Typology not found: " + typoName;
  }
  var cap = Number(row.@capCount);
  if (isNaN(cap) || cap <= 0) {
    throw "validateFatigueFromForm: capCount must be > 0";
  }
  var period = Number(row.@periodDays);
  if (isNaN(period) || period <= 0) {
    throw "validateFatigueFromForm: periodDays must be > 0";
  }
  validateFatigueDuplicateBeforeSave(msgType, targetNo, getRowId(row));
  validateRuleInternalNameAvailable(msgType, targetNo, getRowId(row));
}

// 30.
function ensureFatigueMetadata(fatigueId) {
  var row = loadFatigueById(fatigueId);
  if (!row || !getRowId(row)) {
    throw "ensureFatigueMetadata: row not found id=" + fatigueId;
  }
  var targetNo = row.@LGU_TARGET_TYPE_M_NO;
  var typeDetail = row.@TYPE_DETAIL ? String(row.@TYPE_DETAIL) : "";
  var msgType = row.@messageType !== undefined && String(row.@messageType) !== ""
    ? String(row.@messageType)
    : String(DEFAULT_MESSAGE_TYPE_SMS_MMS);
  var ruleName = buildRuleInternalName(msgType, targetNo);
  var label = row.@label && String(row.@label) !== ""
    ? String(row.@label)
    : buildDefaultFatigueLabel(msgType, targetNo, typeDetail);
  var typo = row.@typologyInternalName && String(row.@typologyInternalName) !== ""
    ? String(row.@typologyInternalName)
    : resolveDefaultTypology(msgType);
  var execOrder = row.@executionOrder;
  if (execOrder === undefined || execOrder === null || String(execOrder) === "") {
    execOrder = String(suggestNextExecutionOrder());
  } else {
    execOrder = String(execOrder);
  }
  xtk.session.Write(
    <LGU_TARGET_TYPE_FATIGUE_M _operation="update" id={getRowId(row)}
      ruleInternalName={ruleName}
      label={label}
      typologyInternalName={typo}
      messageType={msgType}
      managedBySync="true"
      executionOrder={execOrder}
      xtkschema={FATIGUE_SCHEMA}/>
  );
  logInfo("ensureFatigueMetadata: id=" + getRowId(row) + " rule=" + ruleName);
}

// 31.
function syncFatigueFromForm(fatigueId) {
  try {
    validateFatigueFromForm(fatigueId);
    ensureFatigueMetadata(fatigueId);
    var row = loadFatigueById(fatigueId);
    if (!row || !getRowId(row)) {
      throw "syncFatigueFromForm: row not found after ensureFatigueMetadata id=" + fatigueId;
    }
    return syncFatigueRow(row, {forceManaged: true});
  } catch (e) {
    logError("syncFatigueFromForm: " + e);
    try {
      updateFatigueSyncStatus(fatigueId, false, e);
    } catch (e2) {
      logError("syncFatigueFromForm.updateFatigueSyncStatus: " + e2);
    }
    throw e;
  }
}

// 32.
function syncAllScheduled() {
  return syncAll();
}

// 33. folder-id=0 Rule — Explorer 미표시 복구 (peer RLLgu* folder 복사)
function repairTypologyRuleFolder(ruleName) {
  if (!isManagedRuleName(String(ruleName))) {
    throw "repairTypologyRuleFolder: not managed name=" + ruleName;
  }
  var rule = loadRuleByName(String(ruleName));
  if (!rule || !getRowId(rule)) {
    throw "repairTypologyRuleFolder: typologyRule not found name=" + ruleName;
  }
  var currentFolder = getRuleFolderId(rule);
  if (currentFolder) {
    logInfo("repairTypologyRuleFolder: already folder-id=" + currentFolder + " name=" + ruleName);
    return currentFolder;
  }
  var peer = loadRuleByName(buildRuleInternalName(DEFAULT_MESSAGE_TYPE_SMS_MMS, TOTAL_TARGET_TYPE_NO));
  if (!peer) {
    throw "repairTypologyRuleFolder: peer RLLguSmsMmsAll not found";
  }
  var folderId = getRuleFolderId(peer);
  if (!folderId) {
    throw "repairTypologyRuleFolder: peer folder-id invalid";
  }
  xtk.session.Write(
    <typologyRule _operation="update" _key="@name"
                  folder-id={String(folderId)}
                  name={String(ruleName)}
                  xtkschema="nms:typologyRule"/>
  );
  logInfo("repairTypologyRuleFolder: name=" + ruleName + " folder-id=" + folderId);
  return String(folderId);
}

// 34. Console diagnostic — fatigue row ↔ typologyRule 존재·link 확인
function diagFatigueSync(fatigueId) {
  var row = loadFatigueById(fatigueId);
  if (!row) {
    logError("diagFatigueSync: fatigue not found id=" + fatigueId);
    return;
  }
  var ruleName = row.@ruleInternalName ? String(row.@ruleInternalName) : "";
  var typoName = row.@typologyInternalName ? String(row.@typologyInternalName) : "";
  logInfo("diagFatigueSync: fatigue id=" + getRowId(row)
    + " ruleName=" + ruleName + " typoName=" + typoName
    + " managed=" + isFatigueManaged(row)
    + " lastSyncStatus=" + row.@lastSyncStatus);
  var rule = ruleName !== "" ? loadRuleByName(ruleName) : null;
  var ruleId = getRowId(rule);
  logInfo("diagFatigueSync: typologyRule exists=" + (ruleId ? "yes" : "no")
    + " ruleId=" + ruleId + " folder-id=" + (rule ? getRuleFolderId(rule) : ""));
  var typo = typoName !== "" ? loadTypologyRef(typoName) : null;
  var typoId = getRowId(typo);
  logInfo("diagFatigueSync: typology exists=" + (typoId ? "yes" : "no") + " typoId=" + typoId);
  if (ruleId && typoId) {
    logInfo("diagFatigueSync: linked=" + isRuleTypologyLinked(typoId, ruleId));
  }
}
