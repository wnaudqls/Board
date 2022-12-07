/**
*  컨설팅 표준화 작업
*  @FileName 	Message.js 
*  @Creator 	consulting
*  @CreateDate 	2021.05
*  @Desction   		
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.08     	이노다임 개발팀 	          	최초 생성 
*  2021.05.17     	이노다임 개발팀  	           	주석 정비
*  2021.05.16		이노다임 개발팀				gfnGetApplication 공통함수 변경
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/**
 * @class 메세지팝업오픈
 * @param {String} sMsgId - 메세지ID	
 * @param {Array} arrArg - 메세지에 치환될 부분은 "{0~N}"이 되고 치환값은 배열로 넘김 
 * @param {String} [sPopId] - 팝업ID(하나의 callback함수에서 중복된 메시지 처리를 할 경우 PopId구분을 위해 unique한 ID 반드시 사용)
 * @param {String} [sCallback] - 팝업콜백 (confirm성 메시지를 사용시 반드시 필요)
 * @return N/A
 * @example
 * this.gfnAlert(this, "A", "확인하세요");	
 */
pForm.gfnAlert = function (sMsgId, arrArg, sPopId, sCallback)
{
    var objApp = pForm.gfnGetApplication();
	if(objApp.gds_message.findRow("MSG_ID", sMsgId) < 0) return false;

	var sColumn  = "MSG_CTNT";
	var sMsg = objApp.gds_message.lookup("MSG_ID", sMsgId, sColumn);
	
	if( this.gfnIsNull(sMsg) ) sMsg = "확인";
	// 줄바꿈 변경
	sMsg = sMsg.replace(/\\n/g, String.fromCharCode(10));
	sMsg =  pForm.gfnConvertMessageNew(sMsg, arrArg);
	
	var sMsgType = objApp.gds_message.lookup("MSG_ID", sMsgId, "MSG_TYPE_CD");	
	if (this.gfnIsNull(sMsgType) ) 
	{
		var ret = new RegExp(/\?/g).test(sMsg);
		if (ret == true)
		{
			sMsgType = "C"; //메세지에 ?가 있으면 confirm으로 설정 21.05.24
		}
		else 
		{
			sMsgType = "A";//기본값을 alert으로 설정 21.04.26 추가
		}
	}
	if( this.gfnIsNull(sPopId) ) sPopId = sMsgId;
	
	var sMsgUrl ="";
	var sTitleText = "";
	var sButton = arguments[4];
	switch(sMsgType) {
		case "A":
			sMsgUrl = "comm_pop::compop0002.xfdl";
			sTitleText = "Alert";
			break;
		case "C":
			sMsgUrl = "comm_pop::compop0001.xfdl";
			sTitleText = "Confirm";
			if(this.gfnIsNull(sCallback)) trace("callback함수를 지정하지 않았습니다");
			break;
	}
	
	var oArg = {paramContents:sMsg,paramButton:sButton};
	var oOption = {titlebar:"true",title:sTitleText};	
	
	// messagePopup 여부 전역변수
	if (this.gfnGetApplication().gv_messagePop == "true") {
		this.gfnOpenPopup(sPopId,sMsgUrl,oArg,sCallback,oOption);
	}
	// alert-cofirm
	else {
		if (sMsgType == "A") {
			alert(sMsg);
		}
		else {
			return confirm(sMsg);
		}
	}
};

/**
 * @class 메세지 치환
 * @param {String} msg - 메세지	
 * @param {Array} values - 메세지에 치환될 부분은 "{0~N}"이 되고 치환값은 배열로 넘김 
 * @return {String}
 */
pForm.gfnConvertMessage = function(msg, values) 
{
    return msg.replace(/\{(\d+)\}/g, function() {
        return values[arguments[1]];
    });
};

/**
 * @class 메세지 치환 후 완성된 메시지 리턴
 * @param {String} sMsgId - 메세지ID	
 * @param {Array}  arrArg - 메세지에 치환될 부분은 "{0~N}"이 되고 치환값은 배열로 넘김 
 * @return {String}
 */
pForm.gfnGetMessage = function(sMsgId, arrArg) 
{
    var objApp = this.gfnGetApplication();
	if(objApp.gds_message.findRowNF("MSG_ID", sMsgId) < 0) 
	{
		trace("메세지를 찾을수 없습니다.");
		return "";
	}
	

	var sColumn  = "MSG_CTNT";
	var sMsg = objApp.gds_message.lookup("MSG_ID", sMsgId, sColumn);
	//trace("메세지1:"+sMsg);

	// 줄바꿈 변경
	sMsg = sMsg.replace(/\\n/g, String.fromCharCode(10));
	//trace("메세지2:"+sMsg);
	sMsg =  pForm.gfnConvertMessage(sMsg, arrArg);
	//trace("메세지3:"+sMsg);
	return sMsg;
};

/**
 * @class 메세지 형태 확인
 * @param {String} msg - 메세지	
 * @return {String} - 정규표현식 
 */
pForm.gfnRegExpr = function(msg)
{
	var reg = new RegExp(/\@/g).test(msg);
	var nIdx = 1;
	if (reg) nIdx = 0;
	
	var arrP = [];
	arrP.push(/(\@+)/);
	arrP.push(/\{(\d+)\}/);
	
	return arrP[nIdx];
};
/**
 * @class 메세지 치환 신규
 * @param {String} msg - 메세지	
 * @param {Array} values - 메세지에 치환될 부분은 "@" 혹은 "{0~N}"이 되고 치환값은 배열로 넘김 
 * @return {String}
 */
pForm.gfnConvertMessageNew = function(msg,values)
{
	var i = 0;
	var func = function () {
		return values[i++];
	}
	var arrExpr = pForm.gfnRegExpr(msg);
	var re = new RegExp(arrExpr,"g");
	var str1 = msg.replace(re, func);
	trace("메세지 변환:"+arrExpr+"  치환:"+re+"  결과:"+str1);
	return str1;
};