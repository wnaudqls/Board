/**
*  그리드 공통 함수
*  @FileName 	Grid.js 
*  @Creator 	consulting
*  @CreateDate 	2021.05
*  @Desction   		
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2021.05.27     	이노다임 개발팀 	        최초 생성 
*  2021.05.27		이노다임 개발팀			gfnGetApplication 공통함수 변경
*******************************************************************************
*/
var pForm = nexacro.Form.prototype;

//grid propertiy
pForm.defaultmenulis = "colfix,colhide,initial,cellcopypaste,selecttype,replace";//"colfix,sort,filter,initial"
pForm.selectmenulist = "checkbox,no,status,replace,colhide,export,import,cellcopypaste";
pForm.popupmenulist = "colfix,filter,initial,replace,colhide,export,import";
//소트
// 헤더 클릭시 정렬 false= 오름/내림 true= 오름/내림/없음
pForm.SORT_TOGGLE_CANCEL = true;
pForm.MARKER_TYPE = "text"; // 정렬 표시자 구분 (text or image)
// Grid Head 에 정렬 상태를 표시할 텍스트 또는 이미지 경로 지정 
pForm.MARKER = ["▲", "▼"];// [오름차순표시, 내림차순표시]
//cell copy and paste 시 chorme용 textarea 저장 object
pForm.tragetGrid = "";
/**
 * @class Grid에 기능 추가
 * @param {Object} obj	- 대상그리드
 * @return N/A
 * @example
 * this.gfnSetGrid(this.grdMain);	
*/
pForm.gfnSetGrid = function(objGrid)
{
	//Grid의 binddataset설정
	var objDs = objGrid.getBindDataset();

	// grid에 바인드된 Dataset이 없는 경우 return;
	if (this.gfnIsNull(objDs)) {
		return;
	}
	// Validation에서 foucus 처리시 사용
	else {
		objDs.bindgrid = objGrid;
	}
	
	//그리드 휠스크롤 속도 설정 21.12.07
	objGrid.set_wheelscrollrow(1);
	
	if (this.gfnIsNull(objGrid.griduserproperty))
	{
		objGrid.griduserproperty = "sort"; //디폴트 UserProperty 추가
	}
	else 
	{
		var sUserProperty = objGrid.griduserproperty;
		if (sUserProperty.toUpperCase().indexOf("SORT") < 0) sUserProperty =  sUserProperty + ",sort";
		
		objGrid.griduserproperty = sUserProperty; //디폴트 UserProperty 추가
	}
	//Grid의 다국어 변환
	if(this.gfnGetApplication().gv_translate == true) {
		for(var i = 0; i < objGrid.getCellCount("Head"); i++) {
			//다국어 변환 처리
			var sDicId = objGrid.getCellProperty("head" , i, "text");
			var sTranslate = this.gfnTranslateGrid(objGrid, i, sDicId, "Grid");
			//trace("Grid:"+sDicId+" Translate Text:"+sTranslate);
			objGrid.setCellProperty("Head", i, "text", sTranslate);
		}
	}
	//그리드 wordWrap 설정
	this._setGridWordWrap(objGrid);
	
	//Grid의 UserProperty설정
	var arrProp = this._getGridUserProperty(objGrid);
	if(this.gfnIsNull(arrProp)) return; 		//설정할 속성이 엄쪄용
	
	objGrid.set_enableevent(false);
	objGrid.set_enableredraw(false);	
	objDs.set_enableevent(false); 
	
	objGrid.orgformat2 = objGrid.getFormatString();
	
	objGrid.arrprop = arrProp;
	this._gfnGridAddProp(objGrid);
	
	this._gfnMakeGridPopupMenu(objGrid,arrProp);//popupmenu 생성
	/*********************************************** 이벤트추가 START ***********************************************/
	
	objGrid.addEventHandler("onheadclick", 	 this.gfnGrid_onheadclick, 	 this); 	//헤드클릭이벤트추가
	objGrid.addEventHandler("oncellclick", 	 this.gfnGrid_oncellclick, 	 this); 	//헤드클릭이벤트추가
	objGrid.addEventHandler("ondrag", 	 this.gfnGrid_ondrag, 	 this); 	//헤드클릭이벤트추가
	objGrid.addEventHandler("onkeyup", 	 this.gfnGrid_onkeyup, 	 this); 	//keyup이벤트 추가 (선택 자동화기능)
	for( var k=0; k< arrProp.length; k++){
		var arr = this.popupmenulist.split(",");
		for( var n=0; n<arr.length; n++){
			if( arrProp[k] == arr[n]){
				//우클릭 이벤트 중 하나라도 있어야 팝업 이벤트 사용 가능
				//우클릭이벤트추가
				objGrid.addEventHandler("onrbuttondown", this.gfnGrid_onrbuttondown, this);	    
				break;
			}
		}
		if( arrProp[k] == "cellcopypaste"){
			objGrid.addEventHandler("onkeydown", this.gfnGrid_onkeydown, this);
		}
	}
	/*********************************************** 이벤트추가 END *************************************************/
	if (objGrid.cellsizingtype == "none") objGrid.set_cellsizingtype("col");
	
	if (objGrid.autoenter == "none") objGrid.set_autoenter("select");
	
	if (objGrid.fillareatype == "linerow") objGrid.set_fillareatype("none"); //그리드 fillareatype = linerow이면 none으로 설정.(속도 이슈) 21.12.23
	
	objGrid.set_scrollbarsize("10"); //그리드 스크롤바 사이즈 작게 설정 21.12.23
	
	objGrid.orgSelectType = objGrid.selecttype;
	objGrid.copyMode = "";
	objGrid.set_enableevent(true);
	objGrid.set_enableredraw(true);	
	objDs.set_enableevent(true);
	objGrid.orgformat = objGrid.getCurFormatString();
};	

/**
 * @class Grid에 기능 추가(addCol..)
 * @param {Object} objGrid	- 대상그리드
 * @return N/A
 * @example
 * this._gfnGridAddProp(this.grdMain);	
*/
pForm._gfnGridAddProp = function (objGrid)
{
	var arrProp = objGrid.arrprop;
	var objDs = objGrid.getBindDataset();
	//console.log(arrProp);
	for( var i=0; i<arrProp.length; i++)
	{
		switch(arrProp[i]) {
			case "checkbox":
				this._gfnGridCheckboxNoStatusAdd(objGrid, objDs, "checkbox");
				break;			
			case "no":
				this._gfnGridCheckboxNoStatusAdd(objGrid, objDs, "no");
				break;
			case "status":
				this._gfnGridCheckboxNoStatusAdd(objGrid, objDs, "status");
				break;
			case "sort":
				objGrid.sort = "true";
				break;
			default: break;
		}
	}
	
};

/**
 * @class Grid에 기능 추가(addCol..)
 * @param {Object} objGrid	- 대상그리드
 * @param {Object} objDs	- 대상데이터셋
 * @param {Array} addProp	- 기능
 * @return N/A
 * @example
 * this._gfnGridCheckboxNoStatusAdd(this.grdMain, this.dsList, [checkbox,no,status]);	
*/
pForm._gfnGridCheckboxNoStatusAdd = function (objGrid, objDs, addProp)
{	
	trace("그리드 체크 박스 속성 설정 함수 호출되었습니다.");
	var nHeadColIndex;
	if(this.gfnIsNull(objDs.insertheadcell)) nHeadColIndex = 0;
	else nHeadColIndex = objDs.insertheadcell;	

	var nBodyColIndex;
	if(this.gfnIsNull(objDs.insertbodycell)) nBodyColIndex = 0;
	else nBodyColIndex = objDs.insertbodycell;
	
	var nFormatRowCount = objGrid.getFormatRowCount();
	var nHeadCount=-1;
	var nBodyCount=-1;
	for (var i=0; i<nFormatRowCount; i++)
	{
		if (objGrid.getFormatRowProperty(i, "band") == "head") nHeadCount++;
		if (objGrid.getFormatRowProperty(i, "band") == "body") nBodyCount++;
	}

	var sNo = "순번";
	var sStatus = "상태";

	//체크박스
	if( addProp == "checkbox")
	{
		objDs.set_enableevent(false); 
		var idx=-1;
		for( var j=0; j<objDs.getColCount(); j++){
			var tmpcol = objDs.getColID(j);
			if( tmpcol == "PROC_DELETE"){
				idx = j;
			}
		}
		if( idx < 0 ) objDs.addColumn("PROC_DELETE", "STRING", 1);
				
		for( var i=0; i<objGrid.getCellCount("head"); i++){
			//헤드텍스트
			var tmp = objGrid.getCellProperty("head" , i, "text");
			if( tmp == "0"){
				// head cell index 에 해당하는 body cell index
				var bodyCellIndex = this._gfnGridGetBodyCellIndex(objGrid, i);
				// body cell index 에 해당하는 바인드 컬럼명
				var columnName = this._gfnGridGetBindColumnNameByIndex(objGrid, bodyCellIndex);
				if(columnName == "PROC_DELETE") {
					//return;
					objGrid.deleteContentsCol("body", i);
				}
			}
		}
		objGrid.insertContentsCol(nBodyColIndex);			
		objGrid.setFormatColProperty(nBodyColIndex, "size", "40");	
		objGrid.setCellProperty("head", nHeadColIndex, "displaytype", "checkboxcontrol");
		objGrid.setCellProperty("head", nHeadColIndex, "edittype", "checkbox");
		objGrid.setCellProperty("head", nHeadColIndex, "text", "0");
		objGrid.setCellProperty("body", nBodyColIndex, "displaytype", "checkboxcontrol");
		objGrid.setCellProperty("body", nBodyColIndex, "edittype", "checkbox");
		objGrid.setCellProperty("body", nBodyColIndex, "text", "bind:PROC_DELETE");
		
		objGrid.mergeContentsCell("head", 0, nBodyColIndex, nHeadCount, nBodyColIndex, nHeadColIndex, false);	
		objGrid.mergeContentsCell("body", 0, nBodyColIndex, nBodyCount, nBodyColIndex, nBodyColIndex, false);		
		
		nHeadColIndex++;
 		nBodyColIndex++;
	}	
	//번호
	if( addProp == "no")
	{
		for( var i=0; i<objGrid.getCellCount("head"); i++){
			var tmp = objGrid.getCellProperty("head" , i, "text");
			if( tmp == "NO" || tmp == "순번"){
				//return;
				objGrid.deleteContentsCol("body", i);
			}
		}
		objGrid.insertContentsCol(nBodyColIndex);	
		objGrid.setFormatColProperty(nBodyColIndex, "size", "50");	
 		objGrid.setCellProperty("head", nHeadColIndex, "text", sNo);	
		objGrid.setCellProperty("head", nHeadColIndex, "textAlign","center");
		objGrid.setCellProperty("body", nBodyColIndex, "text","expr:currow+1");
		objGrid.setCellProperty("body", nBodyColIndex, "textAlign","center");
		objGrid.mergeContentsCell("head", 0, nBodyColIndex, nHeadCount, nBodyColIndex, nHeadColIndex, false);	
		objGrid.mergeContentsCell("body", 0, nBodyColIndex, nBodyCount, nBodyColIndex, nBodyColIndex, false);			
		
		nHeadColIndex++;
 		nBodyColIndex++;
	}
	//상태
	if ( addProp == "status")
	{
		for( var i=0; i<objGrid.getCellCount("head"); i++){
			var tmp = objGrid.getCellProperty("head" , i, "text");
			if( tmp == "상태" || tmp == "Status"){
				//return;
				objGrid.deleteContentsCol("body", i);
			}
		}
		
		var sInsert = "입력";
		var sUpdate = "수정";
		var sDelete = "삭제";
		var sExpr = "expr:"
				  + "dataset.getRowType(currow)==2?"+sInsert
				  + ":dataset.getRowType(currow)==4?"+sUpdate
				  + ":dataset.getRowType(currow)==8?"+sDelete
				  + ":''";
		
		var nSize = 50;
		
		objGrid.insertContentsCol(nBodyColIndex);	
		objGrid.setFormatColProperty(nBodyColIndex, "size", nSize);	
		objGrid.setCellProperty("head", nHeadColIndex, "text", sStatus);	
		objGrid.setCellProperty("head", nHeadColIndex, "textAlign","center");
		objGrid.setCellProperty("body", nBodyColIndex, "displaytype", "expr:dataset.getRowType(currow) != 1 ? 'text' : ''");
		objGrid.setCellProperty("body", nBodyColIndex, "text", sExpr);		
		objGrid.setCellProperty("body", nBodyColIndex, "textAlign","center");
		objGrid.mergeContentsCell("head", 0, nBodyColIndex, nHeadCount, nBodyColIndex, nHeadColIndex, false);	
		objGrid.mergeContentsCell("body", 0, nBodyColIndex, nBodyCount, nBodyColIndex, nBodyColIndex, false);			
		
		nHeadColIndex++;
 		nBodyColIndex++;
	}	
};

/**
 * @class  그리드헤드클릭 이벤트 [Sort, Checkbox]
 * @param {Object} objGrid - 대상그리드
 * @param {Evnet}  e	   - 헤드클릭이벤트
 * @return  N/A
 * @example
 * objGrid.addEventHandler("onheadclick", 	 this.gfnGrid_onheadclick, 	 this);
 */
pForm.gfnGrid_onheadclick = function(objGrid, e)
{
	var sCheckBoxControl = "";
	var sType = "";
	var nSubCellCnt = objGrid.getSubCellCount("head",e.cell);
	if (nSubCellCnt > 0)
	{
		//subcell 있음
		for (var k=0;k<nSubCellCnt;k++)
		{
			sType = objGrid.getSubCellProperty("head", e.cell, k, "displaytype");
			if (sType == "checkboxcontrol")
			{
				break;
			}
		}
	}
	else 
	{
		sType = objGrid.getCellProperty("head", e.cell, "displaytype");
	}
	trace("onheadclick:"+ objGrid.griduserproperty+" HScrollbarPos["+objGrid.hscrollbar.pos+"]");
	trace("onheadclick sType:"+ sType);
	objGrid.hscrollbarpos = objGrid.hscrollbar.pos;
	if (sType == "checkboxcontrol"){
	
		if (!this.gfnIsNull(objGrid.griduserproperty))
		{
			if (objGrid.griduserproperty.indexOf("!checkbox")>=0) sCheckBoxControl = true;
		}
		if (sCheckBoxControl == true) return;
		//head display type이 checkbox일 경우 all/none check기능추가
		this._gfnHeadCheckSelectAll(objGrid, e);
	}else{
		//sort
		if(this.gfnIsNull(objGrid.sort) || objGrid.sort=="false"){
			return;
		}else if(objGrid.sort == "true"){
			var arr = objGrid.arrprop;
			var multiple = true;
			//if ( e.ctrlkey ) multiple = true;// Ctrl 키를 사용하지 않도록 멀티소트 방식 변경. 21.12.13
				// 정렬 상태 변경이 성공하면 정렬을 실행한다.
			var rtn = this._gfnGridSetSortStatus(objGrid, e.cell, multiple);
			if(rtn){
				this._gfnGridExecuteSort(objGrid);
			}
		}
	}
	objGrid.hscrollbar.set_pos(objGrid.hscrollbarpos);
};
/**
 * @class  그리드클릭 이벤트 
 * @param {Object} objGrid - 대상그리드
 * @param {Evnet}  e	   - 클릭이벤트
 * @return  N/A
 * @example
 * objGrid.addEventHandler("onclick", 	 this.gfnGrid_onclick, 	 this);
 */
pForm.gfnGrid_oncellclick = function(objGrid, e)
{
	if (e.row < 0) return;
	trace("grid onclick cell:["+e.cell+"]");
	var nClickCellIdx = e.cell;
	objGrid.clickCellIdx = nClickCellIdx;
};
/**
 * @class  그리드 drag 이벤트 
 * @param {Object} objGrid - 대상그리드
 * @param {Evnet}  e	   - drag 이벤트
 * @return  N/A
 * @example
 * objGrid.addEventHandler("ondrag", 	 this.gfnGrid_ondrag, 	 this);
 */
pForm.gfnGrid_ondrag = function(objGrid, e)
{
	if (e.row < 0) return;
	var sSelectType = objGrid.selecttype;
	if (sSelectType == "row" || sSelectType == "multirow" || sSelectType == "cell") return;
	trace("grid ondrag cell:["+e.cell+"]");
	var nClickCellIdx = e.cell;
	objGrid.clickCellIdx = nClickCellIdx;
};
/**
 * @class  그리드키다운 이벤트 [cellcopypaste]
 * @param {Object} objGrid - 대상그리드
 * @param {Evnet}  e	   - 키다운이벤트
 * @return  N/A
 * @example
 * objGrid.addEventHandler("onheadclick", 	 this.gfnGrid_onheadclick, 	 this);
 */
pForm.gfnGrid_onkeydown =function(objGrid, e){
	var keycode = e.keycode;
	var sBrowser = system.navigatorname;
	trace("key event:"+e.ctrlkey+"["+keycode+"]");
	if(e.ctrlkey){
		if(keycode == 67){
			//copy
			if( sBrowser == "nexacro" || sBrowser == "IE"){
				this._gfnGridCopyEventForRuntime(objGrid, e);
			}else {
				this._gfnGridCopyEventForChrome(objGrid, e);
			}
		}else if(keycode == 86){
			//paste
			this._gfnGridPasteEvent(objGrid, e);
		}
	}
	return true;
};

/**
 * @class 정렬가능여부리턴
 * @param {Object} grid - 대상그리드
 * @param {Number} headCellIndex - 대상셀INDEX
 * @param {Boolean}multiple - 멀티소트여부 
 * @param {Number} sortStatus - 소트상태  
 * @return{Boolean} sort 가능/불가능 여부
 * @example
 * this._gfnGridSetSortStatus(obj, e.cell, multiple);	
 */
pForm._gfnGridSetSortStatus = function(grid, headCellIndex, isMultiple, sortStatus, bodyCellIndex)
{
	// head cell index 에 해당하는 body cell index
	if( this.gfnIsNull(bodyCellIndex)){
		bodyCellIndex = this._gfnGridGetBodyCellIndex(grid, headCellIndex);
	}
	if ( bodyCellIndex < 0 ) return false;
	
	// body cell index 에 해당하는 바인드 컬럼명
	var columnName = this._gfnGridGetBindColumnNameByIndex(grid, bodyCellIndex);
	if ( this.gfnIsNull(columnName) ){
		trace("Check Grid body cell bind value");
		return false;
	}
	
	if ( this.gfnIsNull(isMultiple) ) isMultiple = false;
	if ( this.gfnIsNull(sortStatus) ) sortStatus = -1;
	
	// 대상 grid 에 정렬정보를 가지는 사용자 속성 확인/추가
	if ( this.gfnIsNull(grid.sortInfos) ){
		grid.sortInfos = {};
	}
	
	// 정렬대상컬럼 (순서중요)
	if ( this.gfnIsNull(grid.sortItems) ){
		grid.sortItems = [];
	}
	
	var sortInfos = grid.sortInfos,
		sortItems = grid.sortItems,
		sortInfo = sortInfos[columnName],
		sortItem,
		status;
	
	if ( this.gfnIsNull(sortInfo) )
	{
		var headText = grid.getCellText(-1, headCellIndex);
		
		// executeSort에서 정렬 표시를 위해 cell index 가 필요한데
		// cell moving 될 경우 index는 변하므로 cell object 를 참조하여 값을 얻어온다. 		
		var refCell = this._gfnGridGetGridCellObject(grid, "head", headCellIndex);
		sortInfo = sortInfos[columnName] = { status: 0, text: headText, refCell: refCell};
	}
	// set sort status
	if ( isMultiple ) {		
		status = sortInfo.status;
		if ( sortStatus == -1 ) {
			if ( status == 0 ) {
				sortInfo.status = 1;
			} 
			else if ( status == 1 ) {
				sortInfo.status = 2;
			} 
			else if ( status == 2 ) {
				sortInfo.status = ( this.SORT_TOGGLE_CANCEL ? 0 : 1);
			}
		}
		else {
			sortInfo.status = sortStatus;
		}
	}else {
		for (var p in sortInfos) {
			if ( sortInfos.hasOwnProperty(p) )
			{
				sortInfo = sortInfos[p];
				if ( p == columnName ) {
					status = sortInfo.status;
					if ( sortStatus == -1 ) {
						if ( status == 0 ) {
							sortInfo.status = 1;
						} 
						else if ( status == 1 ) {
							sortInfo.status = 2;
						} 
						else if ( status == 2) {
							sortInfo.status = ( this.SORT_TOGGLE_CANCEL ? 0 : 1);
						}
					}else {
						sortInfo.status = sortStatus;
					}
				}else {
					sortInfo.status = 0;
				}
				if ( sortInfo.status == 0 ){
					for (var j=0, len2=sortItems.length; j<len2; j++) {
						if ( sortItems[j] !== columnName ) {
							sortItems.splice(j, 1);
							break;
						}
					}
				}
			}
		}
	}
	
	// 컬럼정보 등록
	var hasItem = false;
	for (var i=0, len=sortItems.length; i<len; i++) {
		if ( sortItems[i] == columnName ) {
			hasItem = true;
			break;
		}
	}	
	if ( !hasItem ){
		sortItems.push(columnName);
	}
	return true;
}; 

/**
 * @class head cell에 match되는 body cell을 얻어온다
 * @param {Object}  grid 대상 Grid Component
 * @param {Number} eadCellIndex head cell index
 * @return{Number}  body cell index
 * @example
 * this._gfnGridSetSortStatus(obj, e.cell, multiple);	
 */ 
pForm._gfnGridGetBodyCellIndex = function(grid, headCellIndex, useColspan) 
{	//, useColspan) 
	if( this.gfnIsNull(useColspan)) useColspan=false;
	// Max Head Row Index
	var maxHeadRow = 0;
	for (var i=0, len=grid.getCellCount("head"); i<len; i++) {
		var row = grid.getCellProperty("head", i, "row");
		if (maxHeadRow < row) {
			maxHeadRow = row;
		}
	}
	// Max Body Row Index
	var maxBodyRow = 0;
	for (var i=0, len=grid.getCellCount("body"); i<len; i++) {
		var row = grid.getCellProperty("body", i, "row");
		if (maxBodyRow < row) {
			maxBodyRow = row;
		}
	}
	
	if (maxHeadRow == 0 && maxBodyRow == 0) {
// 		var headcolspan = grid.getCellProperty("head", headCellIndex, "colspan");
// 		var bodycolspan = grid.getCellProperty("body", headCellIndex, "colspan");
// 		
// 		if( headcolspan == bodycolspan ){
// 			return headCellIndex;
// 		}
		useColspan = true;
	}
	
	// Body Row 가 1개 이상일 경우
	// Head의 row 가 Body의 row 보다 클 경우 차이 row 를 뺀 것을 대상으로 찾고
	// Body의 row 가 Head의 row 보다 크거나 같을 경우 row index가 같은 대상을 찾는다.			
	var cellIndex = -1;
	var sRow = -1;
	var nRow = parseInt(grid.getCellProperty("head", headCellIndex, "row"));
	var nCol = parseInt(grid.getCellProperty("head", headCellIndex, "col"));
	var nColspan = parseInt(grid.getCellProperty("head", headCellIndex, "colspan"));				
	
	if (maxHeadRow > maxBodyRow) 
	{
		sRow = nRow - (maxHeadRow - maxBodyRow);
		sRow = (sRow < 0 ? 0 : sRow);
	}
	else 
	{
		sRow = nRow;
	}
	var cRow, cCol, cColspan, cRowspan;
	for (var i=0, len=grid.getCellCount("body"); i<len; i++) 
	{
		cRow = parseInt(grid.getCellProperty("body", i, "row"));
		cCol = parseInt(grid.getCellProperty("body", i, "col"));	
		cColspan = parseInt(grid.getCellProperty("body", i, "colspan"));					
		cRowspan = parseInt(grid.getCellProperty("body", i, "rowspan"));
		if( cRowspan > 1 )
		{
			if ( useColspan ){
				if (sRow >= cRow && nCol <= cCol && cCol < (nCol + nColspan)) 
				{		
					cellIndex = i;
					break;
				}		
			}else{
				if (sRow >= cRow && nCol == cCol && nColspan == cColspan) 
				{		
					cellIndex = i;
					break;
				}
			}
		}else{	
			if ( useColspan ){
				if (sRow == cRow && nCol <= cCol && cCol < (nCol + nColspan)) 
				{		
					cellIndex = i;
					break;
				}		
			}else{
				if (sRow == cRow && nCol == cCol && nColspan == cColspan) 
				{		
					cellIndex = i;
					break;
				}
			}
		}
	}
	return cellIndex;
};

/**
 * @class body cell index로 binding 된 컬럼명을 얻어온다.
 * @param {Object}  grid 대상 Grid Component
 * @param {Number} eadCellIndex head cell index
 * @return{String} column id
 * @example
 * this._gfnGridGetBindColumnNameByIndex(obj, e.cell);	
 */  
pForm._gfnGridGetBindColumnNameByIndex = function(grid, index) 
{
	var text = "";
	var columnid = "";
	var subCell = grid.getCellProperty("body", index, "subcell");
	if ( subCell > 0 ){
		text = grid.getSubCellProperty("body", index, 0, "text");
	}
	else{
		text = grid.getCellProperty("body", index, "text");
	}
	
	if ( !this.gfnIsNull(text) ){
		if ( text.search(/^BIND\(/) > -1 ) {	
			columnid = text.replace(/^BIND\(/, "");
			columnid = columnid.substr(0, columnid.length-1);
		} 
		else if ( text.search(/^bind:/) > -1 ) {
			columnid = text.replace(/^bind:/, "");
		}
	}
	return columnid;
};

/**
 * @class 소트를 실행한다
 * @param {Object}  grid 대상 Grid Component
 * @return{String}  N/A
 * @example
 * this._gfnGridExecuteSort(obj);	
 */  
pForm._gfnGridExecuteSort = function(grid) 
{
	var sortInfo, 
		sortItem,
		sortInfos = grid.sortInfos,
		sortItems = grid.sortItems,
		columnName,
		status,
		cell,
		sortString = "";
		
	if ( this.gfnIsNull(sortInfos) || this.gfnIsNull(sortItems) ) return;

	// keystring 조합
	for (var i=0; i<sortItems.length; i++) {
		columnName = sortItems[i];
		sortInfo = sortInfos[columnName];
		status = sortInfo.status;
		cell = sortInfo.refCell;
		
		// 컬럼삭제 등으로 제거될 수 있으므로 실제 column 이 존재하는지
		// 확인하여 없으면 제거해 준다.
		if ( this.gfnIsNull(cell) || grid.getBindCellIndex("body", columnName) < 0 ){
			// 컬럼정보제거
			sortItems.splice(i, 1);
			sortInfos[columnName] = null;
			delete sortInfos[columnName];
			
			i--;
		}else if ( status > 0 ) {
			sortString += (status == 1 ? "+" : "-") + columnName;
		}
	}
	
	var ds = grid.getBindDataset();
	// keystring 확인
	var curKeyString = ds.keystring;
	var groupKeyString = "";
	
	if ( curKeyString.length > 0 && curKeyString.indexOf(",") < 0 ){
		var sIndex = curKeyString.indexOf("S:");
		var gIndex = curKeyString.indexOf("G:");

		if ( sIndex > -1 ){
			groupKeyString = "";
		}else{
			if ( gIndex < 0 )
			{
				groupKeyString = "G:"+curKeyString;
			}
			else
			{
				groupKeyString = curKeyString;
			}
		}
	}else{
		var temps = curKeyString.split(",");
		var temp;
		for (var i=0,len=temps.length; i<len; i++){
			temp = temps[i];
			if ( temp.length > 0 && temp.indexOf("S:") < 0 ){
				if ( temp.indexOf("G:") < 0 )
				{
					groupKeyString = "G:"+temp;
				}else{
					groupKeyString = temp;
				}
			}
		}
	}
	
	if ( sortString.length > 0 ){
		var sortKeyString = "S:"+sortString;
		
		if ( groupKeyString.length > 0 ){
			ds.set_keystring(sortKeyString + "," + groupKeyString);
		}else{
			ds.set_keystring(sortKeyString);
		}
		
		grid.sortKeyString = sortKeyString;
	}else{		
		ds.set_keystring(groupKeyString);
		grid.sortKeyString = "";
	}

	// 정렬표시
	var type = this.MARKER_TYPE;
	var index, marker;
	for (var p in sortInfos) {
		if ( sortInfos.hasOwnProperty(p) )
		{
			sortInfo = sortInfos[p];			
			cell = sortInfo.refCell;
			if ( cell )
			{
				index = cell._cellidx;
				marker = this.gfnDecode(sortInfo.status, 1, this.MARKER[0], 2, this.MARKER[1], "");
				grid.setCellProperty( "head", index, "text", marker + sortInfo.text);
			}
		}
	}
};

/**
 * Cell object 를 반환 (Grid 내부 속성이므로 get 용도로만 사용)
 * @param {Grid} grid 대상 Grid Component
 * @param {string} band 얻고자 하는 cell 의 band (head/body/summ);
 * @param {number} index 얻고자 하는 cell 의 index
 * @return {object} cell object
 */
pForm._gfnGridGetGridCellObject = function(grid, band, index)
{
	// 내부속성을 통해 얻어온다.
	var refCell;
	var format = grid._curFormat;
	if (format){
		if ( band == "head" ){
			refCell = format._headcells[index];
		}
		else if ( band == "body" ){
			refCell = format._bodycells[index];
		}
		else if ( band == "summ" || band == "summary" ){
			refCell = format._summcells[index];
		}
	}
	return refCell;
};

/**
 * @class 그리드의 Sort Mark 제거
 * @param {Object} Grid 대상그리드
 * @return N/A
 */  
pForm._gfnClearSortMark = function(obj)
{
	var sortInfos = obj.sortInfos;
	var sortItems = obj.sortItems;
	
	if ( this.gfnIsNull(sortInfos) || this.gfnIsNull(sortItems) ) return;
	
	// 정렬상태 초기화.
	for( var j=0; j<sortItems.length;j++){
		var col = sortItems[j];
		var sortInfo = sortInfos[col];
		sortInfo.status = 0;
	}
	
	// 정렬실행
	this._gfnGridExecuteSort(obj);
	
	// 정보 초기화
	obj.sortInfos = {};
	obj.sortItems = [];
};

/**
 * @class  마우스우클릭이벤트
 * @param  {Object} objGrid	- 대상그리드
 * @param  {Event}  e		- 우클릭이벤트 
 * @return  N/A
 * @example
 * this._gfnGetHeadBodyIndex(this.grdMain, this.dsMain);	
 */
pForm.gfnGrid_onrbuttondown = function (objGrid, e)
{
	trace("Grid RButtonDown event cell:"+e.cell+" col:"+e.col);
	trace("속성확인:"+objGrid.griduserproperty.indexOf("!menu"));
	//그리드 팝업메뉴 안보여주기 설정 추가 22.02.07
	if (objGrid.griduserproperty.indexOf("!menu") > -1) return;
	
	var objApp = pForm.gfnGetApplication();
	
	// 대상 그리드와 셀 정보를 추가
	objGrid.popupMenu.grid = objGrid;
	objGrid.popupMenu.cellindex = e.cell;
	objGrid.popupMenu.rowindex = e.row;
	var nLeftFrameSize = "";
	if(nexacro.getApplication().xadl.indexOf("quickview") > -1){
		nLeftFrameSize = "15,0,*";
	}
	else 
	{
		nLeftFrameSize = objApp.mainframe.HFrameSet.separatesize;
	}
	
	var nLeftSize = 15;
	if (nLeftFrameSize.indexOf("300") >= 0) nLeftSize = 300;
	
	if (objGrid.left > 10) nLeftSize = objGrid.left;
	
	trace("position X:"+nexacro.System.getCursorX() + " Grid pos:" +system.clientToScreenX(objGrid, 0)+" LeftSize:"+ nLeftSize + " Grid Left:"+objGrid.left);
	//trace("position Y:"+nexacro.toNumber(nexacro.System.getCursorY()) + " " +nexacro.toNumber(system.clientToScreenY(objApp.mainframe, 0)));
	var x = nexacro.toNumber(nexacro.System.getCursorX()) - nexacro.toNumber(system.clientToScreenX(objGrid, 0) - nLeftSize);
	var y = nexacro.toNumber(nexacro.System.getCursorY()) - nexacro.toNumber(system.clientToScreenY(objApp.mainframe, 0));
	//trace("X:"+x+"   Y:"+y);
	objGrid.popupMenu.trackPopup(x, y);
};

/**
 * @class  gfnCreatePopupMenu 내부함수로 팝업메뉴 클릭 시 발생하는 이벤트
 * @param {Object} objGrid	- 대상그리드
 * @param {Evnet}  e 		- 팝업메뉴클릭이벤트
 * @return N/A
 * @example
 * this.gfnPopupmenu_onmenuclick(this.grdMain, nexacro.MenuClickEventInfo);	
 */
pForm.gfnPopupmenu_onmenuclick = function (objMenu, e)
{
	var selectId   = e.id;
	var grid 	   = objMenu.grid;
	var nCellIndex = objMenu.cellindex;	
	var nRowIndex  = objMenu.rowindex;

	switch(selectId) {
		case "colfix"://틀고정 열
			this.fv_CellIndex = nCellIndex;
			this._gfnGridcellFix(grid, this.fv_CellIndex, nRowIndex);
			break;
		case "colfixfree"://틀고정 열 해제
			this._gfnGridCellFree(grid);
			break;
		case "filter"://필터
			this._gfnGridFilter(grid);
			break;
		case "filterfree"://필터해제
			this._gfnGridCellFilterFree(grid);
			break;
		case "replace"://찾기/바꾸기
			this._gfnGridCellReplace(grid, nCellIndex, nRowIndex);
			break;
		case "colhide"://컬럼숨기기
			this._gfnGridColHideShow(grid, nRowIndex);
			break;	
		case "export"://엑셀내보내기
			this._gfnGridExcelExport(grid, nRowIndex);
			break;	
		case "import"://엑셀가져오기
			this._gfnGridExcelImport(grid, nRowIndex);
			break;		
		case "selecttype"://그리드 selecttype 변경(복사&붙여넣기)
			this._gfnGridSetProperty(grid);
			break;				
		case "initial"://초기화
			grid.set_formats("<Formats>" + grid.orgformat2 + "</Formats>");
			//this._gfnGridCellFree(grid);
			//this._gfnClearSortMark(grid);
			this._gfnClearSorting(grid);
			this._gfnGridAddProp(grid);
			break;
		default: break;
	}
};
/**
 * @class  _gfnClearSorting 소트 초기화
 * @param {Object} objGrid	- 대상그리드
 * @return N/A
 * @example
 * this._gfnClearSorting(this.grdMain);	
 */
pForm._gfnClearSorting = function(objGrid)
{
	var ds = objGrid.getBindDataset();
	trace("grid sort clear:"+objGrid.sortKeyString);
	trace("ds sort clear:"+ds.keystring);
	ds.set_keystring("");
	objGrid.sortKeyString = "";
	objGrid.sortInfos = "";
	objGrid.sortItems = "";
};
/**
 * @class  _gfnGridSetCssclass 행고정/해제시 css설정
 * @param {Object} objGrid	- 대상그리드
 * @return N/A
 * @example
 * this._gfnGridSetCssclass(this.grdMain);	
 */
pForm._gfnGridSetCssclass = function (objGrid)
{
	var clname = "Cell_WF_Fixed";
	clname = nexacro.wrapQuote(clname);
			
	objGrid.set_enableredraw(false);

	for( var k=0; k<objGrid.getFormatColCount(); k++){
		var expr = "";
		if( objGrid.fixedRow >= 0 ){
			expr = "expr:comp.fixedRow==currow?"+clname+":''";
		}
		objGrid.setCellProperty("body", k, "cssclass", expr);
	}
	objGrid.set_enableredraw(true);
	objGrid.setFixedRow(objGrid.fixedRow);
};

/**
 * @class  그리드헤드클릭이벤트 내부함수 (헤드클릭시 체크 ALL/None)
 * @param {Object} objGrid - 대상그리드
 * @param {Evnet}  e	   - 헤드클릭이벤트
 * @return  N/A
 * @example
 * this._gfnHeadCheckSelectAll(objGrid, e); //ALL CHECK
 */
pForm._gfnHeadCheckSelectAll = function (objGrid, e)
{
	if(objGrid.readonly == true) return;
	
	var sType;
	var sChk;
	var sVal;
	var sChkVal;
	var oDsObj;
	var nHeadCell  = e.cell;
	var nBodyCell;
	var nSubCnt = objGrid.getSubCellCount("head", nHeadCell);

	oDsObj  = objGrid.getBindDataset();
	
	if(oDsObj.getRowCount() < 1) return;
	
	if(objGrid.getCellCount("body") != objGrid.getCellCount("head")) {
		nBodyCell = parseInt(objGrid.getCellProperty("head", nHeadCell, "col"));
	} else {
		nBodyCell = e.cell;
	}
	sChkVal = objGrid.getCellProperty("body", nBodyCell, "text");
	sChkVal = sChkVal.toString().replace("bind:", "");
		
	if (nSubCnt > 0)
	{
		sType = objGrid.getSubCellProperty("head", nHeadCell, 0, "displaytype");	
	}
	else 
	{
		// Merge한 셀이 없는 경우
		sType = objGrid.getCellProperty("head", nHeadCell, "displaytype");		
	}

	if(sType != "checkboxcontrol") {
		return;
	}

	// Head셋팅
	if (nSubCnt > 0)
	{
		sVal = objGrid.getSubCellProperty("head", nHeadCell, 0, "text");
		trace(sVal + "  valueOf:" + sVal.valueOf() + " object여부:"+(typeof sVal == "object"));
		if (typeof sVal == "object")
		{
			sVal = "";
		}
	}
	else 
	{
		sVal = objGrid.getCellProperty("head", nHeadCell, "text");
	}
	trace("head value:"+sVal+" null인지 여부:"+this.gfnIsNull(sVal));		
	if (this.gfnIsNull(sVal) || sVal == "0") {
		if (nSubCnt > 0)
		{
			objGrid.setSubCellProperty("head", nHeadCell, 0, "text", "1");
		}
		else 
		{
			objGrid.setCellProperty("head", nHeadCell, "text", "1");
		}
		
		sChk="1";
	} else {
		if (nSubCnt > 0)
		{
			objGrid.setSubCellProperty("head", nHeadCell, 0, "text", "0");
		}
		else 
		{
			objGrid.setCellProperty("head", nHeadCell, "text", "0");
		}
		
		var bodyCellIndex = this._gfnGridGetBodyCellIndex(objGrid, nHeadCell);
		// body cell index 에 해당하는 바인드 컬럼명
		var columnName = this._gfnGridGetBindColumnNameByIndex(objGrid, bodyCellIndex);
		if(columnName == "PROC_DELETE" || columnName == "CHK") {
			 sChk="";
		}else{
			sChk="0";
		}
	}
	
	trace("_gfnHeadCheckSelectAll 함수 실행  sChkVal["+sChkVal+"]");
	// Body셋팅 전체설정/해제 처리는 반대로 반복문을 처리한다. 21.08.04
	if(sChkVal != "PROC_DELETE") oDsObj.set_enableevent(false);
	var nLoopCnt = oDsObj.getRowCount();
	for(var i=nLoopCnt ; i >= 0 ; i--) {
		oDsObj.setColumn(i, sChkVal, sChk);
	}
	if(sChkVal != "PROC_DELETE") oDsObj.set_enableevent(true);
};

/**
 * @class  마우스우클릭시 표현될 팝업메뉴생성
 * @param  {Object} objGrid	- 대상그리드
 * @return  N/A
 * @example
 * this._gfnGetHeadBodyIndex(this.grdMain, this.dsMain);	
 */
pForm._gfnMakeGridPopupMenu = function (objGrid, arrProp)
{
	var objApp 		 = pForm.gfnGetApplication();
	var objMenuDs 	 = objApp.gdsGridPopupMenu;
	var objParentForm= objGrid.parent;
	
	var sPopupDsMenu = "dsPopupMenu_"+objGrid.name+"_"+this.name;
	var objPopupDs 	 = new Dataset(sPopupDsMenu);
	objParentForm.addChild(sPopupDsMenu, objPopupDs); 
	objPopupDs.copyData(objApp.gdsGridPopupMenu);
	
	for(var i=0; i<arrProp.length; i++){
		for(var j=0; j<objPopupDs.rowcount; j++){
			var sMenu = objPopupDs.getColumn(j,"id");
			if( this.gfnIsNull(sMenu) ) continue;
			
			if( sMenu.indexOf(arrProp[i]) > -1 ){
				objPopupDs.setColumn(j, "enable", "true");
				if( objPopupDs.getColumn(j, "level") == 1){
					var sUpMenu = objPopupDs.getColumn(j, "upmenu");
					var nUpRow = objPopupDs.findRow("id", sUpMenu);
					if(nUpRow > -1) objPopupDs.setColumn(nUpRow, "enable", "true");
				}
			}
		}
	}
	var sPopMenu = "popMenu_"+objGrid.name+"_"+this.name;
	var objPopMenu = new PopupMenu(sPopMenu, 0, 0, 100, 100);
	
	var oEnvLang = nexacro.getEnvironmentVariable("evLanguage");
	objParentForm.addChild(objPopMenu.name, objPopMenu);
	
	objPopMenu.set_innerdataset(sPopupDsMenu);
	objPopMenu.set_captioncolumn("caption");
	objPopMenu.set_enablecolumn("enable");
	objPopMenu.set_idcolumn("id");
	objPopMenu.set_levelcolumn("level");
 	objPopMenu.addEventHandler("onmenuclick", this.gfnPopupmenu_onmenuclick, objParentForm);
	objPopMenu.show();
	
	objPopMenu.set_itemheight(30);
	
	objPopMenu.grid = objGrid;
	objGrid.popupMenu = objPopMenu;
};

/**
 * @class  그리드 설정 내부함수<br>
		   그리드에 유저프로퍼티를 Array형태로 반환한다.
 * @param  {Object}objGrid	- 대상그리드
 * @return {Array} user property
 * @example
 * this._getGridUserProperty(this.grdMain);	
 */
pForm._getGridUserProperty = function (objGrid)
{
	var sProp = objGrid.griduserproperty;
	
	var arrdefault = this.defaultmenulis.split(",");
	var arrprop = [];
	
	if(!this.gfnIsNull(sProp)){
		arrprop = sProp.split(",");
		for( var i=0; i<arrprop.length; i++){
			if( arrprop[i].indexOf("!") == 0 ){
				//TODO.DEFAULT에서제거
				for( var j=0; j<arrdefault.length; j++){
					if( arrdefault[j] == arrprop[i].substr(1) ){
						arrdefault[j] = "";
					}
				}
				arrprop[i] = "";
			}
		}
	}
	
	var arrmyprop = [];
	for( var i=0; i< arrdefault.length; i++){
		if(!this.gfnIsNull(arrdefault[i])){
			arrmyprop.push(arrdefault[i]);
		}
	}
	
	for( var i=0; i< arrprop.length; i++){
		if(!this.gfnIsNull(arrprop[i])){
			arrmyprop.push(arrprop[i]);
		}
	}
	
	return arrmyprop;
};


//////////////////////////////////////////////////////////////////////////Popupmenu//////////////////////////////////////////////////////////////////////////
/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
		  셀고정(colfix)
 * @param {Object} objGrid  - 대상그리드
 * @param {Number} nCellIdx - 셀고정 셀인덱스
 * @param {Number} nRowIdx  - 셀고정 로우 인덱스
 * @return N/A
 * @example
 * this._gfnGridcellFix(this.grdMain, 1, 2);	
 */
pForm._gfnGridcellFix = function (objGrid, nCellIdx, nRowIdx)
{
	var sBandType;
	if(nRowIdx == -1) sBandType = "Head";
	else if(nRowIdx == -2) sBandType = "Summary";
	else sBandType = "Body";
	
	var nCol 	 = nexacro.toNumber(objGrid.getCellProperty(sBandType, nCellIdx, "col"));
	var nColSpan = nexacro.toNumber(objGrid.getCellProperty(sBandType, nCellIdx, "colspan"));
	var nRowSpan = nexacro.toNumber(objGrid.getCellProperty(sBandType, nCellIdx, "rowspan"));
	var nVal = objGrid.getCellpos
	var nMaxCol = 0;
	var i;
	var nRealCol;
	var nRealColSpan;
	var nRealCol_end;
	trace("nCellIdx:" + nCellIdx + "  nCol:"+nCol);
	objGrid.nFixedCol = nCol; //그리드 틀고정 선택한 Col index
	objGrid.set_enableredraw(false);
	
	objGrid.setFormatColProperty(0, "band", "body");	
	
	for (i=0; i<objGrid.getCellCount("Head"); i++)
	{
		nRealCol = nexacro.toNumber(objGrid.getCellProperty("Head", i, "col"));
		nRealColSpan = nexacro.toNumber(objGrid.getCellProperty("Head", i, "colspan"));
		nRealCol_end = nRealCol + nRealColSpan - 1;
		//trace("nRealCol:"+nRealCol+" nRealColSpan:"+nRealColSpan+" nRealCol_end:"+nRealCol_end);
		if ( nRealCol == nCol || nRealCol_end == nCol)
		{
			nCol = nRealCol_end;
			/*
			if(nRealColSpan>1)
			{
				//objGrid.setCellProperty("Head", i, "line", "1 solid #dcdbdaff,2 solid #919191ff");
				nCol = nRealCol_end;
			}else
			{
				//objGrid.setCellProperty("Head", i, "line", "1 solid #dcdbdaff,2 solid #919191ff");
				nCol = nRealCol_end;
			}
			*/
		}
		else
		{
			objGrid.setCellProperty("Head", i, "line", "");
		}
	}
	trace(">>>>>>>>>> nCellIdx:" + nCellIdx + "  nCol:"+nCol);
	var m = 0;
	var arrM = [];
	for (i=0; i<objGrid.getCellCount("Body"); i++)
	{
		var nFindColIdx = nexacro.toNumber(objGrid.getCellProperty("Body", i, "colspan"));
		trace("Body영역에 머지되어 있는 셀:"+nFindColIdx);
		if (objGrid.getCellProperty("Body", i, "col") == nCol)
		{
			//objGrid.setCellProperty("Body", i, "line", "1 solid #dcdbdaff,2 solid #919191ff");
			objGrid.setCellProperty("Body", i, "border", "1px solid #dbdee2 , 2px solid aqua , 1px solid #dbdee2 , 1px solid #dbdee2");
		}
		else
		{
			//objGrid.setCellProperty("Body", i, "line", "");
			objGrid.setCellProperty("Body", i, "border", "");
		}
		
		if (nFindColIdx > 1)
		{
			trace("cell split................"+i);
			var arrIndex = arrM.length;
			arrM[arrIndex] = [i,i+1];
			
			objGrid.splitContentsCell( "Body", 0, i, 0, i+1, true );
		}		
	}
	objGrid.userFixedBodyColInfo = arrM;
	var k = 0;
	var arrK = [];
	for (i=0; i<objGrid.getCellCount("Summary"); i++)
	{
		var nFindColIdx = nexacro.toNumber(objGrid.getCellProperty("Summary", i, "colspan"));
		trace(k+"   [summary] 머지되어 있는 셀:"+nFindColIdx);
		
		if (nFindColIdx > 1)
		{
			trace("[summary] cell split.........*......."+i);
			//var nEndCol = (i+nFindColIdx)  - 1;
			k = nFindColIdx;
			trace("[summary] cell split End Col................"+k);
			var arrIndex = arrK.length;
			arrK[arrIndex] = [i,k];
			objGrid.splitContentsCell( "Summary", 0, i, 0, (i+k), true );
		}
		
	}
	objGrid.userFixedSummaryColInfo = arrK;
	objGrid.setFormatColProperty(nCol, "band", "left");	
	
	
	for(var n = arrM.length -1; n >= 0; n--)
	{
		var nBStartCol = arrM[n][0];
		var nBEndCol = arrM[n][1];
		trace("body merge cell:"+nBStartCol+":"+nBEndCol);
		var nBCell = objGrid.mergeContentsCell( "Body", 0, nBStartCol, 0, nBEndCol, nBStartCol, false );		
	}

	var nArrLength = arrK.length - 1;
	for (var j=nArrLength;j>=0;j--)
	{
		var nStartCol = arrK[j][0];
		var nEndCol = arrK[j][1];	

		if (j == 0)
		{
			trace("[summary]다시 머지합니다:"+nStartCol + "    "+nEndCol);
			var nCell = objGrid.mergeContentsCell( "Summary", 0, nStartCol, 0, nCol, nStartCol, false );
			trace("[summary]머지 결과:"+nCell);	
			
			nEndCol = nStartCol + arrK[j][1];
			var nStartCol1 = nCol + 1;
			var nEndCol1 = nEndCol - nCol;
			trace("[summary]다시 머지합니다2:"+nStartCol1 + "    "+nEndCol1);
			var nCell = objGrid.mergeContentsCell( "Summary", 0, nStartCol1, 0, nEndCol, nStartCol1, false );
			trace("[summary]머지 결과2:"+ nBCell);				
		}
		else 
		{
			var nEndCol2 = nStartCol + nEndCol - 1;
			trace("[summary]다시 머지합니다3:"+nStartCol + "    "+nEndCol+ "="+nEndCol2);
			var nCell = objGrid.mergeContentsCell( "Summary", 0, nStartCol, 0, nEndCol2, nStartCol, false );
			trace("[summary]머지 결과3:"+nCell);				
		}
	
	}
	objGrid.set_enableredraw(true);
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
		  셀고정해제(colfree)
 * @param {Object} objGrid - 대상그리드
 * @return N/A
 * @example
 * this._gfnGridCellFree(this.grdMain);	
 * 셀고정 해제시 기존 소트등이 초기화 된다. 21.12.02
 * mergeContentsCell 사용으로 초기화시 비정상 동작한다. 21.12.02
 */
pForm._gfnGridCellFree = function(objGrid)
{
	var sFormatString = objGrid.getFormatString();
	var ds = objGrid.getBindDataset();
	trace("틀고정해제 Grid keystring:"+objGrid.sortKeyString+" ds keystring:"+ds.keystring);

	objGrid.set_formats( sFormatString );
	//틀고정해제 후 기존 소트처리내용 반영. 21.12.06
	this._gfnGridExecuteSort(objGrid);

/*


	for(i=0; i< objGrid.getFormatColCount(); i++)
	{		
		objGrid.setFormatColProperty(i, "band", "body");	
	}
		
	for (i=0; i<objGrid.getCellCount("Body"); i++)
	{
		objGrid.setCellProperty("Body", i, "border", "");
	}	
	//컬럼 병합 원래대로 돌리기 21.12.01
	var nCol = objGrid.nFixedCol;
	var arrSummary = objGrid.userFixedSummaryColInfo;
	trace("summary 병합정보:"+arrSummary);
	if (this.gfnIsNull(arrSummary) == false)
	{
		trace("원래대로 되돌리기 시작");
		var nLength = arrSummary.length;
		for(var j = nLength -1; j >= 0; j--)
		{
			var nStartCol = arrSummary[j][0];
			var nEndCol = arrSummary[j][1];	

			if (j == 0)
			{
				
				//nEndCol = nStartCol == 0 ? nEndCol - 1 : nEndCol;
				trace("*[summary]다시 머지합니다:"+nStartCol + "    "+nEndCol);
				var nCell = objGrid.mergeContentsCell( "Summary", 0, nStartCol, 0, nEndCol, nStartCol, false );
				trace("*[summary]머지 결과:"+nCell);			
			}
			else 
			{
				var nEndCol2 = nStartCol + nEndCol - 1;
				trace("*[summary]다시 머지합니다3:"+nStartCol + "    "+nEndCol+ "="+nEndCol2);
				var nCell = objGrid.mergeContentsCell( "Summary", 0, nStartCol, 0, nEndCol2, nStartCol, false );
				trace("*[summary]머지 결과3:"+nCell);				
			}			
		}
	}
*/	
	this.gv_CellIndex = -1;
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          셀필터(cellFilter)
 * @param {Object} objGrid - 대상그리드	
 * @param {Number} nCell - 셀필터 셀 인덱스
 * @return N/A
 * @example
 * this._gfnGridFilter(this.grdMain);	
 */
pForm._gfnGridFilter = function(objGrid)
{
	var sTitle = "데이터 필터 설정";
	var oArg = {pvGrid:objGrid};
	
	var oOption = {title:sTitle};	//top, left를 지정하지 않으면 가운데정렬 //"top=20,left=370"
	var sPopupCallBack = "gfnGridFilterCallback";
	this.gfnOpenPopup( "cmmGridFilter", "cmm::cmmGridFilter.xfdl",oArg, sPopupCallBack, oOption);	
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          셀필터해제(cellfilterfree)
 * @param {Object} objGrid - 대상그리드	
 * @param {Number} nCell - 셀필터 셀 인덱스
 * @return N/A
 * @example
 * this._gfnGridCellFilterFree(this.grdMain);	
 */
pForm._gfnGridCellFilterFree = function(objGrid)
{
	var objDs = objGrid.getBindDataset();
	objDs.set_filterstr("");
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          찾기/바꾸기
 * @param {Object} objGrid - 대상그리드	
 * @param {Number} nCell - 셀필터 셀 인덱스
 * @return N/A
 * @example
 * this._gfnGridCellReplace(this.grdMain);	
 */
pForm._gfnGridCellReplace = function(objGrid,nCellIndex,nRowIndex)
{
	var sTitle = "데이터 찾기/바꾸기";
	var orgselecttype = objGrid.selecttype;

	var oArg = {pvGrid:objGrid, pvStrartRow:nRowIndex, pvSelectCell:nCellIndex, pvSelectType:orgselecttype};
	var oOption = {title:sTitle};	//,popuptype:"modeless" //top, left를 지정하지 않으면 가운데정렬 //"top=20,left=370"
	var sPopupCallBack = "gfnReplaceCallback";
	this.gfnOpenPopup( "cmmFindReplace","comm_pop::compop0830.xfdl",oArg,sPopupCallBack,oOption);
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          컬럼 숨기기/보이기
 * @param {Object} objGrid - 대상그리드	
 * @param {Number} nCell - 셀필터 셀 인덱스
 * @return N/A
 * @example
 * this._gfnGridColHideShow(this.grdMain);	
 */
pForm._gfnGridColHideShow = function(objGrid)
{
	var sTitle = "컬럼 보이기/숨기기";
	
	var oArg = {pvGrid:objGrid};
	var oOption = {title:sTitle};	//top, left를 지정하지 않으면 가운데정렬 //"top=20,left=370"
	var sPopupCallBack = "gfnColumnHidCallback";
	this.gfnOpenPopup( "cmmColumnHide","comm_pop::compop0003.xfdl",oArg,sPopupCallBack,oOption);	
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          엑셀익스포트
 * @param {Object} objGrid - 대상그리드	
 * @return N/A
 * @example
 * this._gfnGridExcelExport(this.grdMain);	
 */
pForm._gfnGridExcelExport = function(objGrid)
{
	this.gfnExcelExport(objGrid, "*?*?*?*?*?*?*?","");
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          엑셀임포트
 * @param {Object} objGrid - 대상그리드	
 * @return N/A
 * @example
 * this._gfnGridExcelImport(this.grdMain);	
 */
pForm._gfnGridExcelImport = function(objGrid)
{
	var sDataset = objGrid.binddataset;
	this.gfnExcelImport(sDataset, "sheet1", "A2", "fnImportCallback", objGrid.name + sDataset , this);
};
/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          selecttype속성 변경
 * @param {Object} objGrid - 대상그리드	
 * @return N/A
 * @example
 * this._gfnGridSetProperty(this.grdMain);	
 */
pForm._gfnGridSetProperty = function(objGrid)
{
	var sSelectTypeProp = objGrid.selecttype;
	if (sSelectTypeProp == "row" || sSelectTypeProp == "multirow")
	{
		objGrid.set_selecttype("area");
	}
	else 
	{
		objGrid.set_selecttype(objGrid.orgSelectType);
	}
	
	if (this.gfnIsNull(objGrid.copyMode)) 
	{
		objGrid.copyMode = "copy";
		
		objGrid.set_readonly(true);
	}
	else 
	{
		objGrid.copyMode = "";
		
		objGrid.set_readonly(false);
	}
	trace("그리드 프로퍼티 설정(복사모드 설정/해제):"+objGrid.copyMode);
};
/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          그리드 개인화내용 저장을 위해 유니크한 아이디를 구성한다.
 * @param {Object} objGrid - 대상그리드	
 * @return N/A
 * @example
 * this._gfnGridPersonalize(this.grdMain);	
 */
pForm._getUniqueId = function (objGrid)
{
	var sFormId;
	var oForm = objGrid.parent; //대상FORM조회
	while (true)
	{
		if(oForm instanceof nexacro.ChildFrame){
			break;
		}else{
			oForm = oForm.parent;
		}
	}
	sFormId = oForm.name;
	if( sFormId.indexOf("win") > -1 ){
		//팝업과 workform구분
		sFormId = oForm.form.divWork.form.name;
	}
	
	var otf = objGrid.parent.parent;
	if( otf instanceof nexacro.Tabpage){
		//탭안에 그리드가 있을경우
		sFormId += "_" + otf.parent.name +"_"+ otf.name;
	}else if( otf instanceof nexacro.Div && otf.name != "divWork"){
		//div안에 그리드가 있을경우
		sFormId += "_" + otf.name;
	}
	sFormId += "_" + objGrid.name;
	return sFormId;
};

//////////////////////////////////////////////////////////////////////////POPUPMENU CALLBACK///////////////////////////////////////////////////////////

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          그리드 개인화 메세지콜백
 * @param {String} sid - popupid	
 * @param {String} rtn - return value	 
 * @return N/A
 * @example
 * this.gfnGridFormatChangeFormatCallback("TEST", "");	
 */
pForm.gfnGridFormatChangeMsgCallback = function (sid, rtn)
{
	//TODO.
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          그리드 찾기/바꾸기 팝업 콜백
 * @param {String} sid - popupid	
 * @param {String} rtn - return value	 
 * @return N/A
 * @example
 * this.gfnReplaceCallback("TEST", "");	
 */
pForm.gfnReplaceCallback = function (sid, rtn)
{
	//TODO
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          그리드 필터 팝업 콜백
 * @param {String} sid - popupid	
 * @param {String} rtn - return value	 
 * @return N/A
 * @example
 * this.gfnGridFilterCallback("TEST", "");	
 */
pForm.gfnGridFilterCallback = function (sid, rtn)
{
	//TODO
};

/**
 * @class 그리드 우클릭 POPUPMENU 내부함수<br>
          그리드 컬럼숨기기/보이기
 * @param {String} sid - popupid	
 * @param {String} rtn - return value	 
 * @return N/A
 * @example
 * this.gfnColumnHidCallback("TEST", "");	
 */
pForm.gfnColumnHidCallback = function (sid, rtn)
{
	//TODO
};

//////////////////////////////////////////////////////////////////////////POPUPMENU FUNCTION///////////////////////////////////////////////////////////
/**
 * @class   주어진 문자열을 그리드에서 찾는다.
 * @param {Object} grid - 대상그리드	
 * @param {String} findText - 찾을 문자열	
 * @param {Object} option - 찾기옵션	
 * @return {Object} 찾은 열과행
 * @example
 * this.gfnFindGridText(this.fv_grid, txt, option);
 */
pForm.gfnFindGridText = function (grid, findText, option)
{
	grid.lastFindText = findText;
	grid.lastFindOption = option;

	// 찾을 옵션
	var direction = option.direction;
	var position = option.position;
	var scope = option.scope;
	var condition = option.condition;
	var strict = option.strict;

	var dataset = grid.getBindDataset();
	var startCell = ( position == "current" ? grid.currentcell : grid.lastFindCell );
	var startRow = ( position == "current" ? grid.currentrow : grid.lastFindRow );
	
	// 바꾸기에서 호출시 (option.cell 은 바꾸기에서만 지정)
	if ( scope == "col" && !this.gfnIsNull(option.cell) )
	{
		startCell = option.cell;
	}
	
	var findRow = findCell = -1;
	var rowCnt = dataset.rowcount;
	var bodyCellCnt = grid.getCellCount("body");
			
	// 대소문자 구분
	if ( !strict )
	{
		findText = findText.toUpperCase();			
	}
		
	if ( direction == "prev" )
	{
		startRow -= 1;	
		if ( startRow < 0 )
		{
			if (this.fvGrid.findScope == -1)
			{
				grid.nextFindCell = 1;//전체 찾기인 경우, Row초기화 하지 않음 21.07.21
			} 
			else {
				startRow = rowCnt-1;
			}
			
		}
	}
	else
	{
		startRow += 1;
		if ( startRow >= rowCnt )
		{
			//startRow = 0;
			if (this.fvGrid.findScope == -1)
			{
				grid.nextFindCell = 1;//전체 찾기인 경우, Row초기화 하지 않음 21.07.21
			} 
			else {
				startRow = 0;
			}			
		}
	}
	
	var loopCnt = rowCnt;
	while ( loopCnt > 0 )
	{
		// 문자열 비교
		if ( this._compareFindText(grid, startRow, startCell, findText, condition, strict) )
		{
			findRow = startRow;
			findCell = startCell;
			break;
		}
		
		// 방향 (이전, 다음)
		if ( direction == "prev" )
		{
			startRow -= 1;
			if ( startRow < 0 )
			{
				//startRow = rowCnt-1;
				if (this.fvGrid.findScope == -1)
				{
					grid.nextFindCell = 1;//전체 찾기인 경우, Row초기화 하지 않음 21.07.21
				} 
				else {
					startRow = rowCnt-1;
				}
			}				
		}
		else
		{
			startRow += 1;
			if ( startRow > (rowCnt-1) )
			{
				//startRow = 0;
				if (this.fvGrid.findScope == -1)
				{
					grid.nextFindCell = 1;//전체 찾기인 경우, Row초기화 하지 않음 21.07.21
				} 
				else {
					startRow = 0;
				}	
			}
		}
		
		loopCnt--;
	}
	// 마지막 찾은 위치 지정
	// 팝업에서 찾을 방향을 "처음부터" 로 변경 시 초기화
	if ( findRow > -1 && findCell > -1 )
	{
		grid.lastFindRow = findRow;
		grid.lastFindCell = findCell;
	}
	
	return [findRow, findCell];
};

/**
 * @class   주어진 문자열을 그리드에서 찾아서 바꿀 문자열로 변경한다.
 * @param {Object} grid - 대상 Grid Component
 * @param {String} findText - 찾을 문자열
 * @param {String} replaceText - 바꿀 문자열
 * @param {Object} option - 찾을 옵션
 * @param {Boolean} all - 모두 바꾸기 여부
 * @return {Number} 변경 항목 개수.
 * @example
 *this.gfnReplaceGridText(grid, findText, replaceText, option, bAllChg);
 */
pForm.gfnReplaceGridText = function(grid, findText, replaceText, option, all)
{
	// F3 발생 시 마지막 찾은 문자열 계속 찾기 위해 값 지정
	grid.lastFindText = findText;
	grid.lastFindOption = option;
	
	if ( this.gfnIsNull(all) )
	{
		all = false;
	}
	
	
	// 찾을 옵션 ( 바꾸기의 범위는 특정 칼럼만 지원) 
	var direction = option.direction;
	var position = option.position;
	var condition = option.condition;
	var strict = option.strict;
	var cell = option.cell;
	
	var dataset = grid.getBindDataset();//this.gfnLookup(grid.parent, grid.binddataset);
	
	// 바꾸기의 범위는 특정 칼럼만 지원
	var startCell = option.cell;
	var startRow;
	
	if ( position == "current" )
	{
		startRow = grid.currentrow;
	}
	else
	{
		var lastReplaceRow = grid.lastReplaceRow;
		if ( this.gfnIsNull(lastReplaceRow) )
		{
			startRow = 0;
		}
		else
		{
			startRow = lastReplaceRow;
		}
	}
	
	var results = [];
	var findRow = findCell = -1;		
	var rowCnt = dataset.rowcount;
	var bodyCellCnt = grid.getCellCount("body");
	
	// 바꿀 문자열 목록에 등록
	//this.appendFindReplaceCache("replace", replaceText);
	
	// 대소문자 구분
	if ( !strict )
	{
		findText = findText.toUpperCase();	
	}
	
	// 열 범위 바꾸기
	var result;
	var loopCnt = rowCnt;
	while ( loopCnt > 0 )
	{
		// 문자열 비교
		if ( this._compareFindText(grid, startRow, startCell, findText, condition, strict) )
		{
			findRow = startRow;
			findCell = startCell;
			result = this._replaceGridCellText(grid, findRow, findCell, findText, replaceText, strict);
			results.push(result);
			if ( !all ) break;
		}
		
		// 방향 (이전, 다음)
		if ( direction == "prev" )
		{
			startRow -= 1;
			if ( startRow < 0 )
			{
				startRow = rowCnt-1;
			}				
		}
		else
		{
			startRow += 1;
			if ( startRow > (rowCnt-1) )
			{
				startRow = 0;
			}
		}
		
		loopCnt--;
	}
		
	// 마지막 바꾸기 위치 지정
	grid.lastReplaceRow = findRow;
	return results;
};

 /**
 * @class   바꾸기에 의해 찾아진 행, 셀 인덱스에 해당하는 데이터를 실제 변경한다.
 * @param {Object} grid 대상 Grid Component
 * @param {Number} findRow 찾아진 행 인덱스
 * @param {Number} findCell 찾아진 셀 인덱스
 * @param {String} findText 찾을 문자열
 * @param {String} replaceText 바꿀 문자열
 * @param {Boolean} strict 대소문자 구분
 * @return {Object} result - 결과
 * @example
 * this._replaceGridCellText(grid, findText, replaceText, option, bAllChg);
 */
pForm._replaceGridCellText = function(grid, findRow, findCell, findText, replaceText, strict)
{
	var result = {'replace': true, 'message': '처리되었습니다.', 'row': findRow, 'cell': findCell};
	
	// expr 등에 의해 셀이 실제 입력 가능한지 테스트 후 처리
	var dataset = grid.getBindDataset();//this.gfn_Lookup(grid.parent, grid.binddataset);
	dataset.set_rowposition(findRow);
	grid.setCellPos(findCell);
// 	trace(grid + " :::: " + grid.name);
// 	trace("111111111111111111 findRow :: " + findRow + " findCell :: " + findCell)
// 	trace("111111111111111111 dataset :: " + dataset.name);
//	var editable = grid.showEditor(true);
// 	trace("111111111111111111 editable :: " + editable);
// 	if ( editable )
// 	{
// 		grid.showEditor(false);
// 	}
// 	else
// 	{
// 		 return;
// 	}
	var displayType = grid.getCellProperty("body", findCell, "displaytype");
	var editType 	= grid.getCellProperty("body", findCell, "edittype");
	var text 		= grid.getCellProperty("body", findCell, "text");
	var bindColid 	= text.replace("bind:", "");
	
	// displayType 이 normal일 경우
	// dataType 을 체크하여 displayType 을 변경
	var dataType = this.gfnGetBindColumnType(grid, findCell);
	if ( this.gfnIsNull(displayType) || displayType == "normal" )
	{
		switch(dataType)
		{
			case 'INT' :
			case 'FLOAT' :
			case 'BIGDECIMAL' :
				displayType = "number";
				break;
			case 'DATE' :
			case 'DATETIME' :
			case 'TIME' :
				displayType = "date";
				break;
			default :
				displayType = "text";
		}
	}
	
	var replace;
	var replaceVal;
	var columnValue = dataset.getColumn(findRow, bindColid);
	var displayValue = grid.getCellText(findRow, findCell);
	if ( displayType == "number" || displayType == "currency" )
	{
		// currency 의 경우 원(￦) 표시와 역슬레시(\) 다르므로 제거 후 변경
		if ( displayType == "currency" )
		{
			var code = findText.charCodeAt(0);
			if ( code == 65510 || code == 92 )
			{
				findText = findText.substr(1);
			}
			
			code = replaceText.charCodeAt(0);
			if ( code == 65510 || code == 92 )
			{
				replaceText = replaceText.substr(1);
			}
			
			code = displayValue.charCodeAt(0);
			if ( code == 65510 || code == 92 )
			{
				displayValue = displayValue.substr(1);
			}			
		}
		
		// 셀에 보여지는 값에서 찾는 문자열 값을 변경
		
		// 대소문자 구분
		if ( strict )
		{
			displayValue = displayValue.replace(findText, replaceText);
		}
		else
		{
			displayValue = this.gfnReplaceIgnoreCase(displayValue, findText, replaceText);
		}		
		
		// 숫자형 이외 제거
		replaceVal = this._replaceNumberMaskValue(displayValue);
	}
	else if ( displayType == "date"|| displayType == "calendarcontrol" )
	{
		if ( columnValue == null )
		{
			// 값이 없을때 보이는 "0000-01-01" 과 같이 
			// 텍스트에서 찾아 질 경우가 있다.
			result.replace = false;
			result.message = "유효한 날짜가 아닙니다.";
		}
		else	
		{							
			var mask = grid.getCellProperty("body", findCell, "calendardateformat");
			var ret = this._replaceDateMaskValue(columnValue, displayValue, findText, replaceText, mask, strict);			
			replaceVal = ret[1];
			
			if ( ret[0] == false )
			{
				result.replace = false;
				result.message = ret[2];
			}
		}
	}
	else
	{
		// 대소문자 구분
		if ( strict )
		{
			replaceVal = columnValue.replace(findText, replaceText);
		}
		else
		{
			replaceVal = this.gfnReplaceIgnoreCase(columnValue, findText, replaceText);
		}					
	}
		
	if ( result.replace )
	{
		dataset.setColumn(findRow, bindColid, replaceVal);
	}
	
	return result;
};

 /**
 * @class   문자열을 대소문자 구별없이 주어진 변경문자열(문자) 치환한다.
 * @param {String} sOrg - 원래 문자열( 예 : "aaBBbbcc" )
 * @param {String} sRepFrom - 찾고자 하는 문자열( 예 : "bb" )
 * @param {String} sRepTo - 치환될 문자열 ( 예 : "xx" )
 * @return {String} 치환된 문자열 ( 예 : "aaxxxxccxx" ).
 * @example
 * this.gfnReplaceIgnoreCase(str, findStr, "x");
 */
pForm.gfnReplaceIgnoreCase = function( sOrg, sRepFrom, sRepTo )	
{
	var pos, nStart=0, sRet="";
	
	while(1)
	{
		pos = sOrg.toLowerCase().indexOf(sRepFrom.toLowerCase(), nStart)
		
		if( pos < 0 )
		{
			sRet += sOrg.substr( nStart );
			break;
		}
		else
		{
			sRet += sOrg.substr( nStart, pos - nStart);
			sRet += sRepTo;
			nStart = pos+sRepFrom.length;
		}
	}
	
	return sRet;
};

 /**
 * @class  날짜형으로 마스크 처리된 문자열에서 실제 값을 얻어온다.
 * @param {*} columnValue - 변경전 데이터셋의 실제 값
 * @param {String} displayValue - 보여지는 문자열
 * @param {String} findText - 찾을 문자열
 * @param {String} replaceText - 바꿀 문자열
 * @param {String} mask - 마스크 속성값
 * @param {Boolean} strict - 대소문자 구분 여부
 * @return {Object} 변환정보 (날짜여부, 변경된 문자열, 에러메시지)
 * @example
 * this._replaceDateMaskValue(str, findStr, "x");
 */
pForm._replaceDateMaskValue = function(columnValue, displayValue, findText, replaceText, mask, strict)
{		
	if ( this.gfnIsNull(replaceText) )
	{
		// 바꿀 문자열이 빈값이 되지 않도록 패딩
		replaceText = replaceText.padRight(findText.length, " ");
	}
	
	// 1. 현재 보이는 값에서 문자열을 찾아 바꿀 문자열로 변경
	var replaceDisplayValue;
	
	// 대소문자 구분
	if ( strict )
	{
		replaceDisplayValue = displayValue.replace(findText, replaceText);
	}
	else
	{
		replaceDisplayValue = this.gfnReplaceIgnoreCase(displayValue, findText, replaceText);
	}
	
	// 바꿀 값이 없다면 값을 제거한다.
	if ( this.gfnIsNull(replaceDisplayValue.trim()) )
	{
		return [true, null];
	}
	
	// 2. mask 문자 분리
	var arrMask = this._parseDateMask(mask);
	
	// 3. 변경한 값과 마스크 값을 비교하면서 실제 값을 추출하고 유효날짜 판단
	var tmpStr = "";
	var isDate = true;
	var errorMsg = "";
	var valueIndex = 0;
	var displayIndex = 0;
	var dateValue = [];
	var errorValue = [];
	var checkMask;
	var checkDayIndex = -1;
	var checkYearValue = "";
	var checkMonthValue = "";
	
	for ( var i=0,len=arrMask.length; i<len ; i++ )
	{
		checkMask = arrMask[i];
		if ( !this.gfnIsDigit(checkMask) )
		{
			switch (checkMask)
			{
				case 'yyyy' :
					tmpStr = replaceDisplayValue.substr(displayIndex, 4);
					
					if ( tmpStr.length != 4 || !nexacro.isNumeric(tmpStr) )
					{
						isDate = false;	
						errorMsg = "연도가 올바르지 않습니다.";
					}
					
					// 일자체크를 위해
					checkYearValue = tmpStr;
					
					dateValue[dateValue.length] = tmpStr.trim(" ");
					errorValue[errorValue.length] = tmpStr.trim(" ");
					displayIndex += 4;					
					valueIndex += 4;
					break;
				case 'yy' :
				case 'MM' :
				case 'dd' :
				case 'hh' :
				case 'HH' :
				case 'mm' :
				case 'ss' :
					tmpStr = replaceDisplayValue.substr(displayIndex, 2);
										
					if ( tmpStr.length == 2 && nexacro.isNumeric(tmpStr) )
					{
						if ( checkMask == "yy" )
						{
							// 앞 두자리를 원본 데이터로 채운다.
							tmpStr = columnValue.substr(valueIndex, 2) + tmpStr;
							
							// 일자체크를 위해
							checkYearValue = tmpStr;
						}					
						else if ( checkMask == "MM" )
						{
							if ( parseInt(tmpStr) < 1 || parseInt(tmpStr) > 12 )
							{
								isDate = false;
								errorMsg = "월이 올바르지 않습니다.";
							}
							
							// 일자체크를 위해
							checkMonthValue = tmpStr;
						}
						else if ( checkMask == "dd" )
						{
							// 윤년을 적용하기 위해서는 연도가 필요한데 
							// 무조건 연도(yyyy, yy)가 일(dd) 보다 앞에 온다는
							// 보장이 없으므로 루프가 끝난 후 체크한다.
							checkDayIndex = dateValue.length;
						}
						else if ( checkMask == "hh" || checkMask == "HH" )
						{
							if ( parseInt(tmpStr) < 0 || parseInt(tmpStr) > 23 )
							{
								isDate = false;
								errorMsg = "시간이 올바르지 않습니다.";
							}
						}
						else if ( checkMask == "mm" || checkMask == "ss" )
						{
							if ( parseInt(tmpStr) < 0 || parseInt(tmpStr) > 59 )
							{
								isDate = false;
								errorMsg = "분이 올바르지 않습니다.";
							}
						}
					}
					else
					{
						isDate = false;
						errorMsg = "날짜 형식이 올바르지 않습니다.";
					}
					
					dateValue[dateValue.length] = tmpStr.trim(" ");	
					errorValue[errorValue.length] = tmpStr.trim(" ");	
					displayIndex += 2;
					valueIndex += 2;
					break;
			} // end switch
		}
		else
		{
			// dateValue 는 실제 적용할 값이므로 skip 하자
			
			// 마스크 문자가 아닌 경우 표시문자 이므로 원래 값의 것을 사용
			errorValue[errorValue.length] = displayValue.charAt(checkMask);
			displayIndex += 1;
		}
	}
	
	// 일자 유효 체크
	if ( !this.gfnIsNull(checkYearValue) && 
	     !this.gfnIsNull(checkMonthValue) && checkDayIndex > -1 )
	{
		var dt = checkYearValue + checkMonthValue + "01";
		var inputDay = parseInt(dateValue[checkDayIndex]);
		var lastDay = this.gfnGetMonthLastDay(dt);
	}
	
	if ( isDate )
	{
		return [isDate, dateValue.join("")];
	}
	else
	{
		return [isDate, errorValue.join(""), errorMsg];
	}
};

/**
 * @class  날짜형 마스크 구문을 분석합니다.
 * @param {String} mask - mask 마스크 속성값
 * @return {Object} 구문값
 * @example
 * this._parseDateMask("yyyy-MM-dd");
 */
pForm._parseDateMask = function(mask)
{
	arrMask = [];
	var dateMaskCache;
	var maskArr = mask.split("");	
	var tmpStr = "";
	var tokenStr = "";
	var seq = 0;

	for (var i=0,len=mask.length; i<len;)
	{
		tmpStr = mask.substr(i, 4);
		if ( tmpStr == "yyyy" )
		{
			arrMask[seq] = tmpStr;
			i += 4;
			seq++;
			continue;
		}
		
		// ddd => 요일은 입력할 수 없다.		
		tmpStr = mask.substr(i, 3);
		if ( tmpStr == "ddd" )
		{
			//arrMask[seq] = tmpStr;
			i += 3;
			//seq++;
			continue;
		}						
		
		// hh의 경우 (Calendar는 HH이며 그리드는 둘다 동작함)
		tmpStr = mask.substr(i, 2);
		if ( tmpStr == "yy" || tmpStr == "MM" || tmpStr == "dd" ||
			 tmpStr == "HH" || tmpStr == "hh" || tmpStr == "mm" || tmpStr == "ss" )
		{
			arrMask[seq] = tmpStr;
			i += 2;
			seq++;
			continue;
		}
		
		tokenStr = maskArr[i];
		
		// 입력되지 않으므로 skip.
		if ( tokenStr == "H" || tokenStr == "M" ||
			 tokenStr == "d" || tokenStr == "m" || tokenStr == "s" )
		{
			//arrMask[seq] = tokenStr;
			//seq++;
		}
		else
		{
			arrMask[seq] = i;
			seq++;					
		}
		i++;
	}
	
	//dateMaskCache[mask] = arrMask;
	
	return arrMask;
};

 /**
 * @class  숫자형으로 마스크 처리된 문자열에서 실제 값을 얻어온다.
 * @param {String} mask - 숫자형 문자열
 * @return {String} 변환값 문자열
 * @example
 * this._replaceNumberMaskValue("20170808");
 */
pForm._replaceNumberMaskValue = function(numString)
{
	numString = numString.trim();
	
	var numReg = /[0-9]/;
	var bPoint = false; // 소숫점은 1개만 인정.
	var bInside = false; // 부호는 숫자가 나오기 전에만 인정.
	var c, buf = [];
	
	for(var i=0, len=numString.length; i<len; i++ ) 
	{
		c = numString.charAt(i);
		if( ( c == '+' || c == '-') && ( bInside === false) ) 
		{
			// 부호는 숫자가 나오기 전에만 인정.
			buf.push(c);
			bInside = true;
		}
		else if( numReg.test(c) ) 
		{
			// 숫자인경우 인정.
			buf.push(c);
			bInside = true;
		}
		else if( c == "." && bPoint === false ) 
		{
			// 소숫점은 1회만 인정.
			buf.push(c);
			bPoint = true;
			bInside = true;
		}
		else if( c != "," )
		{
			return "";
		}
	}
	return buf.join("");
};

 /**
 * @class   주어진 행, 셀 인덱스에 해당하는 그리드 데이터와 <br>
 * 문자열을 비교하여 찾아진 결과를 반환
 * @param {Object} grid - 대상 Grid Component
 * @param {Number} row - 찾을 행 인덱스
 * @param {Number} cell - 찾을 셀 인덱스
 * @param {String} findText - 찾을 문자열
 * @param {String} condition - 찾을 조건(equal/inclusion)
 * @param {Boolean} strict - 대소문자 구분 (true/false)
 * @return {Boolean} - 찾기 성공.
 * @example
 * this._compareFindText(grid, startRow, startCell, findText, condition, strict) 
 */
pForm._compareFindText = function(grid, row, cell, findText, condition, strict)
{
	var cellText = grid.getCellText(row, cell);
	if( this.gfnIsNull(cellText))return;
	var displayType = grid.getCellProperty("body", cell, "displaytype");
		
	// displayType 이 normal일 경우
	// dataType 을 체크하여 displayType 을 변경
	if ( this.gfnIsNull(displayType) || displayType == "normal" )
	{
		var dataType = this.gfnGetBindColumnType(grid, cell);
		switch(dataType)
		{
			case 'INT' :
			case 'FLOAT' :
			case 'BIGDECIMAL' :
				displayType = "number";
				break;
			case 'DATE' :
			case 'DATETIME' :
			case 'TIME' :
				displayType = "date";
				break;
			default :
				displayType = "string";
		}
	}
	
	// currency 의 경우 원(￦) 표시와 역슬레시(\) 다르므로 제거 후 비교
	if ( displayType == "currency" )
	{
		var code = cellText.charCodeAt(0);
		if ( code == 65510 || code == 92 )
		{
			cellText = cellText.substr(1);
		}
		
		code = findText.charCodeAt(0);
		if ( code == 65510 || code == 92 )
		{
			findText = findText.substr(1);
		}
	}

	// 대소문자 구분
	if ( !strict )
	{
		cellText = cellText.toUpperCase();
	}
	// 일치/포함
	if ( condition == "equal" )
	{
		if ( findText == cellText )
		{
			return true;
		}
	}
	else 
	{
		if ( cellText.indexOf(findText) > -1 )
		{			
			return true;
		}
	}

	return false;
};

 /**
 * @class   데이터의 타입반환
 * @param {Object} grid - 대상 Grid Component
 * @param {Number} cell - 찾을 셀 
 * @return {Object} - 찾기 성공.
 * @example
 *  this.gfnGetBindColumnType(grid, cell);
 */
pForm.gfnGetBindColumnType = function(grid, cell)
{
	var dataType = null;
	var dataset = this.gfnLookup(grid.parent, grid.binddataset);
	var bindColid = grid.getCellProperty("body", cell, "text");
		bindColid = bindColid.replace("bind:", "");
	
	if ( !this.gfnIsNull(bindColid) )
	{
		var colInfo = dataset.getColumnInfo(bindColid);
		if ( !this.gfnIsNull(colInfo) )
		{
			dataType = colInfo.type;
		}
	}
	
	return dataType;
};

//////////////////////////////////////////////////////////////////////////CELL COPY AND PASTE//////////////////////////////////////////////////////////////////////////
/**
 * @class copy event(nexacro, ie)
 * @param {Object} obj- 대상그리드
 * @param {Event}  e - key down event
 * @return N/A
 * @example
 * this._gfnGridCopyEventForRuntime(obj, e);	
*/
pForm._gfnGridCopyEventForRuntime = function (obj, e)
{
	var startrow = nexacro.toNumber(obj.selectstartrow);
	if( startrow == -9) return;

	var endrow   = nexacro.toNumber(obj.selectendrow);
	if( endrow == -9) return;
	
	var startcol = 0;
	var endcol = 0;
	var nClickCellIdx = obj.clickCellIdx;
	var nCellPosDistance = 0;		
	if( obj.selecttype == "row" || obj.selecttype == "multirow" || obj.selecttype == "cell"){
// 		startcol = 0;
// 		endcol = obj.getCellCount("body")-1;
		startcol 	= obj.getCellPos();
		endcol 		= obj.getCellPos();			
	}else{
		startcol = nexacro.toNumber(obj.selectstartcol);
		endcol   = nexacro.toNumber(obj.selectendcol);
	}
	
	if (nClickCellIdx != startcol)
	{
		nCellPosDistance = startcol - nClickCellIdx;
		trace("Runtime 붙여넣기 셀 보정 계산 startcol["+ startcol+"] clickcell["+nClickCellIdx+"] distance["+nCellPosDistance+"]");
		startcol 		= startcol - nCellPosDistance;
		endcol 			= endcol - nCellPosDistance;
	}	
	var colSeperator = "\t";
	var copyData = "";
	var checkIndex = {};
	
	for (var i = startrow; i <= endrow; i++) {
		for (var j = startcol; j <= endcol; j++) {
			var value = obj.getCellValue(i,j);
			if(!this.gfnIsNull(value)) {
				if (j < endcol) {
					copyData += obj.getCellValue(i,j) + colSeperator;
				} else {
					copyData += obj.getCellValue(i,j);
				}
			}
		}
		if (i < obj.selectendrow) {
				copyData += "\r\n";
		}
	}

	copyData += "\r\n";
	system.clearClipboard();
	system.setClipboard("CF_TEXT",copyData);


	var areaInfo = {"startrow": startrow, "startcol": startcol, "endrow": endrow, "endcol": endcol};
};

/**
 * @class paste데이터생성
 * @param {String} browser - 브라우저
 * @return paste데이터 
 * @example
 * this._gfnGirdGetPasteData("nexacro");	
*/
pForm._gfnGirdGetPasteData = function (browser)
{
	console.log(window.clipboardData);
	var copyData = "";
	if( browser == "nexacro" || browser == "IE"){
		copyData = system.getClipboard("CF_TEXT");
		copyData = new String(copyData);
	}else{
		var ta = this.tragetGrid["ta"];

		if(!ta) return;

		copyData = ta.value;
		//document.body.removeChild(ta);
		
		//this.tragetGrid["ta"] = undefined;
	}
	return copyData;
	
};

/**
 * @class paste event
 * @param {Object} obj- 대상그리드
 * @param {Event}  e - key down event
 * @return N/A
 * @example
 * this._gfnGridPasteEvent(obj, e);	
*/
pForm._gfnGridPasteEvent = function (obj, e)
{
	var browser = system.navigatorname;
	var copyData = this._gfnGirdGetPasteData(browser);
	trace("copyData:"+copyData);
	if( this.gfnIsNull(copyData)) return;
	
	var colSeperator = "\t";
	var rowData ="";
	if( browser == "nexacro" || browser =="IE"){
		rowData = copyData.split("\r\n");
		if(rowDataCount < 1) {
			e.stopPropagation();
			return;
		}
	}else{
		rowData = copyData.split(/[\n\f\r]/); 
	}
	var rowDataCount = rowData.length - 1;
	//붙여넣기 오류 처리용 21.9.08
// 	var bPasteMode = false;
// 	var sPasteValue = "";
	
	//autoenter 속성이 select이면 붙여넣기시 값 중복으로 들어가는 문제 회피. 21.09.08
	//var sGrdSelectMode = obj.autoenter;
	//if (sGrdSelectMode == "select") obj.set_autoenter("none");
	
	//obj.set_enableevent(false);
	//obj.set_enableredraw(false); 

	var datasetName = obj.binddataset;
	var ds = obj.getBindDataset();

	//ds.set_enableevent(false); 

	var grdCellCount = obj.getCellCount("body");
	var rowCount = ds.getRowCount();
	
	var startrow = nexacro.toNumber(obj.selectstartrow);
	if( startrow == -9) return;

	var endrow   = nexacro.toNumber(obj.selectendrow);
	if( endrow == -9) return;
	
	var startcol = 0;
	var endcol = 0;
	var nClickCellIdx = obj.clickCellIdx;
	var nCellPosDistance = 0;	
	trace("붙여넣기  startrow["+ startrow+"] endrow["+endrow+"] nClickCellIdx["+nClickCellIdx+"]");
	if( obj.selecttype == "row" || obj.selecttype == "multirow" || obj.selecttype == "cell"){
		//startcol = 0;
		//endcol = obj.getCellCount("body")-1;
		startcol 	= obj.getCellPos();
		endcol 		= obj.getCellPos();			
	}else{
		startcol = nexacro.toNumber(obj.selectstartcol);
		endcol   = nexacro.toNumber(obj.selectendcol);
	}
	if (nClickCellIdx != startcol)
	{
		nCellPosDistance = startcol - nClickCellIdx;
		trace("붙여넣기 셀 보정 계산 startcol["+ startcol+"] clickcell["+nClickCellIdx+"] distance["+nCellPosDistance+"]");
		startcol 		= startcol - nCellPosDistance;
		endcol 			= endcol - nCellPosDistance;
	}
	var currRow = startrow;
	var cellIndex = startcol;
	var maxColumnCount = 0;
	var checkIndex = {};	

	for (var i = 0; i < rowDataCount; i++)
	{
		if(rowCount <= currRow)
		{
			ds.addRow();
		}

		var columnData = rowData[i].split(colSeperator);
		var columnLoopCount = cellIndex + columnData.length;

		if(columnLoopCount > grdCellCount) {
			columnLoopCount = grdCellCount;
		}

		if(maxColumnCount < columnLoopCount) {
			maxColumnCount = columnLoopCount;
		}

		var k = 0;
		for(var j = cellIndex; j < columnLoopCount; j++) 
		{
			var colTemp = obj.getCellProperty("body", j, "text");
			var grdCelltype = obj.getCellProperty("body", j, "displaytype");
			trace("Grid cell type:"+grdCelltype);
			var colid;
			if( this.gfnIsNull(colTemp) )
			{
				colid = obj.getCellProperty("body", j, "text");
			}
			else
			{
				colid = obj.getCellProperty("body", j, "text").substr(5);
			}
			
			var tempValue = columnData[k];
			trace("****************붙여넣기 tempValue:["+tempValue+"]");
			if(!this.gfnIsNull(tempValue))
			{
// 				if (grdCelltype == "editcontrol")
// 				{
// 					trace("붙여넣기2-00 value:["+tempValue+"]");
// // 					obj.setCellProperty("body", j, "displaytype","normal");
// // 					obj.setCellProperty("body", j, "edittype","none");
// 					bPasteMode = true;
// 					sPasteValue = j;
// 				}
// 				else 
// 				{
// 					bPasteMode = false;
// 					sPasteValue = "";
// 					
// 				}
				ds.setColumn(currRow, colid, tempValue);
			}
			k++;
		}
		currRow++;
	}

	ds.rowposition = (startrow == endrow) ? startrow : currRow;	
	
// 	if (bPasteMode)
// 	{
// 		trace("붙여넣기3-0 value:["+sPasteValue+"]");
// 		obj.setCellProperty("body", sPasteValue, "displaytype","editcontrol");
// 		obj.setCellProperty("body", sPasteValue, "edittype","text");
// 	}

	endrow = endrow + rowDataCount - 1;
	endcol = maxColumnCount - 1;
	
	//system.clearClipboard(); //클립보드 초기화 막음. 21.12.14

	//obj.set_enableredraw(true);
	//obj.set_enableevent(true);
	//ds.set_enableevent(true); 

	obj.selectArea(startrow, startcol, endrow, endcol);
	
	//autoenter 속성이 select이면 붙여넣기시 값 중복으로 들어가는 문제 회피 - 초기화. 21.09.08
	//trace("grid select Mode:"+sGrdSelectMode);
	//if (sGrdSelectMode == "none") obj.set_autoenter("select");
	
	var areaInfo = {"startrow": startrow, "startcol": startcol, "endrow": endrow, "endcol": endcol};
	e.stopPropagation();
	
};

/**
 * @class copy event(chrome)
 * @param {Object} obj- 대상그리드
 * @param {Event}  e - key down event
 * @return N/A
 * @example
 * this._gfnGridCopyEventForChrome(obj, e);	
*/
pForm._gfnGridCopyEventForChrome = function (obj, e)
{
	var startrow = nexacro.toNumber(obj.selectstartrow);
	if( startrow == -9) return;

	var endrow   = nexacro.toNumber(obj.selectendrow);
	if( endrow == -9) return;
	
	//autoenter 속성이 select이면 붙여넣기시 값 중복으로 들어가는 문제 회피. 21.09.08
	var sGrdSelectMode = obj.autoenter;
	if (sGrdSelectMode == "select") obj.set_autoenter("none");
	
	var startcol = 0;
	var endcol = 0;
	var nClickCellIdx = obj.clickCellIdx;
	var nCellPosDistance = 0;	
	if( obj.selecttype == "row" || obj.selecttype == "multirow" || obj.selecttype == "cell"){
// 		startcol = 0;
// 		endcol = obj.getCellCount("body")-1;
		//ROW인경우, 클릭한 셀의 값을 복사 21.07.21
		trace("pos:"+obj.getCellPos()+" currentcol:"+obj.currentcol);
		startcol = obj.getCellPos();
		endcol = obj.getCellPos();		
	}else{
	trace("시작:"+obj.selectstartcol+" 끝:"+obj.selectendcol);
		startcol = nexacro.toNumber(obj.selectstartcol);
		endcol   = nexacro.toNumber(obj.selectendcol);		
	}
	if (nClickCellIdx != startcol)
	{
		nCellPosDistance = startcol - nClickCellIdx;
		trace("셀 보정 계산 startcol["+ startcol+"] clickcell["+nClickCellIdx+"] distance["+nCellPosDistance+"]");
		startcol = startcol - nCellPosDistance;
		endcol = endcol - nCellPosDistance;
	}
	var colSeperator = "\t";
	var copyData = "";
	
	for (var i = startrow; i <= endrow; i++) {
		for (var j = startcol; j <= endcol; j++) {
			var value = obj.getCellValue(i,j);
			if(!this.gfnIsNull(value)) {
				if (j < endcol) {
					copyData += obj.getCellValue(i,j) + colSeperator;
				} else {
					copyData += obj.getCellValue(i,j);
				}
			}
		}
		if (i < obj.selectendrow) {
				copyData += "\r\n";
		}
	}

	copyData += "\r\n";
	
	var ta = this._createTextarea(copyData);
	this.tragetGrid = obj;
	this.tragetGrid["ta"] = ta;
	var areaInfo = {"startrow": startrow, "startcol": startcol, "endrow": endrow, "endcol": endcol};
	e.stopPropagation();
};

/**
 * @class cell copy and paste (크롬용 텍스트에어리어생성)
 * @param {String} innerText- value
 * @return{Object} 텍스트에어리어 오브젝트
 * @example
 * this._createTextarea("꼬부기");	
*/
pForm._createTextarea = function(innerText)
{
	var ta = document.createElement('textarea');
	ta.id = "textAreabyCopyAndPaste";
	ta.style.position = 'absolute';
	ta.style.left = '-1000px';
	ta.style.top = document.body.scrollTop + 'px';
	ta.value = innerText;
	
	document.body.appendChild(ta);
	ta.select();

	return ta;
};

/**
 * @class grid의 특정 셀로 이동한다.
 * @param {Object} objGrid   - 처리할 Grid 객체
 * @param {Number}  nRow     - 해당 Row
 * @param {Number || String}  nCol     - 해당 Cell or 바인딩 컬럼ID
 * @return N/A
*/
pForm.gfnGridFocus = function(objGrid, nRow, nCol)
{
	if(this.gfnIsNull(objGrid))		return;
	
	var nCell = nexacro.toNumber(nCol);
	if (nCell == Number.NaN) {
		nCell = objGrid.getBindCellIndex("body", nCol);
	}
	
	var oDs = objGrid.getBindDataset();
	objGrid.setFocus();
	oDs.set_rowposition(nRow);
	objGrid.setCellPos(nCell);
	objGrid.showEditor(true);
};
/**
 * @class grid의 키이벤트 입력을 처리한다.
 * @param {Object} obj   - 처리할 Grid 객체
 * @param {Event}  Event     - 키입력 이벤트(keyup)
 * @param 
 * @return N/A
*/
pForm.gfnGrid_onkeyup = function(obj, e)
{
	trace("공통함수 onkeyup ******** grid name ["+obj.name+"]");
	trace("form name:"+this.name+" isFormMode:"+this.isFormMode+" OwnerFrame:["+this.getOwnerFrame().name+"]");
	if (e.keycode == 13 && this.isFormMode == "popup")
	{
		var ds = obj.getBindDataset();
		trace("ds name:"+ds.name);
		var nColCnt = ds.getColCount();
		var isChk = false;
		for (var i=0;i<nColCnt;i++)
		{
			var objColInfo = ds.getColumnInfo(i);
			var sColNm = objColInfo.name;
			if (sColNm == "CHK")
			{
				isChk = true;
				break;
			}
		}
		trace("체크 컬럼이 존재합니다."+isChk);
		if (isChk == true)
		{
			ds.setColumn(ds.rowposition,"CHK","1");
		}
		
		this.btn_select.click();
	}
};
/**
 * @class grid의 헤더의 텍스트를 wordWrap 속성을 설정한다.
 * @param {Object} obj   - 처리할 Grid 객체
 * @param 
 * @param 
 * @return N/A
*/
pForm._setGridWordWrap = function(objGrid)
{
	for (i=0; i<objGrid.getCellCount("Head"); i++)
	{
		var sWordWrap = objGrid.getCellProperty("Head", i, "wordWrap");
		//trace("wordWrap:"+sWordWrap);
		objGrid.setCellProperty("Head", i, "wordWrap","char");
	}	
}