'use strict';

const blackListRegexp = [
	//окончания с апастрофами, которые встречаются реже всего
	/[^bfjquvwxz]+?'\s$/i,
];

const whiteListRegexp = [
	//окончания, которые встречаются чаще всего
	/(?:a's|e's|ess|ing|n's|r's|s's|al|an|ed|er|es|ic|le|ly|ng|ns|on|rs|ss|te|us)$/i,
	//приставки, которые встречаются чаще всего
	/^(?:co|re|un)/i,
];

let fns = [
	//только фуквы и апостровы
	word => /^[a-z]+(?:[^s]+'s)?$/i.test(word),
	//длина
	word => word.length > 2 && word.length <= 60,
	//окончания
	word => {
		let two = word.slice(-2), three = word.slice(-3), four = word.slice(-4);

		return ["'s", 'ed', 'es', 'en', 'er', 'ty', 'th', 'ly', 'al', 'ic', 'th', 'an', 'ar'].indexOf(two) > -1 ||
			['irr', 'ize', 'ify', 'ate', 'ish', 'ing', 'age', 'dom', 'ion', 'ure', 'ian', 'ism', 'ist', 'ous', 'ful', 'ent', 'ive', 'ite', 'are', 'ate', 'ese', 'ern', 'ood'].indexOf(three) > -1 ||
			['ness', 'less', 'ment', 'ance', 'ancy', 'hood', 'ship', 'teen', 'ards', 'wise', 'able', 'ible'].indexOf(four) > -1;
	},
	//черный список
	word => blackListRegexp.every(v=>!v.test(word)),
	//белый список
	word => whiteListRegexp.some(v=>v.test(word)),
	//приставки
	word => {
		let two = word.slice(-2), three = word.slice(-3), four = word.slice(-4), five = word.slice(-5);

		return ['un', 'im', 'in', 'il', 'ir', 're'].indexOf(two) > -1 ||
			['mis', 'dis', 'non', 'anti', 'cha'].indexOf(three) > -1 ||
			['over'].indexOf(four) > -1 ||
			['super', 'ultra', 'under', 'extra'].indexOf(five) > -1;
	},
	//много повторяющихся букв подряд
	word => !/(\w)\1{2}/i.test(word),
	//повторяющиеся подстроки
	word => !/(\w{3,}).*\1+/i.test(word)
];

exports.test = word => {
	word = word.toLowerCase();

	return (fns[0](word) && fns[1](word) && fns[2](word) && fns[4](word)) || (fns[0](word) && fns[1](word) && fns[3](word) && fns[2](word) && fns.slice(5).reduce((prev, cur) => prev || cur(word), 0));
};
