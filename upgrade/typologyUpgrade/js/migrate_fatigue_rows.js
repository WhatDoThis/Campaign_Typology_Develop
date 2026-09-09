/**
 * lgu.migrateFatigueRows (초기 피로도 행 seed)
 * =============================================
 * Phase 1 — 1회 Execute. lgu:LGU_TARGET_TYPE_FATIGUE_M SMS/MMS 기본 2행 생성.
 *
 * [Dependencies]
 * =========
 * - lgu:LGU_TARGET_TYPE_FATIGUE_M, lgu:LGU_TARGET_TYPE_M
 *
 * Console: Administration > Configuration > JavaScript codes → Execute
 * ⚠ typologyInternalName 은 Staging Typology Internal name 으로 수정.
 */

var TYPOLOGY_INTERNAL_NAME = "TYSmsMms";
var TYPOLOGY_LABEL = "[LGU] SMS/MMS";

// [LGU_TARGET_TYPE_M_NO, TYPE_DETAIL, label, capCount, periodDays, executionOrder, ruleInternalName]
var ROWS = [
  [0, "", "[LGU] SMS/MMS Type All", 10, 7, 10, "RLSmsMmsAll"],
  [2, "", "[LGU] SMS/MMS Type 2", 2, 7, 20, "RLSmsMmsType2"]
];

// lgu:delivery messageType enum lguMMS
var MESSAGE_TYPE_SMS_MMS = 101;

// 1.
function resolveTypologyName() {
  if (TYPOLOGY_INTERNAL_NAME && TYPOLOGY_INTERNAL_NAME !== "") {
    return TYPOLOGY_INTERNAL_NAME;
  }
  return TYPOLOGY_LABEL;
}

// 2.
function findFatigueRow(targetTypeNo, messageType) {
  var whereExpr = "@messageType=" + messageType
    + " and @LGU_TARGET_TYPE_M_NO=" + targetTypeNo;
  var q = xtk.queryDef.create(
    <queryDef schema="lgu:LGU_TARGET_TYPE_FATIGUE_M" operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@LGU_TARGET_TYPE_M_NO"/>
      </select>
      <where>
        <condition expr={whereExpr}/>
      </where>
    </queryDef>
  );
  var res = q.ExecuteQuery();
  if (res.LGU_TARGET_TYPE_FATIGUE_M.length > 0) {
    return res.LGU_TARGET_TYPE_FATIGUE_M[0];
  }
  return null;
}

// 3.
function migrateFatigueRows() {
  var updated = 0;
  var created = 0;

  for each (var row in ROWS) {
    var targetTypeNo = row[0];
    var typeDetail = row[1];
    var label = row[2];
    var capCount = row[3];
    var periodDays = row[4];
    var execOrder = row[5];
    var ruleInternalName = row[6];

    var existing = findFatigueRow(targetTypeNo, MESSAGE_TYPE_SMS_MMS);
    var rowXml;

    if (existing) {
      rowXml = <LGU_TARGET_TYPE_FATIGUE_M _operation="update"
                                           xtkschema="lgu:LGU_TARGET_TYPE_FATIGUE_M"
                                           id={existing.@id}/>;
    } else {
      rowXml = <LGU_TARGET_TYPE_FATIGUE_M _operation="insert"
                                           xtkschema="lgu:LGU_TARGET_TYPE_FATIGUE_M"/>;
    }

    rowXml.@label = label;
    rowXml.@LGU_TARGET_TYPE_M_NO = targetTypeNo;
    rowXml.@TYPE_DETAIL = typeDetail;
    rowXml.@capCount = capCount;
    rowXml.@periodDays = periodDays;
    rowXml.@active = true;
    rowXml.@messageType = MESSAGE_TYPE_SMS_MMS;
    rowXml.@ruleInternalName = ruleInternalName;
    rowXml.@typologyInternalName = resolveTypologyName();
    rowXml.@executionOrder = execOrder;
    rowXml.@managedBySync = true;
    rowXml.@lastSyncStatus = "PENDING: run lguFatigueRuleSync after Phase 2";

    xtk.session.Write(rowXml);
    if (existing) {
      updated++;
      logInfo("Updated fatigue id=" + existing.@id + " → " + ruleInternalName
        + " NO=" + targetTypeNo);
    } else {
      created++;
      logInfo("Created fatigue → " + ruleInternalName + " NO=" + targetTypeNo);
    }
  }

  logInfo("migrateFatigueRows done. updated=" + updated + " created=" + created);
}

migrateFatigueRows();
