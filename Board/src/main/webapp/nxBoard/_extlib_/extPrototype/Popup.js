/**
*  팝업 공통함수
*  @FileName 	Popup.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   		
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀 	           	    최초 생성 
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/**
 * @class 팝업오픈
 * @param {String} sPopupId	- 팝업ID
 * @param {String} sUrl	 - 팝업URL
 * @param {String} [oArg] - 전달값
 * @param {String} [sPopupCallback] - 팝업콜백
 * @param {Object} [oOption] - 팝업옵션 <br>
 *	oOption.top : 상단 좌표 <br>
 *	oOption.left : 좌측 좌표 <br>
 *	oOption.width : 넓이 <br>
 *	oOption.height : 높이 <br>
 *	oOption.popuptype : 팝업종류(modal:showModal, modeless:application.open, modalsync:showModalSync, modalwindow:showModalWindow) <br>
 *	oOption.layered : 투명 윈도우 <br>
 *	oOption.opacity : 투명도 <br>
 *	oOption.autosize : autosize <br>
 * @return N/A
 * @example
 * this.gfnOpenPopup(this);
 */
pForm.gfnOpenPopup = function ( sPopupId, sUrl, oArg, sPopupCallback, oOption)
{
    var objApp = pForm.gfnGetApplication();
	var nLeft = -1;
	var nTop = -1;
	var nWidth = -1;
	var nHeight = -1;
	var bShowTitle = true;	
	var bShowStatus = false;	
	var sPopupType = "modal";
	var bLayered = false;
	var nOpacity = 100;
	var bAutoSize = false;
	var bResizable = false;
	var sPopupCallback = (this.gfnIsNull(sPopupCallback)) ? "fn_popupAfter" : sPopupCallback;
	var sTitleText = "";

	for (var key in oOption) {
       if (oOption.hasOwnProperty(key)) {
            switch (key) 
			{
				case "top":				
					nTop = parseInt(oOption[key]);
					break;
				case "left":
					nLeft = parseInt(oOption[key]);
					break;
				case "width":
					nWidth = parseInt(oOption[key]);
					break;
				case "height":
					nHeight = parseInt(oOption[key]);
					break;
				case "popuptype":
					sPopupType = oOption[key];
					break;
				case "layered":
					bLayered = oOption[key];
					break;
				case "opacity":
					nOpacity =oOption[key];
					break;
				case "autosize":
					bAutoSize = oOption[key];
					break;
				case "titlebar":
					if (""+oOption[key] == "false")	bShowTitle = false;		
					break;
				case "title":					
					sTitleText = oOption[key];	
					break;					
			}	
        }
    }

	var sOpenalign = "";
	if(nLeft == -1 && nTop == -1) 
	{		
		sOpenalign = "center middle";
		if (system.navigatorname == "nexacro") {
			var curX = objApp.mainframe.left;
			var curY = objApp.mainframe.top;
		}else{
			var curX = window.screenLeft;
			var curY = window.screenTop;
		}
		trace("X:"+curX+" Y:"+curY);
        nLeft   =  curX + (objApp.mainframe.width / 2) - Math.round(nWidth / 2);
	    nTop    = curY + (objApp.mainframe.height / 2) - Math.round(nHeight / 2) ;		
		
	}else{
		nLeft   =  this.getOffsetLeft() + nLeft;
		nTop   =  this.getOffsetTop() + nTop;
	}
	//trace("popup Left:"+nLeft+"  top:"+nTop);	
	trace("["+this.name+"] form 타이틀["+this.titletext+"] 넘겨받은 titletext:"+sTitleText);
	if (this.gfnIsNull(sTitleText))
	{
		if (this.gfnIsNull(this.titletext)) return;
		
		sTitleText = this.titletext;
	}
	if(nWidth == -1 || nHeight == -1)
	{
	    bAutoSize = true;
	}
	
	var objParentFrame = this.getOwnerFrame();

    if(sPopupType == "modeless")
    {
        var sOpenStyle= "showtitlebar=" + bShowTitle +" showstatusbar=false showontaskbar=true showcascadetitletext=false resizable=true autosize="+bAutoSize+" titletext="+sTitleText;
		var arrPopFrame = nexacro.getPopupFrames();

		if (arrPopFrame[sPopupId]) {	
			if (system.navigatorname == "nexacro") {
				arrPopFrame[sPopupId].setFocus();
			} else {	
				arrPopFrame[sPopupId]._getWindowHandle().focus();
			}
		}
		else {
			nexacro.open(sPopupId,sUrl,objParentFrame,oArg,sOpenStyle,nLeft, nTop, nWidth, nHeight, this);
		}
    }
	else if(sPopupType == "modalsync")
    {
		newChild = new nexacro.ChildFrame;
		newChild.init(sPopupId, nLeft, nTop, nWidth, nHeight, null, null, sUrl);
		
		newChild.set_dragmovetype("all");
		newChild.set_showcascadetitletext(false);
		newChild.set_showtitlebar(bShowTitle);    //titlebar는 안보임
		newChild.set_autosize(bAutoSize);	
		newChild.set_resizable(bResizable);    //resizable 안됨
		if(!this.gfnIsNull(sTitleText)) newChild.set_titletext(sTitleText);
		newChild.set_showstatusbar(bShowStatus);    //statusbar는 안보임
		newChild.set_openalign(sOpenalign);
		newChild.set_layered(bLayered);
		newChild.set_overlaycolor("RGBA(0, 0, 0, 0.2)");
		system.showModalSync(newChild, objParentFrame, oArg);	
	}
	else if(sPopupType == "modalwindow")
    {
		newChild = new nexacro.ChildFrame;
		newChild.init(sPopupId, nLeft, nTop, nWidth, nHeight, null, null, sUrl);
		
		newChild.set_dragmovetype("all");
		newChild.set_showcascadetitletext(false);
		newChild.set_showtitlebar(bShowTitle);    //titlebar는 안보임
		newChild.set_autosize(bAutoSize);	
		newChild.set_resizable(bResizable);    //resizable 안됨
		if(!this.gfnIsNull(sTitleText)) newChild.set_titletext(sTitleText);
		newChild.set_showstatusbar(bShowStatus);    //statusbar는 안보임
		newChild.set_openalign(sOpenalign);
		newChild.set_layered(bLayered);
		newChild.set_overlaycolor("RGBA(0, 0, 0, 0.2)");
		trace(sPopupId);
		var rtn = system.showModalWindow(newChild, sPopupId, objParentFrame, oArg);		
        return rtn;
 
	}	
    else
    {
		newChild = new nexacro.ChildFrame;
		newChild.init(sPopupId, nLeft, nTop, nWidth, nHeight, null, null, sUrl);
		
		newChild.set_dragmovetype("all");
		newChild.set_showcascadetitletext(false);
		newChild.set_showtitlebar(bShowTitle);    //titlebar는 안보임
		newChild.set_autosize(bAutoSize);	
		newChild.set_resizable(bResizable);    //resizable 안됨
		if(!this.gfnIsNull(sTitleText)) newChild.set_titletext(sTitleText);
		newChild.set_showstatusbar(bShowStatus);    //statusbar는 안보임
		newChild.set_openalign(sOpenalign);
		newChild.set_layered(bLayered);
		newChild.set_overlaycolor("RGBA(0, 0, 0, 0.2)");

		newChild.showModal(objParentFrame, oArg, this, this[sPopupCallback]);
		//newChild.titlebar.closebutton.set_visible(false);	//close버튼 visible false 처리
		//newChild.style.set_border("2 solid #24322b");
		//newChild.style.set_bordertype("round 10 10");
		//newChild.style.set_background("white");    
		//newChild.style.set_opacity(nOpacity);

    }
};
/**
 * 월달력을 팝업한다
 * @param {obj}    폼
 * @param {obj}    월 컴포넌트
 * @param {string} callback 함수
 * @return N/A
 * @example      this.gfn_popupCalendarMonth(this, this.msk_output, "fn_callbackForPopupdiv");
 */
var _callback_func_month = "";
pForm.gfnPopupCalendarMonth = function (objForm, objEdit, sCallback)
{
	_callback_func_month = sCallback;
	var pdivName = "pdiv_" + objEdit.name;

	if (objForm.isValidObject(pdivName)) 
	{
		// Remove Object form Parent Form
		objForm.removeChild(pdivName);
	}

	var objPdiv = new PopupDiv();
	objPdiv.init(pdivName, 0, 0, 175, 187);
	objForm.addChild(objPdiv.name, objPdiv);
	objForm.components[objPdiv.name]._targetObj = objEdit;
	objPdiv.set_async(false);
	objPdiv.set_url("comm_pop::compop0790.xfdl"); //월달력
	objPdiv.set_async(true);
	objPdiv.show();

	
	objForm.components[objPdiv.name].trackPopupByComponent(objEdit, 0, objEdit.getOffsetHeight(), null, null, "_calMonthCallback");
	objForm.components[objPdiv.name].form.set_value();
};
/**
 * 콜백함수(월달력 팝업)
 * @param {popupId}     팝업창 아이디
 * @param {val}    		선택한 월
 * @return N/A
 * @example      
 */
pForm._calMonthCallback = function (popupId, val)
{
	if (this.gfnIsNull(_callback_func_month)) 
	{
		return;
	}

	var convPopupId = popupId.replace("pdiv_", "");

	this[_callback_func_month].call(this, convPopupId, val);
};