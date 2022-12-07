﻿/**
*  유틸리티 공통함수 
*  @FileName 	Util.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀 	        최초 생성 
*  2021.05.27     	이노다임 개발팀       	    주석 정비
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/************************************************************************************************
* String 및 Util 관련
************************************************************************************************/

/**
 * @class 값이 존재하는지 여부 체크 <br>
 * @param {String} sValue	
 * @return {Boolean} true/false
 * @example
 * var bNull = this.gfnIsNull("aaa");	// false
 */
pForm.gfnIsNull = function(sValue)
{
    if (new String(sValue).valueOf() == "undefined") return true;
    if (sValue == null) return true;
    
    var ChkStr = new String(sValue);

    if (ChkStr == null) return true;
    if (ChkStr.toString().length == 0 ) return true;
    return false;
};

/**
 * @class 입력값을 체크하여 Null인경우 지정한 값을 리턴 <br>
 * @param {String} inVal
 * @param {String} nullVal	- Null인경우 대치값
 * @return {String} 입력값이 Null인경우 지정한값, Null이 아닌경우 입력값
 */
pForm.gfnNvl = function(inVal, nullVal)
{
	if(inVal == null) {
		inVal = nullVal;
	}
	return inVal;
};

/**
 * @class	입력값이 Boolean 값인지 여부를 판별한다.
 * @param 	{object}  판별대상 Object
 * @return 	{boolean} boolean 이면 true 아니면 false 를 리턴한다.
*/
pForm.gfnIsBoolean = function(obj)
{
    var strvalue = obj+"";

    if( strvalue == "true" || strvalue == "false" )
        return true;
    else
        return false;

};

/**
 * @class   Grid에서 expression으로  표현할때 decode 문처럼 사용할 수 있는 기능
 * @param  N/A 
 * @return  {String} varRtnValue - 반환된 무자열
 * @example
 * this.gfnDecode();	
 */
pForm.gfnDecode = function ()
{
	var varRtnValue = null;

	var arrArgument = this.gfnDecode.arguments;
	var varValue = arrArgument[0];
	var bIsDefault = false;
	var nCount = 0;

	if ((arrArgument.length % 2) == 0) 
	{
		nCount = arrArgument.length - 1;
		bIsDefault = true;
	}
	else 
	{
		nCount = arrArgument.length;
		bIsDefault = false;
	}

	for (var i = 1; i < nCount; i += 2) 
	{
		if (varValue == arrArgument[i]) 
		{
			varRtnValue = arrArgument[i + 1];
			i = nCount;
		}
	}

	if (varRtnValue == null && bIsDefault) 
	{
		varRtnValue = arrArgument[arrArgument.length - 1];
	}

	return varRtnValue;
};

/**
 * @class 정규식을 이용한 trim 구현 - 문자열 양 옆의 공백 제거 <br>
 * @param {String} sValue - 변경하려는 값
 * @return {String} 문자열
 */
pForm.gfnTrim = function(sValue)
{
    if (this.gfnIsNull(sValue)) return "";
	return nexacro.trim(sValue);
};

/**
 * @class 정규식을 이용한 trim 구현 - 문자열 전체의 공백 제거 <br>
 * @param {String} sValue - 변경하려는 값
 * @return {String} 문자열
*/
pForm.gfnAllTrim = function(sValue)
{
    var objValue = new String(sValue);
    var sRtnValue="";
    var i;

    if ( sValue != null ) {
        for ( var i = 0; i < objValue.length; i++ ) {
            if ( objValue.charAt(i) != " " ) {
                sRtnValue = sRtnValue + objValue.charAt(i);
            }
        }
    } else {
        return -1;
    }
    
    return sRtnValue;
};

/**
 * @class 문자열의 좌측부터 지정한 길이만큼 가져오는 함수
 * @param {String} sOrg - 원본 문자열
 * @param {Number} nSize - 얻어올 크기. [Default Value = 0]
 * @return {String} 문자열
 */
pForm.gfnLeft = function (sOrg, nSize)
{
	return new String(sOrg).substr(0, nSize);
}

/**
 * @class 문자열의 우측부터 지정한 길이만큼 가져오는 함수 <br>
 * @param {String} sOrg - 원본 문자열
 * @param {Number} nSize - 출력될 문자열의 길이
 * @return {String} 결과값
 */
pForm.gfnRight = function(sOrg, nSize)
{
	if ( this.gfnIsNull(sOrg) || this.gfnIsNull(nSize) )	return "";

	if ( sOrg.length < nSize )
		return sOrg;
	else
		return sOrg.substr(sOrg.length-nSize, nSize);
};

/**
 * @class 문자 전체 길이를 계산
 * @param {String} sVal - 문자열
                   - 문자, 숫자, 특수문자 : 1 로 Count
                   - 그외 한글/한자 : 2 로 count 되어 합산 
 * @return {Integer} Type에 따라 구해진 길이
 */
pForm.gfnLengthByte = function (sVal)
{
	var lengthByte = 0;

	if (this.gfnIsNull(sVal)) {
		return -1;
	}

	for (var i = 0; i < sVal.length; i++)
	{
		if (sVal.charCodeAt(i) > 127) {
			lengthByte += 2;
		}
		else {
			lengthByte += 1;
		}
	}

	return lengthByte;
}

/**
 * @class 문자열의 위치를 대소문자 구별하여 거꾸로 부터 찾아 첫번째 나온 index 반환<br>
 * @param {String} sOrg - 원래 문자열( 예 : "aaBBbbccBB" )
 * @param {String} sFind - 찾고자 하는 문자열( 예 : "BB" )
 * @param {Number} nStart - 검색 시작위치 (옵션 : Default=문자열의 끝 )
 * @return {Number}
 * @example
 * var nPos = this.gfnPosReverse("aaBBbbccBB", "BB"); <br>
 * 성공 = 찾고자 하는 문자열의 시작위치 ( 예 : 8 ) <br>
 * 실패 = -1 <br>
 */
pForm.gfnPosReverse = function (sOrg, sFind, nStart)
{
	var pos;

	if (this.gfnIsNull(sOrg) || this.gfnIsNull(sFind)) 
	{
		return -1;
	}
	if (this.gfnIsNull(nStart)) 
	{
		nStart = sOrg.length - 1;
	}

	for (pos = nStart; pos >= 0; pos--) 
	{
		if (sOrg.substr(pos, sFind.length) == sFind) 
		{
			break;
		}
	}

	return pos;
};

/**
 * @class 입력받은 Number에 컴마를 추가한다. <br>
 * @param {Number} nNumber - 숫자
 * @param {Number} [nDetail] - 반올림할 소숫점 이하의 자릿수.
 * @return {String} Comma 가 포함하고 있는 숫자
 */
pForm.gfnAppendComma = function(nNumber,nDetail)
{
	if (nNumber == null)	return "";
	if (nDetail	== null)	nDetail	= 0;
	
	nNumber				= parseFloat(nNumber);
	nNumber				= nexacro.round(nNumber, nDetail);
	
	var strNumber		= new String(nNumber);
	var arrNumber		= strNumber.split(".");
	var strFormatNum	= "";
	var j = 0;
	
	for ( i = arrNumber[0].length - 1; i >= 0; i--)
	{
		if (i != strNumber.length && j == 3)
		{
			strFormatNum = arrNumber[0].charAt(i) + "," + strFormatNum;
			j = 0;
		}
		else
		{
			strFormatNum = arrNumber[0].charAt(i) + strFormatNum;
		}
		j++;
	}
	
	if (arrNumber.length > 1)	strFormatNum = strFormatNum + "." + arrNumber[1];
	
	return strFormatNum;
};

/**
 * @class 컴마를 제거한다. <br>
 * @param {String} strValue - 컴마가 포함된 스트링
 * @return {String} 컴마가 제거된 스트링이 반환된다.
 */
pForm.gfnRemoveComma = function(strValue)
{
	return strValue.replace(/\,/g, "");
};


/**
* @class 전화번호 형식으로 변경
* @param {String, Number} num type
  - num : '-' 문자가 들어있지않은 숫자로된 전화번호
  - type : 0을 보내면 가운데자리를 숨겨준다
* @return String formatNum
  1. 010-XXXX-XXXX : 11자리 휴대폰번호
  2. 010-XXX-XXXX  : 10자리 휴대폰번호
  3. 02-XXXX-XXXX  : 10자리 서울 전화번호
  4. 031-XXX-XXXX  : 10자리 서울 외 전화번호
  5. 1688-XXXX     : 8자리 업체 번호
**/
pForm.gfnPhoneFomatter = function(num, type) 
{
	//num = num.replace('-', '');
	num = num.replace(/[^0-9]/g, '');
	
	var formatNum = '';
    if(num.length==11){
		if(type==0){            
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');        
        }else{
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } 
    }else if(num.length==9){
		if(type==0){            
            formatNum = num.replace(/(\d{2})(\d{3})(\d{4})/, '$1-****-$3');        
        }else{
            formatNum = num.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
        } 
    }else if(num.length==8){
		formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
    }else{
        if(num.indexOf('02')==0){
			if(type==0){
				formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
			}else{
			    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
			} 
		}else{
			if(type==0){
				formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
			}else{
			    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
			}
		}
	}
	
	return formatNum;
};

/**
 * @class 입력 문자열중 숫자값만 남긴다. <br>
 * @param {String} strValue - 입력문자열
 * @return {String} 숫자문자열
 */
pForm.gfnGetDigit = function(strValue)
{
	var regExp = new RegExp("\\D","g");
	var strRet = strValue.replace(regExp,"");

	return strRet;
};

/**
 * @class 특수문자를 제거한다 <br>
 * @param {String} strValue
 * @return {String} 특수문자를 제거한 문자열
 */
pForm.gfnRemoveSpecialChar = function(strValue)
{
   var strSpecial = "~!@#$%^&*-+./=_`{|}()\\?<>";
   
   for (i = 0; i < strValue.length; i++) {
      for (j = 0; j < strSpecial.length; j++) {
        if (strValue.charAt(i) == strSpecial.charAt(j))
	      strValue = strValue.replace(strValue.charAt(i), "");
      }
   }

   return strValue;
};

/** 
 * @class HTML TAG 제거 함수 <br>
 * @param {String} sHtml - 제거대상 문자열
 * @param {String} sTag - 제거할 tag(없으면 전체 tag제거)
 * @return {String}
 * @example
 * var str = this.gfnRemoveHtmlTag("정상적으로<BR>처리되었습니다.");
 */
pForm.gfnRemoveHtmlTag = function(sHtml, sTag)
{
	if(this.gfnIsNull(sTag))
	{
	    sHtml = nexacro.replaceAll(sHtml, "<br>","\n");	
		sHtml = nexacro.replaceAll(sHtml, "<BR>","\n");	
	    var regExp = new RegExp("<(/)?([0-9a-zA-Z]*)(\\s[0-9a-zA-Z]*=[^>]*)?(\\s)*(/)?>","g"); 
	    sHtml = sHtml.replace(regExp, "");
	} 
	else if(sTag.toUpperCase() == "<BR>")
	{
	    sHtml = nexacro.replaceAll(sHtml, "<br>","\n");	
		sHtml = nexacro.replaceAll(sHtml, "<BR>","\n");	
	}
	else
	{
	    sHtml = nexacro.replaceAll(sHtml, sTag.toUpperCase(),"");	
		sHtml = nexacro.replaceAll(sHtml, sTag.toLowerCase(),"");	
	}
	return sHtml;
};

/**
 * @class 배열에 해당 값이 존재하는지 확인한다. <br>
 * @param {Array} arrVal
 * @param {String} varVal - 값
 * @return {Boolean} 배열에 존재여부
 */
pForm.gfnIsExistInArray = function(arrVal, varVal) 
{
	var retVal = false;
	var nCnt = arrVal.length;
	for(var i=0; i<nCnt; i++) {
		if (arrVal[i] == varVal) {
			retVal = true;
			break;
		}
	}

	return retVal;
};

/**
 * @class 입력된 10진수를 16진수로 변환하는 함수 <br>
 * @param {Number} nVal - 10진수
 * @return {String} 16진수 문자열
 */
pForm.gfn10To16 = function(nVal)
{
	var n;
	n = (nVal).toString(16);

	return n;
};

/**
 * @class 입력된 16진수를 10진수로 변환하는 함수
 * @param {String} strVal - 16진수 문자열
 * @return {Number} 10진수 숫자
 */
pForm.gfn16To10 = function(strVal)
{
	var n;
	n = (strVal).toString(10);
	
	return n;
};

/**
* @class 주어진 nexacro 개체의 type 을 반환 <br>
* @param {*} obj Object, Component, Frame, .. 등 nexacro 모든 개체
* @return {String} 개체의 type
* @example
* trace(this.gfnTypeOf(Button00));	// output : Button
* trace(this.gfnTypeOf(Tab00));	// output : Tab
* trace(this.gfnTypeOf(Tab00.tabpage1));	// output : Tabpage
* trace(this.gfnTypeOf(Dataset00));	// output : Dataset
*/
pForm.gfnTypeOf = function(obj)
{
	var type;
	if ( obj && (typeof obj == "object"))
	{
		var s = obj.toString();
		if(s == "[object Object]") return type;
		var nLen = s.length - 9;
		type = s.substr(8, nLen);
	}
	else {
		type = typeof(obj)
	}
	return type;
};

/**
 * @class nexacro Component 여부 Check <br>
 * @param {Object} value - 체크할 Object	
 * @return {boolean}
 */
pForm.gfnIsNexaComponent = function(value) 
{
	if ( value === null || value === undefined  ) return false;
	
	return value instanceof nexacro.Component;
};

 /**
 * @class object의 내용을 trace로 출력
 * @param {Object} objArg - 대상 Object
 * @param {String} [sName]  - key 값
 * @return N/A
 */
pForm.gfnObjView = function (objArg, sName)
{
	for (var name in objArg)
	{
		if (this.gfnIsNull(sName) == false)
		{
			if (name == sName) {
				trace("name : " + name + " / value : " + objArg[name]);
			}
		}
		else {
			trace("name : " + name + " / value : " + objArg[name]);		
		}
	}
};

/**
 * @class   대상에서 오브젝트 반환
 * @param 	{Object} p - 오브젝트를 찾을 대상
 * @param 	{String} name - 오브젝트네임
 * @return  {Object} 오브젝트
 * @example
 * this.gfnLookup(this, "dsList");	
 */
pForm.gfnLookup = function(p, name)
{
	var o;
	while (p)
	{		
		o = p.components;
		if ( o && o[name] ) return o[name];
		
		o = p.objects;
		if ( o && o[name] ) return o[name];
		
		p = p.parent;
	}
	return null;
};

/**
 * @class  지정된 속성의 값이 처음으로 일치하는 객체의 배열 위치를 뒤에서부터 찾아 반환한다.<br>
 * 배열의 각 항목은 하나 이상의 속성을 가진 객체이다.<br> 
 * @param {Array} array 대상 Array.
 * @param {String} prop 기준 속성.
 * @param {String} item 기준 값.
 * @param {Number} from 검색 시작 위치(default: 0).
 * @param {Boolean} strict true: 형변환 없이 비교('==='), false: 형변환 후 비교('==') (default: false).
 * @return {Number} 검색된 배열 위치. 없다면 -1 리턴.
 * @example
 * var users = [];
 * users[0] = {id:"milk", name:"park", age:33};
 * users[1] = {id:"apple", name:"kim"};
 * users[2] = {id:"oops", name:"joo", age:44};
 * users[3] = {id:"beans", name:"lee", age:50};
 * users[4] = {id:"zoo", age:65};
 * users[5] = {id:"milk", name:"", age:33};
 * users[6] = {id:"milk", name:"lee", age:33};
 * var index = this.gfnLastIndexOfProp(users, "name", "lee");
 * trace("index==>" + index);	// output : index==>6
 * var index = this.gfnLastIndexOfProp(users, "name", "lee", 5);
 * trace("index==>" + index);	// output : index==>3
*/
pForm.gfnLastIndexOfProp = function(array, prop, item, from, strict)
{
	var i, obj, 
		propValue;
	
	if (from == null)
	{
		from = array.length - 1;
	}
	else if (from < 0)
	{
		from = Math.max(0, array.length + from);
	}
	
	var strict = strict || false;
	
	if (strict)
	{
		for (i=from; i>=0; i--)
		{
			if (i in array && array[i])
			{
				obj = array[i],
				propValue = obj[prop];
				
				if (propValue === item)
				{
					return i;
				}
			}
		}
	}
	else
	{
		for (i=from; i>=0; i--)
		{
			if (i in array && array[i])
			{
				obj = array[i],
				propValue = obj[prop];
				
				if (propValue == item)
				{
					return i;
				}
			}
		}
	}
	
	return -1;
};


/**
 * @class  원하는 위치의 항목을 배열에서 삭제 처리한다.
 * @param {Array} array remove 대상 Array.
 * @param {Number} index remove하고자 하는 item index.
 * @example
 * var mon = ["Jan","Feb","Mar","Apr"];
 * trace("mon==>" + mon);	// output : mon==>["Jan","Mar","Apr"]
*/
pForm.gfnRemoveAt = function(array, index) 
{
	array.splice(index, 1);
};

/**
 * @class  alphabet character code.
 * charvalue값 => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, a, b, c, d, e, f]
*/
pForm._ALPHA_CHAR_CODES = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102]

/**
 * @class  유일한 ID 를 반환
 * @param {String} prefix id 앞에 붙일 문자열
 * @param {String} separator id 생성시 구분용 문자(default: '-' ).
 * @return {String} id
 * @example
 * trace(this.gfnGetUniqueI()); 
 * // output : 3e52d1f6-f0d2-4970-a590-ba7656b07859
 * 
 * trace(this.gfnGetUniqueI("Button_")); 
 * // output : Button_4e601da1-63f4-4cfa-849b-01b8a7f14d40
 * 
 * trace(this.gfnGetUniqueI("", "_")); 
 * // output : 4e601da1_63f4_4cfa_849b_01b8a7f14d40
 * 
 * trace(this.gfnGetUniqueId("Button_", "_")); 
 * // output : Button_4e601da1_63f4_4cfa_849b_01b8a7f14d40
*/
pForm.gfnGetUniqueId = function(prefix, separator)
{
	if ( this.gfnIsNull(prefix) ) prefix = "";
	if ( this.gfnIsNull(separator) ) {
		separator = 45;
	} else {
		separator = separator.charCodeAt(0);
	}
	
	var pThis = this,
		charcode = this._ALPHA_CHAR_CODES,
		math = Math;
	var seq = 0;
	var seq0;
	var tmpArray = new Array(36);
	var idx = -1;
	
	while (seq < 8) 
	{
		tmpArray[++idx] = charcode[math.random() * 16 | 0];
		seq++;
	}
	seq = 0;
	while (seq < 3) 
	{
		tmpArray[++idx] = separator;//45 => "-", 95=> "_"
		seq0 = 0;
		while (seq0 < 4) 
		{
			tmpArray[++idx] = charcode[math.random() * 16  | 0];
			seq0++;
		}
		seq++;
	}
	tmpArray[++idx] = separator; //45 => "-", 95=> "_"
	
	var tmpStr = (new Date()).getTime();
	tmpStr = ("0000000" + tmpStr.toString(16)).substr(-8);
	seq = 0;
	while (seq < 8) 
	{
		tmpArray[++idx] = tmpStr.charCodeAt(seq);
		seq++;
	}
	seq = 0;
	while (seq < 4) 
	{
		tmpArray[++idx] = charcode[math.random() * 16 | 0];
		seq++;
	}
	return prefix + String.fromCharCode.apply(null, tmpArray);
};

/**
 * @class Component 기준의 XY좌표를 XCompA 기준의 XY좌표로 변환.
 * @param {Object} Component.
 * @param {Array} xy XCompB기준의 XY좌표.
 * @param {Object} XCompB XComponent.
 * @return {Array} XCompA기준의 좌표. [ x좌표, y좌표]
 * @example
 * Form에 아래와 같이 Button00이 존재 할 경우
 *
 * |---------------------------------------------------------|  ^
 * |  Form                                                   |  |
 * |                                                         |  |
 * |                                                         | 300
 * |                                                         |  |
 * |                                     //(0,0)             |  v
 * |                                       *-----------      | 
 * |                                       | Button00 |      | 
 * |                                       ------------      | 
 * |                                                         | 
 * |---------------------------------------------------------| 
 * <--------------- 900 ------------------>	
 *		 
 * trace(this.gfnConvertXY(this,[0,0], Button00)); //output: [900,300]
 * //Button00을 기준으로 한 0,0 좌표는
 * //form 기준으로 했을 때 900, 300이 된다.
*/				
pForm.gfnConvertXY = function(XCompA, xy, XCompB)
{
	var tempX, tempY;
	var x, y;
	if ( XCompB )
	{
		tempX = system.clientToScreenX(XCompB, xy[0]);
		tempY = system.clientToScreenY(XCompB, xy[1]);
		x = system.screenToClientX(XCompA, tempX) + this.gfnGetScrollLeft(XCompA);
		y = system.screenToClientY(XCompA, tempY) + this.gfnGetScrollTop(XCompA);				
	}
	else
	{
		x = xy[0];
		y = xy[1];
	}
	
	return [x, y];
};

/**
 * @class  수평스크롤바의 trackbar 위치를 반환한다.
 * @param  {Object} Component.
 * @return {Number} 수평스크롤바의 trackbar 위치(수평스크롤바가 없을때는 0).
 * @example
 * trace(this.gfnGetScrollLeft(Div01)); //output: 10
 * trace(this.gfnGetScrollLeft(Div01)); //output: 0
*/
pForm.gfnGetScrollLeft = function(XComp)
{
	if(XComp instanceof nexacro.Div){
		XComp = XComp.form;
	}
	return (XComp.hscrollbar && XComp.hscrollbar.visible ? XComp.hscrollbar.pos : 0);
};

/**
 * @class  수직스크롤바의 trackbar 위치를 반환한다.
 * @param  {Object} Component.
 * @return {Number} 수직스크롤바의 trackbar 위치(수직스크롤바가 없을때는 0).
 * @example
 * trace(this.gfnGetScrollTop(Div01)); //output: 20
 * trace(this.gfnGetScrollTop(Div01)); //output: 0
 */
pForm.gfnGetScrollTop = function(XComp)
{
	if(XComp instanceof nexacro.Div){
		XComp = XComp.form;
	}
	return (XComp.vscrollbar && XComp.vscrollbar.visible ? XComp.vscrollbar.pos : 0);
};

/**
 * @class object에 argument로 주어진 object의 모든 속성값을 복사한다.<br>
 * object, function, date, array Type은 reference가 복사된다.
 * @param {Object} tarobject target 객체.
 * @param {Object} srcobject source 객체.
 * @example
 * var target = {};
 * this.gfnCopyProperties(target, {a: 1, b: "2", c: {"A": "3", "B": 4}});
 * for(var p in target)
 * {
 * 	trace(p + ":" + target[p]);
 *	// output : a:1
 *	// output : b:2
 *	// output : c:[object Object]
 * }
*/
pForm.gfnCopyProperties = function(tarobject, srcobject)
{
	if (tarobject && srcobject) 
	{
		var p, value;
		
		for (p in srcobject)
		{
			if (srcobject.hasOwnProperty(p))
			{
				value = srcobject[p];
				tarobject[p] = value;
			}
		}
	}
};	


/**
 * @class  Form 내에서 지정된 접두문자열에 순번이 붙여진 ID 를 반환
 * @param {Object} prefix 순번 앞에 붙일 문자열
 * @param {String} prefix 순번 앞에 붙일 문자열
 * @return {String} id
 * @example
 * // this = Form
 * trace(this.gfnGetSequenceId(this, "Button")); // output : Button0
 * trace(this.gfnGetSequenceId(this, "Button")); // output : Button1
 * // this = Form
 * trace(this.gfnGetSequenceId(this, "chk_")); // output : chk_0
 * trace(this.gfnGetSequenceId(this, "chk_")); // output : chk_1
*/		
pForm.gfnGetSequenceId = function(form, prefix)
{
	if ( this.gfnIsNull(form) ) 
	{
		trace("getSequenceId :: 1st argument doesn't exist !!");
		return null;
	}
	
	if ( this.gfnIsNull(prefix) ) 
	{
		trace("getSequenceId :: 2nd argument doesn't exist !!");
		return null;
	}
	
	if ( !(form instanceof Form) ) 
	{				
		trace("getSequenceId :: 1st argument must be a Form !!");
		return null;
	}
	
	var cache = form._sequenceIdCache;
	if ( this.gfnIsNull(cache) )
	{
		cache = form._sequenceIdCache = {};
	}
	
	var sequence = cache[prefix];
	if ( this.gfnIsNull(sequence) )
	{
		sequence = -1;
	}
	sequence++;
	
	cache[prefix] = sequence;
	
	return prefix + sequence;
};

/**
 * @class object 속성값들을 주어진 함수로 처리한다.<br>
 * 주어진 함수에서 return false를 하면 반복이 멈춘다.
 * @param {Object} object 대상 object.
 * @param {Function} func callback 함수. 
 * @param {String} func.prop object property name.
 * @param {Object} func.val object property value.
 * @param {Object} func.object object 그 자체.
 * @param {Object} scope callback 함수에 대한 수행 scope.
 * @example
 * var datas = {code: "001", userId: "", name: "pete"};
 * this.gfnEach(datas, function(prop, val, object) {
 * 	var result = "";
 * 	if ( !val )
 * 	{
 * 		result = prop + " must have not a non-empty value!"
 * 		st_result03.text += result;
 * 		trace(result);	// output : userId must have not a non-empty value!
 * 		return false;
 * 	}
 * 	result = prop + ":" + val;
 * 	st_result03.text += result + "  ";
 * 	trace(result);	// output : code:001
 * }, this);
*/
pForm.gfnEach = function(object, func, scope)
{
	var p,
		scope = scope || object;
	for (p in object)
	{
		if (object.hasOwnProperty(p))
		{
			if (func.call(scope, p, object[p], object) === false)
			{
				return;
			}
		}
	}
};

/**
 * @class 주어진 Form 을 포함하는 최상위 Form을 찾는다.
 * @param  {Object} curForm 검색 시작 Form.
 * @return {Object} 최상위 Form.
 * @example
 * trace(this.gfnGetTopLevelForm(this));	// output : [object Form]
*/		
pForm.gfnGetTopLevelForm = function(curForm)
{
	var p = curForm;
	while (p && !(p instanceof ChildFrame))
	{
		p = p.parent;
	}
	return p.form;
};

/**
 * @class 지정된 항목이 배열에 포함되어 있는지 확인한다.
 * @param {Array} array 검색 대상 Array.
 * @param {Object} item 찾고자 하는 Item.
 * @param {Boolean} strict true: 형변환 없이 비교('==='), false: 형변환 후 비교('==') (default: false).
 * @return {Boolean} 포함되어 있다면 true, 없다면 false를 리턴.
 * @example
 * var mon = ["Jan","Feb","Mar","Apr"];
 * var contain = this.gfnContains(mon, "Mar");
 * trace("contain==>" + contain);	// output : contain==>true
 * var contain = this.gfnContains(mon, "May");
 * trace("contain==>" + contain);	// output : contain==>false
*/
pForm.gfnContains = function(array, item, strict) 
{
	if (this.gfnIndexOf(array, item, null, strict) === -1) 
	{
		return false;
	}
	else
	{
		return true;
	}
};

/**
 * @class 지정된 항목이 처음 나오는 배열 위치를 반환한다. 
 * @param {Array} array 검색 대상 Array.
 * @param {Object} item 찾고자 하는 Item.
 * @param {Number} from 검색의 시작 위치 (default: 0).
 * @param {Booleans} strict true: 형변환 없이 비교('==='), false: 형변환 후 비교('==') (default: false).
 * @return {Number} 검색된 배열 위치. 없다면 -1 리턴.
 * @example
 * var mon = ["Jan","Feb","Mar","Apr"];
 * var index = this.gfnIndexOf(mon, "Mar");
 * trace("index==>" + index);	// output : index==>2
 * var index = this.gfnIndexOf(mon, "May");
 * trace("index==>" + index);	// output : index==>-1
*/
pForm.gfnIndexOf = function(array, item, from, strict) 
{
	var len = array.length;
	if ( from == null ) from = 0;;
	strict == !!strict;
	from = (from < 0) ? Math.ceil(from) : Math.floor(from);
	if (from < 0)
	{
		from += len;
	}
	
	if (strict)
	{
		for (; from < len; from++) 
		{
			if ( array[from] === item)
			{
				return from;
			}
		}
	}
	else
	{
		for (; from < len; from++) 
		{
			if ( array[from] == item)
			{
				return from;
			}
		}
	}
	
	return -1;
};


/************************************************************************************************
* Dataset 관련 Util
************************************************************************************************/

 /**
 * @class 컨트롤이 Dataset에 bind되어 있을 경우 즉시 value를 Dataset에 적용시킨다.
 * @return N/A
 */   
pForm.gfnUpdateToDataset = function()
{
	var objComp = this.getFocus();
	
	if (objComp != null) 
	{
		try 
		{
			objComp.updateToDataset();
		}
		catch (e) 
		{
		}
	}
};

 /**
 * @class dataSet의 Row 중에서 변경된 내용이 있는지 여부
 * @param {Object} objDs - 확인 대상 Dataset
 * @return {boolean}
 */   
pForm.gfnDsIsUpdated = function (objDs)
{
	if (objDs.getDeletedRowCount() > 0) 
	{
		return true;
	}
	
	for(var i = 0 ; i < objDs.getRowCount() ; i++)
	{
		if(objDs.getRowType(i) == 2 || objDs.getRowType(i) == 4 || objDs.getRowType(i) == 8)
		{
			return true;
		}
	}
	return false;
};

 /**
 * @class dataSet의 Row가 변경되었는지 판단하는 함수
 * @param {Object} ObjDs - 대상 dataset
 * @param {Number} nRow - row값
 * @return {boolean}
 */   
pForm.gfnIsUpdatedRow = function (objDs, nRow)
{
	if (objDs.updatecontrol == true) 
	{
		if (objDs.getRowType(nRow) == 2 || objDs.getRowType(nRow) == 4) 
		{
			return true;
		}
		return false;
	}
	else 
	{
		for (var i = 0; objDs.getColCount(); i++) 
		{
			if (this.gfnIsUpdateColumn(objDs, nRow, i) == true) 
			{
				return true;
			}
		}
	}
	return false;
};

 /**
 * @class dataSet의 Row 에서 해당 칼럼이 변경되었는지 판단하는 함수
 * @param {Object} ObjDs - 대상 dataset
 * @param {Number} nRow - row값
 * @param {String || Number} Column - 칼럼명 or 칼럼index
 * @return {boolean}
 */   
pForm.gfnIsUpdateColumn = function (objDs, nRow, Column)
{
	if (objDs.getRowType(nRow) == 2) 
	{
		if (this.gfnIsNull(objDs.getColumn(nRow, Column))) 
		{
			return false;
		}
	}
	else 
	{
		if (objDs.getColumn(nRow, Column) == objDs.getOrgColumn(nRow, Column)) 
		{
			return false;
		}
	}
	return true;
};
 /**
 * @class dataSet의 Row 에서 해당 칼럼이 변경되었는지 판단하는 함수 (PROC_DELETE, PROC_STATUS, PROC_CODE제외)
 * @param {Object} ObjDs - 대상 dataset
 * @param {Number} nRow - row값
 * @param {String || Number} Column - 칼럼명 or 칼럼index
 * @return {boolean}
 */  
pForm.gfnManualIsUpdatedRow = function(objDs, nRow)
{

	var nColCnt 		= objDs.getColCount();
	var columnValue 	= "";
	var orgColumnValue 	= "";

	for(var i=0 ; i < nColCnt ; i++){
		if(objDs.getColID(i) == "PROC_DELETE" || objDs.getColID(i) == "PROC_STATUS" || objDs.getColID(i) == "PROC_CODE") continue;
		
		if(this.gfnIsNull(objDs.getColumn(nRow,i))){
			if(objDs.getColID(i) == "CHK"){
				columnValue = "0";
			}else{
				columnValue = "";
			}					
		}else{
			columnValue = objDs.getColumn(nRow,i)+"";
		}
		
		if(this.gfnIsNull(objDs.getOrgColumn(nRow,i))){
			if(objDs.getColID(i) == "CHK"){
				orgColumnValue = "0";
			}else{
				orgColumnValue = "";
			}
		}else{
			orgColumnValue = objDs.getOrgColumn(nRow,i)+"";
		}
		//trace("orgValue:["+orgColumnValue+"] value:["+columnValue+"]");
		if(columnValue!= orgColumnValue){
			return true;
		}
	}
	return false;

}
/************************************************************************************************
* 외부연동 관련 Util
************************************************************************************************/
/**
* @class 다음 우편번호 검색 <br>
* @param {Object} obj - WebBrowser Component
* @return N/A
* @example 
* this.gfnPostSearch(obj);
*/
pForm.gfnPostSearch = function(obj)
{
	var sUrl;
	sUrl = nexacro.getEnvironment().services["svcUrl"].url+"external/PostPopWeb.html"
	obj.set_url(sUrl);
};

/************************************************************************************************
* Date 관련 Util
************************************************************************************************/

/**
 * @class 날짜 여부를 확인한다.(년월 or 년월일) <br>
 * @param {String} strDate - 입력스트링(YYYYMM or YYYYMMDD)
 * @return {Boolean}
 */
pForm.gfnIsDate = function(strDate)
{
	if (this.gfnIsNull(strDate)) return false;
	
	var retVal;
	switch(strDate.length)
	{
		case 6://년월
			retVal =  this.gfnIsYM(strDate);
			break;
		case 8://년월일
			retVal =  this.gfnIsYMD(strDate);
			break;
		default:
			retVal = false; 
			break;
	}

	return retVal;
};

/**
 * @class 날짜 여부를 확인한다. <br>
 * @param {String} strDate - 8자리의 숫자로 된 날짜(YYYYMMDD)
 * @return {Boolean}
 */
pForm.gfnIsYMD = function(strDate)
{
	var retVal = this.gfnGetDigit(strDate);
	
	if (retVal.length != 8) {
		return false;
	}

	var strYM = strDate.substr(0,6);	//년월
	if (!this.gfnIsYM(strYM)) {
		return false;
	}
	var nDay   = Number(strDate.substr(6,2));	// 일자
	var nLastDay = Number(this.gfnGetLastDate(strYM).substr(6,2));//gfnGetLastDay에서 전체 20170331값이 넘어와서 .substr(6,2)추가 20170313
	if (nDay < 1 || nDay > nLastDay) {
		return false;
	}
	return true;
};

/**
 * @class 날짜 여부를 확인한다. <br>
 * @param {String} strDate - 6자리의 숫자로 된 날짜(YYYYMM)
 * @return {Boolean}
 */
pForm.gfnIsYM = function(strDate)
{
var retVal = this.gfnGetDigit(strDate);
	
	var retVal = this.gfnGetDigit(strDate);

	if (retVal.length != 6) {
		return false;
	}

	var nYear  = Number(strDate.substr(0,4));	//년도값을 숫자로
	var nMonth = Number(strDate.substr(4,2));	//월을 숫자로

	if((nMonth < 1) || (nMonth > 12)) {
		return false;
	}

	return true;
};

/**
 * @class 시간 형식에 맞는지 Check 한다. <br>
 * @param {String} strTime - 6자리의 숫자로 된 내부시간형식(HHMMSS)
 * @return {Boolean}
 */
pForm.gfnIsTime = function(strTime)
{
	if (strTime.length != 6 || !nexacro.isNumeric(strTime)) {
		return false;
	}
	
	var t01 = Number(strTime.slice(0, 2));
	var t02 = Number(strTime.slice(2, 2));
	var t03 = Number(strTime.slice(4, 2));

	if((t01 < 0 || t01 > 23) || (t02 < 0 || t02 > 59) || (t03 < 0 || t03 > 59)) {
		return false;
	} else {
		return true;
	}
};

/**
 * @class 현재일자를 구한다. <br>
 * @param {String} [sGubn] - date/null : 일자, time : 일자+시간, milli : Milliseconds
 * @return {String} 8자리 날짜(YYYYMMMDD)문자열
 */
pForm.gfnGetDate = function(sGubn) 
{
	if(this.gfnIsNull(sGubn)) sGubn = "date";
	var d = new Date();
	if (!this.gfnIsNull(this.gfnGetApplication().gv_nowDateTime))
	{
		if (this.gfnGetApplication().gv_nowDateTime.length == 19)
		{
			d = new Date(this.gfnGetApplication().gv_nowDateTime);
		}
	}
	
	var s;
	
	if (sGubn == "date") {
		s = d.getFullYear()
			  + ((d.getMonth() + 1) + "").padLeft(2, '0')
			  + (d.getDate() + "").padLeft(2, '0');
	}
	else if (sGubn == "time") {
		s = d.getFullYear()
	      + ((d.getMonth() + 1) + "").padLeft(2, '0')
	      + (d.getDate() + "").padLeft(2, '0')
	      + (d.getHours() + "").padLeft(2, '0')
	      + (d.getMinutes() + "").padLeft(2, '0')
	      + (d.getSeconds() + "").padLeft(2, '0');
	}
	else if (sGubn == "milli") {
		s = d.getFullYear()
	      + ((d.getMonth() + 1) + "").padLeft(2, '0')
	      + (d.getDate() + "").padLeft(2, '0')
	      + (d.getHours() + "").padLeft(2, '0')
	      + (d.getMinutes() + "").padLeft(2, '0')
	      + (d.getSeconds() + "").padLeft(2, '0')
		  + (d.getMilliseconds() + "").padLeft(3, '0');
	}
	return (s);
};

/**
 * @class 년월을 입력받아 마지막 일를 반환한다(년월) <br>
 * @param {String} strDate - 6 / 8 자리의 숫자로 된 날짜(YYYYMM)
 * @return {String} 해당월의 마지막날 8자리
 */
pForm.gfnGetLastDate = function(strDate)
{
	var s = "";
    if (strDate == null) {
	    var date = (new Date()).addMonth(1);
    }
    else {
	    var date = new Date(parseInt(strDate.substr(0,4)),parseInt(strDate.substr(4,2)),1);
    }

	date = (new Date(date)).addDate((new Date(date)).getDate()*-1);

	s = (new Date(date)).getFullYear()
	  + (((new Date(date)).getMonth() + 1) + "").padLeft(2, '0')
	  + ((new Date(date)).getDate() + "").padLeft(2, '0');

	return (s);
};

/**
 * @class 현재월 1일 만들기. <br>
 * @param {String} strDate - Date Format YYYYMM / YYYYMMDD
 * @return {String} date
 */
pForm.gfnGetFirstDate = function(strDate)
{
    var s = "";

    if (strDate == null) {
	    s = this.gfnGetDate().substr(0,6) + "01";
    }
    else {
	    var date = new Date(parseInt(strDate.substr(0,4)),parseInt(strDate.substr(4,2))-1,1);
	    s = (new Date(date)).getFullYear()
	      + (((new Date(date)).getMonth()+1)+ "").padLeft(2, '0')
	      + ((new Date(date)).getDate() + "").padLeft(2, '0');

    }
    
	return (s);
};

/**
 * @class 입력된 날자로부터 요일을 구함 <br>
 * @param {String} strDate - 'yyyyMMdd' 형태로 표현된 날짜.
 * @return {Number} 0 = 일요일 ~ 6 = 토요일. 오류가 발생할 경우 -1 Return.
 */
pForm.gfnGetDay = function(strDate)
{
    var date = new Date();

    var iYear = parseInt(strDate.substr(0, 4));
    var iMonth = parseInt(strDate.substr(4, 2) - 1);
    var iDate = parseInt(strDate.substr(6, 2));
    
	date.setFullYear(iYear,iMonth,iDate);
    return date.getDay();
};

/**
 * @class 두 일자간의 차이 일수 계산 <br>
 * @param {String} sStartDate - yyyyMMdd형태의 From 일자 ( 예 : "20121122" )
 * @param {String} sEndDate - yyyyMMdd형태의 To 일자   ( 예 : "20121202" )
 * @return {Number} 숫자 형태의 차이일수( 예 : 10 ) 단, sEndDate < sStartDate이면 음수가 return된다.
 */
pForm.gfnGetDiffDate = function(sStartDate, sEndDate)
{
    var vFromDate = new Date(parseInt(sEndDate.substring(0,4),  10), parseInt(sEndDate.substring(4,6)-1,  10), parseInt(sEndDate.substring(6,8), 10));
    var vToDate = new Date(parseInt(sStartDate.substring(0,4),  10), parseInt(sStartDate.substring(4,6)-1,  10), parseInt(sStartDate.substring(6,8), 10));
    
    return parseInt((vFromDate - vToDate)/(1000*60*60*24));
};

/**
 * @class 두 일자간의 차이 일수 계산. 단, sStartDate, sEndDate의 일은 포함하지 않고 계산된다. <br>
 * @param {String} sStartDate - yyyyMMdd형태의 From 일자 ( 예 : "20121122" )
 * @param {String} sEndDate - yyyyMMdd형태의 To 일자   ( 예 : "20121202" )
 * @return {Number} 숫자 형태의 차이월수 ( 예 : 10 ) 단, sEndDate < sStartDate이면 음수가 return된다.
 */
pForm.gfnGetDiffMonth = function(sStartDate, sEndDate)
{
	var nStartMon, nEndMon;
	
	nStartMon = parseInt(sStartDate.substr(0,4), 10)*12 + parseInt(sStartDate.substr(4,2), 10);
	nEndMon = parseInt(sEndDate.substr(0,4), 10)*12 + parseInt(sEndDate.substr(4,2), 10);
	
	return (nEndMon - nStartMon);
};

/**
 * @class 입력된 날짜에 OffSet 으로 지정된 만큼의 날짜를 더함 <br>
 * @param {String} strDate - 'yyyyMMdd' 형태로 표현된 날짜.
 * @param {Number} nOffSet - 날짜로부터 증가 감소값.
 * @return {String} date의 문자열 (ex. 20080821)
 */
pForm.gfnAddDate = function(strDate, nOffSet)
{
	var date = new Date();
	
    var iYear = parseInt(strDate.substr(0, 4));
    var iMonth = parseInt(strDate.substr(4, 2) - 1);
    var iDate = parseInt(strDate.substr(6, 2)-(nOffSet*-1));
    
	date.setFullYear(iYear,iMonth,iDate);	
	
	return this.gfnDateToStr(date);
};

/**
 * @class 입력된 월에 OffSet 으로 지정된 만큼의 월을 더함 <br>
 * @param {String} strDate - String Date Format
 * @param {Number} OffSet - Integer Format
 * @return {String} date
 */
pForm.gfnAddMonth = function(strDate, OffSet) 
{	
	var date, d, s, mon, val;

	/**
	 * @class 입력일자 해당월의 마지막 일 <br>
	 * @param {String} strMonth - 'yyyyMMdd' 형태로 표현된 날짜.
	 * @return {Number} 해당월의 마지막일자 2자리
	 */
	var gfnGetMonthLastDate = function(strMonth) {
		var iLastDay;
		var iYear  = parseInt(strMonth.substr(0, 4),10) ;
		var iMonth = parseInt(strMonth.substr(4, 2),10);
		switch(iMonth)
		{
			case 2 :
				if( ((iYear%4)==0) && ((iYear%100)!=0) || ((iYear%400)==0) )
					iLastDay = 29;
				else
					iLastDay = 28;			
				break;
			case 4 :
			case 6 :
			case 9 :
			case 11 :
				iLastDay = 30;
				break;
			default:
				iLastDay = 31;
				break;
		}
		
		return iLastDay;
	};

    if (strDate) {
        date = this.gfnStrToDate(strDate);
        d = (new Date(date)).addMonth(OffSet);
    } else {
    	date = this.gfnStrToDate(this.gfnGetDate());
		d = (new Date(date)).addMonth(OffSet);
    }
    
    if (gfnGetMonthLastDate(strDate) == date.getDate()) {
    	var sY = new Date(d).getFullYear();
    	var sM = new Date(d).getMonth();
    	var eY = date.getFullYear();
    	var eM = date.getMonth();
    	
    	mon = -((eY - sY)* 12 + (eM - sM));
    	
    	if (mon != OffSet) {
   			val = OffSet - mon;
    		d = (new Date(d)).addMonth(-1);
    	}
    	
    	var ld = new Date((new Date(d)).getFullYear() 
    			, (new Date(d)).getMonth()
    			, gfnGetMonthLastDate(this.gfnDateToStr(new Date(d))));
    	
    	s = (new Date(ld)).getFullYear()
		   + (((new Date(ld)).getMonth() + 1) + "").padLeft(2, '0')
		   + (((new Date(ld)).getDate()) + "").padLeft(2, '0');
    } else {
    	s = (new Date(d)).getFullYear()
		   + (((new Date(d)).getMonth() + 1) + "").padLeft(2, '0')
		   + (((new Date(d)).getDate()) + "").padLeft(2, '0');
    }
	
	return (s);
};

/**
 * @class 법정공휴일 구하기 <br>
 * @param {Number} nYear - yyyy
 * @return {Array} 휴일정보
 * @example : 
 */
pForm.gfnGetHolidays = function(nYear)
{
	var nYear;
	var aHoliday = new Array();

	/////// 음력 체크
	// 구정
	aHoliday[0] = this.gfnLunarToSolar((nYear-1) + "1230", false) + "설날";
	aHoliday[1] = this.gfnAddDate(aHoliday[0].substring(0, 8), 1) + "설날";
	aHoliday[2] = this.gfnAddDate(aHoliday[1].substring(0, 8), 1) + "설날";
	// 석가탄신일
	aHoliday[3] = this.gfnLunarToSolar(nYear + "0408", false) + "석가탄신일";
	// 추석
	aHoliday[4] = this.gfnLunarToSolar(nYear + "0814", false) + "추석";
	aHoliday[5] = this.gfnAddDate(aHoliday[4].substring(0, 8), 1) + "추석";
	aHoliday[6] = this.gfnAddDate(aHoliday[5].substring(0, 8), 1) + "추석";	

	/////// 양력 체크
	aHoliday[7] = nYear+"0101" + "신정";
	aHoliday[8] = nYear+"0301" + "삼일절";
	aHoliday[9] = nYear+"0505" + "어린이날";	
	aHoliday[10] = nYear+"0606" + "현충일";		
	aHoliday[11] = nYear+"0815" + "광복절";	
	aHoliday[12] = nYear +"1003" + "개천절";
	aHoliday[13] = nYear +"1009" + "한글날";
	aHoliday[14] = nYear+"1225" + "성탄절";			
	
	return aHoliday.sort();
};

/**
 * @class 양력을 음력으로 변환해주는 함수.<br>
 * [주의사항]<br>
 *  1. return값이 8자리가 아니고 9자리임에 주의<br>
 *  2. 처리가능 기간  1841 - 2043년
 * @param {String | Date} value - yyyyMMdd형태의 양력일자 ( 예 : "20121122" )
 * @return {String} Flag(평달 = "0", 윤달 = "1") + 'yyyyMMdd'형태의 음력일자
 * @example
 * var dt = this.gfnStr2Date("20130331");
 * var str = this.solarToLunar(dt);
 * trace(str); // output : 020130220
 * var str1 = "20130331";
 * var str = this.solarToLunar(str1);
 * trace(str); // output : 020130220
 */		
pForm.gfnSolarToLunar =  function(value) 
{
	var sMd         = "31,0,31,30,31,30,31,31,30,31,30,31";
	var arrMd       = [];
	var arrBaseInfo = [];
	var arrDt       = [];	// 매년의 음력일수를 저장할 배열 변수
	var nTd;		    			// 음력일을 계산하기 위해 양력일과의 차이를 저장할 변수
	var nTd1;			    		// 1840년까지의 날수
	var nTd2;				    	// 현재까지의 날수
	var nTemp;					    // 임시변수
	var nLy, nLm, nLd;			    // 계산된 음력 년, 월, 일을 저장할 변수
	var sLyoon;					    // 현재월이 윤달임을 표시

	var nY, nM, nD;

	nY = parseInt(value.substr(0,4), 10);
	nM = parseInt(value.substr(4,2), 10);
	nD = parseInt(value.substr(6,2), 10);
	
	
	if (nY < 1841 || nY > 2043)	
	{
		return null;
	}

	arrBaseInfo = this.gfnSolarBase();
	arrMd       = sMd.split(",");
	arrMd[1]    = 28;
		
	//윤년여부 확인
	if ((nY % 4) == 0) 
	{
		if ((nY % 100) != 0 || (nY % 400) == 0)
		{ 
			arrMd[1] = 29;
		}
	} 

	// 672069 = 1840 * 365 + 1840/4 - 1840/100 + 1840/400 + 23  //1840년까지 날수
	nTd1 = 672069; 	 
		
	// 1841년부터 작년까지의 날수
	nTd2 = (nY - 1) * 365 + parseInt((nY - 1)/4) - parseInt((nY - 1)/100) + parseInt((nY - 1)/400);
		
	// 전월까지의 날수를 더함
	for (var i = 0; i <= nM - 2; i++)
	{
		nTd2 = nTd2 + parseInt(arrMd[i]);
	}

	// 현재일까지의 날수를 더함
	nTd2 = nTd2 + nD;

	// 양력현재일과 음력 1840년까지의 날수의 차이
	nTd = nTd2 - nTd1 + 1;
	
	// 1841년부터 음력날수를 계산
	for (var i = 0; i <= nY - 1841; i++)
	{
		arrDt[i] = 0;
		for (var j = 0; j <= 11; j++)
		{
			switch (parseInt(arrBaseInfo[i * 12 + j]))
			{
				case 1 : nTemp = 29;
						 break;
				case 2 : nTemp = 30;
						 break;				
				case 3 : nTemp = 58;	// 29 + 29
						 break;				
				case 4 : nTemp = 59;	// 29 + 30
						 break;				
				case 5 : nTemp = 59;	// 30 + 29
						 break;				
				case 6 : nTemp = 60;	// 30 + 30
						 break;				
			}
			
			arrDt[i] = arrDt[i] + nTemp;
		}
	}
		
	// 1840년 이후의 년도를 계산 - 현재까지의 일수에서 위에서 계산된 1841년부터의 매년 음력일수를 빼가면수 년도를 계산
	nLy = 0;
	do
	{
		nTd = nTd - arrDt[nLy];
		nLy = nLy + 1;
	}
	while(nTd > arrDt[nLy]);
	
	nLm    = 0;
	sLyoon = "0";	// 현재월이 윤달임을 표시할 변수 - 기본값 평달
	do
	{

		if (parseInt(arrBaseInfo[nLy * 12 + nLm]) <= 2)
		{
			nTemp = parseInt(arrBaseInfo[nLy * 12 + nLm]) + 28;
			if (nTd > nTemp)
			{
				nTd = nTd - nTemp;
				nLm = nLm + 1;
			}
			else
			{
				break;
			}
		}
		else
		{
			switch (parseInt(arrBaseInfo[nLy * 12 + nLm]))
			{
				case 3 :
					m1 = 29;
					m2 = 29;
					break;
				case 4 : 
					m1 = 29;
					m2 = 30;
					break;					
				case 5 : 
					m1 = 30;
					m2 = 29;
					break;					
				case 6 : 
					m1 = 30;
					m2 = 30;
					break;					
			}

			if (nTd > m1)
			{
				nTd = nTd - m1;
				if (nTd > m2)
				{
					nTd = nTd - m2;
					nLm = nLm + 1;
				}
				else
				{
					sLyoon = "1";
				}
			}
			else
			{
				break;
			}
		}
	}
	while(1);
	
	nLy = nLy + 1841;
	nLm = nLm + 1;
	nLd = nTd;

	var sRtn = sLyoon + nLy; 
	sRtn = sRtn + nLm.toString().padLeft(2, "0"); 
	sRtn = sRtn + nLd.toString().padLeft(2, "0");    
	return sRtn;
};		

/**
 * @class 음력을 양력으로 변환. <br>
 * @param {String | Date} value - yyyyMMdd형태의 음력일자 ( 예 : "20121122" ).
 * @param {Boolean} leapMonth - 윤달 여부.
 * @return {String} 'yyyyMMdd'형태의 양력일자
 */
pForm.gfnLunarToSolar = function(value, leapMonth)
{

	var sMd         = "31,0,31,30,31,30,31,31,30,31,30,31";
	var arrMd       = [];	
	var arrBaseInfo = [];
	var nTd         = 0;
	var nSy, nSm, nSd;			    // 계산된 양력 년, 월, 일을 저장할 변수
	var nY1, nM1, nY2, nY3, nTemp;	// 임시변수	
	var nLeap;    
		
	var nLy, nLm, nLd;

	nLy = parseInt(value.substr(0,4), 10);
	nLm = parseInt(value.substr(4,2), 10);
	nLd = parseInt(value.substr(6,2), 10);
	

	if (nLy < 1841 || nLy > 2043)	
	{
		return null;
	}	

	arrBaseInfo = this.gfnSolarBase();
	arrMd       = sMd.split(",");
	arrMd[1]    = 28;
	
	//윤년여부 확인
	if ((nLy % 4) == 0) 
	{
		if ((nLy % 100) != 0 || (nLy % 400) == 0)
		{ 
			arrMd[1] = 29;
		}
	} 
		
	nY1   = nLy - 1841; //176
	nM1   = nLm - 1; //02
	nLeap = 0;
	
	if (parseInt(arrBaseInfo[nY1 * 12 + nM1]) > 2)
	{
		//윤년여부 확인
		if ((nLy % 4) == 0) 
		{
			if ((nLy % 100) != 0 || (nLy % 400) == 0)
			{ 
				nLeap = 1;
			}
		} 
	}
	if (nLeap == 1)
	{
		switch (parseInt(arrBaseInfo[nY1 * 12 + nM1]))
		{
			case 3 : nTemp = 29;
					 break;
			case 4 : nTemp = 30;
					 break;			
			case 5 : nTemp = 29;
					 break;			
			case 6 : nTemp = 30;
					 break;
		}
	}
	else
	{
		switch (parseInt(arrBaseInfo[nY1 * 12 + nM1]))
		{
			case 1 : nTemp = 29;
					 break;			
			case 2 : nTemp = 30;
					 break;			
			case 3 : nTemp = 29;
					 break;			
			case 4 : nTemp = 29;
					 break;			
			case 5 : nTemp = 30;
					 break;			
			case 6 : nTemp = 30;
					 break;			
		}
	}
	
	var tempY1 = nY1 - 1;
	for (var i = 0; i <= tempY1; i++)
	{
		for (var j = 0; j <= 11; j++)
		{
			switch (parseInt(arrBaseInfo[i * 12 + j]))
			{
				case 1 : nTd = nTd + 29;
						 break;
				case 2 : nTd = nTd + 30;
						 break;				
				case 3 : nTd = nTd + 58;
						 break;				
				case 4 : nTd = nTd + 59;
						 break;				
				case 5 : nTd = nTd + 59;
						 break;				
				case 6 : nTd = nTd + 60;
						 break;				
			}
		}
	}

	var tempM1 = nM1 - 1;
	for (var j = 0; j <= tempM1; j++)
	{
		switch (parseInt(arrBaseInfo[nY1 * 12 + j]))
		{
			case 1 : nTd = nTd + 29;
					 break;			
			case 2 : nTd = nTd + 30;
					 break;						
			case 3 : nTd = nTd + 58;
					 break;						
			case 4 : nTd = nTd + 59;
					 break;						
			case 5 : nTd = nTd + 59;
					 break;						
			case 6 : nTd = nTd + 60;
					 break;						
		}
	}

	if (nLeap == 1)
	{
		switch (parseInt(arrBaseInfo[nY1 * 12 + nM1]))
		{
			case 3 : nTemp = 29;
					 break;						
			case 4 : nTemp = 29;
					 break;						
			case 5 : nTemp = 30;
					 break;						
			case 6 : nTemp = 30;
					 break;						
		}
	}
	
	nTd = nTd + nLd + 22;
	
	if (leapMonth)
	{
		switch (parseInt(arrBaseInfo[nY1 * 12 + nM1]))
		{
			case 3 : nTd = nTd + 29;
					 break;						
			case 4 : nTd = nTd + 30;
					 break;						
			case 5 : nTd = nTd + 29;
					 break;						
			case 6 : nTd = nTd + 30;
					 break;						
		}
	}
	
	nY1 = 1840;
	do
	{
		nY1 = nY1 + 1;
		
		nLeap = 0;
		
		//윤년여부 확인
		if ((nY1 % 4) == 0) 
		{
			if ((nY1 % 100) != 0 || (nY1 % 400) == 0)
			{ 
				nLeap = 1;
			}
		} 

		if (nLeap == 1)
		{
			nY2 = 366;
		}
		else
		{
			nY2 = 365;
		}

		if( nTd <= nY2 )
		{
			break;
		}
			
		nTd = nTd - nY2;
	}
	while(1);

	nSy      = nY1;
	arrMd[1] = nY2 - 337;
	nM1      = 0;
	
	do
	{
		nM1 = nM1 + 1;
		if (nTd <= parseInt(arrMd[nM1-1]))
		{
			break;
		}
		nTd = nTd - parseInt(arrMd[nM1-1]);
	}
	while(1);
	
	nSm = nM1;
	nSd = nTd;
	nY3 = nSy;
	nTd = nY3 * 365 + parseInt(nY3/4) - parseInt(nY3/100) + parseInt(nY3/400);
	
	var tempSm = nSm - 1;
	for (var i = 0; i <= tempSm; i++)
	{
		nTd = nTd + parseInt(arrMd[i]);
	}

	nTd = nTd + nSd;

	var sRtn = nY3;
	sRtn = sRtn + nSm.toString().padLeft(2, "0"); 
	sRtn = sRtn + nSd.toString().padLeft(2, "0");    

	return sRtn;	
};

/**
 * @class 각 월별 음력 기준 정보 (처리가능 기간  1841 - 2043년) <br>
 * @return {String}
 */	 
pForm.gfnSolarBase = function ()
{
	var sBase;
			
	//1841
	sBase = "1,2,4,1,1,2,1,2,1,2,2,1,";
	sBase += "2,2,1,2,1,1,2,1,2,1,2,1,";
	sBase += "2,2,2,1,2,1,4,1,2,1,2,1,";
	sBase += "2,2,1,2,1,2,1,2,1,2,1,2,";
	sBase += "1,2,1,2,2,1,2,1,2,1,2,1,";
	sBase += "2,1,2,1,5,2,1,2,2,1,2,1,";
	sBase += "2,1,1,2,1,2,1,2,2,2,1,2,";
	sBase += "1,2,1,1,2,1,2,1,2,2,2,1,";
	sBase += "2,1,2,3,2,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,1,2,1,1,2,2,1,2,";
	//1851
	sBase += "2,2,1,2,1,1,2,1,2,1,5,2,";
	sBase += "2,1,2,2,1,1,2,1,2,1,1,2,";
	sBase += "2,1,2,2,1,2,1,2,1,2,1,2,";
	sBase += "1,2,1,2,1,2,5,2,1,2,1,2,";
	sBase += "1,1,2,1,2,2,1,2,2,1,2,1,";
	sBase += "2,1,1,2,1,2,1,2,2,2,1,2,";
	sBase += "1,2,1,1,5,2,1,2,1,2,2,2,";
	sBase += "1,2,1,1,2,1,1,2,2,1,2,2,";
	sBase += "2,1,2,1,1,2,1,1,2,1,2,2,";
	sBase += "2,1,6,1,1,2,1,1,2,1,2,2,";
	//1861
	sBase += "1,2,2,1,2,1,2,1,2,1,1,2,";
	sBase += "2,1,2,1,2,2,1,2,2,3,1,2,";
	sBase += "1,2,2,1,2,1,2,2,1,2,1,2,";
	sBase += "1,1,2,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,1,2,4,1,2,2,1,2,2,1,";
	sBase += "2,1,1,2,1,1,2,2,1,2,2,2,";
	sBase += "1,2,1,1,2,1,1,2,1,2,2,2,";
	sBase += "1,2,2,3,2,1,1,2,1,2,2,1,";
	sBase += "2,2,2,1,1,2,1,1,2,1,2,1,";
	sBase += "2,2,2,1,2,1,2,1,1,5,2,1,";
	//1871
	sBase += "2,2,1,2,2,1,2,1,2,1,1,2,";
	sBase += "1,2,1,2,2,1,2,1,2,2,1,2,";
	sBase += "1,1,2,1,2,4,2,1,2,2,1,2,";
	sBase += "1,1,2,1,2,1,2,1,2,2,2,1,";
	sBase += "2,1,1,2,1,1,2,1,2,2,2,1,";
	sBase += "2,2,1,1,5,1,2,1,2,2,1,2,";
	sBase += "2,2,1,1,2,1,1,2,1,2,1,2,";
	sBase += "2,2,1,2,1,2,1,1,2,1,2,1,";
	sBase += "2,2,4,2,1,2,1,1,2,1,2,1,";
	sBase += "2,1,2,2,1,2,2,1,2,1,1,2,";
	//1881
	sBase += "1,2,1,2,1,2,5,2,2,1,2,1,";
	sBase += "1,2,1,2,1,2,1,2,2,1,2,2,";
	sBase += "1,1,2,1,1,2,1,2,2,2,1,2,";
	sBase += "2,1,1,2,3,2,1,2,2,1,2,2,";
	sBase += "2,1,1,2,1,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,2,1,1,2,1,2,1,2,";
	sBase += "2,2,1,5,2,1,1,2,1,2,1,2,";
	sBase += "2,1,2,2,1,2,1,1,2,1,2,1,";
	sBase += "2,1,2,2,1,2,1,2,1,2,1,2,";
	sBase += "1,5,2,1,2,2,1,2,1,2,1,2,";
	//1891
	sBase += "1,2,1,2,1,2,1,2,2,1,2,2,";
	sBase += "1,1,2,1,1,5,2,2,1,2,2,2,";
	sBase += "1,1,2,1,1,2,1,2,1,2,2,2,";
	sBase += "1,2,1,2,1,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,5,1,2,1,2,1,2,1,";
	sBase += "2,2,2,1,2,1,1,2,1,2,1,2,";
	sBase += "1,2,2,1,2,1,2,1,2,1,2,1,";
	sBase += "2,1,5,2,2,1,2,1,2,1,2,1,";
	sBase += "2,1,2,1,2,1,2,2,1,2,1,2,";
	sBase += "1,2,1,1,2,1,2,5,2,2,1,2,";
	//1901
	sBase += "1,2,1,1,2,1,2,1,2,2,2,1,";
	sBase += "2,1,2,1,1,2,1,2,1,2,2,2,";
	sBase += "1,2,1,2,3,2,1,1,2,2,1,2,";
	sBase += "2,2,1,2,1,1,2,1,1,2,2,1,";
	sBase += "2,2,1,2,2,1,1,2,1,2,1,2,";
	sBase += "1,2,2,4,1,2,1,2,1,2,1,2,";
	sBase += "1,2,1,2,1,2,2,1,2,1,2,1,";
	sBase += "2,1,1,2,2,1,2,1,2,2,1,2,";
	sBase += "1,5,1,2,1,2,1,2,2,2,1,2,";
	sBase += "1,2,1,1,2,1,2,1,2,2,2,1,";
	//1911
	sBase += "2,1,2,1,1,5,1,2,2,1,2,2,";
	sBase += "2,1,2,1,1,2,1,1,2,2,1,2,";
	sBase += "2,2,1,2,1,1,2,1,1,2,1,2,";
	sBase += "2,2,1,2,5,1,2,1,2,1,1,2,";
	sBase += "2,1,2,2,1,2,1,2,1,2,1,2,";
	sBase += "1,2,1,2,1,2,2,1,2,1,2,1,";
	sBase += "2,3,2,1,2,2,1,2,2,1,2,1,";
	sBase += "2,1,1,2,1,2,1,2,2,2,1,2,";
	sBase += "1,2,1,1,2,1,5,2,2,1,2,2,";
	sBase += "1,2,1,1,2,1,1,2,2,1,2,2,";
	//1921
	sBase += "2,1,2,1,1,2,1,1,2,1,2,2,";
	sBase += "2,1,2,2,3,2,1,1,2,1,2,2,";
	sBase += "1,2,2,1,2,1,2,1,2,1,1,2,";
	sBase += "2,1,2,1,2,2,1,2,1,2,1,1,";
	sBase += "2,1,2,5,2,1,2,2,1,2,1,2,";
	sBase += "1,1,2,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,1,2,1,2,1,2,2,1,2,2,";
	sBase += "1,5,1,2,1,1,2,2,1,2,2,2,";
	sBase += "1,2,1,1,2,1,1,2,1,2,2,2,";
	sBase += "1,2,2,1,1,5,1,2,1,2,2,1,";
	//1931
	sBase += "2,2,2,1,1,2,1,1,2,1,2,1,";
	sBase += "2,2,2,1,2,1,2,1,1,2,1,2,";
	sBase += "1,2,2,1,6,1,2,1,2,1,1,2,";
	sBase += "1,2,1,2,2,1,2,2,1,2,1,2,";
	sBase += "1,1,2,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,4,1,2,1,2,1,2,2,2,1,";
	sBase += "2,1,1,2,1,1,2,1,2,2,2,1,";
	sBase += "2,2,1,1,2,1,4,1,2,2,1,2,";
	sBase += "2,2,1,1,2,1,1,2,1,2,1,2,";
	sBase += "2,2,1,2,1,2,1,1,2,1,2,1,";
	//1941
	sBase += "2,2,1,2,2,4,1,1,2,1,2,1,";
	sBase += "2,1,2,2,1,2,2,1,2,1,1,2,";
	sBase += "1,2,1,2,1,2,2,1,2,2,1,2,";
	sBase += "1,1,2,4,1,2,1,2,2,1,2,2,";
	sBase += "1,1,2,1,1,2,1,2,2,2,1,2,";
	sBase += "2,1,1,2,1,1,2,1,2,2,1,2,";
	sBase += "2,5,1,2,1,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,2,1,1,2,1,2,1,2,";
	sBase += "2,2,1,2,1,2,3,2,1,2,1,2,";
	sBase += "2,1,2,2,1,2,1,1,2,1,2,1,";
	//1951
	sBase += "2,1,2,2,1,2,1,2,1,2,1,2,";
	sBase += "1,2,1,2,4,2,1,2,1,2,1,2,";
	sBase += "1,2,1,1,2,2,1,2,2,1,2,2,";
	sBase += "1,1,2,1,1,2,1,2,2,1,2,2,";
	sBase += "2,1,4,1,1,2,1,2,1,2,2,2,";
	sBase += "1,2,1,2,1,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,2,1,1,5,2,1,2,2,";
	sBase += "1,2,2,1,2,1,1,2,1,2,1,2,";
	sBase += "1,2,2,1,2,1,2,1,2,1,2,1,";
	sBase += "2,1,2,1,2,5,2,1,2,1,2,1,";
	//1961
	sBase += "2,1,2,1,2,1,2,2,1,2,1,2,";
	sBase += "1,2,1,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,2,3,2,1,2,1,2,2,2,1,";
	sBase += "2,1,2,1,1,2,1,2,1,2,2,2,";
	sBase += "1,2,1,2,1,1,2,1,1,2,2,1,";
	sBase += "2,2,5,2,1,1,2,1,1,2,2,1,";
	sBase += "2,2,1,2,2,1,1,2,1,2,1,2,";
	sBase += "1,2,2,1,2,1,5,2,1,2,1,2,";
	sBase += "1,2,1,2,1,2,2,1,2,1,2,1,";
	sBase += "2,1,1,2,2,1,2,1,2,2,1,2,";
	//1971
	sBase += "1,2,1,1,5,2,1,2,2,2,1,2,";
	sBase += "1,2,1,1,2,1,2,1,2,2,2,1,";
	sBase += "2,1,2,1,1,2,1,1,2,2,2,1,";
	sBase += "2,2,1,5,1,2,1,1,2,2,1,2,";
	sBase += "2,2,1,2,1,1,2,1,1,2,1,2,";
	sBase += "2,2,1,2,1,2,1,5,2,1,1,2,";
	sBase += "2,1,2,2,1,2,1,2,1,2,1,1,";
	sBase += "2,2,1,2,1,2,2,1,2,1,2,1,";
	sBase += "2,1,1,2,1,6,1,2,2,1,2,1,";
	sBase += "2,1,1,2,1,2,1,2,2,1,2,2,";
	//1981
	sBase += "1,2,1,1,2,1,1,2,2,1,2,2,";
	sBase += "2,1,2,3,2,1,1,2,2,1,2,2,";
	sBase += "2,1,2,1,1,2,1,1,2,1,2,2,";
	sBase += "2,1,2,2,1,1,2,1,1,5,2,2,";
	sBase += "1,2,2,1,2,1,2,1,1,2,1,2,";
	sBase += "1,2,2,1,2,2,1,2,1,2,1,1,";
	sBase += "2,1,2,2,1,5,2,2,1,2,1,2,";
	sBase += "1,1,2,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,1,2,1,2,1,2,2,1,2,2,";
	sBase += "1,2,1,1,5,1,2,1,2,2,2,2,";
	//1991
	sBase += "1,2,1,1,2,1,1,2,1,2,2,2,";
	sBase += "1,2,2,1,1,2,1,1,2,1,2,2,";
	sBase += "1,2,5,2,1,2,1,1,2,1,2,1,";
	sBase += "2,2,2,1,2,1,2,1,1,2,1,2,";
	sBase += "1,2,2,1,2,2,1,5,2,1,1,2,";
	sBase += "1,2,1,2,2,1,2,1,2,2,1,2,";
	sBase += "1,1,2,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,1,2,3,2,2,1,2,2,2,1,";
	sBase += "2,1,1,2,1,1,2,1,2,2,2,1,";
	sBase += "2,2,1,1,2,1,1,2,1,2,2,1,";
	//2001
	sBase += "2,2,2,3,2,1,1,2,1,2,1,2,";
	sBase += "2,2,1,2,1,2,1,1,2,1,2,1,";
	sBase += "2,2,1,2,2,1,2,1,1,2,1,2,";
	sBase += "1,5,2,2,1,2,1,2,2,1,1,2,";
	sBase += "1,2,1,2,1,2,2,1,2,2,1,2,";
	sBase += "1,1,2,1,2,1,5,2,2,1,2,2,";
	sBase += "1,1,2,1,1,2,1,2,2,2,1,2,";
	sBase += "2,1,1,2,1,1,2,1,2,2,1,2,";
	sBase += "2,2,1,1,5,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,2,1,1,2,1,2,1,2,";
	//2011
	sBase += "2,1,2,2,1,2,1,1,2,1,2,1,";
	sBase += "2,1,6,2,1,2,1,1,2,1,2,1,";
	sBase += "2,1,2,2,1,2,1,2,1,2,1,2,";
	sBase += "1,2,1,2,1,2,1,2,5,2,1,2,";
	sBase += "1,2,1,1,2,1,2,2,2,1,2,2,";
	sBase += "1,1,2,1,1,2,1,2,2,1,2,2,";
	sBase += "2,1,1,2,3,2,1,2,1,2,2,2,";
	sBase += "1,2,1,2,1,1,2,1,2,1,2,2,";
	sBase += "2,1,2,1,2,1,1,2,1,2,1,2,";
	sBase += "2,1,2,5,2,1,1,2,1,2,1,2,";
	//2021
	sBase += "1,2,2,1,2,1,2,1,2,1,2,1,";
	sBase += "2,1,2,1,2,2,1,2,1,2,1,2,";
	sBase += "1,5,2,1,2,1,2,2,1,2,1,2,";
	sBase += "1,2,1,1,2,1,2,2,1,2,2,1,";
	sBase += "2,1,2,1,1,5,2,1,2,2,2,1,";
	sBase += "2,1,2,1,1,2,1,2,1,2,2,2,";
	sBase += "1,2,1,2,1,1,2,1,1,2,2,2,";
	sBase += "1,2,2,1,5,1,2,1,1,2,2,1,";
	sBase += "2,2,1,2,2,1,1,2,1,1,2,2,";
	sBase += "1,2,1,2,2,1,2,1,2,1,2,1,";
	//2031
	sBase += "2,1,5,2,1,2,2,1,2,1,2,1,";
	sBase += "2,1,1,2,1,2,2,1,2,2,1,2,";
	sBase += "1,2,1,1,2,1,5,2,2,2,1,2,";
	sBase += "1,2,1,1,2,1,2,1,2,2,2,1,";
	sBase += "2,1,2,1,1,2,1,1,2,2,1,2,";
	sBase += "2,2,1,2,1,4,1,1,2,1,2,2,";
	sBase += "2,2,1,2,1,1,2,1,1,2,1,2,";
	sBase += "2,2,1,2,1,2,1,2,1,1,2,1,";
	sBase += "2,2,1,2,5,2,1,2,1,2,1,1,";
	sBase += "2,1,2,2,1,2,2,1,2,1,2,1,";
	//2041
	sBase += "2,1,1,2,1,2,2,1,2,2,1,2,";
	sBase += "1,5,1,2,1,2,1,2,2,2,1,2,";
	sBase += "1,2,1,1,2,1,1,2,2,1,2,2";
	
	var arrBase = [];
	arrBase = sBase.split(",");
	
	return arrBase;
};

/**
 * @class 문자를 날짜로 변환. <br>
 * @param {String} strDate - String Date Format
 * @return {Date} date
 */
pForm.gfnStrToDate = function(inDate)
{
  var date =  new Date(parseInt(inDate.substr(0,4)),parseInt(inDate.substr(4,2))-1,parseInt(inDate.substr(6,2)));
  return date;
};

/**
 * @class Date Type을 String으로 변환 <br>
 * @param {Date} date
 * @return {String} 'yyyyMMdd' 형태로 표현된 날짜
 */
pForm.gfnDateToStr = function(date)
{
	var strYear = date.getYear().toString();
	var strMonth = (date.getMonth()+1).toString();
	var strDate = date.getDate().toString();
	
	if(strYear.length==2)
		strYear = '19'+strYear;
	else if(strYear.length==1)
		strYear = '190'+strYear;
		
	if(strMonth.length==1)
		strMonth = '0'+strMonth;
	if(strDate.length==1)
		strDate = '0'+strDate;
	
	return strYear+strMonth+strDate;
};

/**
 * @class 년월일(yyyyMMdd)을 입력하면 해당 주차를 리턴한다. <br>
 * @param {String} strDate - 8자리 년월일(yyyyMMdd)
 * @return {String} 6자리 년도주차(yyyyWW)
 */
pForm.gfnGetWeek = function(strDate) 
{
	if (strDate.length != 8 || !this.gfnIsDigit(strDate)) {
		return "";
	}
	
	var year  = parseInt(strDate.substr(0,4));
	var month = parseInt(strDate.substr(4,2));
	var day   = parseInt(strDate.substr(6,8));

	var startAt = 1; ///////////// 일요일 표시 부분 / 0 : 일요일(일월화...) / 1 : 월요일(...금토일)

	if(startAt == 0) {
		day = day + 1;
	}

	var a    = Math.floor((14-month) / 12);
	var y    = year + 4800 - a;
	var m    = month + (12 * a) - 3;
	var b    = Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400);
	var J    = day + Math.floor(((153 * m) + 2) / 5) + (365 * y) + b - 32045;
	var d4   = (((J + 31741 - (J % 7)) % 146097) % 36524) % 1461;
	var L    = Math.floor(d4 / 1460);
	var d1   = ((d4 - L) % 365) + L;
	var week = Math.floor(d1/7) + 1;
		week = week.toString();
	return year+week.padLeft(2,"0");			
};

/**
 * @class 주민등록번호로 생년월일을 구한다. <br>
 * @param {String} ssn - 주민등록번호/외국인등록번호 13자리중 최소 7자 입력
 * @return {String} 8자리 날짜(YYYYMMMDD)문자열
 */
pForm.gfnGetBirthDateBySSN = function(ssn)
{
	var retVal;

	ssn = ssn.replace("-", ""); //하이픈제거
	
	if (!isNumber(ssn) || ssn.length < 6) {
		return retVal;
	}

	var yymmdd = ssn.substr(0, 6);
	var century;
	if (ssn.length > 6) {
		var genderFlag = Number(ssn.substr(6, 1));
		
		switch(genderFlag) {
			case 1:
			case 2:
			case 5:
			case 6:
				century = "19";
				break;
			case 3:
			case 4:
			case 7:
			case 8:
				century = "20";
				break;
			case 9:
			case 0:
				century = "18";
				break;
		}
	} else {
		var sTemp = this.gfnGetDate();
		if (sTemp.substr(2, 6) <= yymmdd) {
			century = "19";
		} else {
			century = "20";
		}
	}

	retVal = century + yymmdd;
	
	if (!this.gfnIsDate(retVal)) {
		retVal = null;
	}
	
	return retVal;	
};

/**
 * @class 주민번호 뒷 첫번째 자리로 년대를 return 한다. <br>
 * @param {String} sJuminNo	생년 월일 또는 주민 번호
 * @return {String} 주민번호 뒷 첫번째 자리로 년대를 return 한다.
 */
pForm.gfnGetBirthYear = function(sJuminNo)
{
	if (sJuminNo.toString().length != 13){
		return "N";
	}
	
	if (!(sJuminNo).match(/^\d{6}\d{7}$/)){
		return "N";
	}

	var vGb = sJuminNo.substr(6,1);

	if (vGb == '1' || vGb == '2' || vGb == '5' || vGb == '6') {
		return '19';
	} else if (vGb == '3' || vGb == '4' || vGb == '7' || vGb == '8') {
		return '20';
	}
};

/**
 * @class 기준년월일 기준으로 만나이를 구한다. <br>
 * @param {String} brtYmd - 생년월일
 * @param {String} stdYmd - 기준일자[생략시 현재일자]
 * @return {Number} 숫자형 나이
 */
pForm.gfnGetAge = function(brtYmd, stdYmd)
{
	var retVal = -1;
	
	if (gfnIsEmpty(stdYmd)) {
		stdYmd = gfn_getDate();
	}

	if (gfn_isDate(brtYmd) && gfn_isDate(stdYmd)) {
		var yDiff 	= Number(stdYmd.substr(0, 4)) - Number(brtYmd.substr(0, 4));
		var mdDiff	= Number(stdYmd.substr(4, 4)) - Number(brtYmd.substr(4, 4));
		   
		retVal = yDiff;
		if( mdDiff < 0 ) {	//before
			retVal = retVal - 1;
		}
	}

	return retVal;	
};

/**
* @class 인자를 넘겨줄 경우에 넘겨주는 규칙대로 인자/값을 설정
* @param {string} p_name 설정할 파리미터명
* @param {string} p_value 설정할 값
* @return {string} String
* @example
*     paramStr += this.gfnSetParam("sql_xml", "gspl_sql_common");
*/ 
pForm.gfnSetParam = function(p_name, p_value)
{
	var sValue = "";
	if(!this.gfnIsNull(p_value)){
		sValue = new String(p_value);
	}
	return p_name + "="+nexacro.wrapQuote(this.replaceEmpty(sValue)) + " ";
};
/**
* Grid Row Count 표기
* @param {number} nCnt
* @return
* @example
* @memberOf private
*/
pForm.gfnGetRowCnt = function (nCnt)
{
	var sRowCnt = "<b v='true'><fc v='#004282'>[" + nCnt + "]</fc></b>";
	return sRowCnt
}
 /**
 * @class dataSet의 Row 중에서 변경된 내용이 있는지 여부
 * @param {Object or Array} objDs - 확인 대상 Dataset
 * @return {boolean}
 */   
pForm.gfnDsIsUpdatedManual = function (objDs)
{
	var oRtnVal = false;
	var nRowCnt = 0;
	var arrArgs = new Array( this.gfnGetApplication().gv_rowStatusInsert , this.gfnGetApplication().gv_rowStatusUpdate, this.gfnGetApplication().gv_rowStatusDelete );

	if (Array.isArray(objDs))
	{
		for (var i=0;i<objDs.length;i++)
		{
			nRowCnt += objDs[i].getCaseCount( "PROC_STATUS == $0 || PROC_STATUS == $1 || PROC_STATUS == $2", 0, -1, arrArgs );
		}
	}
	else 
	{
		nRowCnt += objDs.getCaseCount( "PROC_STATUS == $0 || PROC_STATUS == $1 || PROC_STATUS == $2", 0, -1, arrArgs );
	}
	
	if(nRowCnt > 0) 
	{
		oRtnVal = true;
	}
	return oRtnVal;
};
/**
 * 콤보용 데이터셋에 첫행 추가하기
 * @param {obj} dataset
 * @param {string} sAddType add 타입("BLANK","ALL","SEL")
 * @param {string} sDisplayType display 타입(0:name ,1:code + name)
 * @return
 * @example
 * @memberOf private
 */
pForm.gfnAddFirstRowForCombo = function (oDataset, sAddType, sDisplayType, sColCode, sColName)
{
	if (this.gfnIsNull(sColCode)) 
	{
		sColCode = "COMCD";
		sColName = "COMCDT";
	}

	if (!this.gfnIsNull(sDisplayType) && sDisplayType == "1") 
	{
		for (var i = 0; i < oDataset.rowcount; i++) 
		{
			oDataset.setColumn(i, 1, oDataset.getColumn(i, 0) + "|" + oDataset.getColumn(i, 1));
		}
	}

	oDataset.insertRow(0);

	switch (sAddType) 
	{
		case "BLANK":
			oDataset.setColumn(0, sColCode, "");
			oDataset.setColumn(0, sColName, "");
			break;
		case "ALL":
			oDataset.setColumn(0, sColCode, "");
			oDataset.setColumn(0, sColName, this.gfnGetMessage("sys.msg.00011"));
			break;
		case "SEL":
			oDataset.setColumn(0, sColCode, "");
			oDataset.setColumn(0, sColName, this.gfnGetMessage("sys.msg.00012"));
			break;
		case "NA":
			oDataset.setColumn(0, sColCode, "");
			oDataset.setColumn(0, sColName, 'N/A');
			break;
		default:
			break;
	}
};
/**
 * 글로벌 User Info값 조회하기
 * @param {string} 컬럼명
 * @return {String} 조회한 컬럼값
 * @example
 * @memberOf private
 */
pForm.gfnGetUserInfo = function(sName)
{
	if (nexacro.getApplication().gds_userInfo.getRowCount() == 0) return;
	return nexacro.getApplication().gds_userInfo.getColumn(0,sName);
};
/**
 * NRE 모드로 실행하는지 확인하기
 * @param N/A
 * @return {Boolean} true:NRE 
 * @example
 * @memberOf private
 */
pForm.gfnIsNRE = function()
{
	if (system.navigatorname == "nexacro")
	{
		return true;
	}
	return false;
};
/**
 * 입력된 문자열의 일부분을 다른 문자열로 치환하는 함수
 * @param {string} 컬럼명
 * @return {String} 조회한 컬럼값
 * @example
       this.gfnReplace("abc", "b", "*")
	   - coolmind 2011.12.13 :  Ajax에서 정규식을 사용하지 않으면 처음찾은 문자열만 변경한다고 주의사항에 가이드 되어 있음
	                            해당하는 문자열을 모두 변경하려면 이 함수를 사용하지 말아야함, 전부 변경할 수 있도록 함수 수정 필요
 * @memberOf private
 */
pForm.gfnReplace = function ()
{
	var varRtnValue = null;
	var arrArgument = this.gfnReplace.arguments;

	if (arrArgument.length < 3) 
	{
		varRtnValue = arrArgument[0];
	}
	else 
	{
		if (nexacro.getApplication().gfnIsEmpty(arrArgument[0])) 
		{
			return varRtnValue;
		}
		varRtnValue = arrArgument[0].toString().replace(arrArgument[1], arrArgument[2]);
	}
	return varRtnValue;
};
/**
 * 지정한 위치에서 시작하고 지정한 길이를 갖는 부분 문자열을 반환하는 함수
 * @param  {String} 가운데 부문을 얻어올 원본 문자열.
 * @param {Integer} 얻어올 첫 글자의 Index.
 * @param {Integer} 얻어올 글자수. [Default length(해당 개채의 길이)]
 * @return {String} 가운데 부분이 얻어진 문자열.
 * @example
 * @memberOf private
 */
 pForm.gfnSubStr = function(sVal, nStart, nLength)
 {
	var retVal = "";
	if (!this.gfnIsNull(sVal)) 
	{
		if (this.gfnIsNull(nLength)) 
		{
			retVal = String(sVal).substr(nStart);
		} 
		else 
		{
			retVal = String(sVal).substr(nStart, nLength);
		}		
	}

	return retVal;
};
/**
* 전화번호 형식으로 변경
* @param {String, Number} num type
  - num : '-' 문자가 들어있지않은 숫자로된 전화번호
  - type : 0을 보내면 가운데자리를 숨겨준다
* @return String formatNum
  1. 010-XXXX-XXXX : 11자리 휴대폰번호
  2. 010-XXX-XXXX  : 10자리 휴대폰번호
  3. 02-XXXX-XXXX  : 10자리 서울 전화번호
  4. 031-XXX-XXXX  : 10자리 서울 외 전화번호
  5. 1688-XXXX     : 8자리 업체 번호
**/
pForm.gfnPhoneFomatter = function(num, type) 
{
	//num = num.replace('-', '');
	num = num.replace(/[^0-9]/g, '');
	
	var formatNum = '';
    if(num.length==11){
		if(type==0){            
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');        
        }else{
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } 
    }else if(num.length==9){
		if(type==0){            
            formatNum = num.replace(/(\d{2})(\d{3})(\d{4})/, '$1-****-$3');        
        }else{
            formatNum = num.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
        } 
    }else if(num.length==8){
		formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
    }else{
        if(num.indexOf('02')==0){
			if(type==0){
				formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
			}else{
			    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
			} 
		}else{
			if(type==0){
				formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
			}else{
			    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
			}
		}
	}
	
	return formatNum;
};
/******************************************************************************
 * 함수명			: gfn_makeEllipse
 * 설명				: 문자열이 영역 사이즈보다 초과되는 경우, 사이즈에 맞는 
					  문자열을 반환한다.
 * argument			: text - Static 영역에 들어갈 문자열
					  obj  - Static Object
 * return			: String - 영역 너비에 맞는 문자열
 ******************************************************************************/ 
pForm.gfn_makeEllipse = function(text, obj)
{
	if( !obj ){
		return text;
	}
 	//var _style = obj.currentstyle;
	//trace("Global padding info:"+obj.padding);
	//trace("offsetwidth:"+obj.getOffsetWidth());
	//trace("font info:"+obj.font);
	//trace("cssclass:"+obj.cssclass);
	var nPaddingLeft = 0;
	var nPaddingRight = 0;
	var sFontInfo = 'normal 400 36px "NotoSansKR"';//Static default font
	//if (!this.gfnIsNull(obj.cssclass))
	//{
		if (!this.gfnIsNull(obj.padding))
		{
			//trace("Static Padding:"+obj.padding.left);
			nPaddingLeft = obj.padding.left;
			nPaddingRight = obj.padding.right
		}
		if (!this.gfnIsNull(obj.font))
		{
			//trace("Static font:"+obj.font);
			sFontInfo = obj.font;
		}		
	//}

 	var _width = obj.getOffsetWidth() - nPaddingLeft - nPaddingRight;
 	//trace("origin width : " + obj.width + ", offset width : " + obj.getOffsetWidth() + ", padding left : " + _style.padding.left + ", padding right : " + _style.padding.right);
 	
	return this.gfn_makeEllipseByWidth(text, _width, sFontInfo);
};

/******************************************************************************
 * 함수명			: gfn_makeEllipseByWidth
 * 설명				: 문자열이 사이즈보다 초과되는 경우, 파라미터로 전달한 
					  사이즈에 맞는 문자열을 반환한다.
 * argument			: text   - 영역에 들어갈 문자열
					  width  - 영역의 너비
					  font   - 문자열의 폰트 객체
 * return			: String - 영역 너비에 맞는 문자열
 ******************************************************************************/ 
pForm.gfn_makeEllipseByWidth = function(text, width, font)
{
	if( !width || ! font)
		return text;
	
	var ellipse		= "...";
	var objWidth	= width;
	
	var textSize	= nexacro.getTextSize(text, font);
	var ellipseSize	= nexacro.getTextSize(ellipse, font);
	//trace("text size:"+textSize.nx+"  ellipseSize:"+ellipseSize.nx);			
	if( textSize.nx <= objWidth )
	{
		return text;
	}
	else
	{
		var hString, tString;
		var subIndex = Math.floor(text.length / 2);
		
		for( var i = subIndex ; i > 0  ; i = Math.floor(i / 2) )
		{	
				
			hString = text.substring(0, subIndex);
			tString = text.substring(subIndex, subIndex + i);
			
			if( nexacro.getTextSize(hString, font).nx + ellipseSize.nx > objWidth )
				subIndex -= i / 2;	//자른 텍스트 길이가 영역 크기보다 초과하는 경우
			else
				subIndex += i / 2;	//자른 텍스트 길이가 영역 크기보다 작은 경우
			
			textSize = nexacro.getTextSize(text.substring(0, subIndex), font);
			
			if( (textSize.nx + ellipseSize.nx) > objWidth )
				subIndex -= i / 2;
			//trace( ">>> " + i + "  [" + (textSize.nx + ellipseSize.nx) + "]" + "[" + objWidth+ "]" + " : " + text.substring(0, subIndex));
		}

		return text.substring(0, subIndex).trim() + ellipse;
	}
};