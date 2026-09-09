/**
 * lgu.lguTestDeliveryMappingSchema.js ([LGU TEST] Delivery mapping schema 검증)
 * ===============================================================================
 * Console Label: [LGU TEST] Delivery Mapping Schema
 * Test 서버 전용 — custmms / lgu_mms / lguMMS merged schema 존재 확인.
 *
 * [Main Functions]
 * ===========
 * - lguTestDeliveryMappingSchema: nms:deliveryMapping 확장 attribute 검증
 *
 * [Dependencies]
 * =========
 * - nms:deliveryMapping (+ uplus/lgu extensions)
 */

// 1.
function lguTestDeliveryMappingSchema() {
  var s = application.getSchema("nms:deliveryMapping");
  if (!s) {
    logError("lguTestDeliveryMappingSchema: nms:deliveryMapping schema not found");
    return false;
  }
  var names = ["custmms", "lgu_mms", "lguMMS"];
  var i, ok = true;
  for (i = 0; i < names.length; i++) {
    var n = names[i];
    if (s.root.children[n]) {
      logInfo("lguTestDeliveryMappingSchema: " + n + " OK");
    } else {
      logError("lguTestDeliveryMappingSchema: " + n + " MISSING");
      ok = false;
    }
  }
  if (ok) {
    logInfo("lguTestDeliveryMappingSchema: schema OK");
  }
  return ok;
}
