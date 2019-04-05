(function(jQuery, mbrApp) {

	var curr = null;
	var editorHTML, editorCSS, compIndex;
    mbrApp.regExtension({
        name: "witsec-code-editor",
        events: {
            beforeAppLoad: function() {
                mbrApp.Core.addFilter("prepareComponent", function(a, b) {
					// 'a' is the component window's HTML as string. We need to jQuery that, so we can do magic stuff with it
					var h = jQuery(a);

					// Add edit button to component buttons
					var btn = '<span class="mbr-btn mbr-btn-default mbr-icon-code witsec-code-editor-editbutton" data-tooltipster="bottom" title="Edit Code"></span><style>.witsec-code-editor-editbutton:hover { background-color: #42a5f5 !important; }</style>';
					if (h.find(".component-params").length)
						h.find(".component-params").before(btn);
					else if (h.find(".component-remove").length)
						h.find(".component-remove").before(btn);

					// Get the HTML as a string, then return that
					a = h.prop("outerHTML");
					h.remove();
					return a;
				});
			},

            load: function() {
				var a = this;

				// Do stuff to load all required js files (doing it this way somehow ensures all files are loaded properly, while using params.json often messes things up...)
				var dir = mbrApp.getAddonDir("witsec-code-editor");
				var scrarr = ["codemirror-5.44.0.min.js", "jshint-2.10.2.min.js", "lint-javascript-lint-5.44.0.min.js", "lint-lint-5.44.0.min.js", "addon-active-line-5.44.0.min.js", "mode-clike-5.44.0.min.js", "mode-css-5.44.0.min.js", "mode-htmlmixed-5.44.0.min.js", "mode-javascript-5.44.0.min.js", "mode-php-5.44.0.min.js", "mode-xml-5.44.0.min.js"];

				var scrhtml = "";
				scrarr.forEach(s => {
					scrhtml += '<script src="' + dir + '/lib/' + s + '"></script>\n';
				});

				// Create the skeleton for the overlay and edit fields
				if (!$("#witsec-code-editor").length) {
					a.$body.append([
						'<div id="witsec-code-editor">',
						scrhtml,
						'  <div>',
						'    <div class="row witsec-code-editor-row">',
						'      <div class="col-lg-8 witsec-code-editor-col">',
						'        <div class="witsec-code-editor-header"><h4>HTML</h4></div>',
						'        <textarea id="witsec-code-editor-html"></textarea>',
						'      </div>',
						'      <div class="col-lg-4 witsec-code-editor-col">',
						'        <div class="witsec-code-editor-header"><h4>CSS (JSON format)</h4></div>',
						'        <textarea id="witsec-code-editor-css"></textarea>',
						'      <div>',
						'    </div>',
						'  </div>',
						'  <button class="witsec-code-editor-save btn btn-fab btn-raised btn-primary" data-tooltipster="top" title="Save"><i class="mbr-icon-success"></i></button>',
						'  <button class="witsec-code-editor-cancel btn btn-fab btn-raised btn-material-red" data-tooltipster="top" title="Cancel"><i class="mbr-icon-close"></i></button>',
						'<div>'
					].join("\n"));

					// Initialize CodeMirror for the HTML Editor
					editorHTML = CodeMirror.fromTextArea(a.$body.find("#witsec-code-editor-html")[0], {
						styleActiveLine: true,
						lineNumbers: true,
						lineWrapping: false,
						mode: "application/x-httpd-php",
						theme: "solarized dark",
						lint: true,
						gutters: ["CodeMirror-lint-markers"]
					});

					// Initialize CodeMirror for the CSS Editor
					editorCSS = CodeMirror.fromTextArea(a.$body.find("#witsec-code-editor-css")[0], {
						styleActiveLine: true,
						lineNumbers: true,
						lineWrapping: false,
						mode: "application/json",
						theme: "solarized dark",
						lint: true,
						gutters: ["CodeMirror-lint-markers"]
					});
				}

				// Click handler for "edit code" icon
				a.$template.on("click", ".witsec-code-editor-editbutton", function(e) {
					// Re-create component index (this is an internal list only which refers to the actual index, so we don't have to fiddle with that)
					compIndex = [];
					for (index in mbrApp.Core.resultJSON[mbrApp.Core.currentPage].components){
						var comp = mbrApp.Core.resultJSON[mbrApp.Core.currentPage].components[index];
						if (comp._once == "menu")
							compIndex.unshift(index);
						else
							compIndex.push(index);
					}

					// Find the index of the clicked icon
					a.$template.find('.witsec-code-editor-editbutton').each(function(index, obj) {
						if (e.target == obj) {
							curr = mbrApp.Core.resultJSON[mbrApp.Core.currentPage].components[ compIndex[index] ];
						}
					});

					// If curr is null, something is wrong
					if (curr === null) {
						mbrApp.alertDlg("An error occured while opening the Code Editor.");
						return false;
					}

					// If no _customHTML exists, it's probably a "component.js" kinda block, which doesn't have editable HTML
					if (!curr._customHTML) {
						mbrApp.alertDlg("Sorry, this block can't be edited with the Code Editor.");
						return false;
					}

					// Fill HTML and CSS here...
					editorHTML.setValue(DecodePHP(curr._customHTML));
					editorCSS.setValue(JSON.stringify(curr._styles, undefined, 2));

					// Clear history, so ctrl-z doesn't empty the editors
					editorHTML.clearHistory();
					editorCSS.clearHistory();

					// Set editor columns to max height available
					a.$body.find(".witsec-code-editor-col").height(window.innerHeight - 40);	// 40 is the height of the header

					// Set editors to fill 100% of the div they're in
					editorHTML.setSize("100%", "100%");
					editorCSS.setSize("100%", "100%");

					// In case the component params are visible, hide them
					mbrApp.hideComponentParams();

					// Make the editor appear
					$("#witsec-code-editor").height("100%");
				});

				// Auto-resize the editor columns if needed
				$(window).resize(function() {
					// If the Code Editor is visible, set editor columns to max height available
					if (a.$body.find("#witsec-code-editor").height() != "0") {
						a.$body.find(".witsec-code-editor-col").height(window.innerHeight - 40);	// 40 is the height of the header
					}
				});

				// Save everything
				a.$body.on("click", ".witsec-code-editor-save", function(b) {
					try {
						// Check if the CSS (JSON) contains any errors
						try {
							var styles = JSON.parse(editorCSS.getValue());
						}
						catch(e) {
							mbrApp.alertDlg("The CSS doesn't appear to be in proper JSON format.");
							return false;
						}

						// Grab the HTML and save both HTML and CSS to curr
						curr._customHTML = EncodePHP(editorHTML.getValue());
						curr._styles = styles;

						// Save
						var currentPage = mbrApp.Core.currentPage;
						mbrApp.runSaveProject(function() {
							mbrApp.loadRecentProject(function(){
								$("a[data-page='" + currentPage + "']").trigger("click")
							});
						});
					}
					catch(err){
						mbrApp.alertDlg(err.name + ': ' + err.message);
					}

					// Make the editor disappear
					$("#witsec-code-editor").height("0");
					curr = null;
				});

				// Do nothing and hide the editor
				a.$body.on("click", ".witsec-code-editor-cancel", function(b) {
					$("#witsec-code-editor").height("0");
					curr = null;
				});

				// Do things on preview/publish
				a.addFilter("publishHTML", function(b) {
					b = DecodePHP(b);
					return b
				});

				// "Encode" PHP - if we don't obfuscate PHP code, Mobirise tends to rem it out
				EncodePHP = function(php) {
					php = php.replace("<?", "<!--[PHP]<?");
					php = php.replace("?>", "?>[/PHP]-->");
					return php;
				}

				// "Decode" PHP
				DecodePHP = function(php) {
					php = php.replace("<!--[PHP]<?", "<?");
					php = php.replace("?>[/PHP]-->", "?>");
					return php;
				}
            }
        }
    })
})(jQuery, mbrApp);