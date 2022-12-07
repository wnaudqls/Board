/**
*  공통함수
*  @FileName 	Frame.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   		
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀 	                최초 생성 
*  2021.05.27	    이노다임 개발팀					gfnGetApplication 추가				   
*******************************************************************************
*/

var pForm  = nexacro.Form.prototype;
var sysver = "nexacro17"; // 넥사크로 제품구분 nexacro14/nexacro17

/**
* @class frame open <br>
* @param {Object} obj - 화면
* @return N/A
* @example 
* this.gfnFormOnLoad(this);
*/
pForm.gfnFormOnLoad = function(objForm)
{
	var arrComp = objForm.components;
	var nLength = arrComp.length;

	for (var i=0; i<nLength; i++)
	{
		if (arrComp[i] instanceof nexacro.Div)
		{
			arrComp[i].set_formscrollbarsize(10); //스크롤바 사이즈 10 설정 21.12.24
			// URL로 링크된 경우에는 존재하는 경우에는 해당 링크된 Form Onload에서 처리하도록 한다.
			if (this.gfnIsNull(arrComp[i].url))
				this.gfnFormOnLoad(arrComp[i].form); //재귀함수
		}
		else if (arrComp[i] instanceof nexacro.Tab)
		{
			var nPages = arrComp[i].tabpages.length;
			
			for (var j=0; j<nPages;j++)
			{	
				// URL로 링크된 경우에는 존재하는 경우에는 해당 링크된 Form Onload에서 처리하도록 한다.
				if (this.gfnIsNull(arrComp[i].tabpages[j].url))
					this.gfnFormOnLoad(arrComp[i].tabpages[j].form); //재귀함수
			}
		}
		else
		{
			if (arrComp[i] instanceof nexacro.Grid)
			{
				this.gfnSetGrid(arrComp[i]);
			}
			
			if (arrComp[i] instanceof nexacro.Edit)
			{
				this._gfnSetEditMsClear(arrComp[i]);
			}
			//trace("Translate Mode["+this.gfnGetApplication().gv_translate+"]   object type:"+arrComp[i]);
			if (arrComp[i] == "[object Static]")
			{
				//trace("Static name:"+arrComp[i].name+" text["+arrComp[i].text+"]");
				if(this.gfnGetApplication().gv_translate == true) {
					var sText = this.gfnTranslate(arrComp[i], arrComp[i].text, "Static");
// 					var sTooltip = arrComp[i].tooltiptext;
// 					if(!this.gfnIsNull(sTooltip)) {
// 						sTooltip = this.gfnTranslateDirect(sTooltip, "Static");
// 						arrComp[i].set_tooltiptext(sTooltip);
// 					}
					//trace("Translate text:"+sText);
					arrComp[i].set_text(sText);
				}				
			}
			
			if (arrComp[i] == "[object Button]")
			{
				//trace("Button name:"+arrComp[i].name+" text["+arrComp[i].text+"]");
				if(this.gfnGetApplication().gv_translate == true) {
					var sText = this.gfnTranslate(arrComp[i], arrComp[i].text, "Button");
// 					var sTooltip = arrComp[i].tooltiptext;
// 					if(!this.gfnIsNull(sTooltip)) {
// 						sTooltip = this.gfnTranslateDirect(sTooltip, "Button");
// 						arrComp[i].set_tooltiptext(sTooltip);
// 					}
					//trace("Translate text:"+sText);
					arrComp[i].set_text(sText);
				}				
			}	
			
			if (arrComp[i] == "[object CheckBox]")
			{
				//trace("CheckBox name:"+arrComp[i].name+" text["+arrComp[i].text+"]");
				if(this.gfnGetApplication().gv_translate == true) {
					var sText = this.gfnTranslate(arrComp[i], arrComp[i].text, "CheckBox");
// 					var sTooltip = arrComp[i].tooltiptext;
// 					if(!this.gfnIsNull(sTooltip)) {
// 						sTooltip = this.gfnTranslateDirect(sTooltip, "CheckBox");
// 						arrComp[i].set_tooltiptext(sTooltip);
// 					}
					//trace("Translate text:"+sText);
					arrComp[i].set_text(sText);
				}				
			}	
			//칼렌다의 년도,월 스핀 버튼 보여주기 21.12.23
			if (arrComp[i] == "[object Calendar]")
			{
				//trace("Calendar name:"+arrComp[i].name+" showyearspin["+arrComp[i].showyearspin+"]");
				arrComp[i].set_showyearspin(true);
				arrComp[i].set_showmonthspin(true);
			}				
		}
	}
	this._gfnAddDatasetEventHandelr(objForm);
// 	// 화면 loading 시간 측정
// 	if (objForm.parent.name == "divWork")
// 	{
// 		var objApp     = objForm.gfnGetApplication();
// 		var sStartDate = objApp.sStartDate;
// 		var nStartTime = objApp.nStartTime;
// 		
// 		var objDate  = new Date();
// 		var sEndDate = objDate.getYear()
// 						+"-"+String(objDate.getMonth()  ).padLeft(2, '0')
// 						+"-"+String(objDate.getDate()   ).padLeft(2, '0')
// 						+" "+String(objDate.getHours()  ).padLeft(2, '0')
// 						+":"+String(objDate.getMinutes()).padLeft(2, '0')
// 						+":"+String(objDate.getSeconds()).padLeft(2, '0')
// 						+" "+objDate.getMilliseconds();						
// 		var nElapseTime = (objDate.getTime() - nStartTime)/1000;
// 		//trace("gfnFormOnLoad : "+ sStartDate + " - " + nStartTime + " / " + sEndDate + " - " + nElapseTime);		
// 		
// 		objForm.parent.parent.staLodingTime.set_text("해당 화면의 loading 시간은 " +  + nElapseTime + " Sec 입니다.");
// 	}
	this.gfnSetCommonBtn(objForm);
	objForm.addEventHandler("onkeydown", this.gfnOnkeydown, this);
	objForm.isFormMode = "main";
	// 팝업 일때 처리
	if (objForm.opener)
	{
		if (objForm.parent instanceof nexacro.ChildFrame)
		{
			// 키다운 이베트 추가
			objForm.addEventHandler("onkeydown", this.gfnOnkeydown, this);
			objForm.isFormMode = "popup";
		}
	}

	// QuikView 일때 처리
	if (this.gfnIsQuickViewMode()) 
	{
		if (this.gfnIsNull(objForm.opener) && objForm.parent instanceof nexacro.ChildFrame)
		{
			// 키다운 이베트 추가
			objForm.addEventHandler("onkeydown", this.gfnOnkeydown, this);
			objForm.isFormMode = "quickview";
		}
		this.gfnGetMessageTran();
	}
};
/**
 * @description 퀵뷰로 실행하고 있는지 파악
*/
pForm.gfnIsQuickViewMode = function()
{
	var bReturnValue = false;
	if(nexacro.getApplication().xadl.indexOf("quickview") > -1){
		trace("퀵뷰실행["+nexacro.getApplication().xadl+"]");
		bReturnValue = true;
	}
	return bReturnValue;
};
/**
 * @description 메세지를 가져오는 함수(퀵뷰실행의 경우)
*/
pForm.gfnGetMessageTran = function(isAsync)
{
	trace("메세지를 가져온다.");
	if (this.gfnIsNull(isAsync)) isAsync = false;
	
	this.gfnGetApplication().gds_message.clearData();
	this.transaction("message", "svcurl::login/message.do", "", "gds_message=gds_message", "", "fn_callBack",isAsync);
};
/**
 * @description 각 화면에서 단축키 지정
*/
pForm.gfnOnkeydown = function(obj, e)
{
	//trace("e.ctrlkey : " + e.ctrlkey + " / e.keycode : " + e.keycode);
	
	// 디버그 창 : Ctrl + Q
	if (e.ctrlkey && e.keycode == 81)
	{
		// 운영환경에서는 실행 방지
		//if (nexacro.getEnvironmentVariable("evRunMode") == "2") return;
		
		var oArg = {};
		var oOption = {popuptype:"modeless", title:"디버그"};
		var sPopupCallBack = "fnPopupCallback";
		this.gfnOpenPopup("debugging","comm_pop::compop0004.xfdl",oArg,sPopupCallBack,oOption);	
	}
};

/**
 * @class left메뉴 클릭시 해당화면 호출함수 <br>
 * @param {Object} oObj 
 * @return N/A
 * @example 
 */
pForm.gfnCall = function(oObj)
{	
	if(!this.gfnIsNull(oObj) && typeof(oObj) !=  "object") return;	
	
	var objApp  = pForm.gfnGetApplication();
	var gdsOpen = objApp.gds_openMenu;				//열린 	  dataset	
	var ds      = oObj.ds;							//넘어온 dataset
	var nRow    = oObj.nRow;						//선택된 현재 row
	var aArgs 	= this.gfnIsNull(oObj.oArg) ? "" : oObj.oArg ;   //넘어온 arguments
	var sMenuId;
	
	if (!this.gfnIsNull( oObj.sMenuId)){
		sMenuId = oObj.sMenuId;
	}else{
		sMenuId = ds.getColumn(nRow, objApp.gvMenuColumns.menuId);
	}	
	
	var winid = gdsOpen.lookup(objApp.gvMenuColumns.menuId, sMenuId, objApp.gvMenuColumns.winId);
	//화면이 이미 실행중이면 화면에 포커스 처리, MDI탭 포커스 처리
	if (!this.gfnIsNull(winid))
	{
// 		if (objApp.MDIWORK.frames[winid] == true)
// 		{
			objApp.MDIWORK.frames[winid].setFocus();
			//objApp.MDIWORK.frames[winid].form.fnSetFormParam(aArgs);//열린 화면에 파라메터 정보를 설정한다. 21.11.03
			objApp.MDIWORK.frames[winid].form.lookupFunc("fnSetFormParam").call(aArgs);
			for (var i=0;i<objApp.FRAMETAB.form.tab_openMenu.tabpages.length;i++)
			{
				if (objApp.FRAMETAB.form.tab_openMenu.tabpages[i].winid == winid)
				{
					objApp.FRAMETAB.form.tab_openMenu.set_tabindex(i);
					return;
				}
			}
//		}
	}
	
	//열린메뉴 체크( application.gvMax = 10)	
	if( objApp.gvMax <= gdsOpen.getRowCount() ){
		          
		alert(objApp.gvMax +"개 초과하여 화면을 열수 없습니다");
		return false;
	}
	
	this.gfnNewMdi(sMenuId, nRow, aArgs);
};

/**
 * @class left메뉴 클릭시 해당화면 호출함수 <br>
 * @param {Object} oObj 
 * @return N/A
 * @example 
 */
pForm.gfnCallSDI = function(oObj)
{	
	if (!this.gfnIsNull(oObj) && typeof(oObj) !=  "object") return;	
	
	var objApp  = pForm.gfnGetApplication();
	var gdsOpen = objApp.gds_openMenu;							// 열린   Dataset	
	var ds      = oObj.ds;										// 넘어온 Dataset
	var nRow    = oObj.nRow;									// 선택된 현재 row
	var aArgs 	= this.gfnIsNull(oObj.oArg) ? "" : oObj.oArg ; 	// 넘어온 Arguments
	var sMenuId;
	
	if (!this.gfnIsNull(oObj.sMenuId))
		sMenuId = oObj.sMenuId;
	else
		sMenuId = ds.getColumn(nRow, objApp.gvMenuColumns.menuId);
	
	if (!this.gfnIsNRE())
	{
		// History	
		var sHash 	= "menu:" + sMenuId;
		var oData	= {oArg : oObj.oArg};
		
		MyHistory.setLocationHash(sHash, oData);
	}
	
	this.gfnNewSdi(sMenuId, aArgs);
};

/**
 * @class gdsOpenMenu의 해당 Row의 정보를 기준으로 신규 윈도우 화면을 생성하고 open 시킴 <br>
 * @param {String} sMenuId - menuId
 * @param {Number} nRow - gdsOpenMenu의rowpostion
 * @param {Array} aArgs - arguments
 * @return N/A
 */
pForm.gfnNewMdi = function(sMenuId, nRow, aArgs)
{	
	var objApp   = pForm.gfnGetApplication();
	var gdsOpen  = objApp.gds_openMenu;		//열린 dataset
	var gdsMenu  = objApp.gds_menu;
	var winid    = "win" + sMenuId + "_" + gdsOpen.getRowCount() + "_" + parseInt(Math.random() * 1000);		
	var sPageUrl = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, objApp.gvMenuColumns.pageUrl);
	var sGroupId = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, objApp.gvMenuColumns.groupId);

// 	// 화면 loading 시간 측정
// 	var objDate = new Date();
// 	var nStartTime = objDate.getTime();
//     var sStartDate = objDate.getYear()
// 						+"-"+String(objDate.getMonth()).padLeft(2, '0')
// 						+"-"+String(objDate.getDate()).padLeft(2, '0')
// 						+" "+String(objDate.getHours()).padLeft(2, '0')
// 						+":"+String(objDate.getMinutes()).padLeft(2, '0')
// 						+":"+String(objDate.getSeconds()).padLeft(2, '0')
// 						+" "+objDate.getMilliseconds();
// 	objApp.nStartTime = nStartTime;
// 	objApp.sStartDate = sStartDate;

	var sColumn  = objApp.gvMenuColumns.menuNm;
	var sMenuNm  = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, sColumn);
	
	if(this.gfnIsNull(sPageUrl)) return;		//pageURl 이 없으면 return
	this.gfnSetOpenMenuDs(winid, sMenuId, sMenuNm, sPageUrl, sGroupId);	// 열린메뉴 화면 삽입
	
/* 화면 PARAM 전달 (기존 방식)*/
			var strTitle,sTitleText;
				strTitle     = gdsMenu.lookup("MENU_ID", sMenuId, "MENU_NM");
			var sMenuAuth    = "";
			var sButtonAuth  = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "BUTTON_AUTH");
			var sEmpSchAuth  = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "EMP_SCH_AUTH");
			// 만약 직원조회권한이 없으면 본인으로 설정
			if(this.gfnIsNull(sEmpSchAuth)){
				sEmpSchAuth  = objApp.C_EMP_SEARCH_AUTH_SELF;
			}
			var sProfileId   = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "PROFILE_ID");
			var sModuleId    = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "MODULE_ID");
			var sModuleNm    = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "MODULE_NM");
			var sParentId    = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "PARENT_MENU_ID");
			var sJuminYn     = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "JUMIN_YN");
			var sProgramId   = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "PROGRAM_ID");
			var sHelpYn      = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "HELP_YN");
 			var sZReqForm    = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "REQTP");
			var sSecurInfoYn = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "SECUR_INFO_YN");
			var sExpad       = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "EXPAD");
			var sRoltp       = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "ROLTP");
			var sTeamv       = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "TEAMV");
			var sZrole       = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "ZROLE");
			var sPriot       = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "PRIOT");
			var sReqtp       = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, "REQTP");
			
			var sViewNavigation = "<b v='true'>"+ sMenuNm + "</b>";
			var sLogNavigation = sMenuNm;
			var sUpId = sMenuId;
			var sUpNm = "";
			while(!this.gfnIsNull(sUpId))
			{
				sUpId = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sUpId, "PARENT_MENU_ID");
				sUpNm = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sUpId, "MENU_NM");
				if(!this.gfnIsNull(sUpNm))
				{
					sViewNavigation = sUpNm + " > " + sViewNavigation;
					sLogNavigation  = sUpNm + " > " + sLogNavigation;
				}
			}
			var array = sViewNavigation.split(" > ");
			//sViewNavigation = sViewNavigation.replace(array[0],sModuleNm);
			
			//실행화면 로그를 기록한다.
			this.gfnOpenFormLog(sModuleId,sMenuId,sPageUrl);
			
			array = sLogNavigation.split(" > ");
			this.o_menu = {
				MENU_ID : sMenuId,
				MENU_NM : sMenuNm,
				URL : sPageUrl,
				MENU_AUTH: sMenuAuth,
				BUTTON_AUTH: sButtonAuth,
				EMP_SCH_AUTH: sEmpSchAuth,
				PROFILE_ID: sProfileId,
				MODULE_ID: sModuleId,
				PARENT_ID: sParentId,
				PROGRAM_ID: sProgramId,
				JUMIN_UN: sJuminYn,
				HELP_YN: sHelpYn,
 				ZREQ_FORM: sZReqForm,
				SECUR_INFO_YN: sSecurInfoYn,
				EXPAD: sExpad,
				ROLTP: sRoltp,
				TEAMV: sTeamv,
				ZROLE: sZrole,
				PRIOT: sPriot,
				REQTP: sReqtp,
				VIEW_NAVIGATION: sViewNavigation,
				LOG_NAVIGATION: sLogNavigation,
				PARAM  : aArgs
		    };
			/*
			if (typeof(oArgs) != "undefined" && !this.gfnIsNull(oArgs) && typeof oArgs == "object")
			{
				for ( var key=0; key<oArgs.length;key++ )
				{
					if ( oArgs.hasOwnProperty(key) )
					{
						this.o_menu.PARAM[key] = oArgs[key];
					}
				}
			}
			
			this.o_menu.PARAM["menuId"]       =  sMenuId;
			this.o_menu.PARAM["menuNm"]       =  sMenuNm;
			this.o_menu.PARAM["pageUrl"]      =  sPageUrl;
			this.o_menu.PARAM["buttonAuth"]   =  sButtonAuth;
			this.o_menu.PARAM["empSchAuth"]   =  sEmpSchAuth;
			this.o_menu.PARAM["profileId"]    =  sProfileId;
			this.o_menu.PARAM["moduleId"]     =  sModuleId;
			this.o_menu.PARAM["parentId"]     =  sParentId;
			this.o_menu.PARAM["programId"]    =  sProgramId;
			this.o_menu.PARAM["juminYn"]      =  sJuminYn;
			this.o_menu.PARAM["helpYn"]       =  sHelpYn;
			this.o_menu.PARAM["zSecurInfoYn"] =  sSecurInfoYn;
			this.o_menu.PARAM["expad"]        =  sExpad;
			this.o_menu.PARAM["roltp"]        =  sRoltp;
			this.o_menu.PARAM["teamv"]        =  sTeamv;
			this.o_menu.PARAM["zrole"]        =  sZrole;
			this.o_menu.PARAM["priot"]        =  sPriot;
			this.o_menu.PARAM["reqtp"]        =  sReqtp;
			/*
/* 화면 PARAM 전달 (기존 방식) End*/

	var objNewWin = new ChildFrame;
	objNewWin.init(winid, 0, 0, objApp.MDIWORK.getOffsetWidth() - 0, objApp.MDIWORK.getOffsetHeight() - 0);
	objApp.MDIWORK.addChild(winid, objNewWin);

	objNewWin.arguments = [];
	objNewWin.set_dragmovetype("all");
	objNewWin.set_showtitlebar(false);
	objNewWin.set_resizable(true);
	objNewWin.set_openstatus("maximize");
	objNewWin.set_titletext(sMenuNm);
	objNewWin.set_showcascadetitletext(false);
	objNewWin.oMenu  = this.o_menu;				//Param 전달 방식
	objNewWin.set_formurl("Frame::frm_Work.xfdl");

	objApp.FRAMELEFT.form.fn_AddTabPage(winid, sMenuNm, sMenuId);
	
	objNewWin.show();	
};

/**
 * @class gdsOpenMenu의 해당 Row의 정보를 기준으로 신규 윈도우 화면을 생성하고 open 시킴 <br>
 * @param {String} sMenuId - menuId
 * @param {Number} nRow - gdsOpenMenu의rowpostion
 * @param {Array} aArgs - arguments
 * @return N/A
 */
pForm.gfnNewSdi = function(sMenuId, aArgs)
{
	var objApp   = pForm.gfnGetApplication();
	var gdsOpen  = objApp.gdsOpenMenu;		//열린 dataset
	var gdsMenu  = objApp.gdsMenu;
	var sPageUrl = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, objApp.gvMenuColumns.pageUrl);
	var sGroupId = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, objApp.gvMenuColumns.groupId);

// 	// 화면 loading 시간 측정
// 	var objDate = new Date();
// 	var nStartTime = objDate.getTime();
//     var sStartDate = objDate.getYear()
// 						+"-"+String(objDate.getMonth()	).padLeft(2, '0')
// 						+"-"+String(objDate.getDate()	).padLeft(2, '0')
// 						+" "+String(objDate.getHours()  ).padLeft(2, '0')
// 						+":"+String(objDate.getMinutes()).padLeft(2, '0')
// 						+":"+String(objDate.getSeconds()).padLeft(2, '0')
// 						+" "+objDate.getMilliseconds();
// 	objApp.nStartTime = nStartTime;
// 	objApp.sStartDate = sStartDate;
	
	var sColumn  = objApp.gvMenuColumns.menuNm;
	var sMenuNm  = gdsMenu.lookupAs(objApp.gvMenuColumns.menuId, sMenuId, sColumn);
	
	var objNewWin = objApp.gvWorkFrame;
		objNewWin.set_url("");
		
	// Div Arguments Setting
 	objNewWin.arguments = [];
 	objNewWin.arguments["winKey" ] = objNewWin.name;
 	objNewWin.arguments["menuId" ] = sMenuId;
 	objNewWin.arguments["menuNm" ] = sMenuNm;
 	objNewWin.arguments["pageUrl"] = sPageUrl;
 	objNewWin.arguments["aArgs"	 ] = aArgs;
	
	objNewWin.set_url("frameSDI::frameWork.xfdl");	
};

/**
 * @class 열린화면 데이터셋에 추가 <br>
 * @param {String} winid
 * @param {String} menuId
 * @param {String} strTitle
 * @param {String} spageUrl
 * @param {String} sGroupId
 * @return N/A
 */
pForm.gfnSetOpenMenuDs = function(winid, menuid, strTitle, spageUrl, sGroupId)
{
	var objApp  = pForm.gfnGetApplication();
	var gdsOpen = objApp.gds_openMenu ;  //열린 dataset
	var nRow = gdsOpen.addRow();
	gdsOpen.setColumn(nRow, objApp.gvMenuColumns.winId, winid);
	gdsOpen.setColumn(nRow, objApp.gvMenuColumns.menuId, menuid);
	gdsOpen.setColumn(nRow, objApp.gvMenuColumns.title, strTitle);	
	gdsOpen.setColumn(nRow, objApp.gvMenuColumns.groupId, sGroupId);
	gdsOpen.setColumn(nRow, "URL", spageUrl);
};

/**
 * @class 해당 화면의 아규먼트 조회 <br>
 * @param {String} 	sName : winKey, menuId, menuNm, pageUrl, aArgs
 * @return String
 */
pForm.gfnGetArgument = function(sName)
{
	//return this.getOwnerFrame().arguments[sName];
	if (this.gfnIsNull(sName)) return "";
	var arrArg = this.getOwnerFrame().oMenu.PARAM;
	var sReturnVal = arrArg[sName];
	if (this.gfnIsNull(sReturnVal)) return "";
	return sReturnVal;	
};

/**
 * @class 해당화면 데이터셋에 추가 <br>
 * @param {String} 	sName : winKey, menuId, menuNm, pageUrl, aArgs
 * @return String
 */
pForm.gfnGetServerUrl = function()
{
	var urlPath = "";
    if (this.gfnIsNRE()) 
	{
	    var objEnv = nexacro.getEnvironment();
		urlPath = objEnv.services["svcurl"].url;
	}else{
		urlPath = window.location.protocol + "//" + window.location.host;
		//urlPath+="/sr30/";
	}
	//trace("urlPath : " + urlPath);
	return urlPath;
};

/**
 * @class 현재 실행된 어플리케이션의 Application 오브젝트를 반환하는 메소드 <br>
 * @param  none
 * @return Object
 */
pForm.gfnGetApplication = function()
{
	// nexacro 14/17 구분하여 Application object를 사용한다.
	var objApp = (sysver == "nexacro17" ? nexacro.getApplication() : application);
	
	return objApp;
};

pForm._gfnAddDatasetEventHandelr = function(obj)
{
	var _arrDsList = obj.objects
	for (var i=0;i<_arrDsList.length;i++)
	{
		//trace("addEventHandler target dataset name:"+_arrDsList[i].name);
		var sType = _arrDsList[i].controlType;
		if (!this.gfnIsNull(_arrDsList[i].controlType))
		{
			if (sType.toLowerCase() == "save")
			{
				_arrDsList[i].addEventHandler("onvaluechanged",this._gfnDatasetOnvaluechanged,this);
			}
		}
	}
};
/**
 * @class Dataset컬럼(PROC_STATUS) 처리하기 위한 이벤트 <br>
 * @param  this
 * @return 
 */
pForm._gfnDatasetOnvaluechanged = function(obj, e)
{
	if (e.columnid == "PROC_STATUS") return;
	//trace("_gfnDatasetOnvaluechanged:::::: columid["+e.columid +"] row["+ e.row +"] newvalue["+ e.newvalue +"] oldvalue["+ e.oldvalue+"]");
	//if (this.gfnIsNull(e.newvalue) && this.gfnIsNull(e.oldvalue)) return;
	this.gfnSetProcStatus(obj,e);
};
/**
 * 특정 row 의 상태(등록,수정,삭제)를 표시한다.
 * @param {dataset} ds
 * @param {nexacro.DSColChangeEventInfo}  e
 * @return N/A
 * @example
 */
pForm.gfnSetProcStatus = function (obj, e)
{
	if (obj.getRowType(e.row) == Dataset.ROWTYPE_INSERT || obj.getColumn(e.row, "PROC_STATUS") == "I") 
	{
		if (obj.getColumn(e.row, "PROC_DELETE") == 1) 
		{
			obj.deleteRow(e.row);
		}
		else 
		{
			obj.setColumn(e.row, "PROC_STATUS", "I");
		}
	}
	else if (obj.getRowType(e.row) == Dataset.ROWTYPE_UPDATE) 
	{
		if (obj.getColumn(e.row, "PROC_DELETE") == 1) 
		{
			obj.setColumn(e.row, "PROC_STATUS", "D");
		}
		else 
		{
			if (this.gfnManualIsUpdatedRow(obj, e.row)) //gfnIsUpdated함수에서 변경 21.07.08
			{
				obj.setColumn(e.row, "PROC_STATUS", "U");
			}
			else 
			{
				obj.setColumn(e.row, "PROC_STATUS", "");
			}
			//CHK컬럼의 값을 설정/해제 할때, 체크해제하면 Update 상태 해제 21.07.08
			if (e.columnid == "CHK")
			{
				if (e.newvalue == 0)
				{
					obj.setColumn(e.row, "PROC_STATUS", ""); 
				}
			}
		}
	}
};
/**
* 공통버튼 숨김처리 및 버튼 위치조정(저장,처리,엑셀,복사등등)
* @param {obj}    폼
* @return N/A
* @example     
*/    
pForm.gfnSetCommonBtn = function (oForm)
{
	// 공통버튼 제어
	var topPos 		= new Array(10);
	var cnt 		= 0;
	var arrComList 	= oForm.components;
	var bType 		= "";
	var buttonAuth 	= "";

	if (this.gfnIsNull(buttonAuth))
	{
		buttonAuth = this.getOwnerFrame().form.buttonAuth;
	}
	//trace("ButtonAuth::::"+buttonAuth);
	for (var i = 0; i < arrComList.length; i++)
	{
		if (!this.gfnIsNull(arrComList[i].btnType)){ 
			bType = arrComList[i].btnType;
			if (this.gfnIsNull(bType)) 
			{
				continue;
			}else{
				if(bType == "W"){
					if(buttonAuth.substr(1,1) == "1"){
						arrComList[i].set_visible(true);
					} else {
						arrComList[i].set_visible(false);
					}
				}else if(bType == "P"){
					if(buttonAuth.substr(2,1) == "1"){
						arrComList[i].set_visible(true);
					} else {
						arrComList[i].set_visible(false);
					}				
				}else if(bType == "E"){
					if(buttonAuth.substr(3,1) == "1"){
						arrComList[i].set_visible(true);
					} else {
						arrComList[i].set_visible(false);
					}				
				}
			}
		}else if (arrComList[i] instanceof nexacro.Tab){
			var tabPages = arrComList[i].tabpages;
			for(var j = 0; j < tabPages.length; j++){
				var item = tabPages[j].form.components;
				
				var btnArray = new Array();
				var index = 0;
				
				for(var k = 0; k < item.length; k++){
					if (!this.gfnIsNull(item[k].btnType)) 
					{
						bType = item[k].btnType;

						if (this.gfnIsNull(bType)) 
						{
							btnArray[index] = item[k];
							index++;
							continue;
						}else{
							if(bType == "W"){
								if(buttonAuth.substr(1,1) == "1"){
									item[k].set_visible(true);
									btnArray[index] = item[k];
									index++;
								} else {
									item[k].set_visible(false);
								}
							}else if(bType == "P"){
								if(buttonAuth.substr(2,1) == "1"){
									item[k].set_visible(true);
									btnArray[index] = item[k];
									index++;									
								} else {
									item[k].set_visible(false);
								}				
							}else if(bType == "E"){
								if(buttonAuth.substr(3,1) == "1"){
									item[k].set_visible(true);
									btnArray[index] = item[k];
									index++;									
								} else {
									item[k].set_visible(false);
								}				
							}
						}
					}					
				}
				
				this.gfnBtnSort(btnArray);			
			}
		}else if (arrComList[i] instanceof nexacro.Div){
			
			var item = arrComList[i].form.components;

			var btnArray = new Array();
			var index = 0;

			for(var k = 0; k < item.length; k++){
				if (!this.gfnIsNull(item[k].btnType)) 
				{
					bType = item[k].btnType;

					if (this.gfnIsNull(bType)) 
					{
						btnArray[index] = item[k];
						index++;
						continue;
					}else{
						if(bType == "W"){
							if(buttonAuth.substr(1,1) == "1"){
								item[k].set_visible(true);
								btnArray[index] = item[k];
								index++;
							} else {
								item[k].set_visible(false);
							}
						}else if(bType == "P"){
							if(buttonAuth.substr(2,1) == "1"){
								item[k].set_visible(true);
								btnArray[index] = item[k];
								index++;									
							} else {
								item[k].set_visible(false);
							}				
						}else if(bType == "E"){
							if(buttonAuth.substr(3,1) == "1"){
								item[k].set_visible(true);
								btnArray[index] = item[k];
								index++;									
							} else {
								item[k].set_visible(false);
							}				
						}
					}
				}
				this.gfnBtnSort(btnArray);			
			}
		}
	}

	for (var i = 0; i < arrComList.length; i++){
		// 2017.02.16 pharos 버튼위치 대상 가져오는 부분 수정
		if (arrComList[i].visible && !this.gfnIsNull(arrComList[i].btnType) && (!this.gfnIsNull(arrComList[i].btnType) && arrComList[i].btnType != "X")){
			if(cnt == 0){
				topPos[cnt] = arrComList[i].top;
			}else if(topPos[cnt] != "undefined" || topPos[cnt] != arrComList[i].top){
				topPos[cnt] = arrComList[i].top;

			}
			cnt++;
		}
	}

	// 정렬
	topPos.sort(function (a, b)
	{
		return a - b;
	});
	
	var btnArray = new Array();
	
	var index = 0;
	for (var i = 0; i < topPos.length; i++){
		
		if(i != 0 && topPos[i] == topPos[i-1]) continue;
		
		btnArray = new Array();
		
		if(this.gfnIsNull(topPos[i])){
			break;
		}
		
		index = 0;
		for (var j = 0; j < arrComList.length; j++){
			if (arrComList[j] instanceof nexacro.Button && arrComList[j].visible){
			if(typeof(arrComList[j].btnType) != "undefined" && arrComList[j].btnType == "X"){
				continue;
			}
			
			if(topPos[i] == arrComList[j].top){
				btnArray[index] = arrComList[j];
				index++;
			}
			}
		}
		
		this.gfnBtnSort(btnArray);		
	}
};

/**
* 버튼 위치조정
* @param {obj} Array 버튼
* @return N/A
* @example     
*/    
pForm.gfnBtnSort = function (btnSourceArray)
{
	var btnArray = new Array();
	var index = 0;
	var btnMarginR = 0;
	
	for(var z = 0; z < btnSourceArray.length; z++){
		if(btnSourceArray[z].visible){
			btnArray[index] = btnSourceArray[z];
			index++;
		}
	}
	
	// 정렬
	btnArray.sort(function (a, b)
	{
		return a.right-b.right;
	});

	for(var m = 0; m < btnArray.length; m++){
		btnMarginR = 0;
		if(m == 0){
			if(!this.gfnIsNull(btnArray[m].btnInitPosR)){
				btnArray[m].set_right(Number(btnArray[m].btnInitPosR));
			}else{		
				btnArray[m].set_right(15);
			}
		}else{
			if(!this.gfnIsNull(btnArray[m].btnMarginR)){
				btnMarginR = btnArray[m].btnMarginR;
			}
			
			if(!this.gfnIsNull(btnArray[m-1].right)){
				btnArray[m].set_right(Number(btnArray[m-1].right)+Number(btnArray[m-1].width)+3+Number(btnMarginR));
			}
		}
	}				

};

/**
* 버튼 위치조정(taborder지정순)
* @param {obj} Array 버튼
* @return N/A
* @example     
*/    
pForm.gfnBtnSortByTaborder = function (btnSourceArray)
{
	var btnArray = new Array();
	var index = 0;
	var btnMarginR = 0;
	for(var z = 0; z < (btnSourceArray.length - 1); z++){
		if(btnSourceArray[z].visible){
			btnArray[index] = btnSourceArray[z];
			index++;
		}
	}

	// 정렬
	btnArray.sort(function (a, b)
	{
		return b.taborder - a.taborder;
	});
	
	for(var m = 0; m < btnArray.length; m++){
		if(m == 0){
			btnArray[m].set_right(15);
		}else{
			if(!this.gfnIsNull(btnArray[m].btnMarginR)){
				btnMarginR = btnArray[m].btnMarginR;
			}
			btnArray[m].set_right(Number(btnArray[m-1].right)+Number(btnArray[m-1].width)+3+Number(btnMarginR));
		}
	}				
};

/**
* 다국어 번역 - Button & Static
* @param {obj, sDicId, sType, formType} 
* @return String 번역한 문자열
* @example     
*/ 
pForm.gfnTranslate = function (obj, sDicId, sType, formType)
{
	if(this.gfnIsNull(formType)) {
		formType = "";
	}
	
	var objApp = nexacro.getApplication();
	var langDs = objApp.gds_message;
	var rtn;
	var sDicFullId = sType + "." + this.gfnAllTrim(sDicId);//공백없애기

	var sLongVal = langDs.lookup("MSG_ID", sDicFullId, "MSG_CTNT");
	var sVal = sLongVal;
	
	if(this.gfnIsNull(sVal)) {
		sVal = obj.text;
	}
//trace(nexacro.getApplication().gdsButtonDic.saveXML() + "....." + sLongVal + "....." + sShortVal + "....." + obj.text);
	if(!this.gfnIsNull(sVal)) {
		sVal = sVal.replace(/\\n/g, "\n");
	}
	return sVal;
};

/**
* 다국어 번역 - Grid Head
* @param {obj, nCell, sDicId, sType, formType} 
* @return String 번역한 문자열
* @example     
*/ 
pForm.gfnTranslateGrid = function (obj, nCell, sDicId, sType, formType)
{
	if(this.gfnIsNull(sDicId)) {
		var sVal = obj.getCellProperty("Head", nCell, "text");
		return sVal;
	}
	var objApp = nexacro.getApplication();
	var langDs = objApp.gds_message;
	var rtn = "";
	var sDicFullId = sType + "." + this.gfnAllTrim(sDicId);//공백없애기
	
	var sLongVal = langDs.lookup("MSG_ID", sDicFullId, "MSG_CTNT");
	var sVal = sLongVal;

	if(this.gfnIsNull(sVal)) {
		sVal = obj.getCellProperty("Head", nCell, "text");
	}
	
	if(!this.gfnIsNull(sVal)) {
		sVal = sVal.replace(/\\n/g, "\n");
	}
	return sVal;
};
/**
* 프레임 사이즈 설정
* @param String 모드 값
* @return N/A
* @example     
*/ 
pForm.gfnSetFrameSeparatesize = function(argMode)
{
	var sHframeSet 		= this.gfnGetApplication().mainframe.HFrameSet;
	var _MdiFrame 		= this.gfnGetApplication().MDIWORK;
	var sMode 			= argMode;
	var sSeparateSize 	= "";
	if (this.gfnIsNull(sMode)) sMode = "MDI";//LOGIN,MDI,HIDE,SHOW
	
	//trace("MODE:"+sMode);
	if (sMode == "LOGIN")
	{
		sSeparateSize = "300,0,0,*";
	}
	else if (sMode == "HIDE")
	{
		if(_MdiFrame.frames.length == 0)
		{
			sSeparateSize = "15,0,0,*";
		}
		else
		{
			sSeparateSize = "15,*,0,0";
		}
		
	}
	else if (sMode == "SHOW")
	{
		if(_MdiFrame.frames.length == 0)
		{
			sSeparateSize = "300,0,0,*";
		}
		else
		{
			sSeparateSize = "300,*,0,0";
		}		
	}
	else if (sMode == "INIT")
	{
		sSeparateSize = "300,0,0,*";
	}
	else 
	{
		sSeparateSize = "300,*,0,0";
	}
	//trace("separatesize:"+sSeparateSize);
	sHframeSet.set_separatesize(sSeparateSize);
};
/**
* MDI 화면의 파라메터를 가져온다. 
* 메뉴가 아닌 함수를 사용하여 화면을 여는 경우 파라메터를 확인한다.
* @param String 
* @return 파라메터 값
* @example     
*/ 
pForm.gfnGetFormParam = function(sParam)
{
	var oForm = this.getOwnerFrame();
	
	try {
		var oFormParam = oForm.form.fv_formParam.PARAM;
		trace("gfnGetFormParam 화면의 파라메터 정보 확인:"+oFormParam);
		
		if (!this.gfnIsNull(oFormParam))
		{
			if (this.gfnIsNull(sParam))
			{
				return oFormParam;
			}
			else
			{
				for (var key in oFormParam)
				{
					trace("gfnGetFormParam 화면의 파라메터     key:"+key);
					trace("gfnGetFormParam 화면의 파라메터     value:"+oFormParam[key]);
					if (key == sParam)
					{
						return oFormParam[key];
					}
				}
			}
		}
	
	} catch(e){}
};

/**
* MDI 화면의 파라메터를 초기화한다
* @param String 
* @return 파라메터 값
* @example     
*/ 
pForm.gfnClearFormParam = function(sParam)
{
	var oForm = this.getOwnerFrame();
	var oFormParam = oForm.form.fv_formParam.PARAM;
	//trace("gfnGetFormParam 화면의 파라메터 정보 확인:"+oFormParam);
	oForm.form.fv_formParam.PARAM = null;
}

/**
* 화면 실행 로그를 기록한다.
* @param String 
* @return 파라메터 값
* @example     
*/ 
pForm.gfnOpenFormLog = function(sModuleId,sMenuId,sPageUrl)
{
	trace("화면의 실행로그를 기록한다.");
	var sDsInId = "__dsFormLogInfo";
	var _dsIn = this.objects[sDsInId];
	if (this.gfnIsNull(_dsIn))
	{
		_dsIn = new Dataset;
		this.addChild(sDsInId, _dsIn);	
		//_dsIn.addColumn("S_CLIENT","STRING",255);
		//_dsIn.addColumn("S_CO_CD","STRING",255);
		//_dsIn.addColumn("I_USER_ID","STRING",255);
		//_dsIn.addColumn("I_DEPT_NO","STRING",255);
		_dsIn.addColumn("I_MODULE_ID","STRING",255);
		_dsIn.addColumn("I_MENU_ID","STRING",255);
		_dsIn.addColumn("I_PROGRAM_ID","STRING",255);
		_dsIn.addColumn("I_IP","STRING",255);		
	}
	else 
	{
		_dsIn.clearData();
	}	
	var nNewRow = _dsIn.addRow();
	
	//_dsIn.setColumn(nNewRow,"S_CLIENT",this.gfnGetApplication().gds_userInfo.getColumn(0,"S_CLIENT"));
	//_dsIn.setColumn(nNewRow,"S_CO_CD",this.gfnGetApplication().gds_userInfo.getColumn(0,"S_CO_CD"));
	//_dsIn.setColumn(nNewRow,"I_USER_ID",this.gfnGetApplication().gds_userInfo.getColumn(0,"S_USER_ID"));
	//_dsIn.setColumn(nNewRow,"I_DEPT_NO",this.gfnGetApplication().gds_userInfo.getColumn(0,"S_DEPT_NO"));
	_dsIn.setColumn(nNewRow,"I_MODULE_ID",sModuleId);
	_dsIn.setColumn(nNewRow,"I_MENU_ID",sMenuId);
	_dsIn.setColumn(nNewRow,"I_PROGRAM_ID",sPageUrl);
	_dsIn.setColumn(nNewRow,"I_IP","");
	
	var sMode 		= "saveLogForm";					//구분 "searchComCode" => 조회
	var sClassNm 	= "sysAdminService";					//Class
	var sServiceNm 	= "";								//Service
	var sMethodNm 	= "";		//Method (Query ID)
	var inDataset 	= "dsSearchInfo=__dsFormLogInfo:U";								//input dataset
	var outDataset 	= "";								//output dataset
	var sParam 		= "";								//Argument 생략 가능
	var sPackageNm 	= "";								//패키지명(default:com.nexacro.sr30.mapper.) 생략 가능
	var sDirectMethodNm = "insertProgamLog";
	
	this.gfnAddService(sMode, sClassNm, sServiceNm, sMethodNm, inDataset, outDataset, sParam, sPackageNm,sDirectMethodNm);

	this.gfnTransaction("saveLogForm", "", true, false);	
}

pForm.gfnPushSendMessage = function(oForm, sPushId, sMsgType, sMsg, oParam)
{
	var sAdlId = nexacro.getApplication().id;
	
	if (sAdlId == "Application_Desktop")
	{
		var objFrame = this.gfnGetApplication().FRAMELEFT;
		
		if (objFrame == null)				return;
		if (objFrame.form == null)			return;
		
		objFrame.form.fnXPushSendMessage(oForm, sPushId, sMsgType, sMsg, oParam);
	}
	else if (sAdlId == "Application_Sign")
	{
		var objFrame = this.gfnGetApplication().mainframe.WorkFrame;
		
		if (objFrame == null)				return;
		if (objFrame.form == null)			return;
		
		objFrame.form.fnXPushSendMessage(oForm, sPushId, sMsgType, sMsg, oParam);
	}
};