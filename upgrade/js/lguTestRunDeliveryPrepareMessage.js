/**
 * lgu.lguTestRunDeliveryPrepareMessage.js ([LGU TEST] PrepareMessage 후속 실행)
 * ===========================================================================
 * Console Label: [LGU TEST] Run Delivery Prepare Message
 * Test 서버 전용 — Campaign WF 가 PrepareTarget 만 할 때 broadLog 생성 검증용.
 * STG/PRD Import 금지 (STG 는 OOTB Prepare+발송 경로 사용).
 *
 * [Main Functions]
 * ===========
 * - lguTestRunDeliveryPrepareMessage: mirror + PrepareMessage + broadLog 검증
 *
 * [Dependencies]
 * =========
 * - lgu:lguEnsureDeliveryScheduling.js, nms:delivery, nms:broadLogRcp, xtk:queryDef
 */

// 1.
function lguTestRunDeliveryPrepareMessage(deliveryId) {
  deliveryId = Number(deliveryId);
  if (!deliveryId) {
    logError("lguTestRunDeliveryPrepareMessage: invalid deliveryId");
    return false;
  }
  logInfo("lguTestRunDeliveryPrepareMessage: start id=" + deliveryId);

  loadLibrary("lgu:lguEnsureDeliveryScheduling.js");
  ensureDeliveryScheduling(deliveryId);

  var snap = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="getIfExists">
      <select>
        <node expr="@id"/>
        <node expr="@state"/>
        <node expr="@messageType"/>
        <node expr="[@linkedDelivery-id]"/>
      </select>
      <where>
        <condition expr={"@id=" + deliveryId}/>
      </where>
    </queryDef>
  ).ExecuteQuery();

  if (!snap || !snap.@id) {
    logError("lguTestRunDeliveryPrepareMessage: delivery not found id=" + deliveryId);
    return false;
  }

  logInfo("lguTestRunDeliveryPrepareMessage: state=" + snap.@state
    + " messageType=" + snap.@messageType
    + " linkedDelivery-id=" + snap.@["linkedDelivery-id"]);

  if (Number(snap.@["linkedDelivery-id"]) > 0) {
    logWarning("lguTestRunDeliveryPrepareMessage: linkedDelivery-id set — OOTB Prepare skips PrepareMessage");
    return false;
  }

  var stateBefore = Number(snap.@state);
  if (stateBefore !== 15 && stateBefore !== 21 && stateBefore !== 25 && stateBefore !== 45) {
    logWarning("lguTestRunDeliveryPrepareMessage: unexpected state=" + stateBefore
      + " — expected 15(targetReady) after PrepareTarget");
  }

  var del = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="get">
      <where>
        <condition expr={"@id=" + deliveryId}/>
      </where>
    </queryDef>
  ).ExecuteQuery();

  try {
    nms.delivery.PrepareMessage(del);
  } catch (e) {
    logError("lguTestRunDeliveryPrepareMessage: PrepareMessage failed id=" + deliveryId
      + " error=" + e);
    return false;
  }

  var after = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="getIfExists">
      <select>
        <node expr="@id"/>
        <node expr="@state"/>
        <node expr="[properties/@deliveryState]"/>
        <node expr="[content/sms/source]"/>
      </select>
      <where>
        <condition expr={"@id=" + deliveryId}/>
      </where>
    </queryDef>
  ).ExecuteQuery();

  logInfo("lguTestRunDeliveryPrepareMessage: after state=" + after.@state
    + " deliveryState=" + after.properties.@deliveryState
    + " smsSourceLen=" + String(after.content.sms.source).length);

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
    logInfo("lguTestRunDeliveryPrepareMessage: broadLog id=" + bl.@id
      + " address=" + bl.@address
      + " status=" + bl.@status);
  }
  logInfo("lguTestRunDeliveryPrepareMessage: broadLog count=" + blCount);
  logInfo("lguTestRunDeliveryPrepareMessage: end ok=" + (blCount > 0));
  return blCount > 0;
}
