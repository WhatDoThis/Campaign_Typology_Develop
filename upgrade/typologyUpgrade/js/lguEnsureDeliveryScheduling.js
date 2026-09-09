/**
 * lgu.lguEnsureDeliveryScheduling.js (Delivery Prepare scheduling 공통 보정)
 * ===================================================================
 * WF/campaign component delivery: scheduling expr·contactDate 누락 시 idempotent 보정.
 * Typology preTarget 에서 in-memory delivery + DB 모두 패치 (Pressure arbitration 용).
 * lguMMS MSG → content/sms/source 미러 (OOTB PrepareMessage 엔진용).
 * Target/SENDER/template 복사는 하지 않음 — WF upstream·UI Save 가 SSOT.
 *
 * [Main Functions]
 * ===========
 * - lguDeliveryPrepareLib: 채널 registry (CHANNEL_MESSAGE_TYPES 확장)
 * - lguPrepareAccDateTimeNow: DB Write 용 datetime 문자열
 * - LguDeliveryPrepareContext: snapshot / live+DB scheduling·content mirror patch
 * - ensureDeliveryPrepareForTypology: Control rule entry (preTarget)
 * - ensureDeliveryPrepareMessageForTypology: postTarget PrepareMessage (TEST typology only)
 *
 * [Dependencies]
 * =========
 * - nms:delivery, xtk:session.Write, xtk:queryDef, formatDate, getCurrentDate
 */

// 0. config — 채널 추가 시 CHANNEL_MESSAGE_TYPES 만 확장
var lguDeliveryPrepareLib = {
  CHANNEL_MESSAGE_TYPES: [101],
  DEFAULT_TIMEZONE: "Asia/Seoul",
  DEFAULT_EXTRACTION_EXPR: "GetDate()",
  DEFAULT_CONTACT_EXPR: "GetDate()"
};

// 1.
function lguPrepareIsBlank(value) {
  if (value === undefined || value === null) {
    return true;
  }
  var text = String(value);
  return text === "" || text === " ";
}

// 2. DB Write 용 — raw Date 객체는 TIM-030009
function lguPrepareAccDateTimeNow() {
  return formatDate(getCurrentDate(), "%4Y-%2M-%2D %2H:%2N:%2S");
}

// 3. typology delivery — delivery.id 만 사용 (.@id 컴파일 오류 방지)
function lguPrepareResolveDeliveryId(delivery) {
  if (!delivery) {
    return null;
  }
  var id = delivery.id;
  if (id === undefined || id === null || String(id) === "") {
    return null;
  }
  return Number(id);
}

// 4.
function lguPrepareIsRegisteredChannel(messageType) {
  var mt = Number(messageType);
  var list = lguDeliveryPrepareLib.CHANNEL_MESSAGE_TYPES;
  for (var i = 0; i < list.length; i++) {
    if (Number(list[i]) === mt) {
      return true;
    }
  }
  return false;
}

// 5. WF component 또는 operation-linked delivery
function lguPrepareIsComponent(deliveryRow) {
  if (!deliveryRow || !deliveryRow.@id) {
    return false;
  }
  var wfId = Number(deliveryRow.@["workflow-id"]);
  var opId = Number(deliveryRow.operation.@id);
  return wfId > 0 || opId > 0;
}

// 6.
function lguPrepareCondIdEquals(id) {
  return "@id=" + String(id);
}

// 7. lguMMS nested MSG — OOTB PrepareMessage 는 content/sms/source(CDATA) 기대
function lguPrepareReadLguMmsMsg(contentNode) {
  if (!contentNode || !contentNode.lguMMS || !contentNode.lguMMS.source) {
    return "";
  }
  return String(contentNode.lguMMS.source.MSG);
}

function lguPrepareReadSmsSource(contentNode) {
  if (!contentNode || !contentNode.sms) {
    return "";
  }
  return String(contentNode.sms.source);
}

function lguPrepareApplySmsSourceLive(liveDelivery, msg) {
  if (!liveDelivery || lguPrepareIsBlank(msg)) {
    return false;
  }
  if (!liveDelivery.content) {
    liveDelivery.content = <content/>;
  }
  if (!liveDelivery.content.sms) {
    liveDelivery.content.sms = <sms/>;
  }
  if (String(liveDelivery.content.sms.source) === msg) {
    return false;
  }
  liveDelivery.content.sms.source = msg;
  return true;
}

// 8. typology in-memory delivery.scheduling — arbitration 은 live 객체만 참조
function lguPrepareReadLiveScheduling(liveDelivery) {
  if (!liveDelivery || !liveDelivery.scheduling) {
    return null;
  }
  return liveDelivery.scheduling;
}

function lguPrepareApplySchedulingLive(liveDelivery, row, nowDate) {
  var sched = lguPrepareReadLiveScheduling(liveDelivery);
  if (!sched) {
    return false;
  }
  var lib = lguDeliveryPrepareLib;
  var patched = false;

  if (!row || lguPrepareIsBlank(row.scheduling.@extractionExpr)) {
    if (lguPrepareIsBlank(sched.extractionExpr)) {
      sched.extractionExpr = lib.DEFAULT_EXTRACTION_EXPR;
      patched = true;
    }
  }
  if (!row || lguPrepareIsBlank(row.scheduling.@contactDateExpr)) {
    if (lguPrepareIsBlank(sched.contactDateExpr)) {
      sched.contactDateExpr = lib.DEFAULT_CONTACT_EXPR;
      patched = true;
    }
  }
  if (!row || lguPrepareIsBlank(row.scheduling.@contactDate)) {
    if (lguPrepareIsBlank(sched.contactDate)) {
      sched.contactDate = nowDate;
      patched = true;
    }
  }
  if (!row || lguPrepareIsBlank(row.scheduling.@extraction)) {
    if (lguPrepareIsBlank(sched.extraction)) {
      sched.extraction = nowDate;
      patched = true;
    }
  }
  if (lguPrepareIsBlank(sched.contactDateTimeZone)) {
    sched.contactDateTimeZone = lib.DEFAULT_TIMEZONE;
    patched = true;
  }
  if (sched.delayed === undefined || sched.delayed === null || String(sched.delayed) === "") {
    sched.delayed = 0;
    patched = true;
  }
  return patched;
}

// 9.
function lguPrepareCreateContext(deliveryOrId) {
  return new LguDeliveryPrepareContext(deliveryOrId);
}

lguDeliveryPrepareLib.isBlank = lguPrepareIsBlank;
lguDeliveryPrepareLib.resolveDeliveryId = lguPrepareResolveDeliveryId;
lguDeliveryPrepareLib.isRegisteredChannel = lguPrepareIsRegisteredChannel;
lguDeliveryPrepareLib.isComponent = lguPrepareIsComponent;
lguDeliveryPrepareLib.condIdEquals = lguPrepareCondIdEquals;
lguDeliveryPrepareLib.createContext = lguPrepareCreateContext;

// 10. delivery 단위 Context
function LguDeliveryPrepareContext(deliveryOrId) {
  this.liveDelivery = null;
  if (typeof deliveryOrId === "number" || String(deliveryOrId).match(/^\d+$/)) {
    this.deliveryId = Number(deliveryOrId);
  } else if (deliveryOrId) {
    this.liveDelivery = deliveryOrId;
    this.deliveryId = lguPrepareResolveDeliveryId(deliveryOrId);
  } else {
    this.deliveryId = null;
  }
  this._snapshot = null;
}

LguDeliveryPrepareContext.prototype.loadSnapshot = function(forceReload) {
  if (this._snapshot && !forceReload) {
    return this._snapshot;
  }
  if (!this.deliveryId) {
    this._snapshot = null;
    return null;
  }
  var cond = lguPrepareCondIdEquals(this.deliveryId);
  this._snapshot = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="getIfExists">
      <select>
        <node expr="@id"/>
        <node expr="@messageType"/>
        <node expr="[@workflow-id]"/>
        <node expr="[operation/@id]"/>
        <node expr="[scheduling/@extractionExpr]"/>
        <node expr="[scheduling/@contactDateExpr]"/>
        <node expr="[scheduling/@contactDate]"/>
        <node expr="[scheduling/@extraction]"/>
        <node expr="[scheduling/@contactDateTimeZone]"/>
        <node expr="[content/lguMMS/source/MSG]"/>
        <node expr="[content/lguMMS/source/SENDER]"/>
        <node expr="[content/sms/source]"/>
        <node expr="@state"/>
        <node expr="[properties/@toDeliver]"/>
        <node expr="[@linkedDelivery-id]"/>
        <node expr="[@recurringDelivery-id]"/>
      </select>
      <where><condition expr={cond}/></where>
    </queryDef>
  ).ExecuteQuery();
  return this._snapshot;
};

LguDeliveryPrepareContext.prototype.needsContentMirror = function(row) {
  if (!row || !row.@id) {
    return false;
  }
  if (!lguPrepareIsRegisteredChannel(row.@messageType)) {
    return false;
  }
  var msg = lguPrepareReadLguMmsMsg(row.content);
  if (lguPrepareIsBlank(msg)) {
    return false;
  }
  return lguPrepareReadSmsSource(row.content) !== msg;
};

LguDeliveryPrepareContext.prototype.needsLiveContentMirror = function(row) {
  if (!this.liveDelivery) {
    return false;
  }
  if (!row || !row.@id) {
    return false;
  }
  if (!lguPrepareIsRegisteredChannel(row.@messageType)) {
    return false;
  }
  var msg = lguPrepareReadLguMmsMsg(this.liveDelivery.content);
  if (lguPrepareIsBlank(msg)) {
    msg = lguPrepareReadLguMmsMsg(row.content);
  }
  if (lguPrepareIsBlank(msg)) {
    return false;
  }
  return lguPrepareReadSmsSource(this.liveDelivery.content) !== msg;
};

LguDeliveryPrepareContext.prototype.patchContentMirror = function() {
  if (!this.deliveryId) {
    return false;
  }
  var row = this.loadSnapshot();
  if (!this.needsContentMirror(row) && !this.needsLiveContentMirror(row)) {
    return false;
  }
  var msg = lguPrepareReadLguMmsMsg(row.content);
  if (lguPrepareIsBlank(msg) && this.liveDelivery) {
    msg = lguPrepareReadLguMmsMsg(this.liveDelivery.content);
  }
  if (lguPrepareIsBlank(msg)) {
    return false;
  }
  var livePatched = false;
  var dbPatched = false;

  if (this.liveDelivery && this.needsLiveContentMirror(row)) {
    livePatched = lguPrepareApplySmsSourceLive(this.liveDelivery, msg);
  }

  if (this.needsContentMirror(row)) {
    try {
      xtk.session.Write(
        <delivery _operation="update" xtkschema="nms:delivery" id={this.deliveryId}>
          <content>
            <sms>
              <source>{msg}</source>
            </sms>
          </content>
        </delivery>
      );
      dbPatched = true;
    } catch (e) {
      logWarning("LguDeliveryPrepareContext.patchContentMirror: deliveryId="
        + this.deliveryId + " error=" + e);
    }
  }

  if (livePatched || dbPatched) {
    logInfo("ensureDeliveryContentMirror: patched id=" + this.deliveryId
      + " live=" + (livePatched ? "yes" : "no")
      + " db=" + (dbPatched ? "yes" : "no")
      + " msgLen=" + String(msg).length);
    this.loadSnapshot(true);
    return true;
  }
  return false;
};

LguDeliveryPrepareContext.prototype.needsDbSchedulingPatch = function(row) {
  if (!row || !row.@id) {
    return false;
  }
  if (!lguPrepareIsRegisteredChannel(row.@messageType)) {
    return false;
  }
  if (!lguPrepareIsComponent(row)) {
    return false;
  }
  var needExpr = lguPrepareIsBlank(row.scheduling.@extractionExpr)
      || lguPrepareIsBlank(row.scheduling.@contactDateExpr);
  var needDate = lguPrepareIsBlank(row.scheduling.@contactDate)
      || lguPrepareIsBlank(row.scheduling.@extraction);
  return needExpr || needDate;
};

LguDeliveryPrepareContext.prototype.needsLiveSchedulingPatch = function(row) {
  if (!this.liveDelivery) {
    return false;
  }
  if (!row || !row.@id) {
    return false;
  }
  if (!lguPrepareIsRegisteredChannel(row.@messageType)) {
    return false;
  }
  if (!lguPrepareIsComponent(row)) {
    return false;
  }
  var sched = lguPrepareReadLiveScheduling(this.liveDelivery);
  if (!sched) {
    return false;
  }
  return lguPrepareIsBlank(sched.contactDate)
      || lguPrepareIsBlank(sched.extraction)
      || lguPrepareIsBlank(sched.contactDateExpr)
      || lguPrepareIsBlank(sched.extractionExpr);
};

LguDeliveryPrepareContext.prototype.shouldPatchScheduling = function() {
  var row = this.loadSnapshot();
  return this.needsDbSchedulingPatch(row) || this.needsLiveSchedulingPatch(row);
};

LguDeliveryPrepareContext.prototype.patchScheduling = function() {
  if (!this.deliveryId || !this.shouldPatchScheduling()) {
    return false;
  }
  var lib = lguDeliveryPrepareLib;
  var row = this.loadSnapshot();
  var nowDate = getCurrentDate();
  var nowStr = lguPrepareAccDateTimeNow();
  var livePatched = false;
  var dbPatched = false;

  if (this.liveDelivery && this.needsLiveSchedulingPatch(row)) {
    livePatched = lguPrepareApplySchedulingLive(this.liveDelivery, row, nowDate);
  }

  if (this.needsDbSchedulingPatch(row)) {
    var sched = <scheduling delayed={0} contactDateTimeZone={lib.DEFAULT_TIMEZONE}/>;
    if (!row || lguPrepareIsBlank(row.scheduling.@extractionExpr)) {
      sched.@extractionExpr = lib.DEFAULT_EXTRACTION_EXPR;
    }
    if (!row || lguPrepareIsBlank(row.scheduling.@contactDateExpr)) {
      sched.@contactDateExpr = lib.DEFAULT_CONTACT_EXPR;
    }
    if (!row || lguPrepareIsBlank(row.scheduling.@contactDate)) {
      sched.@contactDate = nowStr;
    }
    if (!row || lguPrepareIsBlank(row.scheduling.@extraction)) {
      sched.@extraction = nowStr;
    }
    try {
      xtk.session.Write(
        <delivery _operation="update" xtkschema="nms:delivery" id={this.deliveryId}>
          {sched}
        </delivery>
      );
      dbPatched = true;
    } catch (e) {
      logWarning("LguDeliveryPrepareContext.patchScheduling: deliveryId="
        + this.deliveryId + " error=" + e);
    }
  }

  if (livePatched || dbPatched) {
    logInfo("ensureDeliveryScheduling: patched id=" + this.deliveryId
      + " live=" + (livePatched ? "yes" : "no")
      + " db=" + (dbPatched ? "yes" : "no")
      + " contactDate=" + nowStr
      + " tz=" + lib.DEFAULT_TIMEZONE);
    this.loadSnapshot(true);
    return true;
  }
  return false;
};

// 11. broadLog 존재 여부 — PrepareMessage 중복 호출 방지
function lguPrepareCountBroadLog(deliveryId) {
  if (!deliveryId) {
    return 0;
  }
  try {
    var cntRes = xtk.queryDef.create(
      <queryDef schema="nms:broadLogRcp" operation="count">
        <where>
          <condition expr={"[@delivery-id]=" + deliveryId}/>
        </where>
      </queryDef>
    ).ExecuteQuery();
    if (cntRes === undefined || cntRes === null) {
      return 0;
    }
    if (typeof cntRes === "number") {
      return cntRes;
    }
    var c = cntRes.@count;
    if (c !== undefined && c !== null && String(c) !== "") {
      return Number(c) || 0;
    }
    c = cntRes.@expr1;
    if (c !== undefined && c !== null && String(c) !== "") {
      return Number(c) || 0;
    }
    return 0;
  } catch (e) {
    logWarning("lguPrepareCountBroadLog: deliveryId=" + deliveryId + " error=" + e);
    return 0;
  }
}

// 12. Control typology rule entry — delivery 인자 필수 (live patch)
function ensureDeliveryPrepareForTypology(delivery) {
  var ctx = lguPrepareCreateContext(delivery);
  if (!ctx.deliveryId) {
    logWarning("ensureDeliveryPrepareForTypology: missing delivery id");
    return true;
  }
  ctx.patchScheduling();
  ctx.patchContentMirror();
  return true;
}

// 13. postTarget — WF PrepareTarget-only 환경에서 PrepareMessage (TEST typology only, STG 미배포)
function ensureDeliveryPrepareMessageForTypology(delivery) {
  var ctx = lguPrepareCreateContext(delivery);
  if (!ctx.deliveryId) {
    logWarning("ensureDeliveryPrepareMessageForTypology: missing delivery id");
    return true;
  }
  var row = ctx.loadSnapshot();
  if (!row || !row.@id) {
    logWarning("ensureDeliveryPrepareMessageForTypology: delivery not found id=" + ctx.deliveryId);
    return true;
  }
  if (!lguPrepareIsRegisteredChannel(row.@messageType)) {
    return true;
  }
  if (!lguPrepareIsComponent(row)) {
    return true;
  }
  if (Number(row.@["linkedDelivery-id"]) > 0) {
    logInfo("ensureDeliveryPrepareMessageForTypology: skip linkedDelivery id=" + ctx.deliveryId);
    return true;
  }
  var toDeliver = Number(row.properties.@toDeliver);
  if (toDeliver <= 0) {
    logInfo("ensureDeliveryPrepareMessageForTypology: skip toDeliver=0 id=" + ctx.deliveryId);
    return true;
  }
  if (lguPrepareCountBroadLog(ctx.deliveryId) > 0) {
    logInfo("ensureDeliveryPrepareMessageForTypology: skip broadLog exists id=" + ctx.deliveryId);
    return true;
  }
  ctx.patchContentMirror();

  logInfo("ensureDeliveryPrepareMessageForTypology: start id=" + ctx.deliveryId
    + " state=" + row.@state + " toDeliver=" + toDeliver);

  try {
    if (ctx.liveDelivery) {
      nms.delivery.PrepareMessage(ctx.liveDelivery);
    } else {
      var del = xtk.queryDef.create(
        <queryDef schema="nms:delivery" operation="get">
          <where>
            <condition expr={lguPrepareCondIdEquals(ctx.deliveryId)}/>
          </where>
        </queryDef>
      ).ExecuteQuery();
      nms.delivery.PrepareMessage(del);
    }
    logInfo("ensureDeliveryPrepareMessageForTypology: ok id=" + ctx.deliveryId
      + " broadLog=" + lguPrepareCountBroadLog(ctx.deliveryId));
  } catch (e) {
    logWarning("ensureDeliveryPrepareMessageForTypology: PrepareMessage failed id="
      + ctx.deliveryId + " error=" + e);
  }
  return true;
}

// 14. 하위 호환 alias
function ensureDeliverySchedulingForTypology(delivery) {
  ensureDeliveryPrepareForTypology(delivery);
}

// 15. Console/WF id-only entry (DB only — typology rule 에서는 ensureDeliveryPrepareForTypology 사용)
function ensureDeliveryScheduling(deliveryId) {
  var ctx = lguPrepareCreateContext(deliveryId);
  if (!ctx.deliveryId) {
    return false;
  }
  var patched = ctx.patchScheduling();
  if (ctx.patchContentMirror()) {
    patched = true;
  }
  return patched;
}
