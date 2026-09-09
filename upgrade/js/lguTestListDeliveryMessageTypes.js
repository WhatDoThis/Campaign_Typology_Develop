/**
 * lgu.lguTestListDeliveryMessageTypes.js ([LGU TEST] messageType enum 진단)
 * ===========================================================================
 * Console Label: [LGU TEST] List Delivery Message Types
 * Test 서버 전용 — nms:delivery messageType 목록·byte value 중복 검출.
 *
 * [Main Functions]
 * ===========
 * - lguTestListDeliveryMessageTypes: messageType enum dump
 *
 * [Dependencies]
 * =========
 * - nms:delivery (merged schema)
 */

// 1.
function lguTestListDeliveryMessageTypes() {
  var schema = nms.delivery.schema;
  if (!schema || !schema.messageType) {
    logError("lguTestListDeliveryMessageTypes: messageType enumeration not found");
    return;
  }

  var byValue = {};
  var lines = [];
  var dupCount = 0;

  for each (var v in schema.messageType) {
    var val = String(v.value);
    lines.push("value=" + val + " | name=" + v.name + " | label=" + v.label);
    if (!byValue[val]) {
      byValue[val] = [];
    }
    byValue[val].push(v.name + " (" + v.label + ")");
  }

  lines.sort();
  logInfo("=== nms:delivery messageType (" + lines.length + " entries) ===");
  for each (var line in lines) {
    logInfo(line);
  }

  for (var key in byValue) {
    if (byValue[key].length > 1) {
      dupCount++;
      logWarning("COLLISION value=" + key + " -> " + byValue[key].join(" | "));
    }
  }
  if (dupCount === 0) {
    logInfo("No duplicate byte values.");
  }

  var lguMms = schema.messageType.lguMMS;
  if (lguMms) {
    logInfo("lguMMS: value=" + lguMms.value + " label=" + lguMms.label);
  } else {
    logWarning("lguMMS enum not found — import lgu:delivery schema first.");
  }
}
