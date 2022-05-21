var data = { // loaded dynamically
	dexInfo: null,
	learnsetsInfo: null,
};
data.inputTypes = {
	name: "Name",
	types: "Types",
	abilities: "Abilities",
	stats: "Stats",
	moveAdditions: "Movepool Additions",
	moveRemovals: "Movepool Removals",
	weight: "Weight",
	height: "Height",
	evos: "Evos",
	prevo: "Prevo",
	gender: "Gender",
	eggGroups: "Egg Groups",
	tier: "Tier",
	doublesTier: "Doubles Tier",
};
data.inputData = {};
for (var iType in data.inputTypes) {
	data.inputData[iType] = "";
}
// Single Input Editing Functions
data.getInputRow = function(row) {
	var returnObj = {};
	for (var iType in data.inputTypes) {
		returnObj[iType] =  data.inputData[iType].split("\n")[row];
	}
	return returnObj;
}
data.replaceInput = function(rowN, iType, newInput) {
	var row = data.inputData[iType].split("\n")[rowN];
	data.inputData[iType] = data.inputData[iType].replace(row, newInput);
}
data.deleteInputRow = function(rowN) {
	for (var iType in data.inputTypes) {
		var row = data.inputData[iType].split("\n")[rowN];
		data.inputData[iType] = data.inputData[iType].replace(row + "\n", "");
		data.inputData[iType] = data.inputData[iType].replace(row, "");
	}
}

data.regions = {
	kanto: {
		iden: ["kanto", "kantonese", "kantan", "kantonian", "kantoan", "kantonan", "kantish"],
		name: "Kanto",
	},
	jhoto: {
		iden: ["jhoto", "jhotonese", "jhotan", "jhotoan", "jhotonan", "jhotish", "jhotonian", "jhotovian"],
		name: "Jhoto",
	},
	hoenn: {
		iden: ["hoenn", "hoennese", "hoenese", "hoennian", "hoenian", "hoennish", "hoenish"],
		name: "Hoenn",
	},
	sinnoh: {
		iden: ["sinnoh", "sinnish", "sinnoan", "sinnohan", "sinnonian", "sinnosian", "sinnan", "sinnonese", "sinnoese",],
		name: "Sinnoh",
	},
	unova: {
		iden: ["unova", "unovan"],
		name: "Unova",
	},
	kalos: {
		iden: ["kalos","kalosian", "kalosan"],
		name: "Kalos",
	},
	alola: {
		iden: ["alola", "alolan"],
		name: "Alola",
	},
	galar: {
		iden: ["galar", "galarian"],
		name: "Galar",
	},
};

ajaxUtils.sendGetRequest( "js/data/pokedex.js", function(r){
	data.dexInfo = r;
}, true ); 