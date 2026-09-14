/**
 * lgu.lguTypologyPressureAdapter.js (Typology Pressure Adapter)
 * ================================================================
 * WF component delivery: scheduling contactDate·extraction 누락 시 live+DB materialize.
 * Typology preTarget — Pressure arbitration 이 live contactDate 를 요구.
 * extractionExpr/contactDateExpr/content/SENDER/target — **건드리지 않음**.
 *
 * [Main Functions]
 * ===========
 * - lguTypologyPressureAdapterLib: 채널 registry (CHANNEL_MESSAGE_TYPES 확장)
 * - LguTypologyPressureAdapterContext: snapshot / live+DB contactDate·extraction patch
 * - applyTypologyPressureAdapter: Control rule entry (preTarget)
 * - applyTypologyPressureAdapterById: Console id-only entry
 *
 * [Dependencies]
 * =========
 * - nms:delivery, xtk:session.Write, xtk:queryDef, formatDate, getCurrentDate
 */

// 0. config — 채널 추가 시 CHANNEL_MESSAGE_TYPES 만 확장
var lguTypologyPressureAdapterLib = {
  CHANNEL_MESSAGE_TYPES: [101],
  DEFAULT_TIMEZONE: "Asia/Seoul"
};

// 1.
function lguPressureAdapterIsBlank(value) {
  if (value === undefined || value === null) {
    return true;
  }
  var text = String(value);
  return text === "" || text === " ";
}

// 2. DB Write 용 — raw Date 객체는 TIM-030009
function lguPressureAdapterAccDateTimeNow() {
  return formatDate(getCurrentDate(), "%4Y-%2M-%2D %2H:%2N:%2S");
}

// 3. typology delivery — delivery.id 만 사용 (.@id 컴파일 오류 방지)
function lguPressureAdapterResolveDeliveryId(delivery) {
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
function lguPressureAdapterIsRegisteredChannel(messageType) {
  var mt = Number(messageType);
  var list = lguTypologyPressureAdapterLib.CHANNEL_MESSAGE_TYPES;
  for (var i = 0; i < list.length; i++) {
    if (Number(list[i]) === mt) {
      return true;
    }
  }
  return false;
}

// 5. WF component 또는 operation-linked delivery
function lguPressureAdapterIsComponent(deliveryRow) {
  if (!deliveryRow || !deliveryRow.@id) {
    return false;
  }
  var wfId = Number(deliveryRow.@["workflow-id"]);
  var opId = Number(deliveryRow.operation.@id);
  return wfId > 0 || opId > 0;
}

// 6.
function lguPressureAdapterCondIdEquals(id) {
  return "@id=" + String(id);
}

// 7. arbitration 은 live delivery.scheduling.contactDate 참조
function lguPressureAdapterEnsureLiveSchedulingNode(liveDelivery) {
  var lib = lguTypologyPressureAdapterLib;
  if (!liveDelivery) {
    return null;
  }
  if (!liveDelivery.scheduling) {
    liveDelivery.scheduling = <scheduling delayed={0} contactDateTimeZone={lib.DEFAULT_TIMEZONE}/>;
    return { sched: liveDelivery.scheduling, created: true };
  }
  return { sched: liveDelivery.scheduling, created: false };
}

function lguPressureAdapterApplySchedulingLive(liveDelivery, row, nowDate) {
  var ensured = lguPressureAdapterEnsureLiveSchedulingNode(liveDelivery);
  if (!ensured) {
    return false;
  }
  var sched = ensured.sched;
  var lib = lguTypologyPressureAdapterLib;
  var patched = ensured.created;

  if (!row || lguPressureAdapterIsBlank(row.scheduling.@contactDate)) {
    if (lguPressureAdapterIsBlank(sched.contactDate)) {
      sched.contactDate = nowDate;
      patched = true;
    }
  }
  if (!row || lguPressureAdapterIsBlank(row.scheduling.@extraction)) {
    if (lguPressureAdapterIsBlank(sched.extraction)) {
      sched.extraction = nowDate;
      patched = true;
    }
  }
  if (lguPressureAdapterIsBlank(sched.contactDateTimeZone)) {
    sched.contactDateTimeZone = lib.DEFAULT_TIMEZONE;
    patched = true;
  }
  if (sched.delayed === undefined || sched.delayed === null || String(sched.delayed) === "") {
    sched.delayed = 0;
    patched = true;
  }
  return patched;
}

function lguPressureAdapterForceLiveContactDate(liveDelivery, nowDate) {
  return lguPressureAdapterApplySchedulingLive(liveDelivery, null, nowDate);
}

// 8.
function lguPressureAdapterCreateContext(deliveryOrId) {
  return new LguTypologyPressureAdapterContext(deliveryOrId);
}

lguTypologyPressureAdapterLib.isBlank = lguPressureAdapterIsBlank;
lguTypologyPressureAdapterLib.resolveDeliveryId = lguPressureAdapterResolveDeliveryId;
lguTypologyPressureAdapterLib.isRegisteredChannel = lguPressureAdapterIsRegisteredChannel;
lguTypologyPressureAdapterLib.isComponent = lguPressureAdapterIsComponent;
lguTypologyPressureAdapterLib.condIdEquals = lguPressureAdapterCondIdEquals;
lguTypologyPressureAdapterLib.createContext = lguPressureAdapterCreateContext;

// 9. delivery 단위 Context
function LguTypologyPressureAdapterContext(deliveryOrId) {
  this.liveDelivery = null;
  if (typeof deliveryOrId === "number" || String(deliveryOrId).match(/^\d+$/)) {
    this.deliveryId = Number(deliveryOrId);
  } else if (deliveryOrId) {
    this.liveDelivery = deliveryOrId;
    this.deliveryId = lguPressureAdapterResolveDeliveryId(deliveryOrId);
  } else {
    this.deliveryId = null;
  }
  this._snapshot = null;
}

LguTypologyPressureAdapterContext.prototype.loadSnapshot = function(forceReload) {
  if (this._snapshot && !forceReload) {
    return this._snapshot;
  }
  if (!this.deliveryId) {
    this._snapshot = null;
    return null;
  }
  var cond = lguPressureAdapterCondIdEquals(this.deliveryId);
  this._snapshot = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="getIfExists">
      <select>
        <node expr="@id"/>
        <node expr="@messageType"/>
        <node expr="[@workflow-id]"/>
        <node expr="[operation/@id]"/>
        <node expr="[scheduling/@contactDate]"/>
        <node expr="[scheduling/@extraction]"/>
        <node expr="[scheduling/@contactDateTimeZone]"/>
      </select>
      <where><condition expr={cond}/></where>
    </queryDef>
  ).ExecuteQuery();
  return this._snapshot;
};

LguTypologyPressureAdapterContext.prototype.needsDbSchedulingPatch = function(row) {
  if (!row || !row.@id) {
    return false;
  }
  if (!lguPressureAdapterIsRegisteredChannel(row.@messageType)) {
    return false;
  }
  if (!lguPressureAdapterIsComponent(row)) {
    return false;
  }
  return lguPressureAdapterIsBlank(row.scheduling.@contactDate)
      || lguPressureAdapterIsBlank(row.scheduling.@extraction);
};

LguTypologyPressureAdapterContext.prototype.needsLiveSchedulingPatch = function(row) {
  if (!this.liveDelivery) {
    return false;
  }
  if (!row || !row.@id) {
    return false;
  }
  if (!lguPressureAdapterIsRegisteredChannel(row.@messageType)) {
    return false;
  }
  if (!lguPressureAdapterIsComponent(row)) {
    return false;
  }
  var ensured = lguPressureAdapterEnsureLiveSchedulingNode(this.liveDelivery);
  if (!ensured) {
    return false;
  }
  if (ensured.created) {
    return true;
  }
  var sched = ensured.sched;
  return lguPressureAdapterIsBlank(sched.contactDate)
      || lguPressureAdapterIsBlank(sched.extraction);
};

LguTypologyPressureAdapterContext.prototype.patchScheduling = function() {
  if (!this.deliveryId) {
    return false;
  }
  var lib = lguTypologyPressureAdapterLib;
  var row = this.loadSnapshot();
  var nowDate = getCurrentDate();
  var nowStr = lguPressureAdapterAccDateTimeNow();
  var livePatched = false;
  var dbPatched = false;

  if (this.liveDelivery && row && row.@id
      && lguPressureAdapterIsRegisteredChannel(row.@messageType)
      && lguPressureAdapterIsComponent(row)) {
    if (this.needsLiveSchedulingPatch(row)
        || lguPressureAdapterIsBlank(row.scheduling.@contactDate)) {
      livePatched = lguPressureAdapterApplySchedulingLive(this.liveDelivery, row, nowDate);
    }
  }

  if (this.needsDbSchedulingPatch(row)) {
    var sched = <scheduling delayed={0}/>;
    var hasWrite = false;
    if (lguPressureAdapterIsBlank(row.scheduling.@contactDate)) {
      sched.@contactDate = nowStr;
      hasWrite = true;
    }
    if (lguPressureAdapterIsBlank(row.scheduling.@extraction)) {
      sched.@extraction = nowStr;
      hasWrite = true;
    }
    if (lguPressureAdapterIsBlank(row.scheduling.@contactDateTimeZone)) {
      sched.@contactDateTimeZone = lib.DEFAULT_TIMEZONE;
      hasWrite = true;
    }
    if (hasWrite) {
      try {
        xtk.session.Write(
          <delivery _operation="update" xtkschema="nms:delivery" id={this.deliveryId}>
            {sched}
          </delivery>
        );
        dbPatched = true;
      } catch (e) {
        logWarning("LguTypologyPressureAdapterContext.patchScheduling: deliveryId="
          + this.deliveryId + " error=" + e);
      }
    }
  }

  if (this.liveDelivery && !livePatched) {
    livePatched = lguPressureAdapterForceLiveContactDate(this.liveDelivery, nowDate);
  }

  if (livePatched || dbPatched) {
    logInfo("typologyPressureAdapter: patched id=" + this.deliveryId
      + " live=" + (livePatched ? "yes" : "no")
      + " db=" + (dbPatched ? "yes" : "no")
      + " contactDate=" + nowStr
      + " tz=" + lib.DEFAULT_TIMEZONE);
    this.loadSnapshot(true);
    return true;
  }
  return false;
};

// 10. Control typology rule entry — Pressure arbitration 용 live contactDate
function applyTypologyPressureAdapter(delivery) {
  var ctx = lguPressureAdapterCreateContext(delivery);
  if (!ctx.deliveryId) {
    logWarning("applyTypologyPressureAdapter: missing delivery id");
    return true;
  }
  logInfo("applyTypologyPressureAdapter: enter id=" + ctx.deliveryId);
  if (!ctx.patchScheduling()) {
    logInfo("applyTypologyPressureAdapter: scheduling unchanged id=" + ctx.deliveryId);
  }
  return true;
}

// 11. Console id-only entry
function applyTypologyPressureAdapterById(deliveryId) {
  var ctx = lguPressureAdapterCreateContext(deliveryId);
  if (!ctx.deliveryId) {
    return false;
  }
  return ctx.patchScheduling();
}
