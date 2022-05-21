(function(global) {
	var sepChars = ['/',',','\t','\\.','\\\\',':',';', '\s-', '-\s'];
	var removeChars = ['\\*','&','$','@','!','#','\\(','\\)','\\{','\\}','\\[','\\]','~','`','~','"',"'","none","---","----","-----"];
	var arrFromStr = function(str) { // Turns strings separated by chars in sepChars into arrays
		for( var c of sepChars ) str = str.replace(new RegExp(c, "g"), '|');
		var arr = str.split('|');
		for (var i in arr) {
			if (!arr[i]) {
				delete arr[i];
				continue;
			}
			arr[i] = arr[i].trim();
			arr[i].replace(arr[i].charAt(0), arr[i].charAt(0).toUpperCase());
			arr = arr.filter(function(el) {
				if (el.replace(/\s/g, '') === '') return false;;
				if (toID(el) === '' && isNaN(el)) return false;
				if (el) return true;
				return false;
			})
		}
		return arr;
	};
	var toID = function(str) {
		str = str.toLowerCase().replace(/\s/g, '').replace(/-/g, '');
		if (str) for( var c of removeChars) str = str.replace(new RegExp(c, "g"), '');
		if (str) for( var c of sepChars) str = str.replace(new RegExp(c, "g"), '');
		return str;
	};
	var parseDexFunctions = { // list of functions to get stringified values for each pokedex.js property
		setIDs: function(pData) { // gets a list of pokemon ids for the exported code
			var ids = data.inputData.name.split('\n');
			var inputRow = pData.inputRow;
			if (ids[0]) {
				for (var i in ids) {
					ids[i] = toID(ids[i]);
					if (!ids[i]) delete ids[i];
					else inputRow[ids[i]] = i;
				}
			} else { // if name list is not given, create dummy ids based on the first property that has data
				for (var key in settings.dex.dataInputTypes) {
					var arr = data.inputData[key].split('\n');
					if (arr[0]) {
						for (var i in arr) {
							let j = Number(i) + 1;
							ids[i] = "pkmn" + j;
							if (!arr[i]) delete ids[i];
							else inputRow[ids[i]] = i;
						}
						break;
					}
				}
			}
			pData.ids = ids;
		},
		// parsing functions
		name: function(name) {
			return '"' + name.trim() + '"';
		},
		types: function(types) {
			var typeArr = arrFromStr(types);
			var buf = '["' + typeArr[0] + '"';
			if (typeArr[1]) buf += ', "' + typeArr[1] +'"';
			buf += ']';
			return buf;
		},
		abilities: function(abilities) {
			abilities = abilities.replace(/hidden ability/i, '');
			abilities = abilities.replace(/HA|DW/g, '');
			var abilArr = arrFromStr(abilities);
			if (abilArr.length === 2) {// if there are only two abilities, the last one is the hidden ability
				abilArr = [abilArr[0], "", abilArr[1]];
			}
			var buf = '{0: "' + abilArr[0] + '"';
			if (abilArr[1]) buf += ', 1: "' + abilArr[1] +'"';
			if (abilArr[2]) buf += ', H: "' + abilArr[2] +'"';
			buf += '}';
			return buf;
		},
		stats: function(stats) {
			stats = stats.replace(/[a-zA-Z]*/g, '');
			var statArr = arrFromStr(stats);
			var buf = '{hp: ' + statArr[0];
			if (statArr[1]) buf += ', atk: ' + statArr[1];
			if (statArr[2]) buf += ', def: ' + statArr[2];
			if (statArr[3]) buf += ', spa: ' + statArr[3];
			if (statArr[4]) buf += ', spd: ' + statArr[4];
			if (statArr[5]) buf += ', spe: ' + statArr[5];
			buf += '}';
			return buf;
		},
		// moveAdditions and moveRemovals return arrays instead of strings
		moveAdditions: function(moveStr) {
			moveStr = moveStr.replace(/\s?[0-9]{1-2}\s/g,"|");
			moveStr = moveStr.replace(/tm[0-9]{1-2}|tm[0-9]{1-2}|le?ve?l[0-9]{1-2}/g, "|");
			var arr = arrFromStr(moveStr);
			for (var i in arr) {
				arr[i] = toID(arr[i]);
				
			}
			arr = arr.filter(function(el){
				if (el) return true;
				return false;
			})
			return arr;
		},
		moveRemovals: function(moveStr) {
			moveStr = moveStr.replace(/\s?[0-9]{1-2}\s/g,"|");
			moveStr = moveStr.replace(/tm[0-9]{1-2}|tm[0-9]{1-2}|le?ve?l[0-9]{1-2}/g, "|");
			var arr = arrFromStr(moveStr);
			for (var i in arr) {
				arr[i] = toID(arr[i]);
			}
			arr = arr.filter(function(el){
				if (el) return true;
				return false;
			})
			return arr;
		},
		weight: function(weight) {
			return weight.replace(/[a-z]/g, '').trim();
		},
		height: function(height) {
			return height.replace(/[a-z]/g, '').trim();
		},
		evos: function(evos) {
			var evoArr = arrFromStr(evos);
			var buf = '["' + evoArr[0] + '"';
			for (var i = 1; i<= evoArr.length; i++) {
				if (evoArr[i]) buf += ', "' + evoArr[i] +'"';
			};
			buf += ']';
			return buf;
		},
		prevo: function(prevo) {
			rPrevo = arrFromStr(prevo);
			return '"' + rPrevo[0].trim() + '"';
		},
		gender: function(toReturn) {
			
		},
		eggGroups: function(eG) {
			var eArr = arrFromStr(eG);
			var buf = '["' + eArr[0] + '"';
			for (var i = 1; i<= eArr.length; i++) {
				if (eArr[i]) buf += ', "' + eArr[i] +'"';
			};
			buf += ']';
			return buf;
		},
		tier: function(tier) {
			return tier.trim();
		},
		doublesTier: function(tier) {
			return tier.trim();
		},
	};
	var parseDexColumn = function(key, ids) {
		var arr = data.inputData[key].split('\n'); // separate each input into an array by newline char, then parse each element individually
		var obj = {};
		for (let i in ids) {
			if (arr[i]) for( var c of removeChars) arr[i] = arr[i].replace(new RegExp(c, "g"), '');
			if (arr[i]) obj[ids[i]] = parseDexFunctions[key](arr[i]);
		};
		return obj;
	};
	var processData = function(pData) { // takes parsed data and figures out forme changes
		var extraData = {
			baseSpecies: {},
			otherFormes: {},
			formeOrder: {},
			forme: {},
		}
		var getForme = function(name) {
			name = name.replace(/"/g, "");
			let nameArr = ["", name];
			var forme = false;
			if (!name.includes(" ") && !name.includes("-")) return nameArr;
			if (name.includes(" ")) {
				nameArr = [ name.slice(0, name.indexOf(" ")), name.slice(name.indexOf(" ") + 1)];
			} 
			if (name.includes("-")) {
				nameArr = [ name.slice(name.lastIndexOf("-") + 1), name.slice(0, name.lastIndexOf("-")) ];
				forme = true;
			}
			if ( toID(nameArr[0]) === "mega" ) return nameArr;
			for (var regionid in data.regions) {
				if (data.regions[regionid].iden.includes( toID(nameArr[0]) )) {
					nameArr[0] = data.regions[regionid].name;
					forme = true;
					break;
				}
			}
			if (forme) return nameArr;
			else return ["", name];
		}
		var getFormes = function(name) {
			var formeList = [];
			var res = getForme(name);
			while (res[0] !== "") {
				formeList.push(res[0]);
				res = getForme(res[1]);
			}
			var buf = "";
			for (var forme of formeList) {
				buf += forme + '-';
			}
			buf = buf.slice(0, buf.lastIndexOf("-"));
			var toReturn = {
				baseSpecies: '"' + res[1] + '"',
				forme: '"' + buf + '"',
			}
			return toReturn;
		}
		var doDexProcess = function() {
			var i = settings.dex.initDexNum;
			for (var id of pData.ids) {
				if(!id) continue;
				pData.num[id] = i;
				i++;
				if (!pData.name[id]) {
					pData.name[id] = id;
					continue;
				}
				if (data.dexInfo && id in data.dexInfo) continue;
				var formeData = getFormes( pData.name[id] );
				if (formeData.baseSpecies !== pData.name[id]) {
					extraData.baseSpecies[id] = formeData.baseSpecies;
					extraData.forme[id] = formeData.forme;
				}
			}
			pData.baseSpecies = extraData.baseSpecies;
			pData.forme = extraData.forme;
			
			for (var id in extraData.forme) {
				let newID = toID(extraData.baseSpecies[id]) + toID(extraData.forme[id]);
				if (id !== newID) {
					for (var table in pData) {
						if (pData[table][id]) {
							if (table === 'name') pData[table][newID] = extraData.baseSpecies[id] + '-' + extraData.forme[id];
							else if (table.slice(0,4) === 'move') pData[table][newID] = [].concat(pData[table][id]);
							else if (
								!(table === "baseSpecies" || table === "forme") ||
								!(data.dexInfo && id in data.dexInfo)
							) {
								pData[table][newID] = pData[table][id];
							}
							delete pData[table][id];
						}
					}
					pData.ids.splice(pData.ids.indexOf(id), 1, newID);
				}
			}
		}
		doDexProcess();
		return pData;
	};
	global.parseDexInputs = function() {
		var parsedData = {};
		parsedData.num = {};
		parsedData.inputRow = {};
		for (var iType in data.inputTypes) {
			parsedData[iType] = {};
		}
		parseDexFunctions.setIDs(parsedData);
		var ids = parsedData.ids
		for (var key in settings.dex.dataInputTypes) {
			if (settings.dex.dataInputTypes[key]) parsedData[key] = parseDexColumn(key, ids);
		}
		parsedData = processData(parsedData);
		return parsedData;
	};

	var outputStr = {
		inherit: "inherit",
		num: "num",
		name: "name",
		baseSpecies: "baseSpecies",
		forme: "forme",
		types: "types",
		gender: "genderRatio",
		stats: "baseStats",
		abilities: "abilities",
		height: "heightm",
		weight: "weightkg",
		color: "color",
		prevo: "prevo",
		evos: "evos",
		eggGroups: "eggGroups",
	};
	var outputProps =  [
		'num', 'name', 'baseSpecies', 'forme', 'types', 'gender', 
		'stats', 'abilities', 'height', 'weight', 'color', 'prevo', 
		'evos', 'eggGroups'
	];
	var newLine = function(str, indent) {
		var buf = "";
		for (var i = 1; i <= indent; i++) buf += '\t';
		return buf + str + '\n';
	};
	// pokedex.ts
	global.get1DexJS = function(id, pData){
		var indent = settings.dex.dexIndent;
		var buf = "";
		if (!id) return buf;
		// id and open bracket
		buf += newLine(`${id}: {`, indent);
		// inherit
		if (id in data.dexInfo) buf += newLine(`inherit: true,`, indent + 1);
		for (var key of outputProps) {
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) {
				buf += newLine(`${outputStr[key]}: ${pData[key][id]},`, indent + 1);
			}
		}
		buf += newLine(`},`, indent);
		return buf
	}
	global.getPokedexJS = function( pData = global.parseDexInputs(), pkmnid ){
		var buf = "";
		for (var id of pData.ids) {
			buf += get1DexJS(id, pData);
		}
		return buf;
	}
	// learnsets.ts
	var getLSObj = function(id, pData) {
		var indent = settings.dex.learnsetsIndent;
		var buf = "";
		if (!id) return buf;
		var hasAdd = false;
		var hasRem = false;
		var key = "moveAdditions";
		if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) hasAdd = true;
		key = "moveRemovals";
		if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) hasRem = true;
		if (!hasAdd && !hasRem) return "";
		
		// id and open bracket
		buf += newLine(`${id}: {`, indent);
		buf += newLine("learnset: {", indent + 1)
		// inherit
		if (id in data.dexInfo) buf += newLine(`inherit: true,`, indent + 2);
		var key = "moveAdditions";
		if (hasAdd) {
			for (var moveid of pData[key][id]) {
				buf += newLine(`${moveid}: ["8L1"],`, indent + 2);
			}
		}
		key = "moveRemovals";
		if (hasRem) {
			for (var moveid of pData[key][id]) {
				buf += newLine(`${moveid}: null,`, indent + 2);
			}
		}
		buf += newLine(`},`, indent + 1);
		buf += newLine(`},`, indent);
		return buf;
	}
	global.getLearnsetsJS = function( pData = global.parseDexInputs(), pkmnid ) {
		var buf = "";
		for (var id of pData.ids) {
			if (!pkmnid || pkmnid === id) buf += getLSObj(id, pData);
		}
		return buf;
	}
	global.getScriptsJS = function( pData = global.parseDexInputs() ) {
		var indent = settings.dex.scriptsIndent;
		var buf = "";
		for (var id of pData.ids) {
			if (!id) continue;
			// if (id in data.dexInfo === false) continue;
			var hasAdd = false;
			var hasRem = false;
			var key = "moveAdditions";
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) hasAdd = true;
			key = "moveRemovals";
			if (pData[key] && pData[key][id] && settings.dex.dataInputTypes[key] !== false) hasRem = true;
			if (!hasAdd && !hasRem) continue;
			
			var name = pData.name[id] ? pData.name[id].replace(/"/g, "") : id;
			buf += newLine(`// ${name}`, indent);			
			if (hasAdd) {
				for (var moveid of pData["moveAdditions"][id]) {
					buf += newLine(`this.modData("Learnsets", "${id}").learnset.${moveid} = ["8L1"];`, indent);
				}
			}
			if (hasRem) {
				for (var moveid of pData["moveRemovals"][id]) {
					buf += newLine(`delete this.modData('Learnsets', '${id}').learnset.${moveid};`, indent);
				}
			}
		}
		return buf;
	}
	global.getFormatsDataJS = function( pData = global.parseDexInputs() ) {
		var indent = settings.dex.formatsIndent;
		var buf = "";
		for (var id of pData.ids) {
			if (!id) continue;
			var key = "tier";
			if ((
					( settings.dex.useDefaultTier === "fakeOnly" && id in data.dexInfo ) || 
					( settings.dex.useDefaultTier === 'none' )
				) &&
				(!pData[key] || !pData[key][id] || !settings.dex.dataInputTypes[key])
			) continue;
			// id and open bracket
			buf += newLine(`${id}: {`, indent);
			var val = pData[key][id] || settings.dex.defaultTier;
			buf += newLine(`${key}: "${val}",`, indent + 1);
			
			key = "doublesTier";
			val = pData[key][id] || settings.dex.defaultDoublesTier;
			buf += newLine(`${key}: "${val}",`, indent + 1);
			
			buf += newLine(`},`, indent);
		}
		return buf;
	}
})(window);