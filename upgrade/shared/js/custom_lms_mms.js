/******************************************************************************
*-----------------------------------------------------------------------------*
* LMS/MMS notifications *
* (c) ibank 2026                                                     *
* Language  : JavaScript                                                      *
* Creation  : shyang 2026/06/24                                          *
******************************************************************************/

loadLibrary("xtk:shared/nl.js");
NL.require('/nl/core/shared/xtk.js')
  .require('/nl/core/shared/js.js');

//-----------------------------------------------------------------------------
// Adobe Campaign Delivery Connector Methods
//-----------------------------------------------------------------------------
function processDeliveryPart (deliveryPart) {
  var msgs = <messages successOnSent="true"/>;
  //logInfo(deliveryPart.toXMLString())
  
  try {
    logInfo(deliveryPart.toXMLString())
  } catch (e) {
     logInfo("error : " + e);
  } 
  
  return msgs;
}

//-----------------------------------------------------------------------------
// Useless here, but needed by Adobe Campaign
//-----------------------------------------------------------------------------
function getStatus (xml) {
  var msgs = <messages/>;
  return msgs;
}

//-----------------------------------------------------------------------------
// Useless here, but needed by Adobe Campaign
//-----------------------------------------------------------------------------
function getMessages (xml) {
  var msgs = <messages/>;
  return msgs;
}