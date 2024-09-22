function checkCookie(){
	if(getCookie("user_id")==false){
		window.location = "index.html";
	}
}
checkCookie();
window.onload = pageLoad;

function getCookie(name) {
	var value = "";
	try {
		value = document.cookie.split("; ").find(row => row.startsWith(name)).split('=')[1]
		return value
	} catch (err) {
		return false
	}
}

var OrderCBElm;
var Orderlabel;
var FavoriteCBElm ;
var FavoriteIcon;
var search;

var allTagList = ["Work","Book","Shop","Entertainment"];
var CBElm = [];
var IconElm = [];
function pageLoad() {
	
	SetGetElementById();
	CreateTagElement();

	FavoriteCBElm.onclick = SortItem;
	search.oninput = SortItem;

	document.addEventListener('keydown', ActivateSearch);
	SortItem();
}
function CreateTagElement(){
	var header = document.getElementById("divtag");
	for (const i in allTagList) {
		var spanhead = document.createElement("span");
		spanhead.className = "tagList";
		spanhead.id = "tag"+allTagList[i];
		IconElm.push(spanhead);
		var checkBox = document.createElement("input");
		checkBox.type = "checkbox";
		checkBox.id = allTagList[i] + "CB";
		checkBox.name = allTagList[i] + "CB";
		checkBox.value = allTagList[i];
		checkBox.hidden = true;
		checkBox.onclick = SortItem;
		CBElm.push(checkBox);
		var label = document.createElement("label");
		label.htmlFor = allTagList[i] + "CB";
		label.innerHTML = allTagList[i];
		label.className = "label";
		spanhead.appendChild(checkBox);
		spanhead.appendChild(label);
		header.appendChild(spanhead);
	}
}
function SetGetElementById(){
	OrderCBElm = document.getElementById("Order");
	Orderlabel = document.getElementById("Orderlabel");
	FavoriteCBElm = document.getElementById("FavoriteCB");
	FavoriteIcon = document.getElementById("tagFavorite");
	search = document.getElementById("inputSearch");
}
function ActivateSearch(){
	search.focus();
}
async function GoEdit(id) {
	await fetch("/editItem", {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: id
		})
	})
		.then((data) => {
			data.text().then((path) => {
				window.location.href = path;
			})
		}).catch((err) => {
			console.log(err);
		});
}

function UpdateCheckTagIcon(){

	if (OrderCBElm != null) if (OrderCBElm.checked == true) {Orderlabel.innerHTML = "Z - A";}else{Orderlabel.innerHTML = "A - Z";}
	if (FavoriteCBElm != null) if (FavoriteCBElm.checked == true){FavoriteIcon.className = "checkedtagList";}else{FavoriteIcon.className = "tagList";}
	for(var i=0;i<allTagList.length;i++){
		if (CBElm[i] != null) if (CBElm[i].checked == true){IconElm[i].className = "checkedtagList";}else{IconElm[i].className = "tagList";}
	}

}
function SortItem() {
	var user_id = getCookie("user_id");
	var FavoriteCB = 0;
	var CB = [];
	var sortAZ = true;

	var searchText = "%" + search.value + "%";

	UpdateCheckTagIcon();

	if (FavoriteCBElm != null) if (FavoriteCBElm.checked == true) FavoriteCB = 1;
	for(var i=0;i<allTagList.length;i++){
		if (CBElm[i] != null) if (CBElm[i].checked == true) {CB[i] = 1} else{CB[i] = 0};
	}
	if (OrderCBElm != null) if (document.getElementById("Order").checked == true) sortAZ = false;

	console.log("FavoriteCB "+FavoriteCB);
	readItem(user_id, CB, sortAZ, FavoriteCB, searchText);
}

function showImg(filename) {
	if (filename !== "") {
		var showpic = document.getElementById('displayPic');
		showpic.innerHTML = "";
		var temp = document.createElement("img");
		temp.src = filename;
		showpic.appendChild(temp);
	}
}

async function readItem(user_id, CB, sortAZ, FavoriteCB, searchText) {
	await fetch("/readItem", {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			user_id: user_id,
			CB0: CB[0],
			CB1: CB[1],
			CB2: CB[2],
			CB3: CB[3],
			sortAZ: sortAZ,
			FavoriteCB: FavoriteCB,
			searchText: searchText
		})
	}).then((data) => {
		data.json().then((jsonData) => {
			var jsonObj = JSON.parse(JSON.stringify(jsonData));
			console.log(jsonObj);
			ShowItem(jsonObj);
		})
	}).catch((err) => {
		console.log(err);
	});
}

function ShowItem(data) {
	var keys = Object.keys(data);
	var divAllItem = document.getElementById("griditem");
	divAllItem.innerHTML = "";
	for (var i = keys.length - 1; i >= 0; i--) {
		var itemName = data[keys[i]]["name"];
		var tempItemBox = document.createElement("div");
		tempItemBox.className = "divitem";
		divAllItem.appendChild(tempItemBox);

		var tempDivFavorite = document.createElement("div");
		tempDivFavorite.className = "divfavorite";
		var tempCBFavorite = document.createElement("input");
		tempCBFavorite.type = "checkBox";
		tempCBFavorite.hidden = true;
		tempCBFavorite.className = "checkboxfavorite";
		tempCBFavorite.id = data[keys[i]]["name"] + "CB";
		tempCBFavorite.name = data[keys[i]]["name"] + "CB";
		tempCBFavorite.value = data[keys[i]]["name"];
		var tempLabelFavorite = document.createElement("label");
		tempLabelFavorite.htmlFor = data[keys[i]]["name"] + "CB";
		var tempImgFavorite = document.createElement("img");
		tempImgFavorite.className = "imgfavorite";
		if(data[keys[i]]["tagFavorite"] == 1){
			tempCBFavorite.checked = true;
			tempImgFavorite.src = '../img/sourceimg/favoriteIcon.png';
		}else{
			tempImgFavorite.src = '../img/sourceimg/defaultFavoriteIcon.png';
		}

		tempLabelFavorite.appendChild(tempImgFavorite);
		tempDivFavorite.appendChild(tempCBFavorite);
		tempDivFavorite.appendChild(tempLabelFavorite);
		tempItemBox.appendChild(tempDivFavorite);

		var tempDivImgBox = document.createElement("div");
		tempDivImgBox.className = "divimgitem";
		var tempLinkImg = document.createElement("a");
		tempLinkImg.className = "linkinimg";
		tempLinkImg.href = data[keys[i]]["link"];
		tempLinkImg.target = "_blank";
		var tempItemImg = document.createElement("img");
		tempItemImg.src = '../img/sourceimg/defaultProfile.png';
		if(data[keys[i]]["img"] != "defaultProfile.png"){
			tempItemImg.src = '../img/uploadimg/' + data[keys[i]]["img"];
		}
		tempItemImg.alt = '../img/sourceimg/defaultProfile.png';
		tempItemImg.className = "imgitem";
		tempLinkImg.appendChild(tempItemImg);
		tempDivImgBox.appendChild(tempLinkImg);
		tempItemBox.appendChild(tempDivImgBox);

		var tempDivName = document.createElement("div");
		tempDivName.className = "divnameitem";
		var tempLinkText = document.createElement("a");
		tempLinkText.className = "linktextitem";
		tempLinkText.href = data[keys[i]]["link"];
		tempLinkText.target = "_blank";
		tempLinkText.innerHTML = itemName;
		tempDivName.appendChild(tempLinkText);
		tempItemBox.appendChild(tempDivName);
		var tempDivGridTag = document.createElement("div");
		tempDivGridTag.id = "textgridtag";
		tempDivGridTag.className = "divgridtag";
		var tempDivTag = document.createElement("div");
		tempDivTag.className = "divtag";
		tempDivGridTag.appendChild(tempDivTag);

		var tagList = [];
		for(var j=0;j<allTagList.length;j++){
			if (data[keys[i]]["tag"+j] == 1) tagList.push(allTagList[j]);
		}

		if (tagList.length > 3) {
			var tempTagTextTop = document.createElement("p");
			for (var j = 0; j < 3; j++) {
				tempTagTextTop.innerHTML += "#" + tagList[j] + " ";
			}
			tempTagTextTop.className = "tagtexttop";
			tempDivTag.appendChild(tempTagTextTop);

			var tempTagTextbot = document.createElement("p");
			for (var k = 3; k < tagList.length; k++) {
				tempTagTextbot.innerHTML += "#" + tagList[k] + " ";
			}
			tempTagTextbot.className = "tagtextbot";
			tempDivTag.appendChild(tempTagTextbot);
		} else if (tagList.length > 0) {
			var tempTagText = document.createElement("p");
			for (const key in tagList) {
				tempTagText.innerHTML += "#" + tagList[key] + " ";
			}
			tempTagText.className = "tagtext";
			tempDivTag.appendChild(tempTagText);
		}

		var tempEditButton = document.createElement("button");
		tempEditButton.className = "editbutton";
		tempEditButton.innerHTML = "";
		tempEditButton.name = itemName;
		var tempEditIcon = document.createElement("img");
		tempEditIcon.className = "editicon";
		tempEditIcon.src = "../img/sourceimg/edit.png";
		tempEditButton.appendChild(tempEditIcon);
		tempDivGridTag.appendChild(tempEditButton);
		tempItemBox.appendChild(tempDivGridTag);
		
		AddMethodToButtonEdit(tempEditButton, data[keys[i]]["item_id"]);
		AddMethodToButtonFavorite(tempCBFavorite, tempImgFavorite, data[keys[i]]["item_id"])
	}
	function AddMethodToButtonEdit(tempEditButton, itemid) {
		tempEditButton.onclick = function () { GoEdit(itemid); }
	}

	function AddMethodToButtonFavorite(tempCBFavorite, tempImgFavorite, item_id) {
		tempCBFavorite.onclick = function () {
			var FavoriteCB;
			if(tempCBFavorite.checked){
				tempCBFavorite.checked = true;
				tempImgFavorite.src = '../img/sourceimg/favoriteIcon.png';
				FavoriteCB = 1;
			}else{
				tempCBFavorite.checked = false;
				tempImgFavorite.src = '../img/sourceimg/defaultFavoriteIcon.png';
				FavoriteCB = 0;
			}
			UpdateFavorite(FavoriteCB, item_id);
		}
	}
}

async function UpdateFavorite(FavoriteCB, item_id){
	await fetch("/updateFavorite", {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			item_id: item_id,
			FavoriteCB: FavoriteCB
		})
	})
	.then((data) => {
		data.text().then((text) => {
			console.log(FavoriteCB);
			RefreshForFavorite();
		})
	}).catch((err) => {
		console.log(err);
	});
}
function RefreshForFavorite(){
	if(FavoriteCBElm.checked){
		SortItem();
	}
}