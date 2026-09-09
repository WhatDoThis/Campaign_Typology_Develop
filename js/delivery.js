/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2009 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property 
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

loadLibrary("/nl/core/shared/nl.js");

NL.require("/nl/core/shared/xtk.js")
  .require("/nl/core/sql.js")
  .require("/nms/dlvUtils.js");
// ## TO REMOVE WHEN JS FWF READY
NL.XTK.parseBoolean = booleanValue;
//---------------------------------------------------------------------------
// Wrapping of the standard API for delivery preparation
//---------------------------------------------------------------------------
function nms_delivery_PrepareTarget(elDelivery) {
  // Launch the preparation of messages
  var xmlDelivery = nms.delivery.create(elDelivery);
  xmlDelivery.PrepareTargetImpl();
  return xmlDelivery.toXML();
}
function nms_delivery_PrepareMessage(elDelivery) {
  // Launch the preparation of messages
  var xmlDelivery = nms.delivery.create(elDelivery);
  xmlDelivery.PrepareMessageImpl();
  return xmlDelivery.toXML();
}
function nms_delivery_Prepare(elDelivery) {
  // Launch the preparation of messages
  var xmlDelivery = nms.delivery.create(elDelivery);
  if( NL.XTK.parseInt(elDelivery.@launchFCP)!=0 && !NL.XTK.parseBoolean(elDelivery.@FCP) ) {
    xmlDelivery.PrepareProof(parseInt(elDelivery.@launchFCP)==2 || parseInt(elDelivery.@launchFCP)==3);
  } else {
    xmlDelivery.PrepareTarget();
    if( !NL.XTK.parseInt(elDelivery.@["linkedDelivery-id"]) )
      xmlDelivery.PrepareMessage();
  }
  return xmlDelivery.toXML();
}

function nms_extAccount_GetDeliverabilityServerDetails(){
  var sname = "deliverabilityInstance";
  var sg = new StringGroup("nms:inboxRendering");
  var query = NLWS.xtkQueryDef.create(
    {queryDef: {schema:"nms:extAccount", operation: "get",
    select: {node : [
      {expr:"@server"},
      {expr:"@account"},
      {expr:"@password"},
      {expr:"@active"}
    ]},
    where: {condition : [
            {expr: "[@name] ="+NL.XTK.toXTKString(sname, 'string') + " and @type = 5"}
    ]},
  }});

  try{
    var queryResult = query.ExecuteQuery();
  }catch(e){
    logError(sg.deliverabilityServerDetailsError(e.toString()));  
  }
  return DOMDocument.fromJXON({
    serverDetails: {
    server: queryResult.$server,
    account: queryResult.$account,
    password: queryResult.$password,
    active: NL.XTK.parseBoolean(queryResult.$active),
  }});
}

function __getServerURL(url){
  var lastIndexOf = url.lastIndexOf("/");
  if(lastIndexOf != url.length - 1) {
    url+="/";
  }
  return url;
}

function nms_delivery_GetSeedList(did, cuid, deviceList){
  var sg = new StringGroup("nms:inboxRendering");
  var deliverabilityAccountDoc = nms_extAccount_GetDeliverabilityServerDetails();
  var deliverabilityAccount = deliverabilityAccountDoc.root;
  if( !deliverabilityAccount.getAttribute("active") ) {
    logError(sg.deliverabilityAccountError(deliverabilityAccount.account));
  }
  var httpRequest = new HttpClientRequest(__getServerURL(deliverabilityAccount.getAttribute("server"))+"inboxrendering/seedlist");
  var documentResult = new DOMDocument("seedListResponse");
  var json;
  try{
    httpRequest.header["Content-Type"] = "application/json; charset=utf-8";
    var buf = new MemoryBuffer();
    buf.fromString(deliverabilityAccount.getAttribute("account") + ':' + decryptPassword(deliverabilityAccount.getAttribute("password")), "utf-8");
    httpRequest.header["Authorization"] = "Basic "+buf.toBase64();
    var devices = deviceList.device;
    if(devices.length() <= 0){
      return documentResult.root;
    }
    var devicesJson = [];
    for(var i=0;i<devices.length();i++){
      var device = devices[i];
      var deviceJson = {};
      deviceJson.id = device.@id.toString();
      deviceJson.providerId = device.@providerId.toString();
      deviceJson.deviceName = device.@deviceName.toString();
      deviceJson.deviceFullName = device.@deviceFullName.toString();
      deviceJson.status = device.@status.toString();
      deviceJson.version = device.@version.toString();
      deviceJson.creationTime = device.@creationTime.toString();
      deviceJson.lastUpdateTime = device.@lastUpdateTime.toString();
      deviceJson.masterList = {};
      deviceJson.masterList.id = device.masterList.@id.toString();
      deviceJson.masterList.label = device.masterList.@label.toString();
      devicesJson.push(deviceJson);
    }
    var seedListRequest = {
      "accountId": cuid,
      "campaignDeliveryId": did.toString(),
      "devices": devicesJson,
      "state": "1"
    }
    httpRequest.body = JSON.stringify(seedListRequest);
    httpRequest.method = "POST";
    httpRequest.execute();
  } catch (e) {
    logError(sg.deliverabilityErrorSeedList(e.toString()));
  }
  try{
    json = JSON.parse(httpRequest.response.body);
  } catch(e){
    logError(sg.deliverabilityErrorSeedList(e.toString()));
  }
  if (httpRequest.response.code != 200) {
    logError(sg.httpRequestErrorCode(httpRequest.response.code));
  }
  for(var index=0;index<json.length;index++){
    var postResponse = json[index];
    var deviceResponse;
    var seedList=documentResult.createElement("seedList");
    for(var i = 0; i<postResponse.emailList.length;i++){
      seedList.appendChild({emailList:postResponse.emailList[i]});
    }
    seedList.setAttribute("id",postResponse.id);
    seedList.setAttribute("seedListRequestId",postResponse.seedListRequestId);
    seedList.setAttribute("providerTestId",postResponse.providerTestId);
    seedList.setAttribute("providerId",postResponse.providerId);
    documentResult.root.appendChild(seedList);
  }
  return documentResult;
}


function nms_delivery_GetDeviceList(cuid){
  var sg = new StringGroup("nms:inboxRendering");
  var deliverabilityAccountDoc = nms_extAccount_GetDeliverabilityServerDetails();
  var deliverabilityAccount = deliverabilityAccountDoc.root;
  if( !deliverabilityAccount.getAttribute("active") ) {
    logError(sg.deliverabilityAccountError(deliverabilityAccount.account));
  }
  var httpRequest = new HttpClientRequest(__getServerURL(deliverabilityAccount.getAttribute("server"))+"inboxrendering/devices/"+cuid);
  var documentDevices = new DOMDocument("devices");
  try {
    httpRequest.method = "GET";
    var buf = new MemoryBuffer();
    buf.fromString(deliverabilityAccount.getAttribute("account") + ':' + decryptPassword(deliverabilityAccount.getAttribute("password")), "utf-8");
    httpRequest.header["Authorization"] = "Basic "+buf.toBase64();
    httpRequest.execute();
  } catch (e) {
    logError(sg.deliverabilityErrorDeviceList(e.toString()));
  }
  if (httpRequest.response.code != 200) {
    logError(sg.httpRequestErrorCode(httpRequest.response.code));
  }
  try {
  var devices = JSON.parse(httpRequest.response.body);
  } catch(e) {
    logError(sg.deliverabilityErrorDeviceList(e.toString()));
  }
  var documentRootElement = documentDevices.root;
  for(var i=0; i < devices.length; i++){
    documentRootElement.appendChild({device:devices[i]});
  }
   return documentDevices;
}

/**
 * Retrieves a template schema for broadLogs or excludeLogs
 * @param {String} sExtNamespace namespace of the future schema
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {String} isFfda flag to indicate FFDA target mapping, false by default<bFfda>
 * @param {DOM} elBroadLogSchema schema of the broadLog
 * @param {NLSchema} schema the schema linked to the broadLog
 * @param {String} sLogType type of the output schema (broadLog / excludeLog)
 * @param {String} sLogLabel Label of the output schema
 * @param {String} if need to be != from schema.name
 * @param {[ NLSchema, ... ]} targetSchema [optionnal parameters] array of schemas that need to linked to this broadLog schema
 **/
function broadLogSchema(sExtNamespace, sNamespace, sSuffix, isFfda, elBroadLogSchema, schema, sLogType, sLogLabel, sLinkToTarget, aTargetSchema) {

  var sLinkName = sLinkToTarget || schema.name
  var blSchema = <srcSchema namespace={sNamespace} name={String(sLogType)+String(sSuffix)}
                 label={sLogLabel} implements='xtk:persist' img={'nms:'+String(sLogType)+'.png'}>
        <element name={String(sLogType)+String(sSuffix)} label={sLogLabel}>
          <element name="delivery" revLabel={sLogLabel}/>
          <element name={sLinkName} type="link" noDbIndex="true"
                   label={schema.label} target={schema.id} integrity="normal"
                   revLabel={sLogLabel} revIntegrity="normal" revLink={String(sLogType)}/>
        </element>
      </srcSchema>;

  var sg = new StringGroup("nms:core");
  if( isFfda ) {
    // "schema" may be a json
    var dataSource = schema.dataSource;
    if( dataSource != '')
      blSchema.element[0].@dataSource = dataSource;
    else
      blSchema.element[0].@dataSource = schema.root.dataSource;
    // NEO-26554: In case of ffda there is no existing link between broadlog and nms:delivery.
    // Without a link, query created from delivery form (client side) does not contain where condition,
    // which results in displaying all the broadlogs rather than logs of that particular delivery in client.
    blSchema.element[0].appendChild(
        <element name="nmsDelivery" type="link"
           label="nmsDelivery" target="nms:delivery" integrity="normal"
           revLabel={String(sLogLabel)} revIntegrity="neutral" revLink={String(sLogLabel)}>
           <join xpath-dst="@id" xpath-src="@delivery-id"/>
        </element>);
    // override ID attribute with UUID type
    // sqlname of the id is always "uBroadLogId" for FFDA (or "iBroadLogId" for non-FFDA) regardless of the delivery mapping
    blSchema.element[0].appendChild(
        <attribute desc={sg.uuidPrimaryKey()} label={sg.uuidPrimaryKey()}
        name="id" sqlname="uBroadLogId" type="uuid"/>);

  }
  else {
    blSchema.element[0].appendChild(
      <dbindex name="tgt">
        <keyfield xlink={sLinkName}/>
        <keyfield xpath="@lastModified"/>
      </dbindex>);
  }

  if( sNamespace !== sExtNamespace) {
    blSchema.@namespace = sExtNamespace;
    blSchema.@extendedSchema = sNamespace + ':' + String(sLogType)+String(sSuffix);
  } else {
    if( isFfda )
      blSchema.element[0].@template="xxl:nmsBroadLogXl";
    else
      blSchema.element[0].@template="nms:broadLog";
  }
  if( elBroadLogSchema && NL.XTK.parseBoolean(elBroadLogSchema.@_defined) ) {
    if( NL.XTK.parseBoolean(elBroadLogSchema.@usePublicId) ) {
      blSchema.element[0].appendChild(<attribute name="publicId" type="long" label={String(elBroadLogSchema.@publicIdLabel)}/>);
    }
    if( NL.XTK.parseBoolean(elBroadLogSchema.@useCodeSegment) ) {
      blSchema.element[0].appendChild(<attribute name="segmentCode" type="string" length="64" label={String(elBroadLogSchema.@segmentCodeLabel)}/>);
    }
    for each(var elAttr in elBroadLogSchema.element.attribute) {
      if( String(elAttr.@name) == "publicId" || String(elAttr.@name) == "segmentCode" )
        continue;
      blSchema.element[0].appendChild(elAttr);
    }
  }
  if( aTargetSchema ) {
    for(var iSchema = 0; iSchema < aTargetSchema.length; iSchema++) {

      var strLinkSchemaName = aTargetSchema[iSchema].name;
      // patch the schema name from "nmsServiceXl" to "service"
      if (isFfda && sLinkName == "appSubscription" && strLinkSchemaName == "nmsServiceXl") {
        strLinkSchemaName = "service";
      }

      blSchema.element[0].appendChild(<element name={strLinkSchemaName} type="link" noDbIndex="true"
                      label={aTargetSchema[iSchema].label} target={aTargetSchema[iSchema].id} integrity="neutral"
                      revLabel={sLogLabel} revIntegrity="neutral" revLink={String(sLogType) + String(sSuffix)}/>);
    }
  }
  return blSchema;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {String} isFfda flag to indicate FFDA target mapping, false by default<bFfda>
 * @param {String} isMobileApp flag to indicate target mapping for mobileApp
 * @param {DOM} elTrackingLogSchema schema of the trackinglog
 * @param {NLSchema} schema schema linked to the broadLog
 * @param {String} sLogType type of the output schema (broadLog / excludeLog)
 * @param {String} sLogLabel Label of the output schema
 * @param {String} if need to be != from schema.name
 * @param {[ NLSchema, ... ]} targetSchema [optionnal parameters] array of schemas that need to linked to this broadLog schema
 **/
function trackingLogSchema(sExtNamespace, sg, sNamespace, sSuffix, isFfda, isMobileApp, elTrackingLogSchema, schema, sLogLabel, sLinkToTarget, aTargetSchema) {

  var sLinkName = sLinkToTarget || schema.name

  var tlSchema = <srcSchema namespace={String(sNamespace)} name={"trackingLog" + String(sSuffix)}
               label={sLogLabel} implements="xtk:persist">
      <element name={"trackingLog" + String(sSuffix)} label={sLogLabel}>
        <element name="delivery" revLabel={sLogLabel}/>
        <element name={sLinkName} type="link" label={schema.label}
                 target={schema.id} integrity="neutral"
                 revLabel={sLogLabel} revIntegrity="normal" revLink="trackingLog"/>
      </element>
    </srcSchema>;
  if( isFfda ) {
    // "schema" may be a json
    var dataSource = schema.dataSource;
    if( dataSource != '')
      tlSchema.element[0].@dataSource = dataSource;
    else
      tlSchema.element[0].@dataSource = schema.root.dataSource;

    // override ID attribute with UUID type uuidPrimaryKey
    // sqlname of the id is always "uTrackingLogId" for FFDA (or "iTrackingLogId" for non-FFDA) regardless of the delivery mapping
    tlSchema.element[0].appendChild(
      <attribute desc={sg.uuidPrimaryKey()} label={sg.uuidPrimaryKey()}
      name="id" sqlname="uTrackingLogId" type="uuid"/>);
    // NEO-26554: In case of ffda there is no existing link between trackingLog and nms:delivery.
    // Without a link, query created from delivery form (client side) does not contain where condition,
    // which results in displaying all the trackinglogs rather than logs of that particular delivery in client.
    tlSchema.element[0].appendChild(
        <element name="nmsDelivery" type="link"
           label="nmsDelivery" target="nms:delivery" integrity="normal"
           revLabel={String(sLogLabel)} revIntegrity="neutral" revLink={String(sLogLabel)}>
           <join xpath-dst="@id" xpath-src="@delivery-id"/>
        </element>);
  } else {
    tlSchema.element[0].appendChild(
      <dbindex name="urlId">
        <keyfield xlink="url"/>
        <keyfield xlink={sLinkName}/>
      </dbindex>
    );
    tlSchema.element[0].appendChild(
        <element name="broadLog" type="link" label={sg.messageLabel()} desc={sg.messageDesc()}
                 target={String(sNamespace) + ":broadLog" + String(sSuffix)} integrity="neutral"
                 revLabel={sLogLabel} revIntegrity="normal" revLink="trackingLog"/>
    );
  }
  // link to broadlog
  tlSchema.element[0].appendChild(
      <element name="broadLog" type="link" label={sg.messageLabel()} desc={sg.messageDesc()}
               target={String(sNamespace) + ":broadLog" + String(sSuffix)} integrity="neutral"
               revLabel={sLogLabel} revIntegrity="normal" revLink="trackingLog"/>
  );
  if( sNamespace !== sExtNamespace) {
    tlSchema.@namespace = sExtNamespace;
    tlSchema.@extendedSchema = sNamespace + ':' + "trackingLog" + String(sSuffix);
  } else {
    if( isFfda )
      tlSchema.element[0].@template="xxl:nmsTrackingLogXl";
    else
      tlSchema.element[0].@template="nms:trackingLog";
  }
  if (NL.XTK.parseBoolean(elTrackingLogSchema.@useDeviceIp))
    tlSchema.element[0].appendChild(<attribute name="deviceIpAddress" type="string" length="16" label={sg.deviceIpAddressLabel()}/>);
  if( aTargetSchema ) {
    for(var iSchema = 0; iSchema < aTargetSchema.length; iSchema++) {
      tlSchema.element[0].appendChild(<element name={aTargetSchema[iSchema].name} type="link" noDbIndex="true"
                       label={aTargetSchema[iSchema].label} target={aTargetSchema[iSchema].id} integrity="neutral"
                       revLabel={sLogLabel} revIntegrity="neutral" revLink={"trackingLog" + String(sSuffix)}/>);
    }
  }

  if( isFfda && isMobileApp ) {
    tlSchema.element[0].appendChild(
      <attribute expr="[broadLog/@service-id]" label="Service" name="serviceId" type="string"/>
    );
    tlSchema.element[0].appendChild(
      <element name="service" type="link" noDbIndex="true" label="Service" target="xxl:nmsServiceXl" integrity="neutral"
          revLabel={sLogLabel} revIntegrity="neutral" revLink={"trackingLog" + String(sSuffix)} >
        <join xpath-dst="@id" xpath-src="@serviceId"/>
      </element>
    );
  }

  return tlSchema;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sSuffix suffix to be used to define the internal name of the delivery globalDelivery<suffix>
 * @param {Number} iMappingId primaryKey of the mapping
 * @param {String} sMappingLabel Label of the output delivery
 **/
function globalDelivery(sg, sSuffix, iMappingId, sMappingLabel) {
  return <delivery _operation="insertOrUpdate" xtkschema="nms:delivery"
                   internalName={'globalDelivery'+String(sSuffix)}
                   label={sg.globalDeliveryLabel(sMappingLabel)}
                   messageType="120" deliveryMode="2"
                   nature="unknownSource"
                   mapping-id={iMappingId}>
           <deliveryProvider _operation="none" name="defaultOther"/>
           <typology _operation="none" name="defaultTypology"/>
         </delivery>;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespaceExt namespace of the future schema
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {DOM} schema definition of the reaction extension
 * @param {NLSchema} schema Schema of the targeting dimension
 **/
function reactionSchema(sg, sExtNamespace, sNamespace, sSuffix, elReactionSchema, schema) {
  var sReactionLabel = sg.reactionLabel(schema.label);
  var remaSchema = <srcSchema namespace={sNamespace} name={"remaMatch" + String(sSuffix)}
                    label={sReactionLabel} img="nms:remaMatch.png" implements="xtk:persist"
                    genAccessors="false">
           <element name={"remaMatch" + String(sSuffix)} label={sReactionLabel}>
             <key internal="true" name="match">
               <keyfield xlink="hypothesis"/>
               <keyfield xlink="broadLog"/>
               { application.hasPackage('nms:interaction') ? <keyfield xlink="proposition" /> : '' }
             </key>
             { NL.XTK.parseBoolean(elReactionSchema.@_defined) ? elReactionSchema.element.* : '' }
             <element name="hypothesis" revLabel={sReactionLabel} revLink={"remaMatch" + String(sSuffix)}/>
             <element label={sg.propositionLabel()} name="proposition"
                      target={String(sNamespace)+":proposition"+String(sSuffix)}
                      type="link" applicableIf="HasPackage('nms:coreInteraction')"/>
             <element label={sg.messageLabel()} desc={sg.messageDesc()} name="broadLog"
                      target={String(sNamespace) + ":broadLog" + String(sSuffix)} type="link"/>
              <element label={sg.reactionResponderLinkLabel()} name="responder" target={schema.id} type="link"/>
           </element>
         </srcSchema>;
  if( sNamespace !== sExtNamespace) {
    remaSchema.@namespace = sExtNamespace;
    remaSchema.@extendedSchema = sNamespace + ':remaMatch' + String(sSuffix);
  } else {
    remaSchema.element[0].@template="nms:remaMatch";
}
  return remaSchema;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {NLSchema} schema schema linked to the broadLog
 * @param {String} sLogLabel Label of the output schema
 **/
function surveyLogSchema(sg, sExtNamespace, sNamespace, sSuffix, elSurveyLogSchema, schema, sSurveyLabel) {

  var svySchema = <srcSchema entitySchema="xtk:srcSchema" label={sSurveyLabel}
           implements="xtk:persist" name={"webAppLog" + String(sSuffix)}
           namespace={sNamespace} xtkschema="xtk:srcSchema">
          <element name={"webAppLog" + String(sSuffix)}>
            { NL.XTK.parseBoolean(elSurveyLogSchema.@_defined) ? elSurveyLogSchema.element.attribute : '' }
            <element name={schema.name} target={schema.id} type="link" label={schema.label}
                     revLink={"webAppLog"+String(sSuffix)} revLabel={sSurveyLabel}/>
            <element name="delivery" target="nms:delivery" type="link" label={sg.deliveryLabel()}
                     revLink={"webAppLog"+String(sSuffix)} revLabel={sSurveyLabel}/>
          </element>
        </srcSchema>;
  if( sNamespace !== sExtNamespace) {
    svySchema.@namespace = sExtNamespace;
    svySchema.@extendedSchema = sNamespace + ':webAppLog' + String(sSuffix);
  } else {
    svySchema.element[0].@template="nms:webAppLog";
}
  return svySchema;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {String} isFfda flag to indicate FFDA target mapping
 * @param {NLSchema} schema schema linked to the broadLog
 * @param {String} sLogLabel Label of the output schema
 **/
function mobileAppSubSchema(sExtNamespace, sNamespace, sSuffix, isFfda, elAppSubSchema, schema, sAppSubLabel) {

  var appSubSchema = <srcSchema entitySchema="xtk:srcSchema" label={sAppSubLabel} xtkschema="xtk:srcSchema"
                    name={"appSubscription"+String(sSuffix)} namespace={sNamespace}>
  <element label={sAppSubLabel} name={"appSubscription"+String(sSuffix)}
           pkgStatus="never">
    { NL.XTK.parseBoolean(elAppSubSchema.@_defined) ? elAppSubSchema.element.attribute : '' }
    <element name="mobileApp" revLabel={sAppSubLabel}/>
    <element name="service" revLabel={sAppSubLabel}/>
    <!-- OOB link to recipient. At least for Campaign optimization (presure) purpose. -->
    <element label={schema.label} name={schema.name} target={schema.id} type="link"
             revLink="appSubscription" revLabel={sAppSubLabel}/>
  </element>
</srcSchema>;

  if( isFfda ) {
    // "schema" may be a json
    var dataSource = schema.dataSource;
    if( dataSource != '')
      appSubSchema.element[0].@dataSource = dataSource;
    else
      appSubSchema.element[0].@dataSource = schema.root.dataSource;
    appSubSchema.element[0].@autopk="true";
    appSubSchema.element[0].@autouuid="true";
  }

  if( sNamespace !== sExtNamespace) {
    appSubSchema.@namespace = sExtNamespace;
    appSubSchema.@extendedSchema = sNamespace + ':appSubscription' + String(sSuffix);
  } else {
    if( isFfda )
      appSubSchema.element[0].@template="xxl:nmsAppSubscriptionXl";
    else
      appSubSchema.element[0].@template="nms:appSubscription";
  }
  return appSubSchema;
}

function deliveryAppSubMapping(sNamespace, sSuffix, sRecipientLink, sAppSubLabel)
{
  return <deliveryMapping blackListIos="@disabled" blackListAndroid="@disabled" builtIn="0" label={sAppSubLabel}
                     name={'mapAppSubscription'+String(sSuffix)}
                     recipientLink={sRecipientLink} schema={String(sNamespace) + ':appSubscription' + String(sSuffix)}>
      <storage broadLogExclSchema={String(sNamespace) + ':excludeLogAppSub' + String(sSuffix)}
               broadLogSchema={String(sNamespace) + ':broadLogAppSub' + String(sSuffix)}
               exclusionType="2">
        <extraField dstXPath="[@service-id]" srcExpr="[@service-id]"/>
        <extraField dstXPath="[@appSubscription-id]" srcExpr="@id"/>
      </storage>
      <folder name="nmsDeliveryMapping"/>
    </deliveryMapping>;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {NLSchema} schema schema linked to the broadLog
 * @param {String} sLogLabel Label of the output schema
 * @param {String} if need to be != from schema.name
 **/
function validationLogSchema(sNamespace, sSuffix, schema, sValidationLogLabel) {

  return <srcSchema label={sValidationLogLabel} name={"localValidation" + String(sSuffix)} namespace={sNamespace}
                    implements="xtk:persist" genAccessors="false">
            <element name={"localValidation" + String(sSuffix)}
                     template="nms:localValidation" label={sValidationLogLabel}>
              <compute-string expr="@label"/>
              <key name="validation">
                <keyfield xlink="localValidationTask"/>
                <keyfield xlink="localDistributionVal"/>
                <keyfield xlink={schema.name}/>
              </key>
              <attribute expr={"["+schema.name+"]"} name="label" type="string"/>
              <element label={schema.label} name={schema.name} target={schema.id} type="link"/>
            </element>
          </srcSchema>;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespaceExt namespace of the future schema
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {String} isFfda flag to indidate FFDA target mapping, false by default<bFfda>
 * @param {DOM} schema definition of the reaction extension
 * @param {NLSchema} schema schema linked to the broadLog
 * @param {String} sLogLabel Label of the output schema
 * @param {String} if need to be != from schema.name
 **/
function propositionSchema(sg, sExtNamespace, sNamespace, sSuffix, isFfda, elPropSchema, schema, sLogLabel) {
  var propSchema = <srcSchema namespace={String(sNamespace)} name={"proposition"+String(sSuffix)}
                    implements="xtk:persist" label={sLogLabel}>
      <element name={"proposition"+String(sSuffix)} label={sLogLabel}>
        { NL.XTK.parseBoolean(elPropSchema.@_defined) ? elPropSchema.element.attribute : '' }
        <element name="offer" revLink={"proposition"+String(sSuffix)}/>
        <element name="offerSpace" revLink={"proposition"+String(sSuffix)}/>
        <element name={schema.name} type="link" label={schema.label}
                 target={schema.id} integrity="neutral"
                 revLabel={sLogLabel} revLink="proposition" revIntegrity="own"/>
      </element>
    </srcSchema>;

  if( isFfda ) {
    propSchema.element[0].@dataSource = schema.root.dataSource;
    // override ID attribute with UUID type
    // sqlname of the id is always "uPropositionId" for FFDA (or "iPropositionId" for non-FFDA) regardless of the delivery mapping
    propSchema.element[0].appendChild(
      <attribute name="id" sqlname="uPropositionId" type="uuid" advanced="true"
        desc={sg.uuidPrimaryKey()} label={sg.uuidPrimaryKey()}/>
    );
    propSchema.element[0].appendChild(
      <attribute name="proposition-id" sql="true" expr="@id" type="uuid" label="Proposition ID"/>
    );
    propSchema.element[0].appendChild(
      <attribute name="interactionId" sqlname="uInteractionId" type="uuid" label={sg.broadLogLinkLabel('id')}/>
    );

    // Similar to NEO-26554, we'd create link to nms:delivery, nms:offer and nms:offerSpace so
    // that queries from client into prop log can resolve wrt schemas in PG
    propSchema.element[0].appendChild(
        <element name="nmsDelivery" type="link"
           label="nmsDelivery" target="nms:delivery" integrity="neutral"
           revLabel={String(sLogLabel)} revIntegrity="neutral">
           <join xpath-dst="@id" xpath-src="@delivery-id"/>
        </element>);
    propSchema.element[0].appendChild(
        <element name="nmsOffer" type="link"
           label="nmsOffer" target="nms:offer" integrity="neutral"
           revLabel={String(sLogLabel)} revIntegrity="neutral">
           <join xpath-dst="@id" xpath-src="@offer-id"/>
        </element>);
    propSchema.element[0].appendChild(
        <element name="nmsOfferSpace" type="link"
           label="nmsOfferSpace" target="nms:offerSpace" integrity="neutral"
           revLabel={String(sLogLabel)} revIntegrity="neutral">
           <join xpath-dst="@id" xpath-src="@offerSpace-id"/>
        </element>);
  }

  propSchema.element[0].appendChild(
      <element name="broadLog" type="link" label={sg.messageLabel()} desc={sg.messageDesc()}
               target={String(sNamespace) + ":broadLog" + String(sSuffix)} integrity="neutral"
               revLabel={sLogLabel} revLink="proposition" revIntegrity="neutral" externalJoin="true">
        <join xpath-src="@interactionId" xpath-dst="@id"/>
        <join xpath-src="@engineType" xpath-dst="'0'"/>
      </element>
  );

  if( sNamespace !== sExtNamespace) {
    propSchema.@namespace = sExtNamespace;
    propSchema.@extendedSchema = sNamespace + ':proposition' + String(sSuffix);
  } else {
    if( isFfda )
      propSchema.element[0].@template="xxl:nmsPropositionXl";
    else
      propSchema.element[0].@template="nms:proposition";
  }
  return propSchema;
}

/**
 * Retrieves a template schema for trackingLogs
 * @param {StringGroup} sg for localisation
 * @param {String} sNamespace namespace of the future schema
 * @param {String} sSuffix suffix to be used to create the schema broadLog<suffix>
 * @param {NLSchema} schema schema linked to the broadLog
 * @param isFfda flag to indicate FFDA mode, false by default
 **/
function offerEnvEntities(sg, sNamespace, sSuffix, schema, isFfda) {
  var eFolderEntities =
    <entities schema="xtk:folder">
      <folder name={"nmsOfferAdmin_design"+String(sSuffix)} label={sg.offerAdminLabel()} model="xtkFolder" order="10"
              image-namespace="xtk" image-name="admin.png" builtIn="1">
        <parent _operation="none" name={"design"+String(sSuffix)}/>
      </folder>
      <folder name={"nmsOfferSpacePreProd"+String(sSuffix)} label={sg.offerSpaceLabel()}
              model="nmsOfferSpace" order="1" image-namespace="nms" image-name="offerSpace.png" schema="nms:offerSpace">
        <parent _operation="none" name={"nmsOfferAdmin_design"+String(sSuffix)}/>
      </folder>
    </entities>;
  if( application.hasPackage('nms:interaction') )
    eFolderEntities.appendChild(
      <folder name={"nmsSegment"+String(sSuffix)} label={sg.offerFilterLabel()}
              model="xtkQueryFilter" schema="xtk:queryFilter"
              image-namespace="xtk" image-name="valuestats.png" order="30" builtIn="1">
        <where filteringSchema="xtk:queryFilter">
          <condition _internalKey="true" _schema="xtk:queryFilter" expr={"[@env-id] = internalKey('nms:offerEnv' , 'design" + String(sSuffix) + "' , '@id')"}/>
        </where>
        <parent _operation="none" name={"nmsOfferAdmin_design"+String(sSuffix)}/>
      </folder>
    );

  var eRightsEntities =
    <entities schema="xtk:rights">
      <rights inherit="0" propagate="1" rights="read|write|delete">
        <folder _operation="none" name={"design"+String(sSuffix)}/>
        <operator _operation="none" name="offer" type="1"/>
      </rights>
      <rights inherit="0" propagate="1" rights="read">
        <folder _operation="none" name={"nmsOfferSpacePreProd"+String(sSuffix)}/>
        <operator _operation="none" name="delivery" type="1"/>
      </rights>
      <rights inherit="0" propagate="1" rights="read">
        <folder _operation="none" name={"categoryRoot"+String(sSuffix)}/>
        <operator _operation="none" name="delivery" type="1"/>
      </rights>
    </entities>;
  if( application.hasPackage('nms:interaction') ) {
    eRightsEntities.appendChild(
      <rights inherit="0" propagate="1" rights="read|write|delete">
        <folder _operation="none" name={"nmsSegment"+String(sSuffix)}/>
        <operator _operation="none" name="offer" type="1"/>
      </rights>
    );
    eRightsEntities.appendChild(
      <rights inherit="0" propagate="1" rights="read">
        <folder _operation="none" name={"nmsSegment"+String(sSuffix)}/>
        <operator _operation="none" name="delivery" type="1"/>
      </rights>
    );
  }

  var eOfferSpacesEntities = <entities schema="nms:offerSpace">
      <offerSpace channel="0" label={sg.offerSpaceEmailLabel()} name={"email"+String(sSuffix)}>
        <folder _operation="none" name={"nmsOfferSpacePreProd"+String(sSuffix)}/>
        <env _operation="none" name={"design"+String(sSuffix)}/>
        <representationFields isMandatory="1" xpath="[view/imageUrl]"/>
        <representationFields isMandatory="1" xpath="[view/trackedUrls/url]"/>
        <representationFields isMandatory="1" xpath="[view/shortContent]"/>
        <rendering useHtmlFunction="1" useTextFunction="0" useXmlFunction="0">
          <htmlFunction><![CDATA[function (imageUrl, targetUrl, shortContent){
        var html = "<a _urlType='11' href='" + targetUrl + "'><img src='" + encodeURI(imageUrl) + "'/></a>";
        html += "<p>" + shortContent + "</p>";
        return html;
      }]]></htmlFunction>
        </rendering>
      </offerSpace>
    </entities>;
  // Paper deliveries for FFDA are to be implemented later. Let's not add that space until we support
  // it. A downside of this approach is that when we implement it then we'd have to write postupgrade
  // instruction to add it in Offers Environments that are provisioned for FFDA.
  if( !isFfda ) {
    eOfferSpacesEntities.appendChild(
      <offerSpace channel="3" label={sg.offerSpacePaperLabel()} name={"paper"+String(sSuffix)}>
        <folder _operation="none" name={"nmsOfferSpacePreProd"+String(sSuffix)}/>
        <env _operation="none" name={"design"+String(sSuffix)}/>
        <representationFields isMandatory="1" xpath="[view/shortContent]"/>
        <representationFields isMandatory="1" xpath="[view/textSource]"/>
      </offerSpace>
    );
  }

  var eOfferEntities =
    <entities schema="nms:offer">
      <offer isModel="1" label={sg.offerNewLabel()} name={"emptyOffer"+String(sSuffix)}
             owner-id="0">
        <filter targetSchema={schema.id}/>
        <category name="nmsOfferModel"/>
        <view>
          <unitaryUpdateStatusUrl_jst><![CDATA[<%@ include view="UpdateStatusUrl" %>]]></unitaryUpdateStatusUrl_jst>
        </view>
      </offer>
    </entities>;
  if( application.hasPackage('nms:interaction') ) {
    eOfferEntities.offer.appendChild(
      <context label={sg.offerContextLabel()} name="emptyContext">
        <offer name={"emptyOffer"+String(sSuffix)}/>
      </context>);
  }

  return [
    <entities schema="nms:offerEnv">
      <offerEnv name={"live"+String(sSuffix)} label={sg.offerEnvProdLabel(schema.label)}
                model="nmsOfferEnv" schema="nms:offer" live="1" version="1"
                propositionSchema={String(sNamespace) + ":proposition" + String(sSuffix)}
                propositionTable={isFfda ? String(sNamespace)+"proposition"+String(sSuffix) : ""}
                inputSchema="nms:interaction" image-namespace="nms" image-name="offerEnv.png" order="3"
                anonymous={sSuffix=="Visitor" ? "1" : "0"}>
                <filter schema={schema.id}/>
                <parent _operation="none" name="nmsOfferMgtProd"/>
      </offerEnv>
      <offerEnv name={"design"+String(sSuffix)} label={sg.offerEnvProdLabel(schema.label)}
                model="nmsOfferEnv" schema="nms:offer" live="0" version="1"
                propositionSchema={String(sNamespace) + ":proposition" + String(sSuffix)}
                propositionTable={isFfda ? String(sNamespace)+"proposition"+String(sSuffix) : ""}
                inputSchema="nms:interaction" image-namespace="nms" image-name="offerEnv.png" order="3"
                anonymous={sSuffix=="Visitor" ? "1" : "0"}>
                <filter schema={schema.id}/>
                <parent _operation="none" name="nmsOfferMgt"/>
                <prodEnv _operation="none" name={"live"+String(sSuffix)}/>
      </offerEnv>
    </entities>,
    eFolderEntities,
    <entities schema="nms:offerCategory">
      <offerCategory name={"categoryRoot"+String(sSuffix)} label={sg.offerCategoryLabel()}
                     model="nmsOfferCategory" schema="nms:offer"
                     image-namespace="nms" image-name="offerCategory.png" order="2">
        <parent _operation="none" name={"design"+String(sSuffix)}/>
        <env _operation="none" name={"design"+String(sSuffix)}/>
      </offerCategory>
    </entities>,
    eRightsEntities,
    eOfferSpacesEntities,
    eOfferEntities];
}

//===========================================================================
// utility functions for campaign agregate workflow
//===========================================================================
//---------------------------------------------------------------------------
// Retrieves the list of delivery mapping for a defined targeting dimension
//---------------------------------------------------------------------------
function getDeliveryMappingList(sTargetSchema) {
  var qryDlvMapping = <queryDef operation="select" schema="nms:deliveryMapping">
     <select>
       <node expr="@id"/>
       <node expr="@name"/>
       <node expr="@label"/>
       <node expr="@schema"/>
       <node expr="@recipientLink"/>
       <node expr="@targetSchema"/>
       <node expr="[storage/@exclusionType]"/>
       <node expr="[storage/@broadLogSchema]"/>
       <node expr="[storage/@broadLogExclSchema]"/>
     </select>
     <where>
       <condition boolOperator="OR" expr={ "@schema = " + NL.XTK.toXTKString(String(sTargetSchema)) } />
       <condition expr="@recipientLink != ''"/>
     </where>
     </queryDef>;
  return toArray(xtk.queryDef.create(qryDlvMapping).ExecuteQuery()).filter(function(item) {
    return String(sTargetSchema)===String(item.@targetSchema);
  });
}

//---------------------------------------------------------------------------
// Creates the workflow that will collect some delivery statistics
// to populate agregated data for campaign reports
//---------------------------------------------------------------------------
function buildDlvAggrTempTable(outputSchema, sTableName) {
  setSchemaSqlTable(outputSchema, sTableName);
  buildSqlTable(outputSchema);
}

//---------------------------------------------------------------------------
// Creates the workflow that will collect some delivery statistics
// to populate agregated data for campaign reports
//---------------------------------------------------------------------------
function computeDeliveryAggregates(eMapping, sBL2RCPLink, eGroupBy, eHypothesisFilter, outputSchema, tsRangeStart, tsAggr, bLogSQL) {

  var sg = new StringGroup('nms:core');
  logInfo(sg.campaignAggregateCollectDeliveryMappingLabel(eMapping.@label));

  var cnx = application.getConnection("default");
  var iRecCount = 0;
  try {
    var SQL = new NL.SQL(bLogSQL);
    var blSchema = application.getSchema(String(eMapping.storage.@broadLogSchema));
    var exclSchema = null;
    if( Number(eMapping.storage.@exclusionType)==2 ) {
      exclSchema = application.getSchema(String(eMapping.storage.@broadLogExclSchema));
    }
    var stmt = null;
    var sQuery = "SELECT iDeliveryId, sLabel, sInternalName, iState " +
                   "FROM NmsDelivery " +
                   "WHERE iFCP = 0 AND iDeleteStatus = 0 AND iIsModel = 0 AND iState!= 0 AND iMappingId = $(l)";
    if( tsRangeStart )
      sQuery = sQuery + " AND tsLastModified >= $(ts)";
    SQL.log(sQuery)
    if( tsRangeStart ) {
      stmt = cnx.query(sQuery, Number(eMapping.@id), tsRangeStart);
    } else {
      stmt = cnx.query(sQuery, Number(eMapping.@id));
    }

    for each( var delivery in stmt) {
      logInfo(sg.campaignAggregateProcessingLabel(delivery[1], delivery[2]));
      var eQryDelivery = <queryDef operation="get" schema="nms:delivery">
        <select>
          <node expr="@id"/>
          <node alias="@_cs" expr="[.]"/>
          <node expr="[@state]"/>
          <node expr="[forecast/@simuResponseType]"/>
          <node expr="[forecast/@simuMarginType]"/>
          <node expr="[forecast/simuResponseRateFormula]"/>
          <node expr="[forecast/@simuResponseRate]"/>
          <node expr="[forecast/simuRevenueFormula]"/>
          <node expr="[forecast/@simuRevenue]"/>
          <node expr="[forecast/simuMarginFormula]"/>
          <node expr="[forecast/@simuMargin]"/>
        </select>
        <where>
          <condition expr={"@id=" + delivery[0]}/>
        </where>
      </queryDef>;

      var dlvDetail = xtk.queryDef.create(eQryDelivery).ExecuteQuery();

      var bUseResponse = (delivery[3] > DELIVERY_STATE_READY) && application.hasPackage('nms:response');
      var remaHypothesis = [];
      if( bUseResponse ) {
        var qryHypothesis = <queryDef schema="nms:remaHypothesis" operation="select">
                         <select>
                           <node expr="@id"/>
                           <node expr="[context/@remaMatchStorage]"/>
                         </select>
                         <where>
                           <condition expr={'[@delivery-id] ='+delivery[0]}/>
                         </where>
                       </queryDef>;
        if( eHypothesisFilter.condition.length()>0 ) {
          qryHypothesis.appendChild(<sysFilter>{eHypothesisFilter.condition}</sysFilter>);
        }
        remaHypothesis = toArray(xtk.queryDef.create(qryHypothesis).ExecuteQuery().remaHypothesis);
        if( remaHypothesis.length>0 &&
            remaHypothesis.some(function(item) {
                   return String(item.context.@remaMatchStorage) !== String(remaHypothesis[0].context.@remaMatchStorage)
             }) )
          logError(sg.campaignAggregateCannotMixRemaStorage());
      }

      var sLinkPrefix = "";
      if( remaHypothesis.length>0 )
        sLinkPrefix = "broadLog/";
      var qryAggr = <queryDef operation="select" schema={eMapping.storage.@broadLogSchema}
                              noLineCount="true" forceExprOrder="true">
        <select>
          <node alias="@delivery-id" expr={NL.XTK.expandXPath(sLinkPrefix + '@delivery-id')} groupBy="true"/>
          <node alias="@lastModified" expr={NL.XTK.toXTKString(tsAggr, 'datetime')} groupBy="true"/>
          <node alias="@failureReason" groupBy="true" ref="nms:dlvAggregate:@failureReason"/>
        </select>
        <where>
          <condition expr={NL.XTK.expandXPath(sLinkPrefix + '@delivery-id') + '=' + String(delivery[0])}/>
        </where>
      </queryDef>;

      for each(ndGroup in eGroupBy.node) {
        qryAggr.select.appendChild(<node alias={ndGroup.@alias} noSqlBind="true"
                                         groupBy="true" noComputeString="true"
                                         expr={NL.XTK.expandXPath(sLinkPrefix + NL.XTK.unexpandXPath(String(ndGroup.@expr)))}/>);
      }

      if( Number(dlvDetail.forecast.@simuResponseType)===1 ) {
        qryAggr.select.appendChild(<node expr={NL.XTK.expandXPath(sLinkPrefix + sBL2RCPLink)} noComputeString="true">
                                     <node alias="/@simuRevenue"
                                             expr={'SUM((' + dlvDetail.forecast.simuRevenueFormula + ') * (' +
                                                            dlvDetail.forecast.simuResponseRateFormula + ')/ 100.0 )'}/>
                                     <node alias="/@simuMargin"
                                             expr={'SUM((' + (NL.XTK.parseBoolean(dlvDetail.forecast.@marginType) ?
                                                              ( dlvDetail.forecast.simuRevenueFormula + ') / 100.0) *(') :
                                                             '') +
                                                          dlvDetail.forecast.simuMarginFormula + ') * (' +
                                                          dlvDetail.forecast.simuResponseRateFormula + ') / 100.0 )'}/>
                                     <node alias="/@simuResponse"
                                             expr={'SUM((' + dlvDetail.forecast.simuResponseRateFormula + ')/ 100.0 )'}/>
                                     </node>);
        } else {
          qryAggr.select.appendChild(<node alias="@simuRevenue"
                                           expr={'SUM(' + String(Number(dlvDetail.forecast.@simuRevenue) *
                                                                 Number(dlvDetail.forecast.@simuResponseRate) / 100.0) + ')'}/>);
          qryAggr.select.appendChild(<node alias="@simuMargin"
                                           expr={'SUM(' + String((NL.XTK.parseBoolean(dlvDetail.forecast.@marginType) ?
                                                                 (Number(dlvDetail.forecast.@simuRevenue) / 100.0) :
                                                                 1) *
                                                              Number(dlvDetail.forecast.@simuMargin) *
                                                              Number(dlvDetail.forecast.@simuResponseRate) / 100.0) + ')'}/>);
          qryAggr.select.appendChild(<node alias="@simuResponse"
                                           expr={'SUM(' + String(Number(dlvDetail.forecast.@simuResponseRate) / 100.0) + ')'}/>);
        }
      if( remaHypothesis.length==0 || delivery[3]!=DELIVERY_STATE_FINISHED ) {
        qryAggr.select.appendChild(<node alias="@remaRevenue"
                                         expr="0"/>);
        qryAggr.select.appendChild(<node alias="@remaMargin"
                                         expr="0"/>);
        qryAggr.select.appendChild(<node alias="@remaResponse"
                                         expr="0"/>);
        qryAggr.select.appendChild(<node alias="@hasResponse"
                                         expr="0"/>);
      } else {
        qryAggr.@schema = String(remaHypothesis[0].context.@remaMatchStorage)
        qryAggr.select.appendChild(<node alias="@remaRevenue"
                                         expr="SUM(@amount)"/>);
        qryAggr.select.appendChild(<node alias="@remaMargin"
                                         expr="SUM(@margin)"/>);
        var sKey = "";
        for each(var joinDef in application.getSchema(String(qryAggr.@schema)).root.children["responder"].joinParts) {
          if( sKey!=="" )
            sKey += "+':'+";
          sKey += "ToString(" + NL.XTK.expandXPath(joinDef.source.nodePath.substring(1)) +")";
      }
        qryAggr.select.appendChild(<node alias="/@remaResponse"
                                         expr={"CountDistinct( " + sKey + " )"}/>);
        qryAggr.select.appendChild(<node alias="@hasResponse"
                                         expr="1"/>);
      }
      if( delivery[3] > 0 && delivery[3] < DELIVERY_STATE_READY ) {
        qryAggr.select.node[2].@expr="[temp:broadCast:"+delivery[0]+":@failureReason]";
        qryAggr.select.appendChild(<node alias="@rule-id" expr={"[temp:broadCast:"+delivery[0]+":@typologyRule-id]"} groupBy="true"/>);
        qryAggr.select.appendChild(<node expr="Count(1)" alias="@totalMsg"/>);
        qryAggr.select.appendChild(<node expr={"Count(Iif([temp:broadCast:"+delivery[0]+":@failureReason]=0, 1, NULL))"} alias="@toDeliver"/>);
        qryAggr.select.appendChild(<node expr="0" alias="@processed"/>);
        qryAggr.select.appendChild(<node expr="0" alias="@success"/>);
      } else {
        qryAggr.select.node[2].@expr=NL.XTK.expandXPath(sLinkPrefix + "msg/@failureReason");
        qryAggr.select.appendChild(<node alias="@rule-id" expr={NL.XTK.expandXPath(sLinkPrefix + "msg/@rule-id")} groupBy="true"/>);
        qryAggr.select.appendChild(<node expr="Count(1)" alias="@totalMsg"/>);
        qryAggr.select.appendChild(<node expr={"Count(Iif(" + NL.XTK.expandXPath(sLinkPrefix + "msg/@rule-id") + "=0, 1, NULL))"} alias="@toDeliver"/>);
        qryAggr.select.appendChild(<node expr={"Count(Iif(" + NL.XTK.expandXPath(sLinkPrefix + "msg/@rule-id") + "=0 AND " + NL.XTK.expandXPath(sLinkPrefix + "@msg-id") + "!=0, 1, NULL))"} alias="@processed"/>);
        qryAggr.select.appendChild(<node expr={"Count(Iif(" + NL.XTK.expandXPath(sLinkPrefix + "msg/@failureReason") + "=0 AND " + NL.XTK.expandXPath(sLinkPrefix + "@msg-id") + "!=0, 1, NULL))"} alias="@success"/>);
      }

      var sColumnList = buildColumnList(outputSchema.id, qryAggr.select);

      var sSelect = xtk.queryDef.create(qryAggr).BuildQuery();
      var sQuery = sSelect;
      if( delivery[3] > 0 && delivery[3] < DELIVERY_STATE_READY ) {
        sQuery = sSelect.replace(blSchema.root.SQLTable, SQL.getWorkTableName("wkDlv_", String(delivery[0])));
      }

      try {
      iRecCount = iRecCount + SQL.execute("INSERT INTO " + outputSchema.root.SQLTable + "(" + sColumnList + ") " +
                                          sQuery);

      if( delivery[3] >= DELIVERY_STATE_READY &&
          Number(eMapping.storage.@exclusionType)==2 ) {
        sQuery = sSelect.replace(blSchema.root.SQLTable, exclSchema.root.SQLTable);
        iRecCount = iRecCount + SQL.execute("INSERT INTO " + outputSchema.root.SQLTable + "(" + sColumnList + ") " +
                                            sQuery);
      }
      } catch(errSql) {
        logWarning(sg.campaignAggregateDeliveryIgnored(delivery[1], delivery[2]));
    }
    }
  } catch(e) {
    logError(e.toString());
  } finally {
    cnx.dispose();
  }
  return iRecCount;
}

//---------------------------------------------------------------------------
// Creates the schema for a defined set of group by based on the initial template
// to populate agregated data for campaign reports
//<schema extendedSchema="nms:dlvAggregate" name="dlvAggregate" namespace="temp">
//  <element name="dlvAggregate">
//    <element advanced="false" belongsTo="recipient" label="Recipient"
//             length="0" name="recipient" notNull="false" type="" unbound="false">
//      <attribute label="Classe d'age" name="ageClass" notNull="false"
//                 sqlname="iAgeClass" type="long"/>
//    </element>
//  </element>
//</schema>
//---------------------------------------------------------------------------
function createCampaignAggregateSchema(sNamespace, sSuffix, rTargetSchema,
                                       eGroupBy, sSchemaLabel) {
  var eDlvAggrSchema = <srcSchema name={'dlvAggregate' + String(sSuffix)} namespace={sNamespace}/>
  // Don't insert the main element immediately, since enumeration elements have to be inserted before.
  var mainElement = <element name={'dlvAggregate' + String(sSuffix)} />;
  if( eGroupBy.node.length()>0 ) {
    var qryAggr = <queryDef operation="select" schema={rTargetSchema.id}>
                    <select/>
                  </queryDef>;
    toArray(eGroupBy.node).map(function(item) {
      qryAggr.select.appendChild(item);
    });
    var qrySchema = registerQuerySchema("TempDlvAggregate", "", "", "TempDlvAggregate",
                        qryAggr, <conditionLinks/>, true, false);
    toArray(qrySchema[1].enumeration).map(function(item) {
      eDlvAggrSchema.appendChild(item);
    });
    toArray(qrySchema[1].element.*).map(function(item) {
      if( item.localName()==="element" )
        mainElement.appendChild(item);
      else if( item.localName()==="attribute" ) {
        mainElement.appendChild(item);
        var enumName = String(item.@enum);
        if (enumName) {
          var aEnumNameParts = enumName.split(":");
          item.@enum = sNamespace + ":" + 'dlvAggregate' + String(sSuffix) + ":" + aEnumNameParts[2];
        }
      }
    });
  }
  eDlvAggrSchema.appendChild(mainElement);

  if( String(sSuffix)==="" ) {
    eDlvAggrSchema.@extendedSchema="nms:dlvAggregate";
    eDlvAggrSchema.setLocalName("schema");
  } else {
    eDlvAggrSchema.element.@template="nms:dlvAggregate";
    eDlvAggrSchema.element.@autopk="true";
    eDlvAggrSchema.element.@sqltable=NL.String.toSmartCase(String(sNamespace))+'DlvAggregate'+NL.String.toSmartCase(String(sSuffix));
  }
  return eDlvAggrSchema;
}

//---------------------------------------------------------------------------
// Creates the workflow that will collect some delivery statistics
// to populate agregated data for campaign reports
//---------------------------------------------------------------------------
function createCampaignAggregates(sg, sTargetSchema, rBroadLogSchema, sExtNamespace, sNamespace, sSuffix, sPlanning, sRetention, eGroupBy, eHypothesisFilter) {

  var sJsEscapedId = escapeJS(sTargetSchema.id);
  var sJsEscapedSchema = escapeJS(String(sExtNamespace)+':dlvAggregate'+String(sSuffix));
  var sJsEscapedName = escapeJS(sTargetSchema.name);
  var sJsEscapedGroupBy = escapeJS(eGroupBy.toXMLString());
  var sJsEscapedHypothesis = '""';
  if( eHypothesisFilter )
    sJsEscapedHypothesis = escapeJS(eHypothesisFilter.toXMLString());

  var workflowEntity = <entities schema="xtk:workflow">
           <workflow production="1" internalName={String(sExtNamespace) + 'dlvAggregate' + String(sSuffix)}
                     label={sg.campaignAggregateWorkflow()} >
      <script>loadLibrary("xtk:shared/nl.js");
NL.require("/nl/core/sql.js")
  .require("/nms/delivery.js");
var sg = new StringGroup("nms:core")</script>
      <activities>
        <schedule name="schedule" x="50" y="75">
          <transitions>
            <transition enabled="true" name="transition" target="fork"/>
          </transitions>
          <period>{sPlanning}</period>
        </schedule>
        <signal name="start" x="50" y="175">
          <transitions>
            <done enabled="true" target="fork"/>
          </transitions>
        </signal>
        <fork collision="0" img="xtk:activities/fork.png" label="Branchement" mask="0"
              name="fork" onError="0" runOnSimulation="true" timezone="_inherit_"
              x="150" y="125">
          <initScript>{'vars.tsAggrStart = getCurrentDate();\n'+
'instance.vars.targetSchema='+sJsEscapedId+';\n'+
'instance.vars.aggregateSchema='+sJsEscapedSchema+';\n'+
'instance.vars.sBL2RCPLink='+sJsEscapedName+';\n'+
'instance.vars.groupBy='+sJsEscapedGroupBy+';\n'+
'instance.vars.hypothesisFilter='+sJsEscapedHypothesis+';\n'}</initScript>
          <transitions>
            <transition enabled="true" name="transition1" target="qryExpired" x="0" y="0"/>
            <transition enabled="true" name="transition2" target="qryObsolete" x="0" y="0"/>
          </transitions>
        </fork>
        <query label={sg.campaingAggregateExpiredLabel()} name="qryExpired"
               schema={String(sExtNamespace)+':dlvAggregate'+String(sSuffix)} x="300" y="175">
          <transitions>
            <result enabled="true" label="Résultat" name="result" target="wriExpired"/>
          </transitions>
          <where filterName="backGroundFilterFrm">
            <condition expr={'@lastModified < AddMonths($datetime(vars/@tsAggrStart), -' + String(sRetention) + ')'}/>
          </where>
        </query>
        <writer label={sg.campaingAggregateDeleteLabel()} name="wriExpired"
                operationType="delete" schema={String(sExtNamespace)+':dlvAggregate'+String(sSuffix)}
                x="450" y="175"/>
        <query label={sg.campaignAggregateObsoleteLabel()} name="qryObsolete"
               schema={String(sExtNamespace)+':dlvAggregate'+String(sSuffix)} x="300" y="75">
          <transitions>
            <result enabled="true" label="Résultat" name="result" target="wriObsolete"/>
          </transitions>
          <where filterName="backGroundFilterFrm">
            <condition expr="@lastModified &lt; [delivery/@lastModified]"/>
          </where>
        </query>
        <writer label={sg.campaingAggregateDeleteLabel()} name="wriObsolete"
                operationType="delete" schema={String(sExtNamespace)+':dlvAggregate'+String(sSuffix)}
                x="450" y="75">
          <transitions>
            <done enabled="true" name="done" target="dlvAggregate"/>
            <remainder enabled="false" label="Rejets" name="remainder"/>
          </transitions>
        </writer>
        <js label={sg.campaignAggregateComputeLabel()} name="dlvAggregate"
            x="600" y="75">
          <transitions>
            <done enabled="true" label="Ok" name="done" target="wriAggregate" x="0" y="0"/>
            <error enabled="false" label="Erreur" name="error"/>
          </transitions>
          <script>logInfo(sg.campaignAggregateCollectMappingLabel());
var aMappings = getDeliveryMappingList(instance.vars.targetSchema);

var rAggrSchema = application.getSchema(instance.vars.aggregateSchema);
var rActivitySchema = application.getSchema("temp:" + activity.name);
var tsLastAggr = sqlGetDate("SELECT Max(tsLastModified) FROM " + rAggrSchema.root.SQLTable)

vars.tableName= NL.SQL.getWorkTableName("wkf", instance.id) + "_" + task.taskIdentifier
vars.schema=""
vars.targetSchema="temp:" + activity.name

buildDlvAggrTempTable(vars.targetSchema, vars.tableName);

var recCount = 0;
for(var i = 0; i &lt; aMappings.length; i++)
  recCount += computeDeliveryAggregates(aMappings[i], instance.vars.sBL2RCPLink,
                              new XML(instance.vars.groupBy),
                              new XML(instance.vars.hypothesisFilter),
                              rActivitySchema, tsLastAggr, vars.tsAggrStart,
                              instance.showSQL);

vars.recCount = recCount;
vars.desc = String(recCount);
</script>
          <extension> { createCampaignAggregateSchema("temp", "", rBroadLogSchema, eGroupBy, "") }</extension>
        </js>
        <writer label={sg.campaignAggregateUpdateLabel()} name="wriAggregate"
                operationType="insertOrUpdate" schema={String(sExtNamespace)+':dlvAggregate'+String(sSuffix)} x="750" y="75">
          <transitions>
            <done enabled="false" label="Processed" name="done" x="574" y="104"/>
            <remainder enabled="false" label="Rejets" name="remainder"/>
          </transitions>
          <primaryKeyNode calcExpr="[@delivery-id]" dstExpr="[@delivery-id]" enabledOperation="all"
                          id="1"/>
          <primaryKeyNode calcExpr="[@rule-id]" dstExpr="[@rule-id]" enabledOperation="all"
                          id="2"/>
          <primaryKeyNode calcExpr="@failureReason" dstExpr="@failureReason" enabledOperation="all"
                          id="3"/>
          <node calcExpr="@simuRevenue" dstExpr="@simuRevenue" id="4"/>
          <node calcExpr="@simuMargin" dstExpr="@simuMargin" id="5"/>
          <node calcExpr="@simuResponse" dstExpr="@simuResponse" id="6"/>
          <node calcExpr="@remaRevenue" dstExpr="@remaRevenue" id="7"/>
          <node calcExpr="@remaMargin" dstExpr="@remaMargin" id="8"/>
          <node calcExpr="@remaResponse" dstExpr="@remaResponse" id="9"/>
          <node calcExpr="@hasResponse" dstExpr="@hasResponse" id="10"/>
          <node calcExpr="@totalMsg" dstExpr="@totalMsg" id="11"/>
          <node calcExpr="@toDeliver" dstExpr="@toDeliver" id="12"/>
          <node calcExpr="@processed" dstExpr="@processed" id="13"/>
          <node calcExpr="@success" dstExpr="@success" id="14"/>
          <node calcExpr="@lastModified" dstExpr="@lastModified" id="15"/>
          <node calcExpr="[@delivery-id]" dstExpr="[@delivery-id]" id="16"/>
          <node calcExpr="[@rule-id]" dstExpr="[@rule-id]" id="17"/>
          <node calcExpr="@failureReason" dstExpr="@failureReason" id="18"/>
        </writer>
      </activities>
      <folder _operation="none" name="nmsTechnicalWorkflow"/>
    </workflow>
  </entities>;
  var iIdGen = 20;
  toArray(eGroupBy.node).map(function(item) {
    workflowEntity.workflow.activities.writer[2].appendChild(<primaryKeyNode
              calcExpr={NL.XTK.expandXPath(String(item.@alias))}
              dstExpr={NL.XTK.expandXPath(String(item.@alias))}
              enabledOperation="all" id={String(++iIdGen)}/>);
    workflowEntity.workflow.activities.writer[2].appendChild(<node
              calcExpr={NL.XTK.expandXPath(String(item.@alias))}
              dstExpr={NL.XTK.expandXPath(String(item.@alias))}
              id={String(++iIdGen)}/>);
  });
  return workflowEntity;
}

//---------------------------------------------------------------------------
// Creates the cube based on the campaign aggregate schema.
// This cube will be used to build campaign reports.
//---------------------------------------------------------------------------

/** Find the available dimensions contained in an element of a custom schema
  @parentElement the element
  @parentNames names of the parent in the path
  @foreignKeys array where foreign keys (don't use them to build a dimension)
*/
function getCustomDimensions(parentElement, parentNames, foreignKeys) {
  var result = [];
  // Recusively discover dimensions in the elements
  for each (var childElement in parentElement.element) {
    var type = String(childElement.@type);
    if (type === "link") {
      for each (var join in childElement.join) {
        var foreignKeyPath = String(join.@['xpath-src']);
        foreignKeys.push(parentNames.concat([foreignKeyPath]).join('/'));
      }
      result.push({'name' : parentNames.concat([String(childElement.@name)]).join('_'),
                   'label': String(childElement.@label),
                   'expr' : parentNames.concat([String(childElement.@name)]).join('/'),
                   'type' : 'link'});
    }
    else if (type === "") {
      var newDimensions = getCustomDimensions(childElement, parentNames.concat([String(childElement.@name)]), foreignKeys);
      result = result.concat(newDimensions);
    }
  }
  // Discover dimensions in the attributes
  for each (var attribute in parentElement.attribute) {
    if( NL.XTK.parseBoolean(attribute.@advanced, false) )
      continue;
    var expr = parentNames.concat(['@'+String(attribute.@name)]).join('/');
    // Don't keep the attribute if it is a foreign key
    if (foreignKeys.indexOf(expr) !== -1)
      continue;
    result.push({'name'         : parentNames.concat([String(attribute.@name)]).join('_'),
                 'label'        : String(attribute.@label),
                 'expr'         : ('[' + expr + ']'),
                 'type'         : String(attribute.@type),
                 'exprSysEnum'  : String(attribute.@enum)});
  }
  return result;
};

/** Fill a cube by adding custom dimensions
  @cube the cube
  @dimensions array of custom dimensions
*/
function addCustomDimensions(cube, cubeName, dimensions) {
  for (var i = 0; i < dimensions.length; i++) {
    var dimension = dimensions[i];
    var olapDimension = <dimension label={dimension.label} name={dimension.name}/>;
    if (dimension.type === "date")
      olapDimension = xtk.olapDimension.GenerateTimeDimension(olapDimension, <field expr={dimension.expr}/>, <config hasYears="true" hasQuarters="true" hasMonths="true" hasWeeks="true" hasDays="true" hasHours="false"/>);
    else if (dimension.type === "datetime" || dimension.type === "datetimetz" || dimension.type === "datetimenotz")
      olapDimension = xtk.olapDimension.GenerateTimeDimension(olapDimension, <field expr={dimension.expr}/>, <config hasYears="true" hasQuarters="true" hasMonths="true" hasWeeks="true" hasDays="true" hasHours="true"/>);
    else
      olapDimension.appendChild(<level expr={dimension.expr} exprType={dimension.type} exprSysEnum={dimension.exprSysEnum} label={dimension.label} name={dimension.name} viewType="inherit"/>);

    olapDimension.appendChild(<cube _operation="none" name={cubeName}/>);
    cube.appendChild(olapDimension);
  }
};

/**
 * Default measures for genreated cube
 */
function campaignMeasures(sg) {
  return {
    revenue:       { label:sg.campaignAggregateRevenue(),       format:"number"},
    margin:        { label:sg.campaignAggregateMargin(),        format:"number"},
    response:      { label:sg.campaignAggregateResponse(),      format:"number"},
    totalMsg:      { label:sg.campaignAggregateTotalMsg(),      format:"number"},
    toDeliver:     { label:sg.campaignAggregateToDeliver(),     format:"number"},
    processed:     { label:sg.campaignAggregateProcessed(),     format:"number"},
    success:       { label:sg.campaignAggregateSuccess(),       format:"number"},
    estimatedCost: { label:sg.campaignAggregateEstimatedCost(), format:"number",     campaignOnly:true},
    forecasted:    { label:sg.campaignAggregateForecasted(),    format:"number",     formula:"@totalMsg"},
    actual:        { label:sg.campaignAggregateActual(),        format:"number",     formula:"Coalesce(Coalesce(@success, @processed), Coalesce(@toDeliver, 0))"},
    actualRate:    { label:sg.campaignAggregateActualRate(),    format:"percentage", formula:"Percent(@actual, @forecasted)"},
    processedRate: { label:sg.campaignAggregateProcessedRate(), format:"percentage", formula:"Percent(@processed, @forecasted)"},
    successRate:   { label:sg.campaignAggregateSuccessRate(),   format:"percentage", formula:"Percent(@success, @forecasted)"},
    responseRate:  { label:sg.campaignAggregateResponseRate(),  format:"percentage", formula:"Percent(@response, @actual)"},
    roiRevenue:    { label:sg.campaignAggregateRoiRevenue(),    format:"percentage", formula:"Percent(@revenue, @estimatedCost)", campaignOnly:true},
    roiMargin:     { label:sg.campaignAggregateRoiMargin(),     format:"percentage", formula:"Percent(@margin, @estimatedCost)",  campaignOnly:true},
    exclusionRate: { label:sg.campaignAggregateExclusionPart(), format:"percentage", dynamic: true, rate: {
        dimension: "rule",
        level:     "rule",
        levelType: "dimension",
        measure:   "forecasted"
      }
    }
  };
}

/** Main method to create the campaign cube based on the aggregate schema
  @sNamespace Namespace of the mapping "recipient" schema
  @sSuffix Suffix used in this mapping
  @aggregateSchema Schema on which we build the cube. This schema has been generated using the mapping configuration.
  @measures Definition of measures to put in the cube
  @return the cube element ("olapCube" node)
*/
function createCampaignCube(sNamespace, sSuffix, aggregateSchema, measures) {
  // Cube structure
  var cubeName = sNamespace + 'dlvAggregate' + String(sSuffix);
  var schemaName = sNamespace + ":" + 'dlvAggregate' + String(sSuffix);
  var cube =  <olapCube label={cubeName} name={cubeName} _operation="insertOrUpdate" xtkschema="xtk:olapCube">
                <fact schema={schemaName}/>
              </olapCube>;

  var sg = new StringGroup("nms:core");

  // Add measures to the cube
  for (var measureName in measures) {
    if (!measures[measureName].campaignOnly || application.hasPackage('nms:campaign')) {
      if (!measures[measureName].formula) {
        // Not computed measures
        cube.appendChild(<measure label={measures[measureName].label} name={measureName} format={measures[measureName].format}>
                          <formula operator="3" leftValue={"@" + measureName}/>
                          <cube _operation="none" name={cubeName}/>
                         </measure>);
      }
      else {
        // Computed measures
        cube.appendChild(<measure label={measures[measureName].label} name={measureName} format={measures[measureName].format}>
                           <computed computed="1" formula={measures[measureName].formula}/>
                           <cube _operation="none" name={cubeName}/>
                         </measure>);
      }
    }
  }

  // Add standard dimensions to the cube
  // Delivery
  var deliveryDimension = <dimension label={sg.campaignAggregateDelivery()} name="delivery">
                            <cube _operation="none" name={cubeName}/>
                          </dimension>;
  if (application.hasPackage('nms:campaign')) {
    deliveryDimension.appendChild(<level expr="[delivery/operation/program]" exprType="link" label={sg.campaignAggregateProgram()}   name="program"   viewType="inherit"/>);
    deliveryDimension.appendChild(<level expr="[delivery/operation]"         exprType="link" label={sg.campaignAggregateOperation()} name="operation" viewType="inherit"/>);
  }
  deliveryDimension.appendChild(<level expr="[delivery]" exprType="link" label={sg.campaignAggregateDelivery()} name="delivery" viewType="inherit">
                                  <format>
                                    <formatLink expr="iif (@deliveryCode != '', @deliveryCode, @internalName) + ' (' + [operation/@internalName] + ')'" id="1" label={sg.campaignReportDeliveryFullLabel()} name="FO1"/>
                                  </format>
                                </level>);
  deliveryDimension.appendChild(<level expr="[delivery/@messageType]" exprType="byte" exprSysEnum="nms:delivery:messageType" label={sg.campaignAggregateChannel()}  name="channel"  viewType="inherit"/>);
  cube.appendChild(deliveryDimension);

  // Channel (part of delivery but we need to separate them in the reports
  var channelDimension = <dimension label={sg.campaignAggregateChannel()} name="channel">
                          <cube _operation="none" name={cubeName}/>
                         </dimension>;
  channelDimension.appendChild(<level expr="[delivery/@messageType]" exprType="byte" exprSysEnum="nms:delivery:messageType" label={sg.campaignAggregateChannel()}  name="channel" viewType="inherit"/>);
  cube.appendChild(channelDimension);

  // Typology rule
  cube.appendChild(<dimension label={sg.campaignAggregateRule()} name="rule">
                    <level expr="rule" exprType="link" label={sg.campaignAggregateRule()} name="rule" viewType="inherit">
                      <format>
                        <formatLink expr={"Iif(@id = 0, '" + sg.campaignReportNoRuleLabel() + "', @label)"} id="1" label={sg.campaignReportRuleFullLabel()} name="FO1"/>
                      </format>
                    </level>
                    <cube _operation="none" name={cubeName}/>
                   </dimension>);
  // Failure reason
  cube.appendChild(<dimension label={sg.campaignAggregateFailureReason()} name="failureReason">
                    <level expr="@failureReason" exprType="byte" exprSysEnum="nms:broadLog:failureReason" label={sg.campaignAggregateFailureReason()} name="failureReason" viewType="inherit"/>
                    <cube _operation="none" name={cubeName}/>
                   </dimension>);
  // Contact date
  var dateDimension = <dimension label={sg.campaignAggregateContactDate()} name="contactDate"/>;
  dateDimension = xtk.olapDimension.GenerateTimeDimension(dateDimension,
                                                          <field expr="[delivery/scheduling/@contactDate]"/>,
                                                          <config hasYears="true" hasQuarters="true" hasMonths="true" hasWeeks="true" hasDays="true" hasHours="false"/>);
  dateDimension.appendChild(<cube _operation="none" name={cubeName}/>);
  dateDimension.setName("dimension");

  cube.appendChild(dateDimension);

  // Add custom dimensions to the cube
  var customDimensions = getCustomDimensions(aggregateSchema.element, [], []);
  addCustomDimensions(cube, cubeName, customDimensions);
  return cube;
};


/** Create a pivot table XML configuration for a campaign report.
 * @pivotConfig Configuration of the pivot table:
 *  - @cubeName Internal of the cube
 *  - @cube The cube generated for these reports
 *  - @label Label of the table
 *  - @measures The measures available in this cube (JSON Map of JSON informations)
 *  - @rowDimensions Dimensions to put in rows. "?" means custom dimensions. Litteral object:
 *    - @dimensionName: name of the dimension
 *    - @levels: name of the levels to enable. Undefined or null means we enable all levels.
 *  - @colDimensions Dimensions to put in columns. "?" means custom dimensions. Litteral object:
 *    - @dimensionName: name of the dimension
 *    - @levels: name of the levels to enable. Undefined or null means we enable all levels.
 *  - @measureNames Name of the measures to use.
 *  - @filter filter on the cube schema.
 */
function _createPivotTable(pivotConfig) {
  var cubeName =     pivotConfig.cubeName;
  var cube =         pivotConfig.cube;

  function findDimension(cube, dimensionName) {
    for each (var olapDimension in cube.dimension) {
      if (String(olapDimension.@name) === dimensionName)
        return olapDimension;
    }
    return null;
  };

  var filter = pivotConfig.filter || <where/>;
  filter.appendChild(<condition enabledIf="$([vars/minDate]) != ''" expr="@contactDate_day &gt;= $date([vars/minDate])" internalId="1"/>);
  filter.appendChild(<condition enabledIf="$([vars/maxDate]) != ''" expr="@contactDate_day &lt;= $date([vars/maxDate])" internalId="2"/>);

  // Empty pivot table on the cube
  var result = <table colspan="1" id="table1" label={pivotConfig.label} statOrientation="row" type="cubeExplorer">
                <rendering htmlEditor="Simple" justifyButton="1" styleButton="1" tableClass="list"/>
                <data schema="nms:operation" variableCount="1">
                  <group name="_root"/>
                </data>
                <cubeExplorer cube-cs={cubeName + "(" + cubeName + ")"}>
                  <cube name={cubeName}/>
                  <visualConfig currentColorStrategy="-1" legend="" measureOrientation="row" showLegend="false" showMeasureLabels="true"/>
                </cubeExplorer>
               </table>;

  result.cubeExplorer.appendChild(filter);

  // Find custom dimensions in the cube
  var standardDimensions = ['delivery', 'channel', 'rule', 'failureReason', 'contactDate'];
  var customDimensions = [];
  for each (var dimension in cube.dimension) {
    if (standardDimensions.indexOf(String(dimension.@name)) == -1)
      customDimensions.push(String(dimension.@name));
  }

  var rowDimensions = pivotConfig.rowDimensions;
  for (var i = 0; i < rowDimensions.length; i++) {
    if (NL.isString(rowDimensions[i])) {
      rowDimensions[i] = {
        dimensionName: rowDimensions[i]
      };
    }
  }
  var colDimensions = pivotConfig.colDimensions;
  for (var i = 0; i < colDimensions.length; i++) {
    if (NL.isString(colDimensions[i])) {
      colDimensions[i] = {
        dimensionName: colDimensions[i]
      };
    }
  }

  // Prepare the list of dimensions to use
  var reportDimensions = [];
  for (var i = 0; i < rowDimensions.length; i++) {
    if (rowDimensions[i].dimensionName === "?") {
      for (var j = 0; j < customDimensions.length; j++)
        reportDimensions.push({
          'dimensionName': customDimensions[j],
          'levels':        null,
          'orientation':   'row'
        });
    } else {
      reportDimensions.push({
        'dimensionName': rowDimensions[i].dimensionName,
        'levels':        rowDimensions[i].levels,
        'orientation':   'row'
      });
    }
  }
  for (var i = 0; i < colDimensions.length; i++) {
    if (colDimensions[i].dimensionName === "?") {
      for (var j = 0; j < customDimensions.length; j++)
        reportDimensions.push({
          'dimensionName': customDimensions[j],
          'levels':        null,
          'orientation':   'column'
        });
    } else {
      reportDimensions.push({
        'dimensionName': colDimensions[i].dimensionName,
        'levels':        colDimensions[i].levels,
        'orientation':   'column'
      });
    }
  }

  // Add the dimensions to the pivot table
  var firstColDimension = true;
  var firstRowDimension = true;
  for (var i = 0; i < reportDimensions.length; i++) {
    var dimensionName = reportDimensions[i].dimensionName;
    var levels        = reportDimensions[i].levels;
    var orientation = reportDimensions[i].orientation;

    var firstDimension = false;
    if (orientation === "row" && firstRowDimension) {
      firstDimension = true;
      firstRowDimension = false;
    }
    else if (orientation === "column" && firstColDimension) {
      firstDimension = true;
      firstColDimension = false;
    }

    var dimension = findDimension(cube, dimensionName);

    var xmlDimension = <dimension orientation={orientation}>
                        <dimension name={dimensionName}>
                          <cube name={cubeName}/>
                        </dimension>
                       </dimension>;

    // Prepare a default configuration for the levels
    var useDefaultConfig = false;
    if (!levels) {
      useDefaultConfig = true;
      levels = [];
      for each (var level in dimension.level) {
        levels.push(String(level.@name));
      }
    }

    // Generate a configuration for levels
    for (var j = 0; j < levels.length; j++) {
      if (NL.isString(levels[j])) {
        levels[j] = {
          name:        levels[j],
          defaultOpen: firstDimension && j === 0
        }
      }
    }

    for each (var level in dimension.level) {
      var active = false;
      var defaultOpen = false;
      for (var j = 0; !active && j < levels.length; j++) {
        if (String(level.@name) === levels[j].name) {
          active = true;
          defaultOpen = levels[j].defaultOpen;
        }
      }
      var ndLevel = <level active={active} dataType={level.@dataType} defaultOpen={defaultOpen} lineCount="200"
                           name={level.@name} showEnumImages="true" showSum="true" sortAsc="true"
                           sortMeasureName="null" sortMode="value" viewType={level.@viewType}/>;

      // Specific dirty cases to use a format different from the standard compute string
      if (dimensionName === "delivery" && String(level.@name) === "delivery")
        ndLevel.@linkFormat = "FO1";
      if (dimensionName === "rule" && String(level.@name) === "rule")
        ndLevel.@linkFormat = "FO1";

      xmlDimension.appendChild(ndLevel);
    }

    result.cubeExplorer.visualConfig.appendChild(xmlDimension);
  }

  var measureNames = pivotConfig.measureNames;
  // Filter measure names depending on the installed packages
  if (!application.hasPackage('nms:campaign')) {
    var temp = [];
    for (var i = 0; i < measureNames.length; i++) {
      if (measureNames[i] !== "roiRevenue")
        temp.push(measureNames[i]);
    }
    measureNames = temp;
  }

  // Add the measures to the pivot table
  for (var i = 0; i < measureNames.length; i++) {
    var measure = pivotConfig.measures[measureNames[i]];
    var xmlMeasure = null;
    if (!measure.dynamic) {
      xmlMeasure = <measure active="true" data="[[null,null],[null,null],[null,null]]" decimalPlaces="" format={measure.format}
                            isDynamic="false" label={measure.label} name={measureNames[i]} unit="" unitFormat="0">
                    <measure name={measureNames[i]}>
                      <cube name={cubeName}/>
                    </measure>
                   </measure>;
    }
    else {
      // Only handle rate dynamic measure for now
      xmlMeasure = <measure active="true" data="[[null,null],[null,null],[null,null]]" decimalPlaces="" format={measure.format}
                            isDynamic="true" label={measure.label} name={measureNames[i]} unit="" unitFormat="0">
                    <dynamicFormula strategy="rate">
                      <rate dimension={measure.rate.dimension} level={measure.rate.level}
                            levelType={measure.rate.levelType} measure={measure.rate.measure}/>
                    </dynamicFormula>
                   </measure>
    }

    result.cubeExplorer.visualConfig.appendChild(xmlMeasure);
  }
  return result;
};

/** Create a script which will prepare the date context filter
 * @param reportConfig configuration of the report:
 *   @schema Schema of the report
 * @return The generated script box
 */
function _createContextScript(reportConfig) {
  var script = <script img="xtk:activities/script.png" label="" mask="0" name="script" x="100" y="100">
                <transitions>
                  <next enabled="true" name="next" target="page"/>
                </transitions>
              </script>;

  var code = null;

  if (reportConfig.schema === "nms:operation") {
    // Use the start and end dates to filter the report
    code = <code><![CDATA[var xmlQuery = <queryDef schema="nms:operation" operation="get" lineCount="1">
                                 <select>
                                  <node expr="@start" alias="@minDate"/>
                                  <node expr="@end"   alias="@maxDate"/>
                                 </select>
                                 <where>
                                   <condition expr={"@id = " + ctx.@_selection}/>
                                 </where>
                               </queryDef>;
                var result = xtk.queryDef.create(xmlQuery).ExecuteQuery();
                ctx.vars.minDate = String(result.@minDate);
                ctx.vars.maxDate = String(result.@maxDate);]]></code>;
  }
  else if (reportConfig.schema === "nms:program") {
    // Filter on 21 days before and after the current date
    code = <code><![CDATA[var xmlQuery = <queryDef schema="nms:operation" operation="get" lineCount="1">
                                 <select>
                                  <node expr="AddMonths(GetDate(), -3)" alias="@minDate"/>
                                  <node expr="AddMonths(GetDate(), 3)"  alias="@maxDate"/>
                                 </select>
                               </queryDef>;
                var result = xtk.queryDef.create(xmlQuery).ExecuteQuery();
                ctx.vars.minDate = String(result.@minDate);
                ctx.vars.maxDate = String(result.@maxDate);]]></code>;
  }
  else {
    // Filter on 21 days before and after the current date
    code = <code><![CDATA[var xmlQuery = <queryDef schema="nms:operation" operation="get" lineCount="1">
                                 <select>
                                  <node expr="AddMonths(GetDate(), -3)" alias="@minDate"/>
                                  <node expr="AddMonths(GetDate(), 3)"  alias="@maxDate"/>
                                 </select>
                               </queryDef>;
                var result = xtk.queryDef.create(xmlQuery).ExecuteQuery();
                ctx.vars.minDate = String(result.@minDate);
                ctx.vars.maxDate = String(result.@maxDate);]]></code>;
  }

  script.appendChild(code);

  return script;
};

/** Creates a campaign report
 * @reportConfig Configuration of the report:
 *   @internalName Name of the report
 *   @label Label of the report
 *   @schema Schema of the report
 *   @global Indicate whether the report is global
 * @return the generated report (empty)
 */
function _createCampaignReport(reportConfig) {
  var sg = new StringGroup("nms:core");

  var strIsGlobal = reportConfig.global ? "1" : "0";
  var strMonoSel  = reportConfig.global ? "0" : "1";

  var errorPageLabel = sg.campaignReportErrorPageLabel();
  var errorLine1 = sg.campaignReportErrorLine1();
  var errorLine2 = sg.campaignReportErrorLine2();
  var nextLabel = sg.campaignReportNextLabel();

  var report = <report appState="5" builtIn="1" category={sg.campaignReportCategory()} defaultLanguage="fr"
                       designLanguage="fr" entitySchema="xtk:report" idCounter="3" img="xtk:report/thumbs/nmx.png"
                       internalName={reportConfig.internalName} isGlobal={strIsGlobal} isModel="0"
                       label={reportConfig.label} modelName="fullReport" monoselection={strMonoSel} multiselection="0"
                       prefered="1" schema={reportConfig.schema} shared="1" startPath="/" state="0" timezone="_inherit_"
                       translationStatus="0" type="full" uuid="3E1DCAD6-3522-4A26-B8DD-BABB0F75C456">
                <properties labelPosition="left" navigationMode="button" windowTitle={reportConfig.label}/>
                <errorPage label={errorPageLabel} name="errorPage">
                  <endPage>
                    <source><![CDATA[<table style="color: red;">
                                       <tr>
                                         <td style="vertical-align: middle; padding-left: 0.5em;">
                                          <img src="/xtk/img/error.png"/>
                                         </td>
                                         <td style="vertical-align: middle; padding: 1em;">
                                           <p>&lt;%= $(line1) %&gt;</p>
                                           <p>&lt;%= $(line2) %&gt;</p>
                                         </td>
                                       </tr>
                                     </table>]]>
                    </source>
                    <strings>
                      <string id="line1" value={errorLine1}/>
                      <string id="line2" value={errorLine2}/>
                    </strings>
                  </endPage>
                </errorPage>
                <activities>
                  <page colcount="1" disableNextButton="true" disablePreviousButton="true" img="nms:activities/page.png"
                        label={reportConfig.label} labelPosition="inherit" mask="0" name="page" randomQuestionsLimit="1"
                        type="page" x="250" y="100">
                    <transitions>
                      <next enabled="false" label={nextLabel} name="next"/>
                    </transitions>
                    <extraHeader>&lt;%@ page import="xtk:shared/nl.js" %&gt;
              &lt;%@ page import="nms:delivery.js" %&gt;</extraHeader>
                  </page>
                </activities>
                <desc><![CDATA[]]></desc>
                <defaultDictionary _operation="none" name="xtkUserDictionary"/>
                <folder _operation="none" name="xtkReport"/>
                <rendering _operation="none" internalName="defaultReportRendering"/>
                <folderProcess _operation="none" name="xtkReport"/>
              </report>;
  return report;
};

/** Build a report on an aggregate table containing a pivot
 * @reportConfig Configuration of the report
 * - @colDimensions
 * - @cube
 * - @cubeName
 * - @filter
 * - @global
 * - @internalName
 * - @label
 * - @measureNames
 * - @measures
 * - @rowDimensions
 * - @schema
 * @return The report
 */
function _buildReport(reportConfig) {
  var report = _createCampaignReport({
    internalName: reportConfig.internalName,
    label:        reportConfig.label,
    schema:       reportConfig.schema,
    global:       reportConfig.global
  });

  var table = _createPivotTable({
    cubeName:      reportConfig.cubeName,
    cube:          reportConfig.cube,
    label:         reportConfig.label,
    measures:      reportConfig.measures,
    rowDimensions: reportConfig.rowDimensions,
    colDimensions: reportConfig.colDimensions,
    measureNames:  reportConfig.measureNames,
    filter:        reportConfig.filter
  });
  report.activities.page.appendChild(table);

  var script = _createContextScript({
    schema: reportConfig.schema
  });
  report.activities.appendChild(script);

  return report;
};

/**
 * Generate some campaign reports
 * @sSuffix suffix of the current mapping
 * @cube The cube generated for these reports
 * @measures The measures available in this cube (JSON Map of JSON informations)
 * @return the xtk:report entity node which can be used in a package
 */
function createCampaignReports(sNamespace, sSuffix, cube, measures) {
  var sg = new StringGroup("nms:core");
  var entities  = <entities schema="xtk:report"/>;
  var cubeName  = sNamespace + 'dlvAggregate' + sSuffix;
  var aggSchema = sNamespace + ":" + 'dlvAggregate' + sSuffix;

  /** Exclusion analysis */
  // Global
  var exclusionAnalysisGlobal = {
    schema:        aggSchema,
    global:        true,
    internalName:  sNamespace + "campaignExclusionAnalysis" + sSuffix,
    label:         sg.campaignReportExclusionAnalysis(sSuffix),
    cubeName:      cubeName,
    cube:          cube,
    measures:      measures,
    measureNames:  ['forecasted', 'exclusionRate'],
    rowDimensions: ['rule', '?'],
    colDimensions: [{
        dimensionName: 'contactDate',
        levels: ['month', 'day']
      }, {
        dimensionName: 'delivery',
        levels: ['delivery']
      }
    ],
    filter: <where><condition expr="[rule_rule/@id] != 0" internalId="1"/></where>
  };
  entities.appendChild(_buildReport(exclusionAnalysisGlobal));

  // On operations
  var exclusionAnalysisOperation = exclusionAnalysisGlobal;
  exclusionAnalysisOperation.schema       = "nms:operation";
  exclusionAnalysisOperation.global       = false;
  exclusionAnalysisOperation.internalName = sNamespace + "campaignExclusionAnalysisOp" + sSuffix;
  exclusionAnalysisOperation.filter = <where>
                                        <condition expr="[rule_rule/@id] != 0" internalId="1"/>
                                        <condition boolOperator="AND" expr="[delivery_operation/@id] = $(@_selection)" internalId="2"/>
                                      </where>;
  entities.appendChild(_buildReport(exclusionAnalysisOperation));

  // On programs
  var exclusionAnalysisProgram = exclusionAnalysisGlobal;
  exclusionAnalysisProgram.schema       = "nms:program";
  exclusionAnalysisProgram.global       = false;
  exclusionAnalysisProgram.internalName = sNamespace + "campaignExclusionAnalysisProg" + sSuffix;
  exclusionAnalysisProgram.filter = <where>
                                      <condition expr="[rule_rule/@id] != 0" internalId="1"/>
                                      <condition boolOperator="AND" expr="[delivery_program/@id] = $(@_selection)" internalId="2"/>
                                    </where>;
  entities.appendChild(_buildReport(exclusionAnalysisProgram));

  /** Execution planning */
  // Global
  var executionPlanningGlobal = {
    schema:        aggSchema,
    global:        true,
    internalName:  sNamespace + "campaignExecutionPlanning" + sSuffix,
    label:         sg.campaignReportExecutionPlanning(sSuffix),
    cubeName:      cubeName,
    cube:          cube,
    measures:      measures,
    measureNames:  ['forecasted', 'processed', 'processedRate', 'success', 'successRate'],
    rowDimensions: ['channel', '?'],
    colDimensions: [{
        dimensionName: 'contactDate',
        levels: ['month', 'day']
      }, {
        dimensionName: 'delivery',
        levels: ['delivery']
      }
    ],
    filter: null
  };
  entities.appendChild(_buildReport(executionPlanningGlobal));

  // On operations
  var executionPlanningOperation = executionPlanningGlobal;
  executionPlanningOperation.schema       = "nms:operation";
  executionPlanningOperation.global       = false;
  executionPlanningOperation.internalName = sNamespace + "campaignExecutionPlanningOp" + sSuffix;
  executionPlanningOperation.filter = <where>
                                        <condition expr="[delivery_operation/@id] = $(@_selection)" internalId="1"/>
                                      </where>;
  entities.appendChild(_buildReport(executionPlanningOperation));

  // On programs
  var executionPlanningProgram = executionPlanningGlobal;
  executionPlanningProgram.schema       = "nms:program";
  executionPlanningProgram.global       = false;
  executionPlanningProgram.internalName = sNamespace + "campaignExecutionPlanningProg" + sSuffix;
  executionPlanningProgram.filter = <where>
                                      <condition expr="[delivery_program/@id] = $(@_selection)" internalId="1"/>
                                    </where>;
  entities.appendChild(_buildReport(executionPlanningProgram));

  /** Roi analysis */
  // Global
  var roiAnalysisGlobal = {
    schema:        aggSchema,
    global:        true,
    internalName:  sNamespace + "campaignRoiAnalysis" + sSuffix,
    label:         sg.campaignReportRoiAnalysis(sSuffix),
    cubeName:      cubeName,
    cube:          cube,
    measures:      measures,
    measureNames:  ['success', 'response', 'responseRate', 'revenue', 'estimatedCost', 'roiRevenue'],
    rowDimensions: ['channel', '?'],
    colDimensions: [{
        dimensionName: 'delivery',
        levels: ['operation', 'delivery']
      }
    ],
    filter: null
  };
  entities.appendChild(_buildReport(roiAnalysisGlobal));

  // On operations
  var roiAnalysisOperation = roiAnalysisGlobal;
  roiAnalysisOperation.schema       = "nms:operation";
  roiAnalysisOperation.global       = false;
  roiAnalysisOperation.internalName = sNamespace + "campaignRoiAnalysisOp" + sSuffix;
  roiAnalysisOperation.filter = <where>
                                  <condition expr="[delivery_operation/@id] = $(@_selection)" internalId="1"/>
                                </where>;
  roiAnalysisOperation.colDimensions = [{
    dimensionName: 'delivery',
    levels: ['delivery']
  }];
  entities.appendChild(_buildReport(roiAnalysisOperation));

  // On programs
  var roiAnalysisProgram = roiAnalysisGlobal;
  roiAnalysisProgram.schema       = "nms:program";
  roiAnalysisProgram.global       = false;
  roiAnalysisProgram.internalName = sNamespace + "campaignRoiAnalysisProg" + sSuffix;
  roiAnalysisProgram.filter = <where>
                                <condition expr="[delivery_program/@id] = $(@_selection)" internalId="1"/>
                              </where>;
  entities.appendChild(_buildReport(roiAnalysisProgram));

  return entities;
};


/**
 * Create iOs/Android new delivery mapping filters
 * @param {NLSchema} appSubSchema the appSubscription schema
 * @param {String} sSuffix suffix to be used to create the filter
 */
function createAppSubCustomFilter(sg, appSubSchema, sSuffix, sChannel, sFilterLabel, sFilterErrorLabel, iMessageType, iPushPlatform) {
  var svcSchema = application.getSchema("nms:service");
  return <queryFilter hasForm="1" img={"nms:" + String(sChannel).toLowerCase() + ".png"}
                   label={sFilterLabel}
                   main="1" name={String(sChannel) + "MobileApplication" + String(sSuffix)}
                   schema={appSubSchema.id}
                   visibleFilterExpr={"@messageType=" + iMessageType} visibleFilterSchema="nms:delivery">
        <where>
          <condition boolOperator="AND" expr="[mobileApp/@uuid] = $(/tmp/list/mobileApp/@uuid)"
                     internalId="1"/>
          <condition expr="[@service-id] = $(/tmp/@serviceId)" internalId="2"/>
        </where>
        <form>
          <enter>
            <if expr="NodeExists([/tmp/@targetMapping-id])=0">
              <set value="" xpath="/tmp/@targetMapping-id"/>
            </if>
          </enter>
          <container label={svcSchema.labelSingular}>
            <input computeStringAlias="@label" createMode="none" label={svcSchema.labelSingular} schema={svcSchema.id}
                   type="linkEdit" xpath="/tmp/@serviceId">
              <sysFilter>
                <condition expr="@type=40"/>
                <condition enabledIf="$(/tmp/@targetMapping-id)!=''" expr="[@mobileAppsTargetMapping-id]=$(/tmp/@targetMapping-id)"/>
              </sysFilter>
            </input>
            <container type="visibleGroup" visibleIf="[/tmp/@serviceId]!=''">
              <input dblClickAction="wizFinish|wizNext"
                     exprOutCS={ "'" + sg.filterAppSubMobileAppLabel().replace(/\'/g, '\\\'') + " \\''+[/tmp/@_cs]+'\\''" }
                     extraColumns="@uuid,notificationCustomFields,notificationSounds" monoSelection="true" name={String(sChannel).toLowerCase()} newEntityFormChoice="false"
                     schema="nms:mobileApp" type="linkListChoice" xpath="/tmp/list"
                     xpathOut="/tmp/list" xpathOutCS="/tmp/@_cs">
                <input expr="[.]"/>
                  <input expr="@pushPlatform"/>
                <sysFilter>
                  <condition expr="[@service-id]=$(/tmp/@serviceId)"/>
                  <condition expr={"@pushPlatform="+iPushPlatform}/>
                </sysFilter>
              </input>
            </container>
          </container>
          <leave>
            <check expr="[/tmp/list/mobileApp/@uuid] != ''">
              <error>{sFilterErrorLabel}</error>
            </check>
          </leave>
        </form>
        <folder name="xtkQueryFilter"/>
      </queryFilter>;
}

/**
* Get the delivery mapping related information if Full fda is enabled
* returns no information if not.
* @elDeliveryMapping {xmlnode} containing information about delivery mapping to be created.
* @return {xmlnode} a storage node to be used by form to fill delivery mapping info.
**/
function nms_deliveryMapping_GetDeliveryMappingFFDAInfo(elDeliveryMapping) {
  var mappingStorageInfo = <storage/>;
  // extracting recipient link and target schema from elDeliveryMapping
  var sTargetLink = elDeliveryMapping.@recipientLink;
  var sTargetSchema = elDeliveryMapping.@schema;
  var sg = new StringGroup("nms:core");

  if (!application.hasPackage("xxl:fullfdaMkt"))
    return mappingStorageInfo;

  var schema = application.getSchema(sTargetSchema);
  if (!schema)
    logError(sg.schemaNotFound(sTargetSchema));

  var dataSource = schema.root.dataSource;
  var isFfda = dataSource && NL.String.startsWith(dataSource.toLowerCase(), 'nms:extaccount:');
  // sending empty storage node in case of non ffda datasource
  if (!isFfda)
    return mappingStorageInfo;

  // broadlog calculation
  var strBlSchemaName = String(elDeliveryMapping.storage.@broadLogSchema);
  if (!strBlSchemaName || !strBlSchemaName.length) {
    strBlSchemaName = String(elDeliveryMapping.@schemaNamespace) +
                      ':broadLog' +
                      String(elDeliveryMapping.@schemaSuffix);
  }

  var blSchema = application.getSchema(strBlSchemaName);
  if (!blSchema)
    logError(sg.schemaNotFound(strBlSchemaName));

  var strTlSchemaName = elDeliveryMapping.storage.@trackingLogSchema;
  // Proceed only if trackingLogSchema exist for this mapping.
  if (strTlSchemaName && strTlSchemaName != "")
  {
    var tlSchema = application.getSchema(strTlSchemaName);
    if (!tlSchema)
      logError(sg.schemaNotFound(strTlSchemaName));
  }
  else
    strTlSchemaName = "";

  var resultInfo = getDeliveryMappingInfo(sTargetSchema, sTargetLink, strBlSchemaName,
                                            strTlSchemaName);

  BLTable = resultInfo.root.getValue("@BLTable");
  TLTable = resultInfo.root.getValue("@TLTable");
  BlKeys  = resultInfo.root.getValue("@BLKeys");
  TlKeys  = resultInfo.root.getValue("@TLKeys");
  BLFilterKeys = resultInfo.root.getValue("@BLFilterKeys");
  TLFilterKeys = resultInfo.root.getValue("@TLFilterKeys");
  trackingHasDeviceIP =NL.XTK.parseBoolean(resultInfo.root.getValue("@trackingHasDeviceIP")) 

  mappingStorageInfo = <storage  broadLogTable = {BLTable} broadLogRcpKeys = {BlKeys}
                                 broadLogFilterKeys = {BLFilterKeys} trackingLogTable = {TLTable} 
                                 trackingLogRcpKeys = {TlKeys} trackingLogFilterKeys = {TLFilterKeys}
                                 trackingHasDeviceIP = {trackingHasDeviceIP} /> ;
  return mappingStorageInfo;
}

//---------------------------------------------------------------------------
// Creates the options linked to the targeting dimension
// using UUID as primary key for broadlog and trackinglog schemas
// as many features are not yet fully supported in FFDA (push, distributed marketing, survey...)
// we'd like to keep the mapping as much simple as possible
// the function will be merged to existing once Full FDA project is finished
//---------------------------------------------------------------------------
function createCustomTargetFfda(sTargetSchema, elCustomTarget, dataSource) {
  setContext('customTargetUuidGen_' + sTargetSchema)
  var sg = new StringGroup("nms:core");
  var schema = application.getSchema(sTargetSchema);
  if (!schema)
    logError(sg.schemaNotFound(sTargetSchema));

  var sCustomNS = String(elCustomTarget.@schemaNamespace);
  if( sCustomNS === 'nms' || sCustomNS === 'ncm' || sCustomNS === 'nl' ||
      sCustomNS === 'crm' || sCustomNS === 'xxl' || sCustomNS === 'xtk' )
    sCustomNS = String(elCustomTarget.@schemaExtNamespace);

  if( sCustomNS === '' )
    sCustomNS = String('cus');

  var pckDesc = <pkgDesc>
      <package buildNumber="*">
        <entities schema='xtk:srcSchema'>
        </entities>
      </package>
    </pkgDesc>;

  // Track schemas created during mapping creation. This would be used later
  // to grant privileges to SF mid user.
  var deployedBroadLogSchema = "";
  var deployedTrackingLogSchema = "";
  var deployedPropositionSchema = "";
  var bMobileApp = NL.XTK.parseBoolean(elCustomTarget.@mobileApp);
  if( !bMobileApp ) {
    // broadlog schema
    pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, true,
                                            elCustomTarget.broadLogSchema, schema, "broadLog", sg.broadLogLabel(schema.label)));
    deployedBroadLogSchema = String(elCustomTarget.@schemaNamespace) + ":broadLog" + String(elCustomTarget.@schemaSuffix);

    // excluded broadlog schema
    if( parseInt(elCustomTarget.@exclusionType)==2 &&
        (!application.getSchema(String(elCustomTarget.@schemaNamespace) + ":excludeLog" + String(elCustomTarget.@schemaSuffix)) ||
         NL.XTK.parseBoolean(elCustomTarget.@excludeExtension)) )
      pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, true,
                                                NL.XTK.parseBoolean(elCustomTarget.@excludeExtension) ? elCustomTarget.broadLogSchema : null,
                                                schema, "excludeLog", sg.exclLogLabel(schema.label)));

    // trackinglog schema
    if( NL.XTK.parseBoolean(elCustomTarget.@tracking, true) ) {
      pckDesc.package.entities[0].appendChild(trackingLogSchema(sCustomNS, sg, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, 
                                                true, false, elCustomTarget.trackingLogSchema, schema, sg.trackingLabel(schema.label), schema.name));
      deployedTrackingLogSchema = String(elCustomTarget.@schemaNamespace) + ":trackingLog" + String(elCustomTarget.@schemaSuffix);
    }
  }

  if( bMobileApp &&
      !application.getSchema(String(elCustomTarget.@schemaNamespace) + ":broadLogAppSub" + String(elCustomTarget.@schemaSuffix)) ) {
    var appSubSchema = null;
    var sRecipientLink = null;
    var sRealTargetSchema = null;

    if( String(elCustomTarget.@appSubSchema)==="" )
    {
      pckDesc.package.entities[0].appendChild(mobileAppSubSchema(sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix,
                                              true, elCustomTarget.appSubscriptionSchema, schema, sg.mobileAppSubLabel(schema.label)));
      sRecipientLink = schema.name;
      appSubSchema = { id: String(elCustomTarget.@schemaNamespace) + ":appSubscription" + String(elCustomTarget.@schemaSuffix),
                       namespace: String(elCustomTarget.@schemaNamespace),
                       name: "appSubscription" + String(elCustomTarget.@schemaSuffix),
                       label: sg.mobileAppSubLabel(schema.label),
                       dataSource: dataSource
                     };
      sRealTargetSchema = sTargetSchema; 

    } else {
      appSubSchema = application.getSchema(String(elCustomTarget.@appSubSchema));
      for each(var child in appSubSchema.root.children) {
        if( child.isLink && child.target.schema.id === schema.id )
          sRecipientLink = child.name;
      }
      sRealTargetSchema = String(elCustomTarget.@targetSchema);
    }

    var realTargetSchema = application.getSchema(sRealTargetSchema);
    pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace),
                                              "AppSub"+String(elCustomTarget.@schemaSuffix), true, null,
                                              appSubSchema, "broadLog", sg.broadLogLabel(appSubSchema.label),
                                              "appSubscription",
                                              [ realTargetSchema, application.getSchema("xxl:nmsServiceXl") ]));
    deployedBroadLogSchema = String(elCustomTarget.@schemaNamespace) + ":broadLogAppSub" + String(elCustomTarget.@schemaSuffix);
    pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace),
                                              "AppSub"+String(elCustomTarget.@schemaSuffix), true, null,
                                              appSubSchema, "excludeLog", sg.exclLogLabel(appSubSchema.label),
                                              "appSubscription",
                                              [ realTargetSchema, application.getSchema("xxl:nmsServiceXl") ]));

    if( NL.XTK.parseBoolean(elCustomTarget.@tracking) ) {
      pckDesc.package.entities[0].appendChild(trackingLogSchema(sCustomNS, sg, String(elCustomTarget.@schemaNamespace),
                                              "AppSub"+String(elCustomTarget.@schemaSuffix), true, true, elCustomTarget.trackingLogSchema,
                                              appSubSchema, sg.trackingLabel(appSubSchema.label), "appSubscription", 
                                              [ realTargetSchema ]));
      deployedTrackingLogSchema = String(elCustomTarget.@schemaNamespace) + ":trackingLogAppSub" + String(elCustomTarget.@schemaSuffix);
    }

    //create custom filters
    var fltEntities = <entities schema="xtk:queryFilter"/>
    fltEntities.appendChild(createAppSubCustomFilter(sg, appSubSchema, elCustomTarget.@schemaSuffix,
                                                     "iOS", sg.filterAppSubLabel("iOS (iPhone, iPad)", appSubSchema.label),
                                                     sg.filterAppSubErrorLabel("iOS"), 41, 0));
    fltEntities.appendChild(createAppSubCustomFilter(sg, appSubSchema, elCustomTarget.@schemaSuffix,
                                                     "android", sg.filterAppSubLabel("android", appSubSchema.label),
                                                     sg.filterAppSubErrorLabel("android"), 42, 1));
    pckDesc.package.appendChild(fltEntities);
  }

  // proposition log schema (offer/interation)
  if( NL.XTK.parseBoolean(elCustomTarget.@offer) ) /* || NL.XTK.parseBoolean(elCustomTarget.@reaction) ) */ {
    // 1. Proposition schema
    if( !application.getSchema(String(elCustomTarget.@schemaNamespace) + ":proposition" + String(elCustomTarget.@schemaSuffix)) ||
        NL.XTK.parseBoolean(elCustomTarget.propositionSchema.@_defined) ) {
      pckDesc.package.entities[0].appendChild(propositionSchema(sg, sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, true,
                                              elCustomTarget.propositionSchema, schema, sg.offerLabel(schema.label)));
      deployedPropositionSchema = String(elCustomTarget.@schemaNamespace) + ":proposition" + String(elCustomTarget.@schemaSuffix);
    }

    // 2. Environment, offer spaces, ...
    var xmlOfferEnvQuery =
      <queryDef schema="nms:offerEnv" operation="getIfExists">
        <select>
          <node expr="@id"/>
        </select>
        <where>
          <condition expr={"@name='design"+String(elCustomTarget.@schemaSuffix)+"'"}/>
        </where>
      </queryDef>;
    var offerEnv = xtk.queryDef.create(xmlOfferEnvQuery).ExecuteQuery();
    if( String(offerEnv.@id) === "" )
    {
      var lstEntitities = offerEnvEntities(sg,
                                           elCustomTarget.@schemaNamespace, elCustomTarget.@schemaSuffix,
                                           schema, true);
      for(var iEntity = 0; iEntity < lstEntitities.length; iEntity++)
        pckDesc.package.appendChild(lstEntitities[iEntity]);
    }
  }

  xtk.builder.InstallPackage(pckDesc);
  grantMidPrivilegesFfda(dataSource, deployedBroadLogSchema, deployedTrackingLogSchema, deployedPropositionSchema);
}

function grantMidPrivilegesFfda(dataSource, broadLogSchema, trackingLogSchema, propositionSchema) {
  var sql;

  // We want to avoid insanely complicated coupling of ensuring that the procedure
  // is available (via updating CAMP_PROVISIONER with changes like NEO-34809) at all
  // sites before we make this change. So, as a smoother work-around, we first test
  // if the procedure is available - invoke only if it's available.
  // Once we know all DBs have this procedure (at least the ones that we care about),
  // then we can drop this check.
  sql = "SELECT 1 AS SUPPORTS FROM INFORMATION_SCHEMA.PROCEDURES WHERE PROCEDURE_NAME='GRANT_MID_PRIVILEGES' AND ARGUMENT_SIGNATURE='(BROADLOG_TABLES VARCHAR, TRACKINGLOG_TABLES VARCHAR, PROPOSITION_TABLES VARCHAR)'";
  var res = sqlSelect("rows, @SUPPORTS:long", sql, dataSource);
  var dbSupportsMidGrant = '1'==String(res.rows.@SUPPORTS);

  if( dbSupportsMidGrant ) {
    var broadLogTable = '';
    var trackingLogTable = '';
    var propositionTable = '';

    if( broadLogSchema && broadLogSchema != '' ) {
      broadLogTable = application.getSchema(broadLogSchema).root.SQLTable;
    }
    if( trackingLogSchema && trackingLogSchema != '' ) {
      trackingLogTable = application.getSchema(trackingLogSchema).root.SQLTable;
    }
    if( propositionSchema && propositionSchema != '' ) {
      propositionTable = application.getSchema(propositionSchema).root.SQLTable;
    }
    sql = "CALL GRANT_MID_PRIVILEGES('" + broadLogTable + "', '" + trackingLogTable + "', '" + propositionTable + "')";
    sqlExecOnDataSource(sql, dataSource);
  }
}

//---------------------------------------------------------------------------
// Creates the options linked to the targeting dimension
//---------------------------------------------------------------------------
function createCustomTarget(sTargetSchema, elCustomTarget) {

  setContext('customTargetGen_' + sTargetSchema)
  var sg = new StringGroup("nms:core");
  var schema = application.getSchema(sTargetSchema);
  var sCustomNS = String(elCustomTarget.@schemaNamespace);

  // if custom namespace is an OOTB one, then use the extention namespace instead
  // ref. updDlvMapping.xml
  if( sCustomNS === 'nms' || sCustomNS === 'ncm' || sCustomNS === 'nl' ||
      sCustomNS === 'crm' ||sCustomNS === 'xxl' || sCustomNS === 'xtk' )
    sCustomNS = String(elCustomTarget.@schemaExtNamespace);

  var pckDesc = <pkgDesc>
      <package buildNumber="*">
        <entities schema='xtk:srcSchema'> {
          broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, false,
                         elCustomTarget.broadLogSchema,
                         schema, "broadLog", sg.broadLogLabel(schema.label))
        }
        </entities>
      </package>
    </pkgDesc>;

  if( parseInt(elCustomTarget.@exclusionType)==2 &&
      (!application.getSchema(String(elCustomTarget.@schemaNamespace) + ":excludeLog" + String(elCustomTarget.@schemaSuffix)) ||
       NL.XTK.parseBoolean(elCustomTarget.@excludeExtension)) )
    pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, false,
                                              NL.XTK.parseBoolean(elCustomTarget.@excludeExtension) ? elCustomTarget.broadLogSchema : null,
                                              schema, "excludeLog", sg.exclLogLabel(schema.label)));
  if( NL.XTK.parseBoolean(elCustomTarget.@mobileApp) &&
      !application.getSchema(String(elCustomTarget.@schemaNamespace) + ":broadLogAppSub" + String(elCustomTarget.@schemaSuffix)) ) {
    var appSubSchema = null;
    var sRecipientLink = null;
    if( String(elCustomTarget.@appSubSchema)==="" )
    {
      pckDesc.package.entities[0].appendChild(mobileAppSubSchema(sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix,
                                              false, elCustomTarget.appSubscriptionSchema, schema, sg.mobileAppSubLabel(schema.label)));
      sRecipientLink = schema.name;
      appSubSchema = { id: String(elCustomTarget.@schemaNamespace) + ":appSubscription" + String(elCustomTarget.@schemaSuffix),
                       namespace: String(elCustomTarget.@schemaNamespace),
                       name: "appSubscription" + String(elCustomTarget.@schemaSuffix),
                       label: sg.mobileAppSubLabel(schema.label)
                     };
    } else {
      appSubSchema = application.getSchema(String(elCustomTarget.@appSubSchema));
      for each(var child in appSubSchema.root.children) {
        if( child.isLink && child.target.schema.id === schema.id )
          sRecipientLink = child.name;
      }
    }

    pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace),
                                              "AppSub"+String(elCustomTarget.@schemaSuffix), false, null,
                                              appSubSchema, "broadLog", sg.broadLogLabel(appSubSchema.label),
                                              "appSubscription",
                                              [ schema, application.getSchema("nms:service") ]));
    pckDesc.package.entities[0].appendChild(broadLogSchema(sCustomNS, String(elCustomTarget.@schemaNamespace),
                                              "AppSub"+String(elCustomTarget.@schemaSuffix), false, null,
                                              appSubSchema, "excludeLog", sg.exclLogLabel(appSubSchema.label),
                                              "appSubscription",
                                              [ schema, application.getSchema("nms:service") ]));

    var dlvMapping = deliveryAppSubMapping(elCustomTarget.@schemaNamespace,
                                           elCustomTarget.@schemaSuffix,
                                           sRecipientLink,
                                           appSubSchema.label);
    if( NL.XTK.parseBoolean(elCustomTarget.@tracking) ) {
      pckDesc.package.entities[0].appendChild(trackingLogSchema(sCustomNS, sg, String(elCustomTarget.@schemaNamespace),
                                              "AppSub"+String(elCustomTarget.@schemaSuffix), false, true,elCustomTarget.trackingLogSchema,
                                              appSubSchema, sg.trackingLabel(appSubSchema.label),
                                              "appSubscription", [ schema ]));
      dlvMapping.storage.@trackingLogSchema= String(elCustomTarget.@schemaNamespace) + ':trackingLogAppSub' + String(elCustomTarget.@schemaSuffix);
    }
    pckDesc.package.appendChild(<entities schema="nms:deliveryMapping">
                                    { dlvMapping }
                                </entities>);

    //create custom filters
    var fltEntities = <entities schema="xtk:queryFilter"/>
    fltEntities.appendChild(createAppSubCustomFilter(sg, appSubSchema, elCustomTarget.@schemaSuffix,
                                                     "iOS", sg.filterAppSubLabel("iOS (iPhone, iPad)", appSubSchema.label),
                                                     sg.filterAppSubErrorLabel("iOS"), 41, 0));
    fltEntities.appendChild(createAppSubCustomFilter(sg, appSubSchema, elCustomTarget.@schemaSuffix,
                                                     "android", sg.filterAppSubLabel("android", appSubSchema.label),
                                                     sg.filterAppSubErrorLabel("android"), 42, 1));
    pckDesc.package.appendChild(fltEntities);
  }
  if( NL.XTK.parseBoolean(elCustomTarget.@tracking, false) ) {
    pckDesc.package.entities[0].appendChild(trackingLogSchema(sCustomNS, sg, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, false, false,
                                              elCustomTarget.trackingLogSchema, schema, sg.trackingLabel(schema.label),
                                              schema.name));
    pckDesc.package.appendChild(<entities schema="nms:delivery">
                                    { globalDelivery(sg, elCustomTarget.@schemaSuffix, elCustomTarget.@id, elCustomTarget.@label) }
                                </entities>);
  }
  if( NL.XTK.parseBoolean(elCustomTarget.@offer) || NL.XTK.parseBoolean(elCustomTarget.@reaction) ) {
    // 1. Proposition schema
    if( !application.getSchema(String(elCustomTarget.@schemaNamespace) + ":proposition" + String(elCustomTarget.@schemaSuffix)) ||
        NL.XTK.parseBoolean(elCustomTarget.propositionSchema.@_defined) ) {
      pckDesc.package.entities[0].appendChild(propositionSchema(sg, sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, false,
                                              elCustomTarget.propositionSchema, schema, sg.offerLabel(schema.label)));
    }

    // 2. Environment, offer spaces, ...
    var xmlOfferEnvQuery =
      <queryDef schema="nms:offerEnv" operation="getIfExists">
        <select>
          <node expr="@id"/>
        </select>
        <where>
          <condition expr={"@name='design"+String(elCustomTarget.@schemaSuffix)+"'"}/>
        </where>
      </queryDef>;
    var offerEnv = xtk.queryDef.create(xmlOfferEnvQuery).ExecuteQuery();
    if( String(offerEnv.@id) === "" )
    {
      var lstEntitities = offerEnvEntities(sg,
                                           elCustomTarget.@schemaNamespace, elCustomTarget.@schemaSuffix,
                                           schema, false);
      for(var iEntity = 0; iEntity < lstEntitities.length; iEntity++)
        pckDesc.package.appendChild(lstEntitities[iEntity]);
    }
  }

  if( NL.XTK.parseBoolean(elCustomTarget.@reaction) &&
      (!application.getSchema(sCustomNS + ":remaMatch" + String(elCustomTarget.@schemaSuffix)) ||
       NL.XTK.parseBoolean(elCustomTarget.reactionSchema.@_defined)) ) {
    pckDesc.package.entities[0].appendChild(reactionSchema(sg, sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix, elCustomTarget.reactionSchema, schema));
    if( String(elCustomTarget.reactionSchema.element.element.@target)!='' )
      pckDesc.package.appendChild(<entities schema="nms:remaHypothesis">
    <remaHypothesis internalName={sCustomNS + "remaHypothesis" + String(elCustomTarget.@schemaSuffix)} isModel="1"
                    label={sg.remaHypothesisLabel(sCustomNS + "remaHypothesis" + String(elCustomTarget.@schemaSuffix))} messageType="127">
      <context recipientLink="recipient" schema={String(elCustomTarget.reactionSchema.element.element.@target)} xpathAmount="@amount"
               xpathDate="@date" remaMatchStorage={String(elCustomTarget.@schemaNamespace) + ":remaMatchRcp" + String(elCustomTarget.@schemaSuffi)}/>
      <execution startDelay="432000" endDelay="2160000"/>
      <folder _operation="none" name="nmsRemaHypothesisModel"/>
    </remaHypothesis>
    </entities>);
  }
  if( NL.XTK.parseBoolean(elCustomTarget.@survey) &&
      (!application.getSchema(String(elCustomTarget.@schemaNamespace) + ":webAppLog" + String(elCustomTarget.@schemaSuffix)) ||
       NL.XTK.parseBoolean(elCustomTarget.webAppLogSchema.@_defined)) )
    pckDesc.package.entities[0].appendChild(surveyLogSchema(sg, sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix,
                                                            elCustomTarget.webAppLogSchema, schema, sg.surveyLabel(schema.label)));
  if( NL.XTK.parseBoolean(elCustomTarget.@valid) &&
      !application.getSchema(String(elCustomTarget.@schemaNamespace) + ":localValidation" + String(elCustomTarget.@schemaSuffix)) )
    pckDesc.package.entities[0].appendChild(validationLogSchema(elCustomTarget.@schemaNamespace, elCustomTarget.@schemaSuffix,
                                                                schema, sg.validLabel(schema.label)));

  if( NL.XTK.parseBoolean(elCustomTarget.@campaignAggregate) ) {
    var iAliasGen = 0;
    toArray(elCustomTarget.groupBy.node).map(function(item) {
      if( String(item.@alias)==="" )
        item.@alias = (String(item.@expr).indexOf("@")>=0 ? "@alias" : "alias") + String(++iAliasGen);
    });

    var docBLSchema = <schema name={'broadLog' + String(elCustomTarget.@schemaSuffix)}
                              namespace={String(elCustomTarget.@schemaNamespace)}
                              mappingType='sql'>
                        { String(elCustomTarget.@schemaNamespace) !== String(elCustomTarget.@schemaExtNamespace) ?
                            getSchema(String(elCustomTarget.@schemaNamespace)+':broadLog'+String(elCustomTarget.@schemaSuffix)).enumeration :
                            ''}
                        <element name={'broadLog' + String(elCustomTarget.@schemaSuffix)}
                                 sqltable={String(elCustomTarget.@schemaNamespace) + 'BroadLog' + String(elCustomTarget.@schemaSuffix)}>
                          <element name={schema.name} label={schema.label} type='link' target={schema.id} />
                          { String(elCustomTarget.@schemaNamespace) !== String(elCustomTarget.@schemaExtNamespace) ?
                              getSchema(String(elCustomTarget.@schemaNamespace)+':broadLog'+String(elCustomTarget.@schemaSuffix)).element.* :
                              getSchema('nms:broadLog').element.*}
                          {elCustomTarget.broadLogSchema.element.attribute}
                        </element>
                      </schema>

    registerSchema(String(elCustomTarget.@schemaNamespace) + ':broadLog' + String(elCustomTarget.@schemaSuffix),
                   docBLSchema, false);
    rBroadLogSchema = application.getSchema(String(elCustomTarget.@schemaNamespace) + ':broadLog' + String(elCustomTarget.@schemaSuffix));
    var aggregateSchema = createCampaignAggregateSchema(sCustomNS,
                                                        elCustomTarget.@schemaSuffix,
                                                        rBroadLogSchema,
                                                        elCustomTarget.groupBy,
                                                        sg.campaignAggregateSchemaLabel(schema.label));
    pckDesc.package.entities[0].appendChild(aggregateSchema);
    pckDesc.package.appendChild(createCampaignAggregates(sg, schema, rBroadLogSchema,
                                    sCustomNS, String(elCustomTarget.@schemaNamespace), elCustomTarget.@schemaSuffix,
                                    elCustomTarget.@planning, elCustomTarget.@retention,
                                    elCustomTarget.groupBy,
                                    NL.XTK.parseBoolean(elCustomTarget.@reaction) ?
                                      elCustomTarget.hypothesisFilter.where : null));
    // Addition of the campaign cube
    var cube = createCampaignCube(sCustomNS, elCustomTarget.@schemaSuffix, aggregateSchema, campaignMeasures(sg));
    var elemCubeEntity = <entities schema="xtk:olapCube"/>
    elemCubeEntity.appendChild(cube);
    pckDesc.package.appendChild(elemCubeEntity);

    var elemReportsEntities = createCampaignReports(sCustomNS, String(elCustomTarget.@schemaSuffix), cube, campaignMeasures(sg));
    pckDesc.package.appendChild(elemReportsEntities);
  }

  xtk.builder.InstallPackage(pckDesc);
}

//---------------------------------------------------------------------------
// Creates the options linked to the targeting dimension
//---------------------------------------------------------------------------
function nms_deliveryMapping_CreateCustomTarget(sTargetSchema, elCustomTarget) {
  // kludge to keep FFDA target mapping as much as simple
  var isFfda = false;
  if( application.hasPackage("xxl:fullfdaCommon") )
  {
    var schema = application.getSchema(sTargetSchema);
    var dataSource = schema.root.dataSource;
    isFfda = dataSource && NL.String.startsWith(dataSource.toLowerCase(), 'nms:extaccount');
  }
  if( isFfda )
    return createCustomTargetFfda(sTargetSchema, elCustomTarget, dataSource);
  else
    return createCustomTarget(sTargetSchema, elCustomTarget);
}

//---------------------------------------------------------------------------
// Creates / Update the options linked to the targeting dimension
//---------------------------------------------------------------------------
function nms_deliveryMapping_UpdateCustomTarget(elOldCustomTarget, elCustomTarget) {
  var bHasChanged = String(elOldCustomTarget.@schemaNamespace)!==String(elCustomTarget.@schemaNamespace) ||
                    String(elOldCustomTarget.@schemaSuffix)!==String(elCustomTarget.@schemaSuffix);

  bHasChanged = bHasChanged ||
                ( (parseInt(elCustomTarget.@exclusionType)==2) &&
                  (parseInt(elOldCustomTarget.@exclusionType)!=2) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@tracking) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@tracking) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@useDeviceIp) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@useDeviceIp) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@mobileApp) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@mobileApp) ) ||
                ( String(elCustomTarget.@appSubSchema) !== String(elOldCustomTarget.@appSubSchema) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@offer) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@offer) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@reaction) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@reaction) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@survey) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@survey) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@valid) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@valid) );

  bHasChanged = bHasChanged ||
                ( NL.XTK.parseBoolean(elCustomTarget.@campaignAggregate) &&
                  !NL.XTK.parseBoolean(elOldCustomTarget.@campaignAggregate) ) ||
                Number(elCustomTarget.@retention) !== Number(elOldCustomTarget.@retention) ||
                String(elCustomTarget.@planning) !== String(elOldCustomTarget.@planning) ||
                ((escapeJS(elCustomTarget.groupBy.toXMLString())+';')  !== elOldCustomTarget.groupBy.text().substring(22)) ||
                ((escapeJS(elCustomTarget.hypothesisFilter.where.toXMLString())+';') !== String(elOldCustomTarget.hypothesisFilter.where).substring(31)) ;

  if( bHasChanged )
    return createCustomTarget(elCustomTarget.@schema, elCustomTarget);
  return;
}

//---------------------------------------------------------------------------
// Creates the options linked to the targeting dimension
//---------------------------------------------------------------------------
function nms_deliveryMapping_UpdateCustomAggregate(elCustomTarget) {

  var iAliasGen = 0;
  toArray(elCustomTarget.select.node).map(function(item) {
    if( String(item.@alias)==="" )
      item.@alias = (String(item.@expr).indexOf("@")>=0 ? "@alias" : "alias") + String(++iAliasGen);
  });

  var sg = new StringGroup('nms:core');

  var sCustomNS = String(elCustomTarget.@schemaNamespace);
  var sCustomSuffix = String(elCustomTarget.@schemaSuffix);
  if( String(elCustomTarget.@aggrSchema)!='' ) {
    var aSchemaDesc = String(elCustomTarget.@aggrSchema).split(':');
    sCustomNS = aSchemaDesc[0];
    sCustomSuffix = aSchemaDesc[1].substr('dlvAggregate'.length);
  }
  var aggregateSchema = createCampaignAggregateSchema(sCustomNS,
                                                      sCustomSuffix,
                                                      application.getSchema(String(elCustomTarget.@broadLogSchema)),
                                                      elCustomTarget.select,
                                                      sg.campaignAggregateSchemaLabel(application.getSchema(String(elCustomTarget.@targetSchema)).label));
  var wkfAggregates = createCampaignAggregates(sg,
                                    application.getSchema(String(elCustomTarget.@targetSchema)),
                                    application.getSchema(String(elCustomTarget.@broadLogSchema)),
                                    sCustomNS, sCustomNS, sCustomSuffix,
                                    elCustomTarget.@planning, elCustomTarget.@retention,
                                    elCustomTarget.select,
                                    NL.XTK.parseBoolean(elCustomTarget.@reaction) ?
                                      elCustomTarget.hypothesisFilter.where : null);
  // Addition of the campaign cube
  var cube = createCampaignCube(sCustomNS,
                                sCustomSuffix,
                                aggregateSchema, campaignMeasures(sg));

  var elemReportsEntities = createCampaignReports(sCustomNS,
                                                  sCustomSuffix,
                                                  cube, campaignMeasures(sg));

  var pckDesc = <pkgDesc>
      <package buildNumber="*">
        <entities schema='xtk:srcSchema'>{aggregateSchema}</entities>
        {wkfAggregates}
        <entities schema="xtk:olapCube">{cube}</entities>
      </package>
    </pkgDesc>;

  xtk.builder.InstallPackage(pckDesc);
  xtk.builder.InstallPackage(<pkgDesc><package buildNumber="*">{elemReportsEntities}</package></pkgDesc>);
}

//---------------------------------------------------------------------------
// Preview of extracted file
//---------------------------------------------------------------------------
function nms_delivery_PreviewExtraction(strFileName, iNbLines)
{
  var strResult = ""
  if (strFileName != "")
  {
    var iCounter = 0
    var f = new File(strFileName)
    f.open("r"/*, File.CODEPAGE_UTF8*/)
    var strLine
    while( (strLine = f.readln())!==null && iCounter++ < iNbLines )
      strResult += strLine+'\n'

    f.close()
  }

  return strResult
}