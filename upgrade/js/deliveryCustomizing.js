loadLibrary("xtk:shared/nl.js");
NL.require("/nl/core/shared/xtk.js");
NL.require("/nl/core/shared/js.js");
/* 권대희 추가 : 채널별 필드 길이 정보 변수화 start */

// SMS/MMS
var mmsReserve4Length = 50;
var mmsMsgLength = 2000;



/* 권대희 추가 : 채널별 필드 길이 정보 변수화 end */
/* 권대희 추가 : 공통 사용 함수 정의 start */

// string 값의 Byte 수 계산
function getUtf8ByteLength(str) {
  var i = 0;
  var bytes = 0;
  var code = 0;
  if (str == null || str == undefined) {
    return 0;
  }
  str = String(str);
  for (i = 0; i < str.length; i++) {
    code = str.charCodeAt(i);
    // 1 byte
    if (code <= 0x7F) {
      bytes += 1;
    }
    // 2 bytes
    else if (code <= 0x7FF) {
      bytes += 2;
    }
    // surrogate pair (4 bytes)
    else if (code >= 0xD800 && code <= 0xDBFF) {
      if (i + 1 < str.length) {
        var nextCode = str.charCodeAt(i + 1);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          bytes += 4;
          i++;
        } else {
          bytes += 3;
        }
      } else {
        bytes += 3;
      }
    }
    // 3 bytes
    else {
      bytes += 3;
    }
  }
  return bytes;
}

// string 값의 글자 수 계산
function getCharLength(str) {
  if (str == null || str == undefined) {
    return 0;
  }
 
  return String(str).length;
}


/* 권대희 추가 : 공통 사용 함수 정의 end */

/* 권대희 추가 : 채널 관련 공통 함수 start */

function lgu_deliveryCustomizing_enterDeliverySetting(_targetTypeNo){
  var detail_string = "";
  var targetTypeQuery = xtk.queryDef.create(
    <queryDef schema="lgu:LGU_TARGET_TYPE_M" operation="get">
    <select>
      <node expr="@TYPE_DETAIL"/>
    </select>
    <where>
      <condition expr={"@NO = " + _targetTypeNo}/>
    </where>
    </queryDef>
  );
  // logInfo("recipient querydef 성공");
  
  var targetTypeDetails = targetTypeQuery.ExecuteQuery();
  for each(var targetTypeDetail in targetTypeDetails){
    detail_string = targetTypeDetail.@TYPE_DETAIL;
  }
  
  return detail_string;
}

/* 권대희 추가 : 채널 관련 공통 함수 end */

/* 권대희 추가 : SMS/MMS 관련 함수 start */
function lgu_deliveryCustomizing_validateMMSContentsLength(_reserved4, _msg){
  var isValid = "false";
  var reserve4ByteLen = getUtf8ByteLength(_reserved4);
  var msgByteLen = getUtf8ByteLength(_msg);
  logInfo("reserve4ByteLen : " + reserve4ByteLen);
  logInfo("msgByteLen : " + msgByteLen);
  if (reserve4ByteLen <= mmsReserve4Length) {
    if (msgByteLen <= mmsMsgLength) {
      isValid = "true";
    }
  }
  
  return isValid;
}

/* 권대희 추가 : SMS/MMS 관련 함수 end */