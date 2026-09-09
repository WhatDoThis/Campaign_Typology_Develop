var DELIVERY_STATE_EDITION           = 0
var DELIVERY_STATE_TARGETPENDING     = 11
var DELIVERY_STATE_TARGETSELECTION   = 12
var DELIVERY_STATE_TARGETARBITRATION = 13
var DELIVERY_STATE_TARGETREADY       = 15
var DELIVERY_STATE_MSGPREPENDING     = 21
var DELIVERY_STATE_PREPARATION       = 22
var DELIVERY_STATE_MESSAGEFINISHED   = 25
var DELIVERY_STATE_PREPAREFAILED     = 37
var DELIVERY_STATE_READY             = 45
var DELIVERY_STATE_DELAYED           = 51
var DELIVERY_STATE_STARTED           = 55
var DELIVERY_STATE_RETRYPENDING      = 61
var DELIVERY_STATE_RETRY             = 62
var DELIVERY_STATE_CANCELPENDING     = 81
var DELIVERY_STATE_CANCEL            = 85
var DELIVERY_STATE_PAUSEPENDING      = 71
var DELIVERY_STATE_PAUSE             = 75
var DELIVERY_STATE_FINISHED          = 95
var DELIVERY_STATE_DELETED           = 100

/**
 * Converts an XTK value to a boolean value with WPP standards
 * #### might be removed once js framework is stable
 **/
function booleanValue(v) {
  var value = String(v).toLowerCase();
  return (value === 'true') || (value === '1') || (value === 'on') ||
         (!isNaN(value) && Number(value) !== 0);
}

/**
 * Converts an XML list into a standard JS array object
 * @param {XMLList} list of items selected
 * @result {Array} list of items selected
 * @TODO  untested
 **/
function toArray(xmlList) {
  var aResult = [];
  for each(xmlItem in xmlList)
    aResult.push(xmlItem);
  return aResult;
}


/**
 * Escapes a string to be inserted in a javascript variable
 * @param {XMLList} list of items selected
 * @result {Array} list of items selected
 * @TODO  untested
 **/
function escapeJS(sValue) {
  return "'" + String(sValue)
                 .replace(/\\/g, '\\\\')
                 .replace(/\'/g, '\\\'')
                 .replace(/\n/g, '') + "'";
}

/**
 * finds the first link between 2 schemas : #### should never be used but ...
 * @param {NLSchema} rSrcSchema source schema
 * @param {NLSchema} rDstSchema destination schema
 * @param {boolean} allow unbound
 **/
function FindLinkOnSchema(rSrcSchema, rDstSchema, bAllowUnbound) {
  for each(var child in rSrcSchema.root.children)
    if( child.isLink && child.target.schema.id === rDstSchema.id &&
        (bAllowUnbound || !child.isUnbound) )
      return child;
  return null;
}

/**
 * Serializes an expression from an XML syntaxic tree using an optionnal parent xpath for fields
 * @param {XML} xmlAST defintion of the expression (result of a parseExprToAST C++ method)
 * @param {string} XPath to apply to all <xpath../> elements while serializing
 * @TODO untested
 **/
function ASTToExpr(xmlAST, sParentXPath) {
  if( !xmlAST )
    return "";
  if( xmlAST.localName()==="expr" )
    return ASTToExpr(xmlAST.*[0], sParentXPath);
  if( xmlAST.localName()==="function" )
    return String(xmlAST.@value) + "(" + ASTToExpr(xmlAST.*[0], sParentXPath) + ")";
  if( xmlAST.localName()==="operator" )
    return ASTToExpr(xmlAST.*[0], sParentXPath) + String(xmlAST.@value) + ASTToExpr(xmlAST.*[1], sParentXPath);
  if( xmlAST.localName()==="xpath" ) {
    var sXPath = String(xmlAST.@value);
    if( sXPath[0]==='[' )
      return NL.XTK.expandXPath(sParentXPath + "/" + sXPath.substring(1, sXPath.length-1));
    return NL.XTK.expandXPath(sParentXPath + "/" + sXPath);
  }
  return NL.XTK.toXTKString(String(xmlAST.@value), String(xmlAST.localName()));
}
