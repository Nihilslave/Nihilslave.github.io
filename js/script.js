var currentPage = "";
var editingRow = -1;
var editingName = "";
document.addEventListener("DOMContentLoaded",
	function (event) {
		// Helper Functions
		var insertHtml = function (selector, html) {
			  var targetElem = document.querySelector(selector);
			  targetElem.innerHTML = html;
		};
		var showLoading = function (selector) {
			  var html = "<div class='loading'>";
			  html += "<img src='img/ajax-loader.gif'></div>";
			  insertHtml(selector, html);
		};
		var changePage = function (html) {
			document.querySelector("#current-page").innerHTML = html;
		};
		var insertProperty = function (str, propName, propValue) {
			var propToReplace = "{{" + propName + "}}";
			str = str
				.replace(new RegExp(propToReplace, "g"), propValue);
			return str;
		};
		// Page Load Functions
		var loadMainMenu = function () { // Main Menu
			showLoading("#current-page");
			currentPage = "main-menu"
			ajaxUtils.sendGetRequest( "html/main-menu.html", changePage, false );
		};
		var loadInputSelectPkmn = function() { // Input Settings
			showLoading("#current-page");
			currentPage = "data-input-select-pkmn";
			ajaxUtils.sendGetRequest( "html/data-input-select-pkmn.html", function(rStr){
				ajaxUtils.sendGetRequest( "html/data-input-select-pkmn-item.html", function(r){
					var buf = "";
					rStr = insertProperty(rStr, "column", settings.dex.columnInput ? "checked" : "");
					rStr = insertProperty(rStr, "single", !settings.dex.columnInput ? "checked" : "");
					rStr = insertProperty(rStr, "all", settings.dex.useDefaultTier === "all" ? "checked" : "");
					rStr = insertProperty(rStr, "fake", settings.dex.useDefaultTier === "fakeOnly" ? "checked" : "");
					rStr = insertProperty(rStr, "none", settings.dex.useDefaultTier === "none" ? "checked" : "");
					rStr = insertProperty(rStr, "tier", settings.dex.defaultTier);
					rStr = insertProperty(rStr, "doublesTier", settings.dex.defaultDoublesTier);
					rStr = insertProperty(rStr, "dexNum", settings.dex.initDexNum);
					for (var key in data.inputTypes) {
						item = r;
						item = insertProperty(item, "id", key);
						item = insertProperty(item, "label", data.inputTypes[key]);
						item = insertProperty(item, "checked", settings.dex.dataInputTypes[key] ? "checked" : "");
						buf += item;
					}
					changePage( insertProperty( rStr, "content", buf ));
				}, false  );
			}, false  );
		};
		var loadInputPkmn = function() { // Column and Single Data Input
			var iStyle = settings.dex.columnInput ? "column" : "single";
			showLoading("#current-page");
			currentPage = "data-" + iStyle + "-input-main";
			ajaxUtils.sendGetRequest( "html/" + currentPage + ".html", function(rStr){
				rStr = insertProperty(rStr, "Spreadsheet", settings.dex.columnInput ? "Spreadsheet " : "");
				ajaxUtils.sendGetRequest( "html/data-" + iStyle + "-input.html", function(r){
					var buf = "";
					for (var key in data.inputTypes) {
						if (!settings.dex.dataInputTypes[key]) continue;
						item = r;
						item = insertProperty(item, "id", key);
						item = insertProperty(item, "type", data.inputTypes[key]);
						item = insertProperty(item, "text", '\n' + data.inputData[key]);
						buf += item;
					}
					rStr = insertProperty(rStr, "content", buf);
					if (iStyle === "single") {
						ajaxUtils.sendGetRequest( "html/data-single-pkmn.html", function(r){
							var pData = window.parseDexInputs();
							buf = "";
							for (var id of pData.ids) {
								if (!id) continue;
								item = r;
								item = insertProperty(item, "row", JSON.stringify(data.getInputRow(pData.inputRow[id])));
								item = insertProperty(item, "rowNum", pData.inputRow[id]);
								item = insertProperty(item, "name", pData.name[id].replace('"', '').replace('"', ''));
								item = insertProperty(item, "tooltip", window.get1DexJS(id, pData));
								buf += item;
							}
							changePage( insertProperty( rStr, "pokemon", buf ));
						}, false );
					} else {
						changePage(rStr);
					}
				}, false );
			}, false );
		};
		var loadOutputPkmn = function() { // View Code Output
			showLoading("#current-page");
			currentPage = "pkmn-output";

			var isDexData = false;
			var isLearnData = false;
			var isFormatsData = true;
			for (var key in settings.dex.dataInputTypes) {
				if (settings.dex.dataInputTypes[key] && (key === "moveAdditions" || key === "moveRemovals")) isLearnData = true;
				else if (settings.dex.dataInputTypes[key] && key !== "name") isDexData = true;
			}
			if (!isDexData && !isLearnData) isDexData = true;
			ajaxUtils.sendGetRequest( "html/pkmn-output.html", function(rStr){
				var pData = window.parseDexInputs(pData);
				var dexStr = isDexData ? window.getPokedexJS(pData) : "";
				var learnsetStr = isLearnData ? window.getLearnsetsJS(pData) : "";
				var scriptsStr = isLearnData ? window.getScriptsJS(pData) : "";
				var formatsDataStr = isDexData ? window.getFormatsDataJS(pData) : "";
				
				ajaxUtils.sendGetRequest( "html/pkmn-output-item.html", function(r){
					var buf = ""
					if (isDexData) {
						buf += insertProperty( r, "id", "pokedex-js" );
						buf = insertProperty( buf, "title", "pokedex.ts");
						buf = insertProperty( buf, "jsData", dexStr );
					}
					if (learnsetStr !== "") {
						buf += insertProperty( r, "id", "learnsets-js" );
						buf = insertProperty( buf, "title", "learnsets.ts");
						buf = insertProperty( buf, "jsData", learnsetStr );
					}
					if (scriptsStr !== "") {
						buf += insertProperty( r, "id", "scripts-js" );
						buf = insertProperty( buf, "title", "scripts.ts");
						buf = insertProperty( buf, "jsData", scriptsStr );
					}
					if (formatsDataStr !== "") {
						buf += insertProperty( r, "id", "formats-data-js" );
						buf = insertProperty( buf, "title", "formats-data.ts" );
						buf = insertProperty( buf, "jsData", formatsDataStr );
					}
					rStr = insertProperty( rStr, "content", buf )
					changePage(rStr);
				}, false );
			}, false );
		};
		// Button Code
		// Save Functions
		var saveInputData = function(page = "") {
			var tagN = page === "data-column-input-main" ? "textarea" : "input";
			if (page) {
				var fields = document.getElementsByTagName(tagN);
				var e1 = data.inputData["name"]
				for (var field of fields) {
					if (page === "data-single-input-main") {
						if (editingRow === -1) {
							if (e1) {
								data.inputData[field.id] += '\n';
								data.inputData[field.id] += field.value;
							}
							else data.inputData[field.id] = field.value;
						}
						else data.replaceInput( editingRow, field.id, field.value);
					} else {
						data.inputData[field.id] = field.value;
					}
				}
			}
			editingRow = -1;
		};
		var saveInputSettings = function(page = "") {
			if (page !== "data-input-select-pkmn") return;
			var fields = document.getElementsByTagName("input");
			for (var field of fields) {
				if (field.id === "default-tier-input") settings.dex.defaultTier = field.value;
				if (field.id === "default-doubles-tier-input") settings.dex.defaultDoublesTier = field.value;
				if (field.id === "dex-num-input") settings.dex.initDexNum = field.value;
			}
			document.cookie = JSON.stringify( settings );
		}
		// Header Bar Buttons
		document.getElementById("home-link").addEventListener( "click", function(e){
			loadMainMenu();
			saveInputSettings( currentPage );
		})
		// Content Buttons
		document.getElementById("current-page").addEventListener( "click", function(e){
			if (!e.target) return;
			if (!e.target.parentElement) return;
			// Main Menu
			if (currentPage === "main-menu") {
				if (e.target.parentElement.id === "button-input-settings") loadInputSelectPkmn();
				if (e.target.parentElement.id === "button-data-enter") loadInputPkmn();
				if (e.target.parentElement.id === "button-code-output") loadOutputPkmn();
				return;
			}
			// Data type select checkboxes
			if (currentPage === "data-input-select-pkmn") {
				for (var key in settings.dex.dataInputTypes) {
					if (e.target.id === key || (e.target.lastChild !== null && e.target.lastChild.id === key)) {			
						settings.dex.dataInputTypes[key] = document.getElementById(key).checked;
						return;
					}
				}
				// Radio buttons
				var id = "radio-column-dex";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) settings.dex.columnInput = true;
				id = "radio-single-dex";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) settings.dex.columnInput = false;
				var id = "radio-tier-all";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) 
					settings.dex.useDefaultTier = "all";
				id = "radio-tier-fake";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) 
					settings.dex.useDefaultTier = "fakeOnly";
				var id = "radio-tier-none";
				if (e.target.id === id || (e.target.lastChild !== null && e.target.lastChild.id === id)) 
					settings.dex.useDefaultTier = "none";
			}
			// single input editing
			if (currentPage === "data-single-input-main") {
				if (e.target.dataset.inputrow) {
					var row = JSON.parse(e.target.dataset.inputrow);
					if (editingRow === -1) {
						document.getElementById("single-input-section").innerHTML +=
						`<div class="buttons">
							<button type="button" id="edit-single-pkmn-button">Save Pokemon</button>
							<button type="button" id="discard-single-pkmn">Discard Changes</button>
							<button type="button" id="delete-single-pkmn">Delete</button>
						</div>`;
					}
					editingRow = e.target.dataset.rownum;
					editingName = e.target.innerHTML.trim();
					e.target.style.fontStyle = "italic";
					e.target.style.color = "white";
					document.getElementById("single-input-title").style.fontStyle = "italic";
					document.getElementById("single-input-title").style.color = "white";
					document.getElementById("single-input-title").innerHTML = "Editing " + e.target.innerHTML;
					document.getElementById("submit-single-pkmn-button").innerHTML = "Update Pokemon";
					for (var iType in row) {
						if (!document.getElementById(iType)) continue;
						document.getElementById(iType).value = row[iType];
					}
					var pkmnList = document.getElementsByClassName("single-pkmn");
					for(var pkmn of pkmnList) {
						if (pkmn.dataset.rownum !== e.target.dataset.rownum) pkmn.style = null;
					}
					return;
				}
			}
			// Back and Submit buttons
			if (e.target.id === "home-button") {
				saveInputSettings(currentPage);
				loadMainMenu();
			} else if (e.target.id === "default-settings-button") {
				loadDefaultSettings();
				document.cookie = JSON.stringify( settings );
				loadInputSelectPkmn();
			} else if (e.target.id === "input-settings-button") {
				saveInputSettings(currentPage);
				loadInputPkmn();
			} else if (e.target.id === "submit-single-pkmn-button" || e.target.id === "edit-single-pkmn-button") {
				saveInputData(currentPage, editingRow);
				loadInputPkmn();
			} else if (e.target.id === "discard-single-pkmn") {
				editingRow = -1;
				loadInputPkmn();
			} else if (e.target.id === "delete-single-pkmn") {
				if (window.confirm( "Delete data for " + editingName + "?")) {
					data.deleteInputRow(editingRow);
					editingRow = -1;
					loadInputPkmn();
				}
			} else if (e.target.id === "submit-pkmn-final-button") {
				saveInputData(currentPage);
				loadOutputPkmn();
			} else if (e.target.id === "input-style-column") {
				settings.dex.columnInput = true;
				saveInputData(currentPage);
				loadInputPkmn();
			} else if (e.target.id === "input-style-single") {
				settings.dex.columnInput = false;
				saveInputData(currentPage);
				loadInputPkmn();
			}
		})
		
		// Init
		loadMainMenu();
		if (document.cookie) settings = JSON.parse( document.cookie );
	}
);