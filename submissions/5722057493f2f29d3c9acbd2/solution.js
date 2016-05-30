var d = {"a":{"asia":1,"s":1,"i":1,"ullah":1,"ae":1,"n":1,"an":1,"in":1,"ing":1,"ah":1,"aeth":1,"amboise":1,"amour":1,"andre":1,"annunzio":1,"arcy":1,"arrest":1,"artagnan":1,"attoma":1,"avenant":1,"iberville":1,"ignazio":1,"inzeo":1,"oria":1,"urfey":1,"ewart":1,"a":1,"d":1,"ez":1,"en":1,"ll":1,"m":1,"ve":1,"allegro":1,"aquila":1,"avare":1,"enfant":1,"etranger":1,"hospital":1,"immoraliste":1,"oreal":1,"otage":1,"ouverture":1,"vov":1,"al":1,"ba":1,"taggart":1,"sieur":1,"min":1,"djamena":1,"erday":1,"alofa":1,"boyle":1,"brien":1,"callaghan":1,"carroll":1,"casey":1,"connell":1,"conner":1,"connor":1,"dell":1,"doneven":1,"donnell":1,"donoghue":1,"donovan":1,"driscoll":1,"dwyer":1,"fallon":1,"faolain":1,"faolcin":1,"fiaich":1,"flaherty":1,"gowan":1,"grady":1,"hara":1,"hare":1,"higgins":1,"keeffe":1,"kelley":1,"kelly":1,"leary":1,"mahony":1,"malley":1,"meara":1,"neil":1,"neill":1,"reilly":1,"rourke":1,"shea":1,"shee":1,"sullivan":1,"toole":1,"hon":1,"anic":1,"ite":1,"ang":1,"izz":1,"lkadah":1,"body":1,"thing":1,"t":1,"ala":1,"antica":1,"italiana":1,"ottava":1,"hoy":1,"nt":1,"ying":1,"sun":1,"suns":1,"ns":1,"er":1,"canny":1,"albert":1,"alembert":1,"arblay":1,"arezzo":1,"estaing":1,"holbach":1,"indy":1,"accord":1,"art":1,"etat":1,"oeuvre":1,"commons":1,"sbane":1,"ts":1,"acte":1,"actes":1,"ard":1,"day":1,"nor":1,"nors":1,"it":1,"pennies":1,"penny":1,"pennyworth":1,"re":1,"faith":1,"accuse":1,"adoube":1,"ouvert":1,"harp":1,"auboutisme":1,"auboutist":1,"auboutiste":1,"ri":1,"addition":1,"chaim":1,"envoy":1,"oeil":1,"tre":1,"te":1,"am":1,"adhdhin":1,"gana":1,"importe":1,"liq":1,"east":1,"easter":1,"west":1,"wester":1,"clock":1,"ertop":1,"anga":1,"orth":1,"orths":1,"chaise":1,"elp":1,"help":1,"nnight":1,"y":1,"ban":1,"ol":1,"sbill":1,"l":1,"ls":1,"other":1,"mute":1,"smilk":1,"un":1,"uns":1,"all":1,"se":1},"ms":10}

var test = function(word) {
	var ac = word.split("'")
	if (ac.length == 2) {
		return d.a[ac[1]] == 1 && ac[0] != ''
	} else if (ac.length == 1 && word.length <= d.ms) {
		return Math.random() > 0.4
	} else {
		return false
	}
}

module.exports.test = test
