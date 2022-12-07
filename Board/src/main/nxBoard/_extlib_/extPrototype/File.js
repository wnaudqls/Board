/**
*  파일 처리 공통함수
*  @FileName 	File.js 
*  @Creator 	이노다임 개발팀
*  @CreateDate 	2021.05
*  @Desction   
************** 소스 수정 이력 ***********************************************
*  date          		Modifier                Description
*******************************************************************************
*  2017.05.27     	이노다임 개발팀 	            최초 생성 
*  2017.05.27     	이노다임 개발팀       	        주석 정비
*******************************************************************************
*/

var pForm = nexacro.Form.prototype;

/**
 * @class 현재 Form 상의 FileUpload 컴포넌트를 서버에 업로드한다. <br>
 * @param {Object} objFileUpload - 파일업로드 컴포넌트
 * @param {String} [sUrl] - 파일업로드 서비스 호출 경로
 * @param {String} [sPath] - 파일업로드시킬 폴더 위치
 * @return N/A
 * @example 
 * this.gfnFileUpload(objFileUpload);
 */
pForm.gfnFileUpload = function(objFileUpload, sUrl, sPath)
{	
	var svcUrl = this.gfnGetServerUrl();
	
	if (this.gfnIsNull(sUrl)) sUrl = svcUrl;
	
	//파일업로드 서비스 호출 경로
	var sFileUrl = sUrl + "fileUpload.jsp";
    
	//파일 업로드 시킬 폴더 위치 지정
	if (this.gfnIsNull(sPath)) sPath = "PATH=upload";
	
	var bSucc = objFileUpload.upload(sFileUrl + "?" + sPath);
	trace("bSucc >> " + bSucc);
};

/**
 * @class 현재 Form 상의 FileDownload 컴포넌트를 이용하여 지정한 위치에서 원하는 파일을 다운로드한다. <br>
 * @param {Object} objFileDownload - 파일다운로드 컴포넌트
 * @param {String} sFilename - 다운로드 할 파일명
 * @param {String} [sUrl] - 파일업로드 서비스 호출 경로
 * @param {String} [sPath] - 파일업로드시킬 폴더 위치
 * @return N/A
 * @example this.gfnFileUpload(objFileUpload, sFilename);
 */
pForm.gfnFileDownload = function(objFileDownload, sFilename, sUrl, sPath)
{
	var svcUrl = this.gfnGetServerUrl();
	if (this.gfnIsNull(sUrl)) sUrl = svcUrl;
	
	
	//파일다운로드 서비스 호출 경로
	var sFileUrl = sUrl + "fileDownload.jsp";
	
	//파일 다운로드할 폴더 위치 지정
	if (this.gfnIsNull(sPath)) sPath = "PATH=upload";
	
	objFileDownload.download(sFileUrl + "?" + sPath + "&file=" + sFilename);
};

/**
 * @class File Path 문자열(예 : C:\a\b\filename.ext)에서 File명(예 : filename)을 추출 <br>
 * @param {String} sPath - File Path 문자열 (예 : "C:\a\b\filename.ext")
 * @param {String} bExt - extend를 return되는 File명에 포함시킬지 여부 ( 옵션 : Default=false )
 * @return {String} 
 * 성공 : <br>
 * bExt가 true인 경우 ==> sPath에서 File명(예 : "filename.ext") <br>
 * bExt가 false인 경우 ==> sPath에서 File명(예 : "filename") <br>
 * 실패 : "" <br>
 */
pForm.gfnGetFileName = function (sPath, bExt)
{
	var start_pos,end_pos,tmp_pos,filename;

	if (this.gfnIsNull(sPath)) 
	{
		return "";
	}
	if (this.gfnIsNull(bExt)) 
	{
		bExt = false;
	}

	start_pos = Math.max(this.gfnPosReverse(sPath, "\\"), this.gfnPosReverse(sPath, "/"));
	tmp_pos = this.gfnPosReverse(sPath, "::");
	if (tmp_pos > 0) 
	{
		tmp_pos++;
	}
	start_pos = Math.max(start_pos, tmp_pos);
	if (bExt == false) 
	{
		end_pos = this.gfnPosReverse(sPath, ".");
		if (end_pos < 0) 
		{
			end_pos = sPath.length;
		}
		filename = sPath.substr(start_pos + 1, end_pos - start_pos - 1);
	}
	else 
	{
		filename = sPath.substr(start_pos + 1);
	}

	return filename;
};
/**
* @description form onload --> define config object
* @param objForm : objForm,
*		 objConfig : {	objUpTrans	: this.fileUpTrans,
						objDownTrans: this.fileDownTrans,
						objDialog 	: this.fileDialog,
						objProgId	: "ProgressBar00",
						dsUploadId	: "dsUpload",
						dsDownloadId: "dsDownload",
						sFolerName	: this.folderName,
						sSaveUrl	: this.saveUrl,
						sUploadUrl	: "fileUpload_postdatatest.jsp?filefolder=",
						sDownloadSingleUrl	: "fileDownload_postdatatest.jsp",
						sDownloadMultiUrl	: "fileDownload_postdatatestAll.jsp"
* @return
*/ 
pForm.gfnFileTransUpDownFormLoad = function(objForm,objConfig)
{
	//add event handler
	objConfig.objUpTrans.addEventHandler("onsuccess", this.fileUpTrans_onsuccess, this);
	objConfig.objUpTrans.addEventHandler("onerror", this.fileUpTrans_onerror, this);
	objConfig.objUpTrans.addEventHandler("onprogress", this.fileUpTrans_onprogress, this);
	
	objConfig.objDownTrans.addEventHandler("onsuccess", this.fileDownTrans_onsuccess, this);
	objConfig.objDownTrans.addEventHandler("onerror", this.fileDownTrans_onerror, this);
	
	objConfig.objDialog.addEventHandler("onclose", this.fileDialog_onclose, this);
	
	objConfig.objUpTrans.datasetId = objConfig.dsUploadId;
	objConfig.objDownTrans.datasetId = objConfig.dsDownloadId;
	
	//object connected
	objForm.config = objConfig;
};
/**
* @description file size calculate
* https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Example_Showing_file(s)_size
* @param nFileSize
* @return
*/ 
pForm.gfnCutFileSize = function(nFileSize)
{
	var sOutput = nFileSize + " bytes";
	var aMultiples = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	var nApprox = nFileSize / 1024;
	
	for (var nMultiple = 0; nApprox > 1; nApprox /= 1024, nMultiple++) 
	{
		sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple];
	}
	trace("첨부파일 사이즈:"+sOutput);
	return sOutput;
};

/**
* @description get percentage
* @param nload, nTotal ( nload/nTotal ) X 100
* @return
*/ 
pForm.gfnGetPercent = function(nload,nTotal)
{
	var nCurPercent = (nload / nTotal) * 100;
	return nCurPercent;
};

/**
* @description close file dialog and grip ondrop --> add row file list (dataset)
* @param filelists : add file list(virture file),
         objForm : form
* @return
*/ 
pForm.gfnAddFileList = function(filelists, objForm)
{
	var objFileUpTrans = objForm.config.objUpTrans;
	var sMode = "";//SVCNO와 관계없이 sMode값으로 구분하도록 수정. 21.08.09
	if (this.gfnIsNull(objForm.config.sMode))
	{
		sMode = "Single";
	}
	else
	{
		sMode = objForm.config.sMode;
	}
	trace("file upload mode:"+sMode);
	//array type virtualfile List
	var vFile;
	var len = filelists.length;

	if (!this.gfnCheckFileExt(filelists)) 
	{
		//이미지파일을 선택해 주세요. sys.msg.00338
		this.gfnAlert("sys.msg.00260");
		return;
	}
	//NRE환경 대응을 위한 처리 21.09.09
	if (this.gfnIsNRE())
	{
		if (!this.isValidObject("vFile")) 
		{
			vFile = new VirtualFile();
		}
	}
	trace("gfnAddFileList:"+len);
	for (var i = 0; i < len; i++)
	{	
		if (!this.gfnIsNRE()) vFile = filelists[i];
		var sUploadFileNm = (this.gfnIsNRE()) ? filelists[i].filename : vFile.name;
		if (sMode == "Single") sUploadFileNm = "file";
		objFileUpTrans.addFile(sUploadFileNm,vFile);	
		vFile.addEventHandler("onsuccess", this.fileList_onsuccess, this);
		vFile.addEventHandler("onerror", this.fileList_onerror, this);		
		vFile.datasetId = objFileUpTrans.datasetId;
		if (this.gfnIsNRE())
		{
			var sFilePath = filelists[i].path + filelists[i].filename;
			trace("파일명:"+sFilePath);
			vFile.open(sFilePath, VirtualFile.openRead|VirtualFile.openBinary);
		}
		else 
		{
			vFile.open(null, VirtualFile.openRead);
			vFile.getFileSize();	
			vFile.close();			
		}
		
		//return file size --> fileList_onsuccess : reason 9

	}
};
/**
* @description 파일확장자 체크 (이미지 파일만 업로드 가능)
* @param filelists : add file list(virture file),
* @return boolean
*/ 
pForm.gfnCheckFileExt = function (vFile)
{
	var sExt = "";
	var len = vFile.length;
	var bReturnValue = true;
	for (var i=0;i<len;i++)
	{
		var sFileName = vFile[i].filename;
		
		sExt = sFileName.substring(sFileName.lastIndexOf("."), sFileName.length);
		trace("file name 확장자 체크:"+sFileName+"["+sExt+"]");
		if (this.gfnIsNull(sExt)) 
		{
			bReturnValue = false;
		}
		else if (sExt.toUpperCase() == ".JPG" || sExt.toUpperCase() == ".JPEG"
			 || sExt.toUpperCase() == ".GIF" || sExt.toUpperCase() == ".BMP"
			 || sExt.toUpperCase() == ".PNG" || sExt.toUpperCase() == ".PDF"
			 || sExt.toUpperCase() == ".XLS" || sExt.toUpperCase() == ".XLSX") 
		{
			//
		}
		else 
		{
			bReturnValue = false;
		}
	}
	return bReturnValue;
};
/**
* @description add dataset virture file list
* @param objVirtureFile : VirtureFile
*        e : EventInfo
* 1.this.gfnAddFileList -> 2.vFile.getFileSize() 
   -> 3. fileList_onsuccess : reason 9 -> 4. this.gfnAddUploadRow
* @return
*/ 
pForm.gfnAddUploadRow = function (objVirtureFile,e)
{
	var objDs = this.objects[objVirtureFile.datasetId];
	var objParent = objDs.parent;
	var objProgress = this.components[objParent.config.objProgId];
	var nRowIdx = objDs.addRow();
	objDs.setColumn(nRowIdx, "ORGN_FILE_NM", objVirtureFile.filename);
	objDs.setColumn(nRowIdx, "FiLE_SIZE", this.gfnCutFileSize(e.filesize));
	//file local path --> only nexacro runtime environment 
	objDs.setColumn(nRowIdx, "FILE_PATH", objVirtureFile.fullpath);
	//objDs.setColumn(nRowIdx, "FILE_ID",	  objVirtureFile.id);
	
	//progressbar status
	if(objProgress.pos > 0)
	{
		objProgress.set_pos(0);
		objProgress.set_visible(false);
	}
};

/**
* @description save file on server
* @param objForm
* @return
*/ 
pForm.gfnUploadfile = function(objForm)
{
	var objFileUpTrans 	= objForm.config.objUpTrans;
	var sFolderName 	= "";//objForm.config.sFolerName;
	var sUrl 			= objForm.config.sSaveUrl;
	var sUploadUrl 		= objForm.config.sUploadUrl;
	
	//trace("upload file:"+objFileUpTrans.filelist);
	var len = objFileUpTrans.filelist.length;
	if (len == 0) return;
	
	for (var i=0;i<len;i++)
	{
		trace(i+"번째 파일:["+objFileUpTrans.filelist[i].filename+"]");
	}

	//Set Post Data
	this.gfnSetPostData(objForm,objFileUpTrans,"Up");
	//file upload excute
	objFileUpTrans.upload(sUrl + sUploadUrl + sFolderName);
};

/**
* @description single download
* @param nRow : clicked row
*        objForm
* @return
*/
pForm.gfnSingleDownloadFile = function (nRow, objForm)
{
	var objFileDownTrans = objForm.config.objDownTrans;
	
	var objDs = objForm.objects[objFileDownTrans.datasetId];
	objFileDownTrans.clearPostDataList();
	
	var sFolderName = objForm.config.sFolerName;
	
	//only nexacro runtime environment property 
	objFileDownTrans.set_downloadfilename(objDs.getColumn(nRow, "FILE_ID"));	
	
	//set filedownload option
// 	objFileDownTrans.setPostData(
// 		"CLIENT",
// 		objDs.getColumn(nRow, "CLIENT")
// 	);
// 	objFileDownTrans.setPostData(
// 		"CO_CD",
// 		objDs.getColumn(nRow, "CO_CD")
// 	);
// 	objFileDownTrans.setPostData(
// 		"SVC_NO",
// 		objDs.getColumn(nRow, "SVC_NO")
// 	);	
// 	objFileDownTrans.setPostData(
// 		"FILE_ID",
// 		objDs.getColumn(nRow, "FILE_ID")
// 	);	
	//Set Post Data
	this.gfnSetPostData(objForm,objFileDownTrans,"Down",objDs,nRow);
	
	var sUrl = objForm.config.sSaveUrl;
	var sSingleUrl = objForm.config.sDownloadSingleUrl;
	
	//download excute
	objFileDownTrans.download(sUrl+sSingleUrl);
};

/**
* @description multi download --> zip file (사용안함 21.07.16)
* @param objForm
* @return
*/
pForm.gfnMultiDownloadFiles = function(objForm)
{
	var objFileDownTrans = objForm.config.objDownTrans;
	objFileDownTrans.clearPostDataList();
	
	var objDs = objForm.objects[objFileDownTrans.datasetId];
	var arrNameList = new Array();
	
	//request.getParameter("filefolder"); 
	var sFolderName = objForm.config.sFolerName;
	
	for(var i=0; i<objDs.getRowCount(); i++)
	{
		//String object (server) --> request.getParameter("filenamelist");
		arrNameList[i] = objDs.getColumn(i, "FILE_NAME");
	}
	
	//only nexacro runtime environment property 
	objFileDownTrans.set_downloadfilename(sFolderName+".zip");
	
	objFileDownTrans.setPostData(
		"filefolder",
		sFolderName
	);
	objFileDownTrans.setPostData(
		"filenamelist",
		arrNameList
	);	
	
	var sUrl = objForm.config.sSaveUrl;
	var sMultiUrl = objForm.config.sDownloadMultiUrl;
	
	//download excute
	objFileDownTrans.download(sUrl+sMultiUrl);
};
/**
* @description 파일업다운로드 post data 설정
* @param objForm this
* @param objFileTransfer FileTransfer object
* @param 모드값 Up/Down
* @param objDs 다운로드용 Dataset
* @return
*/
pForm.gfnSetPostData = function(objForm)
{
	if (this.gfnIsNull(arguments[1])) return;
	var objFileTransfer = arguments[1];
	var sClient = this.gfnGetUserInfo("S_CLIENT");
	var sCoCd	= this.gfnGetUserInfo("S_CO_CD");
	var sSvcNo 	= objForm.config.sSvcNo;
	var sFileId = objForm.config.sFileId;
	var sSeq 	= objForm.config.sSeq;
	var sMode 	= "";
	var sClassNme = objForm.config.sClassNme;
	
	//alert ("sClassNme=11111111111111111111===>"+sClassNme+"====>>"+sSeq);
	//trace("gfnSetPos1111111111111111111tData SEQ:"+objForm.config.sSeq);
	objFileTransfer.setPostData("CLIENT", sClient);
	objFileTransfer.setPostData("CO_CD"	, sCoCd);
	objFileTransfer.setPostData("CLASS", this.sClassName);
	
	//서비스 접수번호 설정
	if (!this.gfnIsNull(sSvcNo)) 
	{
		objFileTransfer.setPostData("SVC_NO"	, sSvcNo);
	}
	//ITS 등록번호 설정
	if (!this.gfnIsNull(sSeq))
	{
		objFileTransfer.setPostData("SEQ", sSeq);
		objFileTransfer.setPostData("FILE_GB", "01");
		objFileTransfer.setPostData("CLASS", this.sClassName);
	}
	
	//set filedownload option
	if (arguments[2] == "Down")
	{
		objFileTransfer.setPostData("SVC_NO", arguments[3].getColumn(arguments[4], "SVC_NO"));	
		objFileTransfer.setPostData("SEQ", arguments[3].getColumn(arguments[4], "SEQ"));	
		objFileTransfer.setPostData("FILE_ID",arguments[3].getColumn(arguments[4], "FILE_ID"));	
	}
}
/**************************************************************************
 * 각 COMPONENT 별 EVENT 영역
 **************************************************************************/
/**
 * @description FileDialog onclose event --> fileDialog_onclose
*/
pForm.fileDialog_onclose = function(obj,e)
{
	var objParent = obj.parent;
	var objFileupTransFer = objParent.config.objUpTrans;
	if(this.gfnIsNull(e.virtualfiles))
	{
		return;
	}
	
	//add row file list
	this.gfnAddFileList(e.virtualfiles, objParent);
};

/**
 * @description VirtualFile onsuccess event --> fileList_onsuccess
*/
pForm.fileList_onsuccess = function(obj, e)
{
	trace("fileList_onsuccess:"+e.reason);
	//getFileSize() call --> reason : 9
	if (e.reason == 9) //WRE 환경에서 수행됨. 21.09.09
	{
		if (this.fnMakerFileChk()==false)
		{
			//sys.msg.00261 건 이상의 파일 업로드는 허용되지 않습니다.
			var arrMsg = [];
			arrMsg[0] = this.dsMakerList.getRowCount();
			this.gfnAlert("sys.msg.00261",arrMsg);	
			var objDs = this.objects[obj.datasetId];
			var objParent = objDs.parent;
			var objFileupTransFer = objParent.config.objUpTrans;			
			trace(obj.name+"중복 파일명 삭제하자:"+obj.filename);
			//trace(objFileupTransFer.filelist[0].id);
			objFileupTransFer.removeFile(obj.name);
			return;
		}
		else {
			//add dataset virture file list
			this.gfnAddUploadRow(obj,e);
		}
	}
	else if (e.reason == 1) //NRE 환경에서 수행됨. 21.09.09
	{
		if (!this.gfnIsNRE()) return; //WRE에서 이벤트가 발생하여 예외처리 추가 21.09.27
		if (this.fnMakerFileChk()==false)
		{
			//sys.msg.00261 건 이상의 파일 업로드는 허용되지 않습니다.
			var arrMsg = [];
			arrMsg[0] = this.dsMakerList.getRowCount();
			this.gfnAlert("sys.msg.00261",arrMsg);	
			var objDs = this.objects[obj.datasetId];
			var objParent = objDs.parent;
			var objFileupTransFer = objParent.config.objUpTrans;			
			trace(obj.name+"중복 파일명 삭제하자:"+obj.filename);
			//trace(objFileupTransFer.filelist[0].id);
			objFileupTransFer.removeFile(obj.name);
			return;
		}
		else {
			//add dataset virture file list
			this.gfnAddUploadRow(obj,e);
		}		
	}
	
};

/**
 * @description VirtualFile onerror event --> fileList_onerror
*/
pForm.fileList_onerror = function(obj, e)
{
	trace("errortype: "+e.errortype);
	trace("errormsg: "+e.errormsg);
	trace("statuscode: "+e.statuscode);
};

/**
 * @description FileUpTransfer onprogress event --> fileUpTrans_onprogress
*/
pForm.fileUpTrans_onprogress = function(obj,e)
{
	var objParent = obj.parent;
	var objProgress = this.components[objParent.config.objProgId];
	
	objProgress.set_visible(true);
	//get percentage
	var rtnPercent = this.gfnGetPercent(e.loaded,e.total);	
		objProgress.set_pos(rtnPercent);
};

/**
 * @description FileUpTransfer onsuccess event --> fileUpTrans_onsuccess
*/
pForm.fileUpTrans_onsuccess = function(obj,e)
{
	var objParent = obj.parent;
	var objProgress = this.components[objParent.config.objProgId];
	objProgress.set_visible(false);
	
	var objForm = obj.parent;
	//objCallDs == upload dataset ( upload file list )
	//objDs == grid dataset ( grid list )
	var objCallDs = e.datasets[0];//dsResultList

	var objDs = this.objects[objForm.config.dsUploadId]; //dsFile
	var objGrd = this.components[objForm.config.objGrd];
	
	//trace("fileUpTrans_onsuccess:"+objDs);
	var sFileId = "";
	var sFilename = "";
	var sOrgFilename = "";
	
	var nCallDsRow = 0;	
	//trace(objCallDs.name + "  fileUpTrans_onsuccess:["+objDs.getRowCount()+"]");
	//trace("grid:"+objGrd.name);
	for(var i=0; i<objDs.getRowCount(); i++)
	{		
		if(this.gfnIsNull(objDs.getColumn(i,"REG_FILE_NM")))
		{
			//virtureFile id
 			sFileId = objDs.getColumn(i,"FILE_ID");
 			sOrgFilename = objDs.getColumn(i,"ORGN_FILE_NM");
			trace("fileUpTrans_onsuccess 원래 파일ID:"+sFileId);
			
			//virtureFile (upload list) remove
			obj.removeFile(sFileId);
			
			nCallDsRow = objCallDs.findRow("ORGN_FILE_NM",sOrgFilename);
			var bSucc = objDs.copyRow(i,objCallDs,nCallDsRow,"FILE_ID=FILE_ID,REG_FILE_NM=REG_FILE_NM,GRP_FILE_ID=GRP_FILE_ID,SVC_NO=SVC_NO,CO_CD=CO_CD,CLIENT=CLIENT,ENT_ID=ENT_ID");
		}		
	}
	trace("fileUpTrans_onsuccess 데이터 복사 끝....");
	//파일정보 구분값 저장
	this.fnUpdate("uploadAfter");
};

/**
 * @description FileUpTransfer onerror event --> fileUpTrans_onerror
*/
pForm.fileUpTrans_onerror = function(obj,e)
{
	trace(e.errormsg);
};

/**
 * @description FileDownTransfer onsuccess event --> fileDownTrans_onsuccess
*/
pForm.fileDownTrans_onsuccess = function(obj,e)
{
	trace(e.targetfullpath);
};

/**
 * @description FileDownTransfer onerror event --> fileDownTrans_onerror
*/
pForm.fileDownTrans_onerror = function(obj,e)
{
	trace("error : " + e.errormsg);
};