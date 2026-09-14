/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2020 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

// Scripts ran in the customer instance used to synchronize 
// deliverabilitiy related settings and rules from the Deliverability Server
var strCuid = getOption("DmRendering_cuid")
if( strCuid == null || strCuid === "VALUE_TO_CHANGE" ) // VALUE_TO_CHANGE is the default value of the option
  strCuid = ""

//---------------------------------------------------------------------------
// Entry point (function used to call the functions written in deliverability-client.cpp with the help of wrapper object.)
//---------------------------------------------------------------------------
function deliverabilityUpdateV2()
{
  var sg = new StringGroup("nms:core")
  if (strCuid === "") {
    logError(sg.cuidOptionNotSet());
  }

  var deliverabilityClient = new Deliverability();
  try
  {
    deliverabilityClient.CreateOptionsIfNeeded();
  }
  catch( e )
  {
    logWarning(sg.errorCallingFunction("/CreateOptionsIfNeeded/",e));
  }
  try
  {
    deliverabilityClient.GetNewRegex();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/regex/",e));
  }  
  
  try
  {
    deliverabilityClient.GetNewUserAgentRules();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/useragent/",e));
  }    
  
  try
  {
    deliverabilityClient.GetExclusions();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/getexclusions/",e));
  }
  
  try
  {
    deliverabilityClient.GetBroadLogMsg();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/getbroadlogs/",e));
  }

  try
  {
    deliverabilityClient.SendBroadLogMsg();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/sendbroadlogs/",e));
  }
  
  try
  {
    deliverabilityClient.GetInMailRules();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/inmail/",e));
  }

  try
  {
    deliverabilityClient.GetDomainRules();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/domain/",e));
  }

  try
  {
    deliverabilityClient.GetMxRules();
  }
  catch( e )
  {
    logWarning(sg.errorCallingApi("/rules/mx/",e));
  }
}
