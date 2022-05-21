var settings = {};
var loadDefaultSettings = function() {
	settings.dex = {
		columnInput: true,
		useDefaultTier: "all", // possible values are "fakeOnly", "all", and "none"
		defaultTier: "OU",
		defaultDoublesTier: "DOU",
		dexIndent: 1,
		learnsetsIndent: 1,
		scriptsIndent: 2,
		formatsIndent: 1,
		initDexNum: 1001,
	};
	settings.dex.dataInputTypes = {};
	for (var iType in data.inputTypes) {
		settings.dex.dataInputTypes[iType] = false;
	}
	for (var iType of ["name", "types", "abilities", "stats"]) {
		settings.dex.dataInputTypes[iType] = true;
	}
};
loadDefaultSettings();