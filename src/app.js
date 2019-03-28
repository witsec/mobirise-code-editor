(function(jQuery, mbrApp) {

	var curr;
    mbrApp.regExtension({
        name: "code-editor",
        events: {		
            load: function() {
                var a = this;
				a.$body.find(".navbar-devices").append('<li class="updatebutton" style="width:66px; height:58px; cursor:pointer" data-tooltipster="bottom" title="Reload Mobirise"><i class="mbr-icon-update mbr-iconfont"></i></li><li class="editbutton" style="width:66px; height:58px; cursor:pointer" id="editbtn" data-tooltipster="bottom" title="Code Editor"><i class="mbr-icon-code mbr-iconfont"></i></li>');
				a.$body.on("click", ".updatebutton", function(b) {
					Bridge.reload();
				});
				a.$body.on("click", ".editbutton", function(b) {
					var currentPage = mbrApp.Core.currentPage;		
					var complist = '';
					var curr = mbrApp.Core.resultJSON[currentPage].components[0];
					for (x in mbrApp.Core.resultJSON[currentPage].components){
						compname = mbrApp.Core.resultJSON[currentPage].components[x]._name
						complist = complist + '<option value="'+ x +': '+compname +'">'+ x +': '+ compname + '</option>';
					}
					mbrApp.$body.on("change",'[name="blockSelect"]',function(a) {
						var ind = this.selectedIndex;
						var currentPage = mbrApp.Core.currentPage;
						curr = mbrApp.Core.resultJSON[currentPage].components[ind];
						jQuery("#htmlcode").text(curr._customHTML);
						hljs.highlightBlock(document.getElementById("htmlcode"));
						jQuery(".styles").val(JSON.stringify(curr._styles, undefined, 2));
						$("#blockCid").val(curr._cid);
						$("#blockAnchor").val(curr._anchor);
					});
					mbrApp.showDialog({
						title: "Code Editor",
						className: "dp-modal",
						body: ['',
						'<div class="row">',
						'  <div class="col-lg-4"><select class"form-control blockselect" name="blockSelect">',complist,'</select></div>',
						'  <div class="col-lg-3">_cid: <input type="text" class"form-control blockcid" id="blockCid" value="',curr._cid,'"></div>',
						'  <div class="col-lg-5">_anchor: <input type="text" class"form-control blockanchor" id="blockAnchor" value="',curr._anchor,'"></div>',
						'</div>',
						'<div class="row">&nbsp;</div>',
						'<div class="row">',
						'  <div class="col-lg-12">',
						'    <ul class="nav nav-tabs">',
						'      <li class="active"><a data-toggle="tab" href="#html">HTML</a></li>',
						'      <li><a data-toggle="tab" href="#style">STYLE</a></li>',
						'    </ul>',
						'    <div class="tab-content">',
						'      <div id="html" class="tab-pane fade in active">',
						'        <pre><code class="html" id="htmlcode" contenteditable="true">',escHTML(curr._customHTML),'</code></pre>',
						'        <button type="button" class="btn btn-primary" id="searchhtml">SEARCH-REPLACE</button>',
						'      </div>',
						'      <div id="style" class="tab-pane fade">',
						'        <textarea class="form-control styles" id="styles" rows="23" style="font-family:Consolas; background-color:#333; color:#99ec99">',
						         JSON.stringify(curr._styles, undefined, 2),
						'        </textarea>',
						'        <button type="button" class="btn btn-primary" id="searchstyles">search-replace</button>',
						'        <button type="button" class="btn btn-primary" id="validjson">VALIDATE JSON</button>',
						'        <button type="button" class="btn btn-primary" id="tojson">CONVERT CSS TO JSON</button>',
						'      </div>',
						'    </div>',
						'  </div>',
						'</div>',
						'<script>hljs.highlightBlock(document.getElementById("htmlcode"));</script>',
						'<style>pre code {height: 450px;} pre.code {overflow: auto;}</style>'
						].join("\n"),
						buttons: [{
							label: "SAVE",
							default: !0,
							callback: function() {
								try {
									curr._customHTML = jQuery("#htmlcode").text();
									curr._styles = JSON.parse(jQuery(".styles").val());
									mbrApp.runSaveProject(function() {
										mbrApp.loadRecentProject(function(){
											$("a[data-page='"+currentPage+"']").trigger("click")
										});
									});
								}
								catch(err){
									mbrApp.alertDlg(err.name + ' with message : ' +err.message);
								}
							}
						},
							{
							label: "CLOSE",
							default: !0,
							callback: function() {									
								jQuery(".dp-modal").remove();
								mbrApp.$body.off("click", ".dp-modal")
							}
						}
						]
					});
					$("#searchhtml").on("click", function(b) {
						b.preventDefault();
						var selectText = window.getSelection().toString();
						mbrApp.showDialog({
							title: "Search & Replace",
							className: "replace-modal",
							body: ['<form class="page-settings-form">\n<div class="form-group clearfix">\n<div class="col-md-12">\nsearch for :<input class="form-control inputmodal" type="text" id="searchstr" placeholder="search for" value="search for"/>\nreplace by:<input class="form-control inputmodal" type="text" id="replacestr" placeholder="replace by" value=""/>\n</div>\n</div>\n</form>'].join("\n"),
							show: function(g) {
							$("#searchstr").val(selectText);
							},
							buttons: [{
								label: "Replace all",
								default: !0,
								callback: function() {
										var replaceText = $("#replacestr").val();
										selectText = $("#searchstr").val();
										var newText = $('#htmlcode').text().split(selectText).join(replaceText);
										$('#htmlcode').text(newText);
										hljs.highlightBlock(document.getElementById("htmlcode"));
								}
							},
							{
								label: "Close/Cancel",
								default: !0,
								callback: function() {
									$(".replace-modal").remove()
								}
							}
							]
						})
					});
					$("#searchstyles").on("click", function(b) {
						b.preventDefault();
						var selectText = document.getElementById("styles").value.substring(document.getElementById("styles").selectionStart,document.getElementById("styles").selectionEnd);
						mbrApp.showDialog({
							title: "Search & Replace",
							className: "replace-modal",
							body: ['<form class="page-settings-form">\n<div class="form-group clearfix">\n<div class="col-md-12">\nsearch for :<input class="form-control inputmodal" type="text" id="searchstr" placeholder="search for" value="search for"/>\nreplace by:<input class="form-control inputmodal" type="text" id="replacestr" placeholder="replace by" value=""/>\n</div>\n</div>\n</form>'].join("\n"),
							show: function(g) {
							$("#searchstr").val(selectText);
							},
							buttons: [{
								label: "Replace all",
								default: !0,
								callback: function() {
										var replaceText = $("#replacestr").val();
										selectText = $("#searchstr").val();
										var newText = $('#styles').val().split(selectText).join(replaceText);
										//alert(newText);
										$('#styles').val(newText);
								}
							},
							{
								label: "Close/Cancel",
								default: !0,
								callback: function() {
									$(".replace-modal").remove()
								}
							}
							]
						})
					});
					$('#blockCid').on("change", function () {
						curr._cid = $('#blockCid').val();
					});
					$('#blockAnchor').on("change", function () {
						curr._anchor = $('#blockAnchor').val();
					});
					$('#validjson').on("click", function () {
						validatejson(jQuery(".styles").val());
					});
					$('#tojson').on("click", function () {
						css = jQuery(".styles").val();
						jsoncss = tojson(css);
						validatejson(jsoncss);
						curr._styles = JSON.parse(jsoncss);							
						jQuery(".dp-modal").remove();
						$(".blockedit").click();							
					});						
				});				
            }
        }
    })
})(jQuery, mbrApp);