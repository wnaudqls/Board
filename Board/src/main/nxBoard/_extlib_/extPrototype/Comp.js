/**
*  공통함수
*  @FileName 	Comp.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   		
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀 	                최초 생성 
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/**
 * @class Div를 기준으로 Header/Body 의 쌍이 접고 펼치는 처리를 하는 공통함수
 * @param {Object} objList - 아코디언처리할 대상 Object의 목록으로 JSON Object의 형식으로 Header : Body의 형식으로 작성한다.
 * @param {Boolean or Integer} openMode - 아코디언 초기 설정값으로 true: 전체 보여주기, false: 전체 숨기기, index: 해당항목만 펼쳐준다.
 * @return N/A
 */
pForm.gfnSetAccordion = function(objList, openMode)
{
    var targetlist = new Array();

    for(var objName in objList)
    {
		var targetobj = eval("this."+objName);

        // 대상아코디언이 있으면
        if( !this.gfnIsNull(objList[objName]) )
        {
            // Div Object일경우
            if( objList[objName].valueOf() == "[object Div]" )
            {
                targetobj.accordionbody = objList[objName];
            }
            // String으로 넘어온경우
            else
            {
                targetobj.accordionbody = eval("this."+objList[objName]);
            }

            targetobj.accordionbody.orgheight = targetobj.accordionbody.height;
        }

        targetlist.push(targetobj);
    }

    // 각각의 Object의 목록에 대한 아코디언설정정보를 설정한다.
    var firstbtnobj;
    for(var i=0;i<targetlist.length;i++)
    {
        // 어코디언 body 부분이 없는것은 무조건 보여준다.
        if( this.gfnIsNull(targetlist[i].accordionbody) )
        {
            targetlist[i].accordionopenstatus = true;
        }

        var headobjects = targetlist[i].form.components;
        for(var j=0;j<headobjects.length;j++)
        {
            // 아코디언 Close/Open 처리 버튼 검색 및 버튼에 필요한 아코디언 및 상태를 설정한다.
            if( headobjects[j].valueOf() == "[object Button]" && headobjects[j].cssclass.indexOf("btn_WF_Acc") != -1 )
            {
                // 아코디언 이벤트 처리핸들
                headobjects[j].addEventHandler("onclick", this._gfnHandleAccordionButtonClick, this);
                headobjects[j].accordionlist = targetlist;
                headobjects[j].accordionhead = targetlist[i];
                //headobjects[j].setFocus(false);

                if( this.gfnIsNull(firstbtnobj) )
                {
                    firstbtnobj = headobjects[j];
                }

                if( this.gfnIsBoolean(openMode))
                {
                    headobjects[j].accordionopenstatus = openMode;

                    if( openMode == true )
                    {
                        headobjects[j].set_cssclass("btn_WF_AccClose");
						headobjects[j].set_text("CLOSE");
                    }
                    else
                    {
                        headobjects[j].set_cssclass("btn_WF_AccOpen");
						headobjects[j].set_text("OPEN");
                    }

                    targetlist[i].accordionopenstatus = openMode;
                }
                else
                {
                    if( openMode == i )
                    {
                        headobjects[j].accordionopenstatus = true;
                        headobjects[j].set_cssclass("btn_WF_AccClose");
						headobjects[j].set_text("CLOSE");
                        targetlist[i].accordionopenstatus = true;
                    }
                    else
                    {
                        headobjects[j].accordionopenstatus = false;
                        headobjects[j].set_cssclass("btn_WF_AccOpen");
						headobjects[j].set_text("OPEN");
                        targetlist[i].accordionopenstatus = false;
                    }
                }                
                break;
            }
        }
    }

    // 현재의 상태에 맞게 리드로잉처리한다.
    this._gfnRedrawAccordion(firstbtnobj);
};


/**
 * @class 아코디언 처리시에 사용된는 공통 버튼의 이벤트핸들링 (사용자사용금지)
 * @param {Button}         아코디언 해더에 존재하는 버튼
 * @param {ClickEventInfo} 클릭이벤트
 * @return N/A
 */
pForm._gfnHandleAccordionButtonClick = function(obj,e)
{
	//trace(obj.name + " / " + obj.accordionhead.name ); 
    if( obj.accordionopenstatus == true )
    {
        obj.accordionopenstatus = false;
        obj.set_cssclass("btn_WF_AccOpen");
		obj.set_text("OPEN");
        obj.accordionhead.accordionopenstatus = false;
    }
    else
    {
        obj.accordionopenstatus = true;
        obj.set_cssclass("btn_WF_AccClose");
		obj.set_text("CLOSE");
        obj.accordionhead.accordionopenstatus = true;
    }

    // 현재의 상태에 맞게 리드로잉처리한다.
    this._gfnRedrawAccordion(obj);
};


/**
 * @class 아코디언의 상태값을 이용해서 리드로잉 처리한다.
 * @param {Button}         아코디언 해더에 존재하는 버튼
 * @return N/A
 */
pForm._gfnRedrawAccordion = function(obj)
{
	//trace("===== _gfnRedrawAccordion : " + obj.name);
    var heightoffset  = 0;
    var accordionlist = obj.accordionlist;

    var toppos = accordionlist[0].top;
    for(var i=0;i<accordionlist.length;i++)
    {
		//trace("===== _gfnRedrawAccordion accordionlist[i].name : " + accordionlist[i].name);
		
        accordionlist[i].set_top(toppos);

        // 보여주기 처리
        if( accordionlist[i].accordionopenstatus == true )
        {
            // 바디가 존재할때
            if( !this.gfnIsNull(accordionlist[i].accordionbody) )
            {
                accordionlist[i].accordionbody.set_top(parseInt(toppos)+parseInt(accordionlist[i].height));
                accordionlist[i].accordionbody.set_height(accordionlist[i].accordionbody.orgheight);
                accordionlist[i].accordionbody.set_visible(true);
				accordionlist[i].parent.resetScroll();
                toppos = parseInt(toppos)+parseInt(accordionlist[i].height)+parseInt(accordionlist[i].accordionbody.height)+parseInt(heightoffset);
            }
            else
            {
                toppos = parseInt(toppos)+parseInt(accordionlist[i].height)+parseInt(heightoffset);
            }
        }
        // 숨김처리
        else
        {
            if( !this.gfnIsNull(accordionlist[i].accordionbody) )
            {
                accordionlist[i].accordionbody.set_top(parseInt(toppos)+parseInt(accordionlist[i].height));
                accordionlist[i].accordionbody.set_height(0);
                accordionlist[i].accordionbody.set_visible(false);
                accordionlist[i].parent.resetScroll();
                toppos = parseInt(toppos)+parseInt(accordionlist[i].height)+parseInt(heightoffset);
            }
            else
            {
                toppos = parseInt(toppos)+parseInt(accordionlist[i].height)+parseInt(heightoffset);
            }
        }
    }
};

/**
 * @class 폼 로드시에 대상 Edit 컴포넌트 IE의 -ms-clear 동일한 기능으로 동작
 * @param {Edit}           대상 Edit 컴포넌트
 * @return N/A
 */
pForm._gfnSetEditMsClear = function (oEdt)
{	
	if (!oEdt._ms_clear) return;	
	var _oParent = oEdt.parent;
	
	// "Edit 컴포넌트명 + _X"
	var sClrBtnNm = oEdt.name + "_" + "X";
	
	// 현재 Edit 컴포넌트를 기준으로 Button의 위치를 셋팅한다.
	var nWidth = parseInt(oEdt.getOffsetWidth()	);
	var nHeight= parseInt(oEdt.getOffsetHeight());
	var nTop   = parseInt(oEdt.getOffsetTop()	);
	var nLeft  = parseInt(oEdt.getOffsetLeft()	);
	
	// 생성될 Button의 Width, Height 값
	var nBtnWidth = nHeight-3;
	var nBtnHeight= nHeight;
	
	// 현재 Edit 컴포넌트가 있는 위치에 Button을 생성한다.
	// Edit와 Button은 1:1 관계이다.	
	var oBtn = new Button();  
		oBtn.init(sClrBtnNm, nLeft+(nWidth-nBtnWidth), nTop, nBtnWidth, nBtnHeight, null, null);
	
	// Button은 항상 Edit와 함께 움직이도록 한다.
	oBtn.set_left(oEdt.name + ":" + (nBtnWidth*-1));
	
	// Button의 Default 값은 false
	oBtn.set_visible(false);
	
	// Style cssclass로 셋팅한다. (Ex. oBtn.set_cssclass('btnMsClear');)
	oBtn.set_icon("URL('theme://btn_del.png')");
	oBtn.set_iconPosition("left");
	oBtn.set_background("transparent");
	oBtn.set_border("0px none");
	 
	// taborder 사용하지 않는다.
	oBtn.set_tabstop(false);
	
	_oParent.addChild(sClrBtnNm, oBtn); 
	oBtn.show();
	
	// Button Event 제어
	oBtn.addEventHandler("onclick"  	, function (obj, e) {
	
											oEdt.set_value(null);
 											oEdt.setCaretPos(0);										
											oEdt.setFocus();	
											
 											oBtn.set_visible(false);

									      }, this);
	
	oBtn.addEventHandler("onsetfocus"	, function (obj, e) {
											
											oEdt.setFocus();
											
										  }, this);  
	
	// Edit Event 제어								   
	// Edit 컴포넌트 클릭 시 입력된 내용이 존재시에 X 아이콘이 나타난다.
	oEdt.addEventHandler("oneditclick"	, function (obj, e) {
	
											  if (!this.gfnIsNull(oEdt.value)) 
												   oBtn.set_visible(true );
											else 							   
												   oBtn.set_visible(false);

										  }, this);	
	// Edit Event 제어								   
	// Edit 컴포넌트에서 포커스가 나가면 X 아이콘은 없어진다.
	oEdt.addEventHandler("onsetfocus"	, function (obj, e) {
											
											if (!this.gfnIsNull(oEdt.value)) 
												oBtn.set_visible(true );
											
										  }, this);   									  
										  
	// Edit Event 제어								   
	// Edit 컴포넌트에서 포커스가 나가면 X 아이콘은 없어진다.
	oEdt.addEventHandler("onkillfocus"	, function (obj, e) {
	
											if (_oParent.getFocus().name!=oBtn.name) 
												oBtn.set_visible(false );
											
										  }, this);   
										   
	// Edit 컴포넌트 입력 시 입력된 내용이 존재시에 X 아이콘이 나타난다.
	oEdt.addEventHandler("oninput"		, function (obj, e) {
	
											  if (!this.gfnIsNull(oEdt.value)) 
												   oBtn.set_visible(true );	
											else 							   
												   oBtn.set_visible(false);

										  }, this);
	
};

/**
 * @class 폼 로드시에 대상 Edit 컴포넌트의 -ms-clear(X) 버튼 제거
 * @param {Edit}           대상 Edit 컴포넌트
 * @return N/A
 */
pForm._gfnSetEditMsClearRemove = function (oEdt)
{
	var _oParent = oEdt.parent;
	
	// "Edit 컴포넌트명 + _X"
	var sClrBtnNm = oEdt.name + "_" + "X";
	var oBtn	  = _oParent.lookup(sClrBtnNm);
 
	// Remove Object form Parent Form  
	_oParent.removeChild(sClrBtnNm); 
 
	// Destroy Object  
	oBtn.destroy(); 
	oBtn = null;
};

/**
 * @class 폼 로드시에 대상 Edit 컴포넌트 IE의 -ms-clear(X) 동일한 기능으로 동작
 * @param {Edit	  } 대상 Edit 컴포넌트
 * @param {Boolean} 설정값 셋팅
 * @return N/A
 */
pForm.gfnSetEditMsClear = function (oEdt, bMsClear)
{	
	if (this.gfnIsNull(oEdt._ms_clear) || !oEdt._ms_clear) 
		oEdt._ms_clear = true;
	
	if (!this.gfnIsNull(bMsClear)) 
		oEdt._ms_clear = bMsClear;	
	
	  if (oEdt._ms_clear)
		pForm._gfnSetEditMsClear(oEdt);	
	else
		pForm._gfnSetEditMsClearRemove(oEdt); // 해당 컴포넌트 X버튼 삭제	
};

/**
 * @class 폼 로드시에 전체 Edit 컴포넌트 IE의 -ms-clear(X) 동일한 기능으로 동작
 * @param {Form   } 현재 폼 Form
 * @param {Boolean} 설정값 셋팅
 * @return N/A
 */
pForm.gfnSetEditMsClearAll = function (oForm, bMsClear)
{		
	var arrComp = oForm.components;
	var nLength = arrComp.length;

	for (var i=0; i<nLength; i++)
	{
		if (arrComp[i] instanceof nexacro.Div) {
			this.gfnSetEditMsClearAll(arrComp[i].form, bMsClear); //재귀함수
		}
		else if (arrComp[i] instanceof nexacro.Tab) {
			this.gfnSetEditMsClearAll(arrComp[i].form, bMsClear); //재귀함수
		}
		else {
			if (arrComp[i] instanceof nexacro.Edit) {
				var oEdt = arrComp[i];
			
				if (this.gfnIsNull(oEdt._ms_clear) || !oEdt._ms_clear) 
					oEdt._ms_clear = true;
					
				if (!this.gfnIsNull(bMsClear)) oEdt._ms_clear = bMsClear;	
			
				if (oEdt._ms_clear) {
					pForm._gfnSetEditMsClear(oEdt);	
				}
				else {
					pForm._gfnSetEditMsClearRemove(oEdt);	// 해당 컴포넌트 X버튼 삭제
				}
			}
		}
	}	 
};

/**
 * @class  DLL의 full 경로를 리턴
 * @param  {String} 컴포넌트 DLL 파일명
 * @return {String} 해당 DLL의 실제 경로
 */
pForm.gfnGetDLLPath = function(sFileName)
{
	var strpath = "";
	var xadl = nexacro.getProjectPath();
	
	// studio로 실행
    if (xadl.indexOf("file://") != -1) {        
		xadl = xadl.replace("file://", "");
        strpath  = nexacro.replaceAll(xadl.substring(0, xadl.lastIndexOf("/")), "/", "\\")+"\\dll\\"+sFileName;
		trace("ExtCommon path:"+strpath);
    }
	// 웹 접속
    else {
		strpath = system.convertRealPath("%USERAPP%\\Component\\" + sFileName);
	}
	
	trace("==================== gfnGetDLLPath strpath : " + strpath);
    return strpath;
};

/**
 * @class 컴포넌트 DLL 을 로딩하고 그 결과 Object를 리턴
 * @param {String}  컴포넌트 DLL 파일명
 * @return {Object} DLL 컴포넌트 Object
 */ 
pForm.gfnOpenDLL = function(sFileName)
{
	var objApp = this.gfnGetApplication();
	
	if (this.gfnIsNull(objApp[sFileName])) {
		objApp[sFileName] = {};
	}
	else {
		return objApp[sFileName];
	}

	// 로컬/웹 접근에 따른 파일 full 경로 가져오기
	var strpath = this.gfnGetDLLPath(sFileName);

	// dll load
	objApp[sFileName] = nexacro._addExtensionModule(strpath);

	return objApp[sFileName];
};

/**
 * @class 컴포넌트 DLL 을 로딩하고 그 결과 Object를 리턴
 * @return N/A
 */  
pForm.gfnCloseDLL = function(sFileName)
{
	// 로컬/웹 접근에 따른 파일 full 경로 가져오기
	var strpath = this.gfnGetDLLPath(sFileName);
	
	// dll 등록 해제
	nexacro._clearExtensionModule(strpath);
	
	// 객체 null 처리
	var objApp = this.gfnGetApplication();
	objApp[sFileName] = null;
};

/**
 * @class 확장 컴포넌트 DLL를 로딩하고 그 결과 Object를 리턴
 * @return {Object} 확장 컴포넌트 Object
 */ 
pForm.gfnGetExtCommon = function()
{
	var strFile = "";

	// XP
	if (system.osversion == "Windows XP") {
		strFile = "ExtCommonV17_XP.dll";
	}
	// 나머지 OS
	else {
		strFile = "ExtCommonV17_32.dll";
	}
	
	//trace("==================== gfnGetExtCommon strFile : " + strFile);
	return this.gfnOpenDLL(strFile);
};

/**
 * @class확장 컴포넌트 DLL를 해제한다.
 * @return N/A
 */  
pForm.gfnCloseExtCommon = function()
{
	// XP
	if (system.osversion == "Windows XP") {
		strFile = "ExtCommonV17_XP.dll";
	}
	// 나머지 OS
	else {
		strFile = "ExtCommonV17_32.dll";
	}
	
	this.gfnCloseDLL(strFile);
	
};
