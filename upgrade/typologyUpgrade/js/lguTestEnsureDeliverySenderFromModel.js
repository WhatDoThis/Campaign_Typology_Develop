/**
 * lgu.lguTestEnsureDeliverySenderFromModel.js ([LGU TEST] SENDER model fallback)
 * ===============================================================================
 * Console Label: [LGU TEST] Ensure Delivery Sender From Model
 * Test Typology 전용 — UI Save 미반영 시 model SENDER fallback. STG/PRD 금지.
 *
 * [Main Functions]
 * ===========
 * - ensureDeliverySenderFromModelForTypology: Control rule entry (Test only)
 *
 * [Dependencies]
 * =========
 * - lgu:lguEnsureDeliveryScheduling.js
 */

var lguDeliverySenderTestLib = {
  SENDER_CHANNEL_MESSAGE_TYPES: [101]
};

// 1.
function lguSenderTestIsBlank(value) {
  return lguPrepareIsBlank(value);
}

// 2.
function lguSenderTestIsSenderChannel(messageType) {
  var mt = Number(messageType);
  var list = lguDeliverySenderTestLib.SENDER_CHANNEL_MESSAGE_TYPES;
  for (var i = 0; i < list.length; i++) {
    if (Number(list[i]) === mt) {
      return true;
    }
  }
  return false;
}

// 3.
function lguSenderTestReadSenderFromRow(row) {
  if (!row || !row.content || !row.content.lguMMS || !row.content.lguMMS.source) {
    return "";
  }
  return String(row.content.lguMMS.source.SENDER);
}

// 4.
function lguSenderTestCreateContext(deliveryOrId) {
  return new LguDeliverySenderTestContext(deliveryOrId);
}

function LguDeliverySenderTestContext(deliveryOrId) {
  this._prepareCtx = lguPrepareCreateContext(deliveryOrId);
  this.deliveryId = this._prepareCtx.deliveryId;
  this._senderLoaded = false;
  this._currentSender = null;
}

LguDeliverySenderTestContext.prototype.loadCurrentSender = function(forceReload) {
  if (this._senderLoaded && !forceReload) {
    return this._currentSender;
  }
  this._senderLoaded = true;
  this._currentSender = "";
  if (!this.deliveryId) {
    return this._currentSender;
  }
  var cond = lguPrepareCondIdEquals(this.deliveryId);
  try {
    var row = xtk.queryDef.create(
      <queryDef schema="nms:delivery" operation="getIfExists">
        <select>
          <node expr="@id"/>
          <node expr="@messageType"/>
          <node expr="[content/lguMMS/source/SENDER]"/>
        </select>
        <where><condition expr={cond}/></where>
      </queryDef>
    ).ExecuteQuery();
    if (row && row.@id) {
      this._currentSender = lguSenderTestReadSenderFromRow(row);
    }
  } catch (e) {
    logWarning("LguDeliverySenderTestContext.loadCurrentSender: deliveryId="
      + this.deliveryId + " error=" + e);
  }
  return this._currentSender;
};

LguDeliverySenderTestContext.prototype.shouldPatchSender = function() {
  var prep = this._prepareCtx.loadSnapshot();
  if (!prep || !prep.@id) {
    return false;
  }
  if (!lguSenderTestIsSenderChannel(prep.@messageType)) {
    return false;
  }
  if (!lguPrepareIsComponent(prep)) {
    return false;
  }
  if (!lguSenderTestIsBlank(this.loadCurrentSender())) {
    return false;
  }
  return this._prepareCtx.getModelId() > 0;
};

LguDeliverySenderTestContext.prototype.loadModelSender = function() {
  var modelId = this._prepareCtx.getModelId();
  if (modelId <= 0) {
    return "";
  }
  var cond = lguPrepareCondIdEquals(modelId);
  try {
    var model = xtk.queryDef.create(
      <queryDef schema="nms:delivery" operation="getIfExists">
        <select>
          <node expr="@id"/>
          <node expr="[content/lguMMS/source/SENDER]"/>
        </select>
        <where><condition expr={cond}/></where>
      </queryDef>
    ).ExecuteQuery();
    if (!model || !model.@id) {
      return "";
    }
    return lguSenderTestReadSenderFromRow(model);
  } catch (e) {
    logWarning("LguDeliverySenderTestContext.loadModelSender: modelId="
      + modelId + " error=" + e);
    return "";
  }
};

LguDeliverySenderTestContext.prototype.patchSenderFromModel = function() {
  if (!this.shouldPatchSender()) {
    return false;
  }
  var modelId = this._prepareCtx.getModelId();
  var sender = this.loadModelSender();
  if (lguSenderTestIsBlank(sender)) {
    logWarning("lguTestEnsureDeliverySenderFromModel: SENDER blank on delivery and model id="
      + modelId);
    return false;
  }
  try {
    xtk.session.Write(
      <delivery _operation="update" xtkschema="nms:delivery" id={this.deliveryId}>
        <content>
          <lguMMS>
            <source>
              <SENDER>{sender}</SENDER>
            </source>
          </lguMMS>
        </content>
      </delivery>
    );
  } catch (e) {
    logWarning("LguDeliverySenderTestContext.patchSenderFromModel: deliveryId="
      + this.deliveryId + " error=" + e);
    return false;
  }
  logInfo("lguTestEnsureDeliverySenderFromModel: patched id=" + this.deliveryId
    + " SENDER=[" + sender + "] from model=" + modelId);
  this.loadCurrentSender(true);
  return true;
};

// 5. Control typology rule entry (Test only)
function ensureDeliverySenderFromModelForTypology(delivery) {
  if (typeof lguPrepareCreateContext === "undefined") {
    logWarning("lguTestEnsureDeliverySenderFromModel: load lgu:lguEnsureDeliveryScheduling.js");
    return true;
  }
  var ctx = lguSenderTestCreateContext(delivery);
  if (!ctx.deliveryId) {
    logWarning("lguTestEnsureDeliverySenderFromModel: missing delivery id");
    return true;
  }
  ctx.patchSenderFromModel();
  return true;
}
