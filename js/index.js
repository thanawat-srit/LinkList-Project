window.onload = pageLoad;
function pageLoad(){
	ClearCookie();
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.get("error")==1){
		document.getElementById('errordisplay').innerHTML = "Username or password does not match.";
	}	
}
async function ClearCookie(){
	await fetch("/clearCookie");
}
