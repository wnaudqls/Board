/**
*  Transaction 공통함수
*  @FileName 	Transaction.js
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction         서비스 호출 및 콜백처리
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀       	        
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/**
 * @class 서비스 호출 공통함수 <br>
 * Dataset의 값을 갱신하기 위한 서비스를 호출하고, 트랜젝션이 완료되면 콜백함수을 수행하는 함수
 * @param {String} strSvcId - 서비스 ID
 * @param {String} [callBackFnc] - 콜백 함수명
 * @param {Boolean} [isAsync] - 비동기통신 여부 
 * @return N/A
 * @example
 * var strService  = "userService";
 * this.gfnTransaction("save", "fnCallback", true);
 */ 
pForm.gfnTransaction = function(sSvcId, callBackFnc, isAsync, bWaitCursor)
{
	var objEnv = nexacro.getEnvironment();
	var objApp = nexacro.getApplication();
	// fnCallback 함수 기본값 설정
	if (this.gfnIsNull(callBackFnc)) callBackFnc = "fn_callBack";
	
	var objDate = new Date();
	var nStartTime = objDate.getTime();
    var sStartDate = objDate.getYear()
						+"-"+String(objDate.getMonth()).padLeft(2, '0')
						+"-"+String(objDate.getDate()).padLeft(2, '0')
						+" "+String(objDate.getHours()).padLeft(2, '0')
						+":"+String(objDate.getMinutes()).padLeft(2, '0')
						+":"+String(objDate.getSeconds()).padLeft(2, '0')
						+" "+objDate.getMilliseconds();

	//실행Time 표시
	if (sSvcId.indexOf("setOrderAlloc2") >= 0)
	{
		var objDivTimer = this.getOwnerFrame().form.divTimer;
		var objDivWork = this.getOwnerFrame().form.divWork;
		var nTop = objDivWork.top - 5;
		var nLeft = parseInt(objDivWork.getOffsetWidth() / 2);
		trace(objDivWork.getOffsetWidth+" >>>>"+objDivTimer+" TOP["+nTop+"] LEFT["+nLeft+"]");
		objDivTimer.set_top(nTop);
		objDivTimer.set_left();
		if (!objDivTimer.visible) objDivTimer.set_visible(true);
		objDivTimer.form.fn_timer_start("m");		
	}

	// Async
	if ((isAsync != true) && (isAsync != false)) isAsync = true;	

	// 0. Transaction infomation 
	var inDatasets 		= "dsUserInfo=gds_userInfo dsInfo=dsInfo ";
	var outDatasets 	= "";
//	var strSvcId 		= "";
	var sService 		= "";
	var strArg 			= "";
	var nInDsCount 		= 0;
	var _dsTranInfo 	= this.dsInfo;
	var nDsInfoRowCnt 	= _dsTranInfo.getRowCount();
	if (nDsInfoRowCnt < 1) 
	{
		//공통코드 조회일때, dsInfo내용이 없으면 콜백함수를 호출한다.
		if (sSvcId == "searchComCode")
		{
			if (this[callBackFnc]) this.lookupFunc(callBackFnc).call(sSvcId, 0, "SUCCESS");
		}
		return;
	}
	
	for (var i=0;i<nDsInfoRowCnt;i++)
	{
		//strSvcId 			= _dsTranInfo.getColumn(0,"service_id"); //무조건 첫번째 행의 값만 참조
		sService 			= _dsTranInfo.getColumn(i,"service_name"); 
		strArg 				= _dsTranInfo.getColumn(i,"param"); 
		var strInDsNm 		= _dsTranInfo.getColumn(i,"in_dataset_name");
		var sIndatasetName 	= strInDsNm;
		if (strInDsNm.indexOf("=") > 0) 
		{
			sIndatasetName = strInDsNm.substr(0,strInDsNm.indexOf("="));
			_dsTranInfo.setColumn(i,"in_dataset_name",sIndatasetName);
		}
		
		trace("input ds:["+strInDsNm+"] input ds2:"+sIndatasetName);
		var strOutDsNm 	= _dsTranInfo.getColumn(i,"out_dataset_name");
		trace("output ds:["+strOutDsNm+"]");
		
		if (!this.gfnIsNull(strInDsNm)) 
		{
			inDatasets 	+= strInDsNm + " ";
		}
		if (!this.gfnIsNull(strOutDsNm)) 
		{
			var sOutDsString = "";
			//여러개의 output dataset인 경우 공백을 구분자로 자름
			if (strOutDsNm.indexOf(" ") > 0) 
			{
				var arrOutDsList = strOutDsNm.split(" ");
				for (var m=0;m<arrOutDsList.length;m++)
				{
					sOutDsString += arrOutDsList[m] + "=" + arrOutDsList[m] + " ";
				}
			}
			else 
			{
				sOutDsString = strOutDsNm + "=" + strOutDsNm + " ";
			}
			outDatasets += sOutDsString;
		}			
	}
	inDatasets = nexacro.trimRight(inDatasets);
	outDatasets = nexacro.trimRight(outDatasets);
	
	
	// 1. callback에서 처리할 서비스 정보 저장
	var objSvcID = { 
			svcId     : sSvcId,
			svcUrl    : sService,
			callback  : callBackFnc,
			isAsync   : isAsync,
			outDsInfo : outDatasets,
			startDate : sStartDate,
			startTime : nStartTime };

	// 2. strServiceUrl
	var strServiceUrl = objEnv.services["svcurl"].url;
	
	if (sSvcId == "login")
	{
		strServiceUrl += "login/login.do";
	}
	else 
	{
		strServiceUrl += "tgsCommon.do";
	}
	
	// 3. strArg
	var strArguments = "";

	if (!this.gfnIsNull(strArg)) {
		strArguments += strArg;
	}

	
	// 개발시에는 xml, 개발서버/운영서버는 SSV로 통신
	var nDataType;	
	if (nexacro.getEnvironmentVariable("evRunMode") == "2") 
	{
		nDataType = 2;
	}
	else {
		nDataType = 0;
	}
	trace("#1 New argument = [" + strArguments+"]");
	trace("#2 New inDs = [" + inDatasets + "]  #3 outDs=[" + outDatasets + "]");	
	trace("#3 New service Url= ["+strServiceUrl+"]");

	if (this.gfnIsNull(bWaitCursor)) 
	{
		this.gfnSetWaitCursor(true);
	}
	else 
	{
		this.gfnSetWaitCursor(false);
	}
	
	this.transaction( JSON.stringify(objSvcID)  //1.svcID
					, strServiceUrl             //2.strServiceUrl
					, inDatasets                //3.inDataSet
					, outDatasets               //4.outDataSet
					, strArguments              //5.arguments
					, "gfnCallback"				//6.strCallbackFunc
					, isAsync                   //7.bAsync
					, nDataType                 //8.nDataType : 0(XML 타입), 1((Binary 타입),  2(SSV 타입) --> HTML5에서는 Binary 타입은 지원안함
					, false);                   //9.bCompress ( default : false ) 
};
/**
 * @class 공통 Callback 함수 <br>
 * 이 함수가 먼저 수행되고 사용자지정Callback함수가 수행된다.
 * @param {String} svcID - 서비스 ID
 * @param {Number} errorCode - 에러코드(정상 0, 에러 음수값)
 * @param {String} [errorMsg] - 에러메시지
 * @return N/A
 */
pForm.gfnCallback = function(svcID,errorCode,errorMsg)
{
	this.gfnSetWaitCursor(false);//WaitCursor 안보이드록 처리 21.12.03
	
	if (nexacro.getEnvironmentVariable("evErrorMode") == true)
	{
		trace("통신에러가 발생하였습니다.");
		nexacro.setEnvironmentVariable("evErrorMode", false);
		this.alert("서버에러가 발생하였습니다.\n다시 시도해 주세요.");
		return false;
	}
	
	var objSvcID = JSON.parse(svcID);
	
	//실행Time 표시
	if (objSvcID.svcId.indexOf("setOrderAlloc2") >= 0)
	{
		var objDivTimer = this.getOwnerFrame().form.divTimer;
		trace("공통콜백>>>>"+objDivTimer);
		objDivTimer.set_visible(false);
		objDivTimer.form.Button01_onclick();		
	}	
	// 에러 공통 처리
	if(errorCode != 0)
	{
		switch(errorCode)
		{
			case -1 :				
				//var arrError = (""+errorMsg).split("Query is");
				// 서버 오류입니다.\n관리자에게 문의하세요.
				trace("공통 콜백 오류 발생:"+errorCode);
				var sShowMsg = this.gfnGetApplication().gds_message.lookup("MSG_ID", errorMsg, "MSG_CTNT");
				//this.gfnAlert(errorMsg);
				//alert(sShowMsg);//gfnAlert으로 팝업을 실행전에 로그인 페이지로 이동함. alert으로 멈추도록 수정 21.08.10

				
				if (errorMsg == "sys.error.00005")
				{
					alert(sShowMsg);//gfnAlert으로 팝업을 실행전에 로그인 페이지로 이동함. alert으로 멈추도록 수정 21.08.10
					if (this.gfnIsNRE())
					{
						//exit 후 재실행
						this.gfnGetApplication().exit();
					}
					else
					{
						this.gfnGetApplication().gds_userInfo.clearData();
						window.location.href = window.location.href;	
						return;
					}
				
				}
				break;
				
			case -2463215:
				//@todo : 임의 에러코드  처리
				//return false;
				break;
		}
	}

	// 서비스 실행결과 출력
	var sStartDate = objSvcID.startDate;
	var nStartTime = objSvcID.startTime;
	
	var objDate = new Date();0
	var sEndDate = objDate.getYear()
					+"-"+String(objDate.getMonth()).padLeft(2, '0')
					+"-"+String(objDate.getDate()).padLeft(2, '0')
					+" "+String(objDate.getHours()).padLeft(2, '0')
					+":"+String(objDate.getMinutes()).padLeft(2, '0')
					+":"+String(objDate.getSeconds()).padLeft(2, '0')
					+" "+objDate.getMilliseconds();
	var nElapseTime = (objDate.getTime() - nStartTime)/1000;
	
	var sMsg = "";
	if (errorCode == 0)
	{
		sMsg = "gfnCallback : svcID>>"+objSvcID.svcId+ ",  callback>>"+objSvcID.callback+ ",  errorCode>>"+errorCode + ", errorMsg>>"+errorMsg + ", isAsync>>" + objSvcID.isAsync + ", sStartDate>>" + sStartDate + ", sEndDate>>"+sEndDate + ", nElapseTime>>"+nElapseTime;
		trace(sMsg);
	}
	else {
		sMsg = "gfnCallback : svcID>>"+objSvcID.svcId+ ",  svcUrl>>"+objSvcID.svcUrl+ ",  errorCode>>"+errorCode + ", isAsync>>" + objSvcID.isAsync + ", sStartDate>>" + sStartDate + ", sEndDate>>"+sEndDate + ", nElapseTime>>"+nElapseTime;
		sMsg += "\n==================== errorMsg =======================\n"+errorMsg+"\n==================================================";
		trace(sMsg);
	}
	//transaction information 초기화.
	this.dsInfo.clearData();
	/*	
	if (objSvcID.svcId == "searchComCode") 
	{
		for (var i = 0; i < this.ds_comcode.rowcount; i++) 
		{
			this._ds_groupCode.filter("CTYPE_CD == " + nexacro.wrapQuote(this.ds_comcode.getColumn(i, "CTYPE_CD")));
			this.objects[this.ds_comcode.getColumn(i, "DATASETNAME")].copyData(this._ds_groupCode, true);
		}
	}
	*/	
	if (objSvcID.svcId == "searchComCode") 
	{
		//trace("공통코드 outDsInfo:"+objSvcID.outDsInfo);
		/*
		var arrOutDsList = objSvcID.outDsInfo.split(" ");
		for (var i=0;i<arrOutDsList.length;i++)
		{
			var sComDsNm = arrOutDsList[i].substr(0,arrOutDsList[i].indexOf("="));
			//trace("out Ds:["+sComDsNm+"]");
			if (!this.gfnIsNull(sComDsNm)) 
			{
				var oComDs = this.objects[sComDsNm];
				this.gfnGetApplication().gds_comCode.appendData(oComDs);	
				this._gfnComboInit(this,oComDs);
			}
		}
		*/
		this._gfnSetOutDsCommCode(objSvcID);
	}
	else if(objSvcID.svcId.indexOf("search") >=0 )
	{		
		//trace("공통콜백 outDs:"+objSvcID.outDsInfo);
		var _arrOutDsList = objSvcID.outDsInfo.split(" ");
		for (var i=0;i<_arrOutDsList.length;i++)
		{
			var _sOutDatasetNm =_arrOutDsList[i].substr(0,_arrOutDsList[i].indexOf("="));
			//trace("공통콜백 outDs2:"+_sOutDatasetNm);
			var _oOutDs =  this.objects[_sOutDatasetNm];
			if (this.gfnIsNull(_oOutDs)) break;
			
			var _sCType = "";
			if (!this.gfnIsNull(_oOutDs.controlType)) _sCType = _oOutDs.controlType;
			//trace("공통콜백 outDs2 프로토타입:"+_oOutDs.prototype);
			if(_sCType.toLowerCase() == "save")
			{
				var _oColumnInfoStatus = _oOutDs.getColumnInfo("PROC_STATUS"); //글로벌 변수 사용?
				var _oColumnInfoDelete = _oOutDs.getColumnInfo("PROC_DELETE");
				//trace("공통콜백 outDs2 컬럼정보:["+_oColumnInfoStatus+"] ["+_oColumnInfoDelete+"]");
				_oOutDs.set_enableevent(false);
				if (this.gfnIsNull(_oColumnInfoStatus))
				{
					_oOutDs.addColumn("PROC_STATUS","STRING",1);
				}
				if (this.gfnIsNull(_oColumnInfoDelete))
				{
					_oOutDs.addColumn("PROC_DELETE","STRING",1);
				}		
				_oOutDs.set_enableevent(true);
				_oOutDs.applyChange();	
				//trace(_oOutDs.saveXML());	
			}			
		}	
	}
	
	// SSC 주석 처리
	if (errorCode == -1) 
	{
	
	}
	
	
	// 화면의 callBack 함수 실행
	if(!this.gfnIsNull(objSvcID.svcId))
	{
		// form에 callback 함수가 있을때
		if (this[objSvcID.callback]) this.lookupFunc(objSvcID.callback).call(objSvcID.svcId, errorCode, errorMsg);
	}
};
/**
 * @class Global Dataset에 공통코드가 해당 그룹코드로 존재하는지 확인 <br>
 * Global -> Form Dataset으로 복사한다.
 * @param {Object} Servcie ID  - 트랜잭션 outdataset Array
 * @return {array} input/output dataset 
 */
pForm._gfnFindCommCodeFromGlobal = function(argSvcID, argOutDsNm, argParam)
{
		var bReturnVal = false;
		var strOutDsNm = argOutDsNm;
		var _oGdsComCode = this.gfnGetApplication().gds_comCode;
		//공통코드 조회인 경우
		if (argSvcID == "searchComCode")
		{
			var nCount = _oGdsComCode.findRow("GROUP_CD", argParam);
			//trace("["+this.opener+"] global comcode findrow:"+nCount+" GROUP_CD:["+argParam+"]");
			//Global 공통코드 데이터셋에 이미 데이터가 존재한다면
			if (nCount >= 0) 
			{
				//글로벌 데이터셋에 존재하면 화면 Dataset에 복사한다.
				//if (!this.gfnIsNull(this.opener)) 
				//{
					if (this.gfnIsNull(this.objects[strOutDsNm]))
					{
						var _dsout = new Dataset;
						this.addChild(strOutDsNm, _dsout);	
						var _nColCnt = _oGdsComCode.getColCount();
						for (var k=0;k<_nColCnt;k++)
						{
							var _oColInfo = _oGdsComCode.getColumnInfo(k);
							_dsout.addColumn(_oColInfo.name, _oColInfo.type, _oColInfo.size);
						}
					}
					//trace("동적 생성한 데이터셋:"+_dsout.saveXML());
					//extractRows
					var arrFilterRow = _oGdsComCode.extractRows("GROUP_CD=='"+argParam+"'");
					trace("공통코드 찾은 행:"+arrFilterRow);
					for (var i=0;i<arrFilterRow.length;i++)
					{
						var nAddRow = this.objects[strOutDsNm].addRow();
						this.objects[strOutDsNm].copyRow(nAddRow,_oGdsComCode, arrFilterRow[i]);
					}
					//this.gfnGetApplication().gds_comCode.filter("GROUP_CD=='"+argParam+"'");
					//var nCopyRowCnt = this.objects[strOutDsNm].copyData(this.gfnGetApplication().gds_comCode);
					//this.gfnGetApplication().gds_comCode.filter("");
					//trace("공통코드가 이미 존재하여 복사한 행개수:"+nCopyRowCnt);	
					//그룹코드로 필터링한 공통코드를 화면 데이타셋으로 복사한다.
					this._gfnComboInit(this,this.objects[strOutDsNm]);
				//}
				bReturnVal = true;
			}
		}	
		return bReturnVal;
};
/**
 * @class 공통코드 콤보 처리 <br>
 * outdataset을 global 공통코드 dataset에 copy한다.
 * @param {Object} Servcie ID  - 트랜잭션 outdataset Array
 * @return N/A
 */
pForm._gfnSetOutDsCommCode = function(objSvcID)
{
	var arrOutDsList = objSvcID.outDsInfo.split(" ");
	//trace(arrOutDsList.length+"******************"+objSvcID.outDsInfo);
	for (var i=0;i<arrOutDsList.length;i++)
	{
		var sComDsNm = arrOutDsList[i].substr(0,arrOutDsList[i].indexOf("="));
		//trace("out Ds:["+sComDsNm+"]");
		if (!this.gfnIsNull(sComDsNm)) 
		{
			var oComDs = this.objects[sComDsNm];
			var oGdsCom = this.gfnGetApplication().gds_comCode;
			var sGrpCd = oComDs.name.replace("ds","");
			for (var k=0;k<oComDs.getRowCount();k++)
			{
				var _nAddRow = oGdsCom.addRow();
				var sColString = "";
				for (var j=0;j<oComDs.getColCount();j++)
				{
					//trace(oComDs.getColID(j));
					var _sFColNm = oComDs.getColID(j);
					var _sTColNm = _sFColNm;
					sColString += _sFColNm + "=" + _sTColNm + ",";
				}
				//trace(sColString+" last index:"+sColString.lastIndexOf(","));
				sColString = sColString.substr(0,sColString.lastIndexOf(","));
				oGdsCom.copyRow(_nAddRow,oComDs,k,sColString);
				oGdsCom.setColumn(_nAddRow,"GROUP_CD",sGrpCd);
			}
			
			this._gfnComboInit(this,oComDs);
		}
	}	
};
/**
 * @class 코드콤보 공통함수 <br>
 * 이 함수가 먼저 수행되고 사용자지정Callback함수가 수행된다.
 * @param {Object} objForm - 폼 오브젝트
 * @param {Dataset} objDs - 데이터셋
 * @return N/A
 */
pForm._gfnComboInit = function(objForm, objDs)
{
	var arrComp = objForm.components;
	var nLength = arrComp.length;

	for (var i=0; i<nLength; i++)
	{
		if (arrComp[i] instanceof nexacro.Div)
		{
			if (this.gfnIsNull(arrComp[i].url))
			this._gfnComboInit(arrComp[i].form, objDs);
		}
		else if (arrComp[i] instanceof nexacro.Tab)
		{
			var nPages = arrComp[i].tabpages.length;
			
			for (var j=0; j<nPages;j++)
			{	
				// URL로 링크된 경우에는 존재하는 경우에는 해당 링크된 Form Onload에서 처리하도록 한다.
				if (this.gfnIsNull(arrComp[i].tabpages[j].url))
					this._gfnComboInit(arrComp[i].tabpages[j].form, objDs); //재귀함수
			}			
		}
		else if (arrComp[i] instanceof nexacro.Combo)
		{
			//trace(arrComp[i].name+":::"+arrComp[i].comcode+" dataset["+objDs.name+"]");
			//trace(objDs.name);
			var sComCode = arrComp[i].comcode;
			if (this.gfnIsNull(sComCode) == false)
			{
				//trace(objDs.name+">>>>>>>>>>>>>>"+objDs.getCaseCount("CD_NM == '선택'"));
				var arrComCode = sComCode.split(",");
				if (objDs.name.indexOf(arrComCode[0]) > 0)
				{
					//trace("*************공통콤보:"+arrComCode);
					var sCode = "CD";
					var sCodeNm = "CD_NM";	
					var sComboText = this.gfnGetMessage("sys.msg.00012");
					if (arrComCode.length == 4)
					{
						sCode = arrComCode[1];
						sCodeNm = arrComCode[2];
						sComboText = arrComCode[3];					
					}
					if (objDs.getCaseCount(sCodeNm+" == '"+sComboText+"'") == 0)
					{
						objDs.insertRow(0);
						objDs.setColumn(0,sCode,"");
						objDs.setColumn(0,sCodeNm,sComboText);					
					}
					arrComp[i].set_codecolumn(sCode);
					arrComp[i].set_datacolumn(sCodeNm);
					arrComp[i].set_innerdataset(objDs.name);
					arrComp[i].set_index(0);					
				}

				
			}
		}
	}	
};
/**
 * @class 서비스 정보 공통함수 <br>
 * Transaction을 처리하기 위한 각 정보들을 처리하기 위한 함수
 * @param {String} sMode - 서비스 ID
 * @param {String} sClassNm - 콜백 함수명
 * @param {String} sServiceNm - Service
 * @param {array} sMethodNm - 메소드 (쿼리 ID)
 * @param {String} inDataset - input datasets
 * @param {String} outDataset - output datasets
 * @param {String} [sParam] - 파라메터
 * @param {String} [sPackageNm] - 패키지명
 * @param {String} [sDirectMethodNm] - 직접 호출 서비스명 
 * @return N/A
 * @example
 * this.gfnAddService("save", "MatlStockChgMapper", "", ["insert_stcokchg_h","delete_stcokchg_h"], "ds_et_header2=ds_et_header:U", "", "", "", "");
 */ 
pForm.gfnAddService = function()
{
	var _arrModeValue = ["insert","update","delete"];

	if (arguments.length == 0) 
	{
		var arrArg = ["함수인자"]; 
		this.gfnAlert("sys.msg.00181",arrArg);
		return;
	}
	else 
	{
		var sAlertMsg = [];
		if (this.gfnIsNull(arguments[0])) sAlertMsg[0] = "Mode인자값";
		if (this.gfnIsNull(arguments[1])) sAlertMsg[0] = "Class인자값";
		//if (this.gfnIsNull(arguments[2])) sAlertMsg[0] = "Service 인자값";
		if (this.gfnIsNull(arguments[8])) 
		{
			if (this.gfnIsNull(arguments[3])) sAlertMsg[0] = "Method인자값";
		}
		
		
		if (sAlertMsg.length > 0) 
		{ 
			this.gfnAlert("sys.msg.00215",sAlertMsg);	
			return; 
		}
	}
	var _dsInfo = this.dsInfo;
	var sPackageNm = "";
	if (this.gfnIsNull(arguments[7])) 
	{
		sPackageNm = "com.nexacro.sr30.mapper.";
	}
	else 
	{
		sPackageNm = "com.nexacro.sr30.mapper." + arguments[7];
	}
	//arguments 확인
	for (var i = 0; i < arguments.length; i++)
	{
		trace(i+" 번째 값:"+ arguments[i]);
	}

	//sqlLogInterceptor에서 CE_ID가 없는 경우, 발생하는 오류를 해결하기 위해서 추가한 로직		
	var _inDsFullName = arguments[4];
	if (!this.gfnIsNull(_inDsFullName)) 
	{
		trace("input Dataset에 S_USER_ID가 있는지 확인하고 없으면 추가한다.");
		var arrInDs = _inDsFullName.split(" ");
		for (var m=0;m<arrInDs.length;m++)
		{
			var arrInDsName = arrInDs[m].split("=");
			var nIndex = arrInDsName[1].indexOf(":");
			if (nIndex == -1) nIndex = arrInDsName[1].length;
			
			var _inDsObj = arrInDsName[1].substr(0,nIndex);
			trace(">>>>>>>>"+_inDsObj);
			//trace(this.objects[_inDsObj].saveXML());	
			var __inDs = this.objects[_inDsObj];
			if (this.gfnIsNull(__inDs))
			{
				trace("this에 없는 경우 부모Form에서 다시 찾는다.");
				var __nDsCount = this.objects.length;
				for (var i=0;i<__nDsCount;i++)
				{
					trace(i+"번째 Dataset:"+this.objects[i].name);
				}
				var objForm = this.getOwnerFrame();
				trace("부모창 확인 팝업/메인 여부 확인필요:"+objForm.name);//objForm.parent instanceof nexacro.ChildFrame
				if (objForm.parent instanceof nexacro.ChildFrame)
				{
					trace("팝업창입니다");
				}
				else
				{
					__inDs = objForm.form.divWork.form.objects[_inDsObj];
					//trace(__inDs.saveXML());					
				}
			}
			else 
			{
				// TODO : transaction시 전체 데이터가 넘어가서 우선 주석처리. PJY 2021.11.09
// 				var _nColCnt = __inDs.getColCount();
// 				var sFoundResult = "";
// 				for (var k=0;k<_nColCnt;k++)
// 				{
// 					var _oColInfo = __inDs.getColumnInfo(k);
// 					if (_oColInfo.name == "S_USER_ID")
// 					{
// 						sFoundResult = "exist";
// 					}
// 				}	
// 				
// 				if (sFoundResult != "exist")
// 				{
// 					__inDs.addColumn("S_USER_ID", "STRING", 255); //input dataset에 S_USER_ID컬럼 추가
// 				}
// 				var nLoopCnt = __inDs.getRowCount();
// 				for (var s=0;s<nLoopCnt;s++)
// 				{
// 					__inDs.setColumn(s,"S_USER_ID",this.gfnGetApplication().gds_userInfo.getColumn(0,"S_USER_ID")); //Global Dataset의 S_USER_ID 가져옴
// 				}			
				//trace(__inDs.saveXML());					
			}
		
		}
	}

	var nRow =_dsInfo.addRow();
	
	_dsInfo.setColumn(nRow,"service_id",arguments[0]);
	//직접서비스호출이 아닌경우
	if (this.gfnIsNull(arguments[8]))
	{
		if (arguments[0].toLowerCase() == "save")
		{
			var arrMethod = arguments[3];
			if (arrMethod.length == 0) return;
			for (var i=0;i<arrMethod.length;i++)
			{
				var strMethodNm = arrMethod[i].toLowerCase();
				trace(i+" 메소드::"+strMethodNm); 
				
				var sMode = "";
				var sMethod = strMethodNm;
				for (var j=0;j<_arrModeValue.length;j++)
				{
					if (strMethodNm.indexOf(_arrModeValue[j]) >=0 )
					{
						sMode = _arrModeValue[j];
						break;
					}				
				}
				trace("mode:["+sMode+"]"); 
				if (this.gfnIsNull(sMode)) 
				{
					this.gfnAlert("sys.msg.00215");
					return;
				}
				
				switch(sMode)
				{
					case "insert":
						_dsInfo.setColumn(nRow,"insert_method_name",sMethod);
						break;
					case "update":
						_dsInfo.setColumn(nRow,"update_method_name",sMethod);
						break;
					case "delete":
						_dsInfo.setColumn(nRow,"delete_method_name",sMethod);
						break;
					default :
						break;
				}
			}

		}
		else 
		{
			_dsInfo.setColumn(nRow,"select_method_name",arguments[3]);
			//var oForm = arguments[8];
			if (arguments[0].indexOf("ComCode") > 0) 
			{
				var sGroup 	= arguments[6];
				var sLen 	= sGroup.length;
				if (sLen == 0) return;	
				// Create Object
				var sDsInId 	= "dsIn"+sGroup;
				var sDsOutId 	= "ds"+sGroup;
				//trace("dsname:"+sDsInId);
				//Global(gds_comCode)에 공통코드가 이미 존재하는지 확인
				var bReturnVal = this._gfnFindCommCodeFromGlobal(arguments[0],sDsOutId,sGroup);		
				//공통코드가 존재하면 AddService하지 않는다.
				if (bReturnVal) 
				{
					trace("공통코드 존재하여 AddService 중단........");
					_dsInfo.deleteRow(nRow);
					return; 
				}
				var _ds 		= "";
				var _dsout 		= "";
				//input dataset내용이 없으면 공통코드 조회용 input/output dataset을 동적 생성.
				if (this.gfnIsNull(arguments[4]))
				{
					if (this.gfnIsNull(this.objects[sDsInId])) 
					{
						_ds = new Dataset;
						_dsout = new Dataset;
						this.addChild(sDsInId, _ds);
						this.addChild(sDsOutId, _dsout);
					}
					else 
					{
						_ds = this.objects[sDsInId];
						_dsout = this.objects[sDsOutId];
					}
					_ds.assign(this.dsSearchInfo);
					_ds.clearData();
					_ds.addRow();
					_ds.setColumn(0,"I_GROUP_CD",sGroup);
					//trace("ds contents:"+_ds.saveXML());
					arguments[4] = _ds.name + "=" + _ds.name;
					arguments[5] = _dsout.name;					
				}
			}
		}		
	}

	_dsInfo.setColumn(nRow,"class_name",arguments[1]);
	_dsInfo.setColumn(nRow,"in_dataset_name",arguments[4]);
	_dsInfo.setColumn(nRow,"out_dataset_name",arguments[5]);
	_dsInfo.setColumn(nRow,"service_name",arguments[2]);
	_dsInfo.setColumn(nRow,"package_name",sPackageNm);
	_dsInfo.setColumn(nRow,"param",arguments[6]);
	_dsInfo.setColumn(nRow,"class_direct_method_name",arguments[8]);
};
/**
 * @class Global Dataset에 공통코드가 해당 그룹코드로 존재하는지 확인 <br>
 * Global -> Form Dataset으로 복사한다.
 * @param {Boolean} true:Wait Cursor 보여주기, false:Wait Cursor 숨기기
 * @return 없음
 */
pForm.gfnSetWaitCursor = function(argMode)
{
	if (argMode == true)
	{
		this.setWaitCursor(argMode, true);//WaitCursor를 표시한다. Default
	}
	else 
	{
		trace("["+this.name+"] WaitCursor를 강제로 표시하지 않도록 한다.");
		this.setWaitCursor(argMode, true);//WaitCursor를 강제로 표시하지 않도록 한다.
	}
	
};