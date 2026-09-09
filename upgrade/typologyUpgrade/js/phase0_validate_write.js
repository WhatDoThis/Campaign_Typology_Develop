/**
 * lgu.phase0ValidateWrite (Phase 0 — Rule Write 검증)
 * =====================================================
 * Staging 1회 Execute. nms:typologyRule Write/delete · RuleRel 검증.
 *
 * [Main Functions]
 * ===========
 * - phase0ValidateWrite: Rule insert → query → delete
 * - phase0ValidateTypologyLink: RuleRel insert → delete
 *
 * [Dependencies]
 * =========
 * - nms:typologyRule, nms:typology, nms:typologyRuleRel
 *
 * ACC notes:
 * - queryDef: operation="select" + for each (getIfExists .@id 접근 불안정)
 * - Rule delete: _key="@name" 사용 가능
 * - RuleRel Write/delete: typology-id + rule-id (DB iTypologyId/iRuleId — typologyRule-id 아님)
 * - 연결 확인: nms:typologyRule count/get — [typologies/typology/@id] (Managed Cloud SQL expr 금지)
 */

var TEST_RULE_NAME = "RLSmsMmsPhase0Test";
var TYPOLOGY_INTERNAL_NAME = "";
var TYPOLOGY_LABEL = "TYPO_FATIGUE_SMSMMS";

// 1.
function condNameEquals(name) {
  return "@name='" + String(name) + "'";
}

// 2.
function condLabelEquals(label) {
  return "@label='" + String(label) + "'";
}

// 3.
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

// 4.
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

// 5.
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

// 6. Rule.typologies — count then get (Managed Cloud: queryDef sql= 금지)
function isRuleTypologyLinkedViaRuleCount(typologyId, ruleId) {
  var condRule = "@id=" + String(ruleId);
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

// 8.
function isRuleTypologyLinkedViaGet(typologyId, ruleId) {
  var condRule = "@id=" + String(ruleId);
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
  var doc = qGet.ExecuteQuery();
  var rule = doc.typologyRule;
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

// 9.
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

// 10.
function queryTypologyRow(whereCond) {
  var q = xtk.queryDef.create(
    <queryDef schema="nms:typology" operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@name"/>
        <node expr="@label"/>
      </select>
      <where><condition expr={whereCond}/></where>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  for each (var row in res.typology) {
    return row;
  }
  return null;
}

// 6.
function queryRuleRowByName(ruleName) {
  var condRule = condNameEquals(ruleName);
  var q = xtk.queryDef.create(
    <queryDef schema="nms:typologyRule" operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@name"/>
        <node expr="@forceOnPrepareMessage"/>
        <node expr="@validity"/>
      </select>
      <where><condition expr={condRule}/></where>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  for each (var row in res.typologyRule) {
    return row;
  }
  return null;
}

// 7.
function loadTypologyId() {
  var row = null;
  var id = null;

  if (TYPOLOGY_INTERNAL_NAME && String(TYPOLOGY_INTERNAL_NAME) !== "") {
    row = queryTypologyRow(condNameEquals(TYPOLOGY_INTERNAL_NAME));
    id = getRowId(row);
    if (id) {
      logInfo("loadTypologyId: @name=" + TYPOLOGY_INTERNAL_NAME + " id=" + id);
      return id;
    }
  }

  row = queryTypologyRow(condLabelEquals(TYPOLOGY_LABEL));
  id = getRowId(row);
  if (id) {
    logInfo("loadTypologyId: @label=" + TYPOLOGY_LABEL
      + " name=" + row.@name + " id=" + id);
    return id;
  }

  throw "loadTypologyId: not found — TYPOLOGY_LABEL=" + TYPOLOGY_LABEL
    + " (Console Typology Properties > Internal name → TYPOLOGY_INTERNAL_NAME)";
}

// 8. RuleRel Write — typology-id + rule-id (typologyRule-id 는 iRuleId 미매핑 → 0 insert)
function deleteRuleTypologyRel(typologyId, ruleId) {
  xtk.session.Write(
    <typologyRuleRel _operation="delete"
                     typology-id={String(typologyId)}
                     rule-id={String(ruleId)}
                     xtkschema="nms:typologyRuleRel"/>
  );
}

// 9.
function cleanupStaleRuleTypologyRel(typologyId, ruleId) {
  try {
    deleteRuleTypologyRel(typologyId, ruleId);
  } catch (e1) {
    logInfo("cleanupStaleRuleTypologyRel: rule-id=" + ruleId + " " + e1);
  }
  try {
    deleteRuleTypologyRel(typologyId, 0);
  } catch (e2) {
    logInfo("cleanupStaleRuleTypologyRel: orphan rule-id=0 " + e2);
  }
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

// 11.
function deleteTestRuleByName() {
  xtk.session.Write(
    <typologyRule _operation="delete" _key="@name"
                  name={TEST_RULE_NAME}
                  xtkschema="nms:typologyRule"/>
  );
}

// 11.
function buildTestRuleXml(label) {
  return <typologyRule _operation="insertOrUpdate" _key="@name"
                       active="true" forceOnPrepareMessage="true"
                       label={label} messageType="101"
                       name={TEST_RULE_NAME} order="99"
                       ruleType="businessRanking" schema="nms:recipient"
                       validity="0" xtkschema="nms:typologyRule">
    <businessRanking activeForecast="true" boxingUnit="0"
                     periodRanking="7d" threshold="3" thresholdType="0">
      <weightFormula>5</weightFormula>
    </businessRanking>
  </typologyRule>;
}

// 12.
function loadTestRuleId() {
  var row = queryRuleRowByName(TEST_RULE_NAME);
  var id = getRowId(row);
  if (!id) {
    throw "loadTestRuleId: test rule not found " + TEST_RULE_NAME;
  }
  return id;
}

// 13.
function phase0ValidateWrite() {
  logInfo("phase0ValidateWrite: start");

  xtk.session.Write(buildTestRuleXml("Phase0 Write Test"));
  logInfo("phase0ValidateWrite: Write OK");

  var row = queryRuleRowByName(TEST_RULE_NAME);
  var ruleId = getRowId(row);
  if (!ruleId) {
    throw "phase0ValidateWrite: rule not found after Write";
  }
  logInfo("phase0ValidateWrite: query OK id=" + ruleId
    + " forceOnPrepareMessage=" + row.@forceOnPrepareMessage
    + " validity=" + row.@validity);

  deleteTestRuleByName();
  logInfo("phase0ValidateWrite: delete OK — Phase 0.2 passed");
}

// 14.
function phase0ValidateTypologyLink() {
  logInfo("phase0ValidateTypologyLink: start (Rule.typologies link-check)");

  xtk.session.Write(buildTestRuleXml("Phase0 Link Test"));
  var ruleId = loadTestRuleId();
  var typoId = loadTypologyId();

  cleanupStaleRuleTypologyRel(typoId, ruleId);

  insertRuleTypologyRel(typoId, ruleId);
  logInfo("phase0ValidateTypologyLink: RuleRel insert OK");

  if (!isRuleTypologyLinked(typoId, ruleId)) {
    var ruleCountOk = false;
    var getOk = false;
    try {
      ruleCountOk = isRuleTypologyLinkedViaRuleCount(typoId, ruleId);
    } catch (e1) {
      logWarning("phase0ValidateTypologyLink.ruleCount: " + e1);
    }
    try {
      getOk = isRuleTypologyLinkedViaGet(typoId, ruleId);
    } catch (e2) {
      logWarning("phase0ValidateTypologyLink.get: " + e2);
    }
    logWarning("phase0ValidateTypologyLink: ruleCount=" + ruleCountOk
      + " get=" + getOk + " — Console Rule Typologies tab 확인");
    throw "phase0ValidateTypologyLink: RuleRel not found after insert";
  }

  deleteRuleTypologyRel(typoId, ruleId);
  deleteTestRuleByName();
  logInfo("phase0ValidateTypologyLink: cleanup OK — Phase 0.3 passed");
}

// 15.
function cleanupTestRule() {
  try {
    var ruleId = loadTestRuleId();
    var typoId = loadTypologyId();
    if (isRuleTypologyLinked(typoId, ruleId)) {
      deleteRuleTypologyRel(typoId, ruleId);
    }
    deleteTestRuleByName();
    logInfo("cleanupTestRule: deleted " + TEST_RULE_NAME);
  } catch (e) {
    try {
      deleteTestRuleByName();
    } catch (e2) {
      logWarning("cleanupTestRule.deleteByName: " + e2);
    }
    logWarning("cleanupTestRule: " + e);
  }
}

phase0ValidateWrite();
try {
  phase0ValidateTypologyLink();
} catch (e) {
  logError("Phase 0.3 FAILED: " + e);
  cleanupTestRule();
}
