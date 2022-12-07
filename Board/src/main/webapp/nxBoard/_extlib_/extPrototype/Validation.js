/**
*  정합성 체크 공통함수
*  @FileName 	Validation.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   	validation check
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀  	        Validation 등록 방식을 User property에서 
                                                script 방식으로 변경
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/************************************************************************************************
* 정합성 check 공통 기능
************************************************************************************************/
/**
 * Validation 체크 실행
 * @param {Object} oComp : Validation Check 대상 컴포넌트(Div, Tab, Grid)
 * @return {Boolean} true/false
 * @example  this.gfnValidation(oComp)
 */
pForm.gfnValidation = function(obj)
{
//trace(obj instanceof Form);
	if (obj instanceof Form)
	{
		var bRtn = this.gfnSingleValidation(obj);
		return bRtn;
	}
	else 
	{
		var arrComponent = [];
		var nLength = 0;
		
		if( obj instanceof Div)
		{
			arrComponent = obj.form.components;
			nLength = arrComponent.length;
			for( var i=0; i<nLength; i++)
			{
				var nRtn = this.gfnValidation(arrComponent[i]);
				if( nRtn != true )
				{
					arrComponent[i].setFocus();
					return false;
				}
			}
		}
		else if( obj instanceof Tab)
		{
			var arrPage = obj.tabpages;
			nLength = arrComponent.arrPage;
			for( var i=0; i<nLength; i++)
			{
				arrComponent = arrPage[i].form.components;
				for( var j=0; j<arrComponent.length; j++)
				{
					this.gfnValidation(arrComponent[j]);
				}
			}
		}
		else if( obj instanceof Grid)
		{
			var nRtn = this.gfnIsValidGrid(obj);
			if(nRtn!=true){
				return false;
			}
		}
		else 
		{		
			if( this.gfnIsNull(obj.validate) )
			{
				return true;
			}
			else
			{
				var nRtn = this.gfnIsValidComp(obj);
				if(nRtn != true)
				{
					alert(nRtn);
					return nRtn;
				} 
			}
		}
		return true;		
	}

};
/**
 * Validation 체크 실행
 * @param {Object} oComp : Validation Check 대상 컴포넌트(Div, Tab, Grid이외외 폼 컴포넌트)
 * @return {Boolean} true/false
 * @example  this.gfnSingleValidation(this)
 */
pForm.gfnSingleValidation = function(obj)
{
	var arrComponent = [];
	var nLength = 0;
	arrComponent = obj.components;
	nLength = arrComponent.length;	
	for( var i=0; i<nLength; i++)
	{
		if( !(arrComponent[i] instanceof Div) && !(arrComponent[i] instanceof Tab) && !(arrComponent[i] instanceof Grid) ) 
		{
			if( !this.gfnIsNull(arrComponent[i].validate) )
			{
				var nRtn = this.gfnIsValidComp(arrComponent[i]);
				if(nRtn != true)
				{
					alert(nRtn);
					arrComponent[i].setFocus();
					return false;
				} 
			}				
		}
	}	
	return true;
};
/**
 * 컴포넌트단위 Validation 체크.
 * @param {Object} oComp : Validation Check 대상 컴포넌트
 * @return {Boolean} true/false
 * @example  isValidComp(oComp)
 */
pForm.gfnIsValidComp = function(oComp)
{
	var sValidExpr = oComp.validate;
	if (sValidExpr && oComp.visible && oComp.enable)
	{
		var sPropType = oComp instanceof Calendar ? "text" : "value";
		var rtn = this._checkValidationExpr(oComp, sValidExpr, sPropType);
		if ( rtn != true)
		{
			return rtn;
		}
	}
	return true;
};

/**
* validation express 
* @param  oComp			체크 대상 Object
* @param  sValidExpr	Check 항목(","로 구분)
* @param  sPropType		Object 속성 확인(value/text)
* @example  _checkValidationExpr(oComp, sValidExpr, sPropType)
*/
pForm._checkValidationExpr = function(oComp, sValidExpr, sPropType) 
{
	var sValue;
	var aValidExpr = sValidExpr.split(",");
	if (aValidExpr.length < 2) return true;

	// 유효성체크 메시지 처리시 사용될 타이틀 처리
	var aItems 	= aValidExpr[0].split(":");
	var sTitle 	= aItems[1];

	if (oComp instanceof ImageViewer)
	{
		sValue = oComp.image;
	}
	else if (sPropType == "value")
	{
		sValue = oComp.value;
	}
	else
	{
		sValue = String(oComp.text).replace(/[-.\/]/g, ""); // for date mask
	}

	for (var j=1; j<aValidExpr.length; j++)
	{
		var oRtnVal = this._checkValidation(oComp, aValidExpr[j], sTitle, sValue);
		if (oRtnVal != true)
		{
			return oRtnVal;
		}
	}
	return true;
};

/**
 * Check 항목에 대한 Object의 Value 확인.
 * @param {Grid} objGrd : Validation 체크 대상 Grid
 * @param {Boolean} bAll : true(전체Row), false(default : undefined)
 * @return  {Boolean} true/false
 * @example  isValidGrid(objGrd)
 */
pForm.gfnIsValidGrid = function(oGrid)
{

	var pThis = this; 
	
	var sValidate = oGrid.validate;
	if (this.gfnIsNull(oGrid.validate)) return true; 	//validate가 있는지 chkeck
	
	var aColExpr  = sValidate.split("|"); 				//col단위로 자르기
	
	var oValidDs  = pThis.objects[oGrid.binddataset];	//grid의 bindDataset
	var nRowCnt = oValidDs.getRowCount();				//dataset의 rowCnt
	var nColCnt = oValidDs.getColCount();
	
	for( var i=0; i<nRowCnt; i++)
	{
		for( var j=0; j<nColCnt; j++)
		{	
			var sDsColId = oValidDs.getColID(j); 
			var sValue   = oValidDs.getColumn(i,j);
			for( var n=0; n<aColExpr.length; n++)
			{
				var aValidExpr = aColExpr[n].split(",");
				var aColId = aValidExpr[0].split(":"); //첫번째 colID
				var sColId = aColId[1];
				var aTitle = aValidExpr[1].split(":"); //두번째 title
				var sTitle = aTitle[1];
				
				if(sDsColId == sColId)
				{
					for( var k=2; k < aValidExpr.length; k++)
					{
						var oRtnVal = this._checkValidation(oValidDs,aValidExpr[k],sTitle,sValue);
						if (oRtnVal != true)
						{
							var nRow = i+1;
							var nIndex = oGrid.getBindCellIndex( "body", sDsColId);
							var nCol = nIndex+1;
							alert( nRow +"행 " + nCol +"열의 " + oRtnVal);
							oGrid.setFocus();
							oGrid.setCellPos(nIndex); 
							oValidDs.set_rowposition(i); 
							oGrid.showEditor(true); 
							return false;
						}
					}
				}
			}
			
		}
	}
	return true;
};

/**
* check the validation about valid expression(integrated about common components & grid)
* @param oComp		target component
* @param sValidExpr validation expression
* @param sTitle		message title
* @param oValue		message title
* @param oOptional	extra setup option
* @return  true/string(Message)
* @example  _checkValidation(oComp, sValidExpr, sTitle, oValue, oOptional)
*/
pForm._checkValidation = function(oComp, sValidExpr, sTitle, oValue, oOptional)
{
	if (!oOptional) oOptional = {};
	
	var oRtnVal     = true;
	var aValidExpr 	= sValidExpr.split(":");
	var nRowPos		= oOptional;

	switch(aValidExpr[0])
	{
		case "required" :
			if (this.gfnIsNull(this.gfnTrim(oValue)))
			{
				if (aValidExpr[1] == "true")
				{
					oRtnVal = sTitle + "은(는) 필수입력 항목입니다.";
					return oRtnVal;
				}
			}
			break;
		case "digits" :
			if (this.gfnIsDigit(oValue)==false)
			{
				oRtnVal = sTitle + "은(는) 숫자 입력 항목입니다.";
				return oRtnVal;
			}
			break;

		case "date" :
			if (!this.gfnIsNull(this.gfnTrim(oValue)))
			{
				if (!this.gfnIsDate(oValue))
				{
					oRtnVal = sTitle + "은(는) 정확한 날짜를 입력하십시요.";
					return oRtnVal;
				}
			}
			break;

		case "max" :
			if (parseInt(oValue) > parseInt(aValidExpr[1]))
			{
				oRtnVal = sTitle + " 값의 최대값은 " + aValidExpr[1] + "입니다.";
				return oRtnVal;
			}
			break;

		case "min" :
			if (parseInt(oValue) < parseInt(aValidExpr[1]))
			{
				oRtnVal = sTitle + " 값의 최소값은 " + aValidExpr[1] + "입니다.";
				return oRtnVal;
			}
			break;

		case "maxlength" :
			if (!this.gfnIsNull(oValue))
			{
				if (oValue.length > parseInt(aValidExpr[1]))
				{
					oRtnVal = sTitle + " 최대 길이는 " + aValidExpr[1] + "입니다.";
					return oRtnVal;
				}
			}
			break;

		case "minlength" :
			if(!this.gfnIsNull(oValue))
			{
				if (oValue.length < parseInt(aValidExpr[1]))
				{
					oRtnVal = sTitle + " 최소 길이는 " + aValidExpr[1] + "입니다.";
					return oRtnVal;
				}
			}
			break;
			
		default :
			oRtnVal = "Validation Items[ " + aValidExpr[0] + " ]이 명확하지 않습니다.";
			return oRtnVal;
			break;
	}

	return oRtnVal;
};


/************************************************************************************************
* Validation function List
************************************************************************************************/

/**
 * @class 숫자체크 <br>
 * @param {String} sValue
 * @return {Boolean}
 */
pForm.gfnIsDigit = function(sNum)
{
	var c;
	var point_cnt=0;
	var ret=true;

	if ( this.gfnIsNull(sNum) )	return false;

	for (var i=0; i<sNum.length; i++)
	{
		c = sNum.charAt(i);
		if (i == 0 && (c == "+" || c == "-"));
		else if (c >= "0" && c <= "9");
		else if (c == ".")
		{
			point_cnt++;
			if ( point_cnt > 1 )
			{
				ret = false;
				break;
			}
		}
		else
		{
			ret = false;
			break;
		}
	}
	return ret;
};

/**
 * @class 숫자포함여부 체크 <br> 문자열중에 숫자가 있으면 True반환
 * @param {String} sValue
 * @return {Boolean}
 */
pForm.gfnIsDigit2 = function(sNum)
{
	var ret = false;
	var s = sNum ;                 //체크할 문자
	var chkStyle = /\d/ ;      //체크 방식(숫자)
	if(chkStyle.test(s)){
		ret = true; //숫자인 경우
	}
	return ret;
};
/**
 * @class 한글만으로 되어 있는지 Check한다. <br>
 * @param {String} strValue
 * @return {Boolean}
 */
pForm.gfnIsKoreanChar = function(strValue)
{
	var retVal = true;
	
	for (i = 0; i < strValue.length; i++){
		if (!((strValue.charCodeAt(i) > 0x3130 && strValue.charCodeAt(i) < 0x318F) || (strValue.charCodeAt(i) >= 0xAC00 && strValue.charCodeAt(i) <= 0xD7A3))){
			retVal = false;
		}
	}
	
	return retVal;
};

/**
 * @class 특수문자가 있는지 Check한다. <br>
 * @param {String} strValue
 * @return {Boolean}
 */
pForm.gfnIsSpecialChar = function(strValue)
{
	var retVal = false;
	if(strValue.search(/\W|\s/g) > -1) retVal = true;

	return retVal;
};

/**
 * @class 주민등록번호 여부를 확인한다. <br>
 * @param {String} sJuminNo - 입력문자열(주민번호 13자리)
 * @return {Boolean}
 */
pForm.gfnIsSSN = function(sJuminNo)
{
	var birthYear = this.gfnGetBirthYear(sJuminNo);
	
	birthYear += sJuminNo.substr(0, 2);
	var birthMonth = sJuminNo.substr(2, 2)-1;
	var birthDate = sJuminNo.substr(4, 2);
	var birth = new Date(birthYear, birthMonth, birthDate);

	if ( birth.getYear() % 100 != sJuminNo.substr(0, 2) ||
		birth.getMonth() != birthMonth ||
		birth.getDate() != birthDate) 
	{
		return false;
	}

	// Check Sum 코드의 유효성 검사
	buf = new Array(13);
	for (i = 0; i < 6; i++) buf[i] = parseInt(sJuminNo.charAt(i));
	for (i = 6; i < 13; i++) buf[i] = parseInt(sJuminNo.charAt(i));
	  
	multipliers = [2,3,4,5,6,7,8,9,2,3,4,5];
	for (i = 0, sum = 0; i < 12; i++) sum += (buf[i] *= multipliers[i]);

	if ((11 - (sum % 11)) % 10 != buf[12]) {
		return false;
	}else{
		return true;
	}
};

/**
 * @class 외국인 등록번호 여부를 확인한다. <br>
 * @param {String} strNo - 입력문자열(등록번호13자리)
 * @return {Boolean}
 */
pForm.gfnIsFrnrIdNo = function(strNo)
{
	if (strNo.length != 13 || !isNumber(strNo)) return false;
	
	var month = Number(strNo.substr(2, 2));
	var day	  = Number(strNo.substr(4, 2));
		
	if (month < 1 || month > 12) return false;
	if (day < 1 || day > 31) return false;
	
	var sum = 0;
	var odd = 0;
	var buf = array(13);
	var multipliers = [2,3,4,5,6,7,8,9,2,3,4,5];
	
	for (var i=0; i<13; i++) {
		buf[i] = Number(strNo.charAt(i));
	}
	
	if (buf[11] < 6) return false;
	
	odd = buf[7] * 10 + buf[8];
	if((odd%2) != 0) return false;
	
	for (var i=0; i<12; i++) {
		sum += (buf[i] * multipliers[i]);
	}
	
	sum = 11 - (sum % 11);
	
	if (sum >= 10) sum -= 10;
	sum += 2;
	if (sum >= 10) sum -= 10;
	
	if (buf[12] == sum) {
		return true;
	} else {
		return false;
	}
};

/**
 * @class 사업자 등록번호 여부를 확인한다.
 * @param {String} strCustNo - 입력문자열(등록번호10자리)
 * @return {Boolean}
 */
pForm.gfnIsBzIdNo = function(strCustNo)
{
	if (strCustNo.length != 10) return false;
	else {
		
		var checkID = new Array(1, 3, 7, 1, 3, 7, 1, 3, 5, 1);
		var tmpcustNo, i, chkSum=0, c2, remander;

		for (i=0; i<=7; i++) chkSum += checkID[i] * strCustNo.charAt(i);

		c2 = "0" + (checkID[8] * strCustNo.charAt(8));
		c2 = c2.substring(c2.length - 2, c2.length);

		chkSum += Math.floor(c2.charAt(0)) + Math.floor(c2.charAt(1));

		remander = (10 - (chkSum % 10)) % 10 ;

		if (Math.floor(strCustNo.charAt(9)) == remander) return true; // OK!
		return false;
	}

	return true;
};

/**
 * @class 법인 등록번호 여부를 확인한다. <br>
 * @param {String} strNo - 입력문자열(법인번호13자리)
 * @return {Boolean}
 */
pForm.gfnIsFirmIdNo = function(strNo)
{
	if (strNo.length != 13 || !isNumber(strNo)) return false;
	
	var sum = 0;
	var buf = new Array(13);
	var multipliers = [1,2,1,2,1,2,1,2,1,2,1,2];
	
	for (var i=0; i<13; i++) {
		buf[i] = Number(strNo.charAt(i));
	}
	
	for (var i=0; i<12; i++) {
		sum += (buf[i] * multipliers[i]);
	}
	
	sum = (10 - (sum % 10)) % 10;
	
	if (buf[12] == sum) {
		return true;
	} else {
		return false;
	}
};

/**
 * @class 신용카드번호 여부를 확인한다. <br>
 * @param {String} strNo - 카드번호16자리
 * @return {Boolean}
 */
pForm.gfnIsCardNo = function(strNo)
{
	if (strNo.length < 13 || strNo.length > 19 || !nexacro.isNumeric(strNo)) return false;
	
	var sum = 0;
	var buf = new Array();
	
	for (var i=0; i<strNo.length; i++) {
		buf[i] = Number(strNo.charAt(i));
	}
	
	var temp;
	for (var i=buf.length-1, j=0; i>=0; i--, j++) {
		temp = buf[i] * ((j%2) + 1);
		if (temp >= 10) {
			temp = temp - 9;
		}
		sum += temp;
	}
	
	if ((sum % 10) == 0) {
		return true;
	} else {
		return false;
	}
};

/**
 * @class 이메일 형식에 맞는지 Check한다.
 * @param {String} strValue
 * @return {Boolean}
 */
pForm.gfnIsEmail = function(strValue)
{
	var retVal = false;
	var sTmp = "";
	var sRegExp = "[a-z0-9]+[a-z0-9.,]+@[a-z0-9]+[a-z0-9.,]+\\.[a-z0-9]+";

	var regexp = new RegExp(sRegExp,"ig");
	sTmp = regexp.exec(strValue);

	if (sTmp == null) {
		retVal = false;
	} 
	else {
		if (( sTmp.index == 0 ) && (sTmp[0].length == strValue.length )) {
			retVal = true;
		} else {
			retVal = false;
		}
	}
	return retVal;
};