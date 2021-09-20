defineM("witsec-code-editor", function(jQuery, mbrApp, tr) {

	var curr = null;
	var compIndex, ifrHTML, ifrCSS;

    mbrApp.regExtension({
        name: "witsec-code-editor",
        events: {
            beforeAppLoad: function() {
                mbrApp.Core.addFilter("prepareComponent", function(a, b) {
					// Check if current theme is an old M/M3 theme (as the Code Editor isn't available there)
					if (mbrApp.theme.type === "primary")
						return a;

					// 'a' is the component window's HTML as string. We need to jQuery that, so we can do magic stuff with it
					var h = jQuery(a);

					// Add edit button to component buttons
					var btn = '<span class="mbr-btn mbr-btn-default mbr-icon-code witsec-code-editor-editbutton" data-tooltipster="bottom" title="Edit Block"></span><style>.witsec-code-editor-editbutton:hover { background-color: #42a5f5 !important; color: #fff !important }</style>';
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

				// Check if current theme is an old M/M3 theme (as the Code Editor isn't available there)
				if (mbrApp.theme.type === "primary")
					return false;

				var a = this;
				var monacoHtml = mbrApp.getAddonDir("witsec-code-editor") + "/monaco/editor.html";

				// Check app settings for Code Editor settings - if they don't exist, set to a default value
				mbrApp.appSettings["witsec-code-editor-wrap"]  = mbrApp.appSettings["witsec-code-editor-wrap"]  || "off";
				mbrApp.appSettings["witsec-code-editor-theme"] = mbrApp.appSettings["witsec-code-editor-theme"] || "vs-dark";

				// Create the skeleton for the overlay and edit fields
				if (!$("#witsec-code-editor").length) {
					a.$body.append([
						'<div id="witsec-code-editor">',
						'  <div class="witsec-code-editor-col-html">',
						'    <div class="witsec-code-editor-header"><h4>HTML</h4></div>',
						'    <iframe id="witsec-code-editor-iframe-html" class="witsec-code-editor-iframe" src="' + monacoHtml + '" scrolling="no"></iframe>',
						'  </div>',
						'  <div class="witsec-code-editor-divider"></div>',
						'  <div class="witsec-code-editor-col-css">',
						'    <div class="witsec-code-editor-header">',
						'      <h4 style="float:left; width:50%">CSS/LESS</h4>',
						'      <h4 style="float:left; width:50%; text-align:right">',
						'        <i class="mbr-icon-align-left witsec-code-editor-wrapbutton"  data-tooltipster="bottom" title="Toggle Wrap"  style="cursor:pointer"></i>&nbsp;&nbsp;&nbsp;',
						'        <i class="mbr-icon-sun        witsec-code-editor-themebutton" data-tooltipster="bottom" title="Toggle Theme" style="cursor:pointer"></i>',
						'      </h4>',
						'    </div>',
						'    <iframe id="witsec-code-editor-iframe-css" class="witsec-code-editor-iframe" src="' + monacoHtml + '" scrolling="no"></iframe>',
						'  </div>',
						'  <button class="witsec-code-editor-save btn btn-fab btn-raised btn-primary" data-tooltipster="top" title="Save">',
						'    <svg height="30" viewBox="0 0 30 30" width="30" xmlns="http://www.w3.org/2000/svg"><path d="M.5 14a.5.5 0 0 0-.348.858l9.988 9.988a.5.5 0 1 0 .706-.706L.858 14.152A.5.5 0 0 0 .498 14zm28.99-9c-.13.004-.254.057-.345.15L12.163 22.13c-.49.47.236 1.197.707.707l16.982-16.98c.324-.318.077-.857-.363-.857z"/></svg>',
						'  </button>',
						'  <button class="witsec-code-editor-cancel btn btn-fab btn-raised btn-material-red" data-tooltipster="top" title="Cancel">',
						'    <svg height="30" viewBox="0 0 30 30" width="30" xmlns="http://www.w3.org/2000/svg"><path d="M29.484 0c-.13.004-.252.057-.343.15L17.164 12.13c-.49.47.235 1.197.706.707L29.846.857c.325-.318.1-.857-.363-.857zM12.488 17c-.13.004-.25.058-.34.15L.162 29.14c-.486.467.233 1.186.7.7L12.848 17.85c.325-.313.093-.85-.36-.85zM.5 0a.5.5 0 0 0-.348.86L29.14 29.845a.5.5 0 1 0 .706-.706L.86.152A.5.5 0 0 0 .5 0z"/></svg>',
						'  </button>',
						'<div>'
					].join("\n"));

					// Set editor columns to max height available
					a.$body.find(".witsec-code-editor-iframe").css("height", window.innerHeight - 40);	// 40 is the height of the header

					// Set references for quick access
					ifrHTML = document.getElementById("witsec-code-editor-iframe-html").contentWindow;
					ifrCSS = document.getElementById("witsec-code-editor-iframe-css").contentWindow;
				}

				// Click handler for "edit code" icon
				a.$template.on("click", ".witsec-code-editor-editbutton", function(e) {

					// Re-create component index (this is an internal list only which refers to the actual index, so we don't have to fiddle with that)
					compIndex = [];
					var footerIndex = false;
					for (index in mbrApp.Core.resultJSON[mbrApp.Core.currentPage].components){
						var comp = mbrApp.Core.resultJSON[mbrApp.Core.currentPage].components[index];

						// We have to check if there's a footer with the 'always-bottom' attribute
						var attrAB = $(comp._customHTML).attr("always-bottom");
						var attrAT = $(comp._customHTML).attr("always-top");
						if (comp._once == "footers" && typeof attrAB !== typeof undefined && attrAB !== false)		// Footer with always-bottom
							footerIndex = index;
						else if (comp._once == "menu" && typeof attrAT !== typeof undefined && attrAT !== false)	// Menu
							compIndex.unshift(index);
						else
							compIndex.push(index);																	// Any other block
					}

					// If there was a footer with the 'always-bottom' attribute, add it last
					if (footerIndex)
						compIndex.push(footerIndex);

					// Find the index of the clicked icon
					a.$template.find('.witsec-code-editor-editbutton').each(function(index, obj) {
						if (e.target == obj) {
							curr = mbrApp.Core.resultJSON[mbrApp.Core.currentPage].components[ compIndex[index] ];
						}
					});

					// If curr is null, something is wrong
					if (curr === null) {
						mbrApp.alertDlg("An error occured while opening the witsec Code Editor.");
						return false;
					}

					// If no _customHTML exists, it's probably a "component.js" kinda block, which doesn't have editable HTML
					if (!curr._customHTML) {
						mbrApp.alertDlg("Sorry, this block can't be edited with the witsec Code Editor.");
						return false;
					}

					// Get the JS and PHP back again
					curr._customHTML = DecodeJS(curr._customHTML, curr);
					curr._customHTML = DecodePHP(curr._customHTML, curr);

					// If the CSS editor isn't yet set to LESS, do so now (by default it loads with PHP)
					if (ifrCSS.editor._configuration._rawOptions.language != "less")
						ifrCSS.monaco.editor.setModelLanguage(ifrCSS.monaco.editor.getModels()[0], "less");

					// Make sure the theme and word wrap are set correctly
					ToggleTheme(false);
					ToggleWordWrap(false);

					// Empty the editors (this will put the cursor back on line 1)
					ifrHTML.editor.setValue("");
					ifrCSS.editor.setValue("");

					// Put the HTML and CSS in the editor windows
					ifrHTML.editor.setValue( curr._customHTML.replace(/<\/script/img, "<\/script") );	// Escape closing script tag to prevent bad things from happening
					ifrCSS.editor.setValue(json2css(curr._styles));

					// In case the component params are visible, hide them
					mbrApp.hideComponentParams();

					// Make the editor appear
					$("#witsec-code-editor").height("100%");
				});

				// Auto-resize the editor columns if needed
				$(window).resize(function() {
					// If the Code Editor is visible, set editor columns to max height available
					if (a.$body.find("#witsec-code-editor").height() != "0") {
						a.$body.find(".witsec-code-editor-iframe").height(window.innerHeight - 40);	// 40 is the height of the header
					}
				});

				// Save
				a.$body.on("click", ".witsec-code-editor-save", function(b) {
					try {
						// Try to turn the CSS into JSON
						mbrApp.objectifyCSS( ifrCSS.editor.getValue() ).then(
							// On success, save the block
							function(styles) {
								// Grab the HTML and save both HTML and CSS to curr
								curr._customHTML = ifrHTML.editor.getValue();
								curr._styles = styles;

								// Encode PHP and JS
								curr._customHTML = EncodePHP(curr._customHTML, curr);
								curr._customHTML = EncodeJS(curr._customHTML, curr);

								// Check if LESS variables are present in MBR-PARAMETERS
								/*
								let noexist = checkLessVars(curr._customHTML, ifrCSS.editor.getValue());
								if (noexist) {
									mbrApp.alertDlg("The following LESS variables are not present in &lt;mbr-parameters&gt;:<br><br><code>" + noexist.join("</code>, <code>") + "</code>");
									return false;
								}
								*/

								// Check if the block is (now) global
								var attr = $(curr._customHTML).attr("global");
								if (typeof attr !== typeof undefined && attr !== false) {
									// Check if the project has multiple pages
									var multipage = ( Object.keys( mbrApp.Core.resultJSON ).length > 1 ? true : false );

									// If the block wasn't global before, but it is now, we're going to add it to all pages
									var addToAllPages = false;
									if (multipage && !curr._global)
										addToAllPages = true;

									// If the block wasn't global before, make the block's name unique, so it won't be incidentally deleted if another (global) block has the same name and gets deleted (or vice versa)
									if (!curr._global)
										curr._name = curr._name + "-" + curr._cid;

									// Set the block as global (if it wasn't already so)
									curr._global = true;

									// Let's update this block on all pages
									if (multipage)
										SaveGlobalBlock(addToAllPages);
								}
								else {
									// If the "global" attribute was set, but is now removed, change the "_cid", so the block becomes unique
									if (curr._global) {
										var cid = GenerateCID();
										curr._cid = cid;
										curr._global = false;
										curr._name = curr._name + "-" + cid;	// Also required, otherwise if the user wants to delete the global block, this block goes too (unintentionally)
									}
								}

								// Save
								var currentPage = mbrApp.Core.currentPage;
								mbrApp.runSaveProject(function() {
									mbrApp.loadRecentProject(function(){
										$("a[data-page='" + currentPage + "']").trigger("click")
									});
								});

								// Make the editor disappear
								$("#witsec-code-editor").height("0");
								curr = null;

								return true;
							},

							// On error
							function(a) {
								mbrApp.alertDlg("The CSS/LESS contains syntax errors.");
								return false;
							}
						);
					}
					catch(err){
						mbrApp.alertDlg(err.name + ': ' + err.message);
					}
				});

				// Do nothing and hide the editor
				a.$body.on("click", ".witsec-code-editor-cancel", function(b) {
					$("#witsec-code-editor").height("0");
					curr = null;
				});

				// Toggle word wrap
				a.$body.on("click", ".witsec-code-editor-wrapbutton", function(e) {
					ToggleWordWrap(true);
				});

				// Toggle theme
				a.$body.on("click", ".witsec-code-editor-themebutton", function(e) {
					ToggleTheme(true);
				});

				// Put PHP and JavaScript back in the HTML
				a.Core.addFilter("getResultHTMLcomponent", function(b, block) {
					// But only if the block has customHTML
					if (block._customHTML) {
						b = DecodeJS(b, block);
						b = DecodePHP(b, block);
					}
					return b;
				});

				// Extra checks to see if PHP got crippled by Mobirise
                a.addFilter("publishHTML", function(b) {
					if ( /<!--\?/gmi.test(b) && /\?-->/gmi.test(b) ) {
						// Try to capture the page title and output a notification
						var title = b.match(/<title>(.+)<\/title>/i);
						mbrApp.alertDlg("<h4>witsec Code Editor</h4>A PHP conversion error was detected in one of the pages (" + (title[1] ? title[1] : "unknown") + "). Try to re-publish your website. If the problem persists, please notify <a href=\"javascript:mbrApp.openUrl('https://witsec.nl');\" title=\"Go to witsec.nl\">witsec</a>.");
					}

					return b
				});

				// Function to encode PHP
				function EncodePHP(html, block) {
					block._PHPplaceholders = [];

					html = html.replace(/<\?[\w\W]+?\?>/g, function(code) {
						var len = block._PHPplaceholders.length;
						block._PHPplaceholders.push(code);
						return "[PHP_CODE_" + len + "]";
					});

					return html;
				}

				// Function to decode PHP
				function DecodePHP(html, block) {
					if (block._PHPplaceholders && block._PHPplaceholders.length) {
						for (i=0; i<block._PHPplaceholders.length; i++) {
							html = html.replace("[PHP_CODE_" + i + "]", block._PHPplaceholders[i]);
							html = html.replace("[php_code_" + i + "]", block._PHPplaceholders[i]);

							// Remove the ="" after PHP closing tags, if the PHP is inside an HTML tag
							html = html.replace(/\?>=(""|'')/ig, "?>");
						}
					}

					return html;
				}

				// Function to encode Javascript
				function EncodeJS(html, block) {
					block._JSplaceholders = [];

					html = html.replace(/<script[\w\W]+?<\/script>/g, function(code) {
						var len = block._JSplaceholders.length;
						block._JSplaceholders.push(code);
						return "[JS_CODE_" + len + "]";
					});

					return html;
				}

				// Function to decode Javascript
				function DecodeJS(html, block) {
					if (block._JSplaceholders && block._JSplaceholders.length) {
						for (i=0; i<block._JSplaceholders.length; i++) {
							html = html.replace("[JS_CODE_" + i + "]", block._JSplaceholders[i]);
							html = html.replace("[js_code_" + i + "]", block._JSplaceholders[i]);
						}
					}

					return html;
				}

				// Function to toggle word wrap
				function ToggleWordWrap(set) {
					var w = mbrApp.appSettings["witsec-code-editor-wrap"];

					if (set)
						w = ( w == "off" ? "on" : "off" );

					ifrHTML.editor.updateOptions({ wordWrap: w });
					ifrCSS.editor.updateOptions({ wordWrap:  w });

					mbrApp.appSettings["witsec-code-editor-wrap"] = w;
				}

				// Function to toggle theme
				function ToggleTheme(set) {
					var t = mbrApp.appSettings["witsec-code-editor-theme"];

					if (set) {
						switch (t) {
							case "vs-dark":	t = "vs";
											break;
							case "vs":		t = "hc-black";
											break;
							default:		t = "vs-dark";
						}
					}

					ifrHTML.monaco.editor.setTheme(t);
					ifrCSS.monaco.editor.setTheme(t);

					mbrApp.appSettings["witsec-code-editor-theme"] = t;
				}

				// Save a Global Block
				function SaveGlobalBlock(addToAllPages) {
					// Loop through all pages
					for (var page in mbrApp.Core.resultJSON) {

						// If a found page is the current page, skip it (we've already saved that)
						if (page == mbrApp.Core.currentPage)
							continue;

						// Loop through all the components of the page
						var compAnchor = "";
						var compFound = false;
						for (var comp in mbrApp.Core.resultJSON[page]["components"]) {
							// If the _cid or _name matches AND the block is global, go for it
							if ( (mbrApp.Core.resultJSON[page]["components"][comp]["_cid"] == curr._cid || mbrApp.Core.resultJSON[page]["components"][comp]["_name"] == curr._name) && mbrApp.Core.resultJSON[page]["components"][comp]["_global"] ) {
								compFound = true;

								// People like to be able to set page specific anchors for global blocks
								compAnchor = mbrApp.Core.resultJSON[page]["components"][comp]["_anchor"];
								mbrApp.Core.resultJSON[page]["components"][comp] = curr;
								mbrApp.Core.resultJSON[page]["components"][comp]["_anchor"] = compAnchor;
							}
						}

						// If the component wasn't found and the user wants this block to now become global, let's add it to the page
						if (!compFound && addToAllPages) {
							var size = mbrApp.Core.resultJSON[page].components.length;
							mbrApp.Core.resultJSON[page].components[size] = curr;
						}
					}
				}

				// Function to generate a component ID
				function GenerateCID() {
					var cid = "";
					var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

					// Loop until we get a unique CID (usually one go needed, but there's a super small chance you end up with a CID that already exists)
					while (cid == "") {
						// Generate random string
						for (var i = 0; i < 10; i++) {
							cid += chars.charAt(Math.floor(Math.random() * chars.length));
						}

						// Let's check if that CID already exists anywhere else in the project
						var pages = mbrApp.Core.getPages();
						for(var page in pages) {
	
							// Loop through all components of a page
							for (i=0; i<pages[page]["components"].length; i++) {
								if (cid == pages[page]["components"][i]["_cid"]) {
									cid = "";
									break;
								}
							}

							// If CID is empty, we need to start over, so exit this loop
							if (cid == "")
								break;
						}
					}

					// We're here, so we got ourselves a unique CID
					return cid;
				}
            }
        }
    })
}, ["jQuery", "mbrApp", "TR()"]);