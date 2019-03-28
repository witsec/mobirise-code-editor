function testdepend() {alert('test from depend.js');}
function url2path(url) {
path=url.replace(/file:\/\/\//gi, "");
path=path.replace(/\/\//g,"\\");
return path;
}
function path2url(path) {
	//path = path.replace(/\\$/, "")+"\\";
	if (!path.startsWith("file:///")){path = "file:///"+path};
	url = path.replace(/\\/gi, "/");
	return url;
}
function jsonCopy(src) {
  return JSON.parse(JSON.stringify(src));
}
function escHTML(htmlstr) {
    return htmlstr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/^[ \t\r\n]+|[ \t\r\n]+$/g,'');
        // .replace(/"/g, "&quot;")
        // .replace(/'/g, "&#039;")
}
function validatejson(json) { 
	try {
		jsonobj = JSON.parse(json);
		mbrApp.alertDlg('JSON structure OK');
	} catch (e) {
		if (e instanceof SyntaxError) {
			mbrApp.alertDlg(e.name + '/' +e.message);
		} else {
			mbrApp.alertDlg(e.name + '/' +e.message);
		}
	} finally {
		//alert ('finally');
	}
}
function tojson(css) {	
	css = '{\n"'+css+'}';	
	css = css.replace(/^ +/gm, '');	
	css = css.replace(/: /g,'": "');
	css = css.replace(/ {\n/g,'": {\n"');
	css = css.replace(/;\n/g,'",\n"');
	css = css.replace(/}\n/g,'},\n"');
	css = css.replace(/,\n"}/g,'\n}');	
	return css;
}
