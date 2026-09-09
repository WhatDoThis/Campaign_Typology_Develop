/**
 * lgu.lguTestDeliveryPrepareDiag.js ([LGU TEST] Delivery Prepare 진단)
 * ======================================================================
 * Console Label: [LGU TEST] Delivery Prepare Diag
 * Test 서버 전용 — delivery 상태·mapping·broadLog dump.
 *
 * [Main Functions]
 * ===========
 * - lguTestDeliveryPrepareDiag: delivery 상태, lguMMS content, mapping, broadLogRcp
 *
 * [Dependencies]
 * =========
 * - nms:delivery, nms:deliveryMapping, nms:broadLogRcp
 */

// 1.
function lguTestDeliveryPrepareDiag(deliveryId) {
  deliveryId = Number(deliveryId);
  logInfo("lguTestDeliveryPrepareDiag: start id=" + deliveryId);

  var del = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="getIfExists">
      <select>
        <node expr="@id"/>
        <node expr="@state"/>
        <node expr="@messageType"/>
        <node expr="[@mapping-id]"/>
        <node expr="[properties/@toDeliver]"/>
        <node expr="[properties/@deliveryState]"/>
        <node expr="[properties/@reject]"/>
        <node expr="[properties/@sms]"/>
        <node expr="[scheduling/@contactDate]"/>
        <node expr="[scheduling/@contactDateExpr]"/>
        <node expr="[content/lguMMS/source/SENDER]"/>
        <node expr="[content/lguMMS/source/MSG]"/>
        <node expr="[content/sms/source]"/>
        <node expr="[@linkedDelivery-id]"/>
        <node expr="[@recurringDelivery-id]"/>
        <node expr="[@workflow-id]"/>
        <node expr="[@operation-id]"/>
      </select>
      <where>
        <condition expr={"@id=" + deliveryId}/>
      </where>
    </queryDef>
  ).ExecuteQuery();

  if (!del || !del.@id) {
    logError("lguTestDeliveryPrepareDiag: delivery not found id=" + deliveryId);
    return false;
  }

  logInfo("lguTestDeliveryPrepareDiag: delivery XML=" + del.toXMLString());
  logInfo("lguTestDeliveryPrepareDiag: state=" + del.@state);
  logInfo("lguTestDeliveryPrepareDiag: messageType=" + del.@messageType);
  logInfo("lguTestDeliveryPrepareDiag: toDeliver=" + del.properties.@toDeliver);
  logInfo("lguTestDeliveryPrepareDiag: deliveryState=" + del.properties.@deliveryState);
  logInfo("lguTestDeliveryPrepareDiag: reject=" + del.properties.@reject);
  logInfo("lguTestDeliveryPrepareDiag: sms=" + del.properties.@sms);
  logInfo("lguTestDeliveryPrepareDiag: contactDate=" + del.scheduling.@contactDate);
  logInfo("lguTestDeliveryPrepareDiag: contactDateExpr=" + del.scheduling.@contactDateExpr);
  logInfo("lguTestDeliveryPrepareDiag: SENDER=" + del.content.lguMMS.source.SENDER);
  logInfo("lguTestDeliveryPrepareDiag: MSG len="
    + String(del.content.lguMMS.source.MSG).length);
  logInfo("lguTestDeliveryPrepareDiag: smsSource len="
    + String(del.content.sms.source).length);
  logInfo("lguTestDeliveryPrepareDiag: linkedDelivery-id=" + del.@["linkedDelivery-id"]);
  logInfo("lguTestDeliveryPrepareDiag: recurringDelivery-id=" + del.@["recurringDelivery-id"]);
  logInfo("lguTestDeliveryPrepareDiag: workflow-id=" + del.@["workflow-id"]);
  logInfo("lguTestDeliveryPrepareDiag: operation-id=" + del.@["operation-id"]);

  var senderVal = String(del.content.lguMMS.source.SENDER);
  var msgVal = String(del.content.lguMMS.source.MSG);
  var smsSourceVal = String(del.content.sms.source);
  var mt = Number(del.@messageType);
  var hasLguContent = (mt === 101)
    && msgVal !== ""
    && senderVal !== ""
    && senderVal !== " ";
  logInfo("lguTestDeliveryPrepareDiag: hasLguMmsContent=" + hasLguContent);
  if (Number(del.@state) === 15 && hasLguContent && smsSourceVal === "") {
    logWarning("lguTestDeliveryPrepareDiag: content/sms/source empty — re-import lguEnsureDeliveryScheduling.js");
  }
  if (Number(del.@state) === 15 && hasLguContent && Number(del.@["linkedDelivery-id"]) > 0) {
    logWarning("lguTestDeliveryPrepareDiag: linkedDelivery-id set — PrepareMessage skipped by OOTB");
  }
  if (Number(del.@state) === 15 && hasLguContent
      && Number(del.@["linkedDelivery-id"]) === 0 && smsSourceVal !== "") {
    logWarning("lguTestDeliveryPrepareDiag: state=15 + sms mirror OK — run lguTestRunDeliveryPrepareMessage(id)");
  }
  if (Number(del.@state) === 15 && !hasLguContent) {
    logWarning("lguTestDeliveryPrepareDiag: MSG/SENDER empty — Save on delivery UI first");
  }

  var mapId = Number(del.@["mapping-id"]);
  logInfo("lguTestDeliveryPrepareDiag: mapping-id=" + mapId);
  if (mapId > 0) {
    var mp = xtk.queryDef.create(
      <queryDef schema="nms:deliveryMapping" operation="getIfExists">
        <select>
          <node expr="@id"/>
          <node expr="@custmms"/>
          <node expr="@lgu_mms"/>
          <node expr="@lguMMS"/>
          <node expr="@sms"/>
        </select>
        <where>
          <condition expr={"@id=" + mapId}/>
        </where>
      </queryDef>
    ).ExecuteQuery();
    if (mp && mp.@id) {
      logInfo("lguTestDeliveryPrepareDiag: map lguMMS=" + mp.@lguMMS);
    } else {
      logWarning("lguTestDeliveryPrepareDiag: deliveryMapping not found id=" + mapId);
    }
  }

  var blRes = xtk.queryDef.create(
    <queryDef schema="nms:broadLogRcp" operation="select">
      <select>
        <node expr="@id"/>
        <node expr="@address"/>
        <node expr="@status"/>
      </select>
      <where>
        <condition expr={"[@delivery-id]=" + deliveryId}/>
      </where>
    </queryDef>
  ).ExecuteQuery();

  var blCount = 0;
  for each (var bl in blRes.broadLogRcp) {
    blCount++;
    logInfo("lguTestDeliveryPrepareDiag: broadLog id=" + bl.@id
      + " address=" + bl.@address
      + " status=" + bl.@status);
  }
  logInfo("lguTestDeliveryPrepareDiag: broadLog count=" + blCount);
  logInfo("lguTestDeliveryPrepareDiag: end");
  return true;
}
