/**
*  엑셀 공통함수
*  @FileName 	Excel.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀 	           	최초 생성 
*  2021.05.27     	이노다임 개발팀       	        주석 정비
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;
this.objGridExcel;
pForm.gfnExcelExport = function(objGrid,  sSheetName, sFileName)
{
	this.objGridExcel = objGrid;
	var sIsExistCustNm = "";
	trace(">>>>>"+objGrid.name);
	var _bindDs = objGrid.getBindDataset();
	//trace("Grid binddataset:"+_bindDs.name);
	if (this.gfnIsNull(_bindDs)) return;
	
	var IsCustNmCheck = objGrid._custNmSkipYn;
	trace("그리드 UserProperty ::::::::::::::"+IsCustNmCheck);
	if (this.gfnIsNull(IsCustNmCheck))
	{
		var _nColCnt = _bindDs.getColCount();
		for(var i=0;i<_nColCnt;i++)
		{
			var _oColInfo = _bindDs.getColumnInfo(i);
			if (_oColInfo.name == "CUST_NM")
			{
				sIsExistCustNm = "exist";
			}
		}
		var nRowCount = _bindDs.getRowCount();
		if (nRowCount < 1)
		{
			sIsExistCustNm = "";
		}
	}

	trace("CUST_NM 존재하는지 확인결과:"+sIsExistCustNm);
	//sIsExistCustNm = "exist";
	if (sIsExistCustNm == "exist")
	{
		var oArg = {
			p_pmgid : this.parent.parent.fv_formParam.MENU_ID
			,p_sSheetName : sSheetName
			,p_sFileName : sFileName
		};
		var oOption = {title:"엑셀자료 다운로드 사유"};
		//사용자조회 팝업 호출
		this.gfnOpenPopup("popExcelDownReason", "comm_pop::compop0130.xfdl", oArg, "gfnCallbackPopup", oOption);			
	}
	else 
	{
		this.gfnExcelExportProcess(objGrid,  sSheetName, sFileName);
	}

};

//팝업 콜백
pForm.gfnCallbackPopup = function (sPopupId, sVariant)
{
	switch (sPopupId) 
	{
		case "popExcelDownReason":
			trace("넘겨받은 파라메터:"+sVariant);
			if (this.gfnIsNull(sVariant)) 
			{
				//엑셀다운로드 사유를 입력하지 않은 경우, return
				return;
			}
			var objGrid = this.objGridExcel;
			var sSheetName;
			var sFileName;
			var sFilePwd;
			var arrParam = sVariant.split("&");
			for (var i=0;i<arrParam.length;i++)
			{
				var arrP = arrParam[i].split("=");
				
				switch(arrP[0]) {
				case "strSheetNm":
					sSheetName = arrP[1];
					break;
				case "strFileNm":
					sFileName = arrP[1];
					break;		
				case "filePwd":
					sFilePwd = arrP[1];
					break;						
				default:
				}
			}
			trace("그리드:"+objGrid);
			trace("엑셀 익스포트 처리 시작 전 Param Info Sheet Name:"+sSheetName+"  File Name:"+sFileName+"   passwd:"+sFilePwd);
			this.gfnExcelExportProcess(objGrid,  sSheetName, sFileName, sFilePwd);
			break;
		default:
			break;
	}
};
/**
 * @class excel export <br>
 * @param {Object} objGrid - Grid Object	
 * @param {String} [sSheetName]	- sheet name
 * @param {String} [sFileName]	- file name
 * @return N/A
 * @example
 * this.gfnExcelExport(this.grid_export, "SheetName","");
 */
pForm.gfnExcelExportProcess = function(objGrid,  sSheetName, sFileName, sFilePwd)
{

	this.setWaitCursor(true);
	var objGrid_excel = objGrid;
	
	var sMenuNm = "";
	
	//팝업에서 엑셀 다운로드하는 경우
	if(this.getOwnerFrame().form.isFormMode == "popup"){
		sMenuNm = this.getOwnerFrame().opener.getOwnerFrame().form.fv_formParam.MENU_NM;
		
	//메인에서 엑셀 다운로드 하는 경우
	} else {
		sMenuNm = this.getOwnerFrame().form.fv_formParam.MENU_NM;
	
	}
	
	
	// 엑셀 Export파일명이 없는 경우 메뉴명 디폴트 셋팅. 2021.11.10 PJY
	if (this.gfnIsNull(sFileName)) {
		sFileName = this.gfnNvl(sMenuNm, "ExcelExport") + "_" + this.gfnGetDate("time");
	}
	
	if (this.gfnIsNull(sSheetName)) {
		sSheetName = "Sheet1";
	}
	
	var regExp = /[?*:\/\[\]]/g;  				//(엑셀에서 지원하지않는 모든 문자)
	
	sFileName = sFileName.replace(regExp,"");	//파일명에 특수문자 제거
	sSheetName = sSheetName.replace(regExp,""); //시트명에 특수문자 제거
	
	//fileName nullcheck
	sFileName = this.gfnIsNull(sFileName) ? "ExcelExport" + "_" + this.gfnGetDate() : sFileName;
	//sheetName nullcheck
	var sDefaultSheetNm = this.gfnIsNull(sMenuNm) ? "Sheet1" : sMenuNm;
	sSheetName = this.gfnIsNull(sSheetName) ? sDefaultSheetNm : sSheetName;
	//sheetName 30이상일경우 기본시트명
	if( String(sSheetName).length > 30 ){
		sSheetName =  sDefaultSheetNm;
	}
	
	var svcUrl = "svcurl::XExportImport.do";
	this.objExport = null
	this.objExport = new ExcelExportObject();
	
	this.objExport.objgrid = objGrid_excel;
	this.objExport.set_exporturl(svcUrl);
	this.objExport.addExportItem(nexacro.ExportItemTypes.GRID, objGrid_excel, sSheetName+"!A1","allband","allrecord");
	this.objExport.set_exportfilename(sFileName);	
	
 	this.objExport.set_exporteventtype("itemrecord");
 	this.objExport.set_exportuitype("none");
 	this.objExport.set_exportmessageprocess("");
	this.objExport.set_exporttype(nexacro.ExportTypes.EXCEL2007);
	if(!this.gfnIsNull(sFilePwd)) {
		trace("password set.....");
		this.objExport.set_exportfilepassword( sFilePwd );
	}
	
	this.objExport.addEventHandler("onsuccess", this.gfnExportOnsuccess, this);	
	this.objExport.addEventHandler("onerror", this.gfnExportOnerror, this);	
		
	var result = this.objExport.exportData();
};

/**
 * @class excel export on sucess <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.gfnExportOnsuccess = function(obj, e)
{	
	this.setWaitCursor(false);
	this.objGridExcel = "";
};

/**
 * @class  excel export on error <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.gfnExportOnerror = function(obj,  e)
{
	this.alert("Excel Export Error!!");
	this.setWaitCursor(false);
	this.objGridExcel = "";
};

/**
 * @class  excel import( 데이터 헤더포함 ) <br>
 * @param {String} objDs - dataset	
 * @param {String} [sSheet]	- sheet name(default:Sheet1)
 * @param {String} sHead - Head 영역지정	
 * @param {String} [sBody] - body 영역지정(default A2)	
 * @param {String} [sCallback]	- callback 함수
 * @param {String} [sImportId] - import id(callback호출시 필수)	
 * @param {Object} [objForm] - form object(callback호출시 필수)
 * @return N/A
 * @example
 * this.gfnExcelImportAll("dsList","SheetName","A1:G1","A2","fnImportCallback","import",this);
 */
pForm.gfnExcelImportAll = function(objDs,sSheet,sHead,sBody,sCallback,sImportId,objForm)
{	
	this.setWaitCursor(true);    	
	
	if(this.gfnIsNull(sSheet)) sSheet = "Sheet1";
	if(this.gfnIsNull(sBody)) sBody = "A2";
	if(this.gfnIsNull(sHead)) return false;
	
	var svcUrl = "svcurl::XExportImport.do";
	
	var objImport ;	
	
	objImport = new nexacro.ExcelImportObject(objDs+"_ExcelImport",this);				
	objImport.set_importurl(svcUrl);						
	objImport.set_importtype(nexacro.ImportTypes.EXCEL);			
	
	if (!this.gfnIsNull(sCallback))
	{
		objImport.callback = sCallback;
		objImport.importid = sImportId;
		objImport.form = objForm;
	}
	
	objImport.addEventHandler("onsuccess", this.gfnImportAllOnsuccess, this);
	objImport.addEventHandler("onerror", this.gfnImportAllOnerror, this);	
	var sParam1 = "[Command=getsheetdata;Output=outds;Head="+sSheet+"!"+sHead+";Body="+sSheet+"!"+sBody+"]";
	var sParam2 = "["+objDs+"=outds]";


	objImport.importData("", sParam1, sParam2);						
	objImport = null;	 
};

/**
 * @class excel import on success <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.gfnImportAllOnsuccess = function(obj,  e)
{		
	this.setWaitCursor(false);
	var sCallback = obj.callback;
	var sImportId = obj.importid;
	
	//화면의 callback 함수 호출
	if (!this.gfnIsNull(sCallback)) {
		if (this[sCallback]) this.lookupFunc(sCallback).call(sImportId);
	}
};

/**
 * @class  excel import( 데이터 헤더제외 ) <br>
 * @param {String} sDataset - dataset	
 * @param {String} [sSheet]	- sheet name
 * @param {String} [sBody] - body 영역지정	
 * @param {String} [sCallback] - callback 함수	
 * @param {String} [sImportId] - import id(callback호출시 필수)	
 * @param {Object} [objForm] - form object(callback호출시 필수)	
 * @return N/A
 * @example
 * this.gfnExcelImport("dsList","SheetName","A2","fnImportCallback","import",this);
 */
pForm.gfnExcelImport = function(sDataset, sSheet, sBody, sCallback, sImportId, objForm)
{
	this.setWaitCursor(true);    	
	
	if(this.gfnIsNull(sSheet))
	{
		this.gfnSheetListImport(sDataset, sSheet, sBody, sCallback, sImportId, objForm);//Sheet명이 없으면 가져온다.
	}
	else 
	{
		trace("===================================="+arguments[6]);
		if(this.gfnIsNull(sBody)) sBody = "A2";
		
		var svcUrl = "svcurl::XExportImport.do";
		var sImportUrl = "";
		
		var objImport;	
		objImport = new nexacro.ExcelImportObject(sDataset+"_ExcelImport",this);				
		objImport.set_importurl(svcUrl);						
		objImport.set_importtype(nexacro.ImportTypes.EXCEL);	
		if (!this.gfnIsNull(arguments[6]))
		{
			objImport.set_importfilemode("server");
			sImportUrl = arguments[6];
		}
		objImport.outds = sDataset;
		objImport.sRange = sBody;
		if (!this.gfnIsNull(sCallback))
		{
			objImport.callback = sCallback;
			objImport.importid = sImportId;
			objImport.form = objForm;
		}
		
		//out dataset 생성(차후 onsucess 함수에서 헤더생성하기 위한)
		var sOutDsName = sDataset+"_outds";	
		if(this.isValidObject(sOutDsName)) this.removeChild(sOutDsName);			
		var objOutDs = new Dataset();
		objOutDs.name = sOutDsName;
		this.addChild(objOutDs.name, objOutDs);
		
		objImport.addEventHandler("onsuccess", this.gfnImportOnsuccess, this);
		objImport.addEventHandler("onerror", this.gfnImportAllOnerror, this);	
		var sParam = "[command=getsheetdata;output=outDs;body=" + sSheet + "!" + sBody +";]";
		var sParam2 = "[" + sOutDsName + "=outDs]";
		
		objImport.importData(sImportUrl, sParam, sParam2);						
		objImport = null;			
	}

	
	this.setWaitCursor(false);
};
/**
 * @class  excel import( 엑셀 Sheet 리스트 조회 ) <br>
 * @return N/A
 * @example
 * this.gfnExcelImport("dsList","SheetName","A2","fnImportCallback","import",this);//sDataset, sSheet, sBody, sCallback, sImportId, objForm
*/
pForm.gfnSheetListImport = function()
{
	trace("sheetlist import:"+arguments[0]);
    var svcUrl = "svcurl::XExportImport.do";
	//excel import object
	var objImport;
	objImport = new nexacro.ExcelImportObject("SheetList_ExcelImport",this);		
	objImport.set_importurl(svcUrl);						
	objImport.set_importtype(nexacro.ImportTypes.EXCEL);			
	objImport.outds = arguments[0];
	objImport.sheetNm = arguments[1];
	objImport.sRange = arguments[2];
	objImport.sCallback = arguments[3];
	objImport.sImportId = arguments[4];
	objImport.oObjForm = arguments[5];
	
	//out dataset 생성
	var sOutDsName = "DsSheetList";	
	if(this.isValidObject(sOutDsName)) this.removeChild(sOutDsName);			
	var objOutDs = new Dataset();
	objOutDs.name = sOutDsName;
	this.addChild(objOutDs.name, objOutDs);	
		
	//command info - "getsheetlist"
    var sImportCommand  = "[Command=getsheetlist;Output=output1;]";
    var sDatasetList = "DsSheetList=output1";

	//동적으로 이벤트 연결
	objImport.addEventHandler("onsuccess", this.SheetList_ExcelImport_success, this);
	objImport.addEventHandler("onerror", this.SheetList_ExcelImport_error, this);	
	
	//importid = searchsheet
   	objImport.importData("", sImportCommand, sDatasetList);
	objImport = null;	
};
/**
 * @class excel import on success <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.SheetList_ExcelImport_success = function(obj, e)
{
	trace("------------------ SheetList_ExcelImport 성공함 -----------------");
	//this.importObj = null;
	trace(e.eventid);
	trace(e.fromobject);
	trace(e.url);
	this.fileUrl = e.url;
	trace("------------------------------------------");	
	trace(this.DsSheetList.saveXML());
	var sSheetName = this.DsSheetList.getColumn(0,"sheetname");
	trace("sheetname:"+sSheetName);
	//this.GrdSheet.createFormat();
	trace(obj.outds+":::"+sSheetName+":::"+obj.sRange+":::"+obj.sCallback+":::"+obj.sImportId);
	this.gfnExcelImport(obj.outds,sSheetName,obj.sRange,obj.sCallback,obj.sImportId,this,e.url);
}
/**
 * @class excel import on fail <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.SheetList_ExcelImport_error = function(obj, e)
{
	trace("------------- SheetList_ExcelImport 에러남 --------------------");
	trace(e.eventid);
	trace(e.fromobject);
	trace(e.errorcode);
	trace(e.errormsg);
	trace("------------------------------------------");
}
/**
 * @class excel import on success <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.gfnImportOnsuccess = function(obj,  e)
{		
	this.setWaitCursor(false);
	
	var objOutDs = this.objects[obj.outds+"_outds"];
	var objOrgDs = this.objects[obj.outds];
	var sCallback = obj.callback;
	var sImportId = obj.importid;
	var objForm = obj.form;
	var sColumnId;
	trace("gfnImportOnsuccess Dataset:\n"+objOutDs.saveXML());
	if (obj.sRange == "A1")
	{
		for (var i=0;i<objOutDs.getColCount(); i++)
		{
			var sColId = objOutDs.getColumn(0,"Column"+i);
			objOutDs.updateColID(objOutDs.getColID(i), sColId);
		}
		objOutDs.deleteRow(0);
	}
	else 
	{
		//기존 데이터셋의 내용으로 헤더복사
		for (var i=0; i<objOrgDs.getColCount(); i++)
		{
			sColumnId = "Column"+i;
			if (sColumnId != objOrgDs.getColID(i))
			{
				objOutDs.updateColID(sColumnId, objOrgDs.getColID(i));
			}
		}
	
	}
	
	this.gfnDeleteEmptyData(objOutDs);			// 뒤쪽에 빈 데이터 삭제
	
	objOrgDs.clearData();
	objOrgDs.copyData(objOutDs);	

	//화면의 callback 함수 호출
	if (!this.gfnIsNull(sCallback)) {
		if (this[sCallback]) this.lookupFunc(sCallback).call(sImportId);
	}
};

// 빈 데이터 삭제
pForm.gfnDeleteEmptyData = function(objDs)
{
	var nColCnt = objDs.getColCount();
	var nEmptyCnt = 0;
	
	for(i = objDs.rowcount -1; i >= 0; i--)
	{
		nEmptyCnt = 0;
		
		for (var j=0; j<nColCnt; j++)
		{
			if (this.gfnIsNull(objDs.getColumn(i, j)))
			{
				nEmptyCnt++;
			}
			else
			{
				nEmptyCnt = -1;
				break;
			}
		}
		
		if (nEmptyCnt == nColCnt) {
			objDs.deleteRow(i);
		} else {
			break;
		}
	}
};

/**
 * @class  excel import on error <br>
 * @param {Object} obj	
 * @param {Event} e		
 * @return N/A
 * @example
 */
pForm.gfnImportAllOnerror = function(obj,  e)
{
	this.setWaitCursor(false);	
	this.alert(e.errormsg);
};