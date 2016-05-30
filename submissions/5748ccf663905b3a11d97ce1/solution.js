var exports = module.exports = {
	settings: undefined,
	eng_chain: [],
	stop_chain: [],

	_order: 3,

	_pow: function(base, step) {
		result = 1
		for (var i = 1; i <= step; i++)
			result *= base
		return result
	},

	parse_word: function(word) {
		reversed_seq = []
		root = '$'
		len = word.length
		for (var i = 1; i < len; i++) {
			sub_seq = [root]
			for (var j = 0; j < this._order-1; j++) {
				if (i + j > len) {
					sub_seq.push('$')
				} else {
					sub_seq.push(word[len-i-j])
				}
			}
			branch = word[len-i]
			nest = word[len-i-1]			
			reversed_seq.push(sub_seq)
			root = word[len-i]
		}
		return reversed_seq
	},

	get_offset: function(triplet) {
		alphabet = "abcdefghijklmnopqrstuvwxyz'$"
		l = alphabet.length
		pos = 0
		for (var i = 0; i < this._order; i++) {
			sym = triplet[i]
			sym_pos = alphabet.indexOf(sym)
			pos += sym_pos * this._pow(l, this._order - i - 1)
		}
    return pos
	},

	chain_test: function(chain, word) {
		triplet_list = this.parse_word(word)
		plist = []
		if ((word.length < 3) || (word.length > 17)) {
			for (var i = 0; i < triplet_list.length; i++)
				plist.push(0)
			return plist
		}
		for (var i = 0; i < triplet_list.length; i++) {
			triplet = triplet_list[i]
			offset = this.get_offset(triplet)
			plist.push(chain[offset])
		}
		return plist
	},

	_prod: function(list) {
		result = 1
		for (var i = 0; i < list.length; i++)
			result *= list[i]
		return result
	},

	_elem_div: function(list1, list2) {
		result = []
		for (var i = 0; i < list1.length; i++)
			result.push(list1[i] / list2[i])
		return result
	},

	_max: function(list) {
		max = list[0]
		for (var i = 0; i < list.length; i++)
			if (list[i] > max)
				max = list[i]
		return max
	},

	test: function(word) {
		p_eng_list = this.chain_test(this.eng_chain, word)
		p_stop_list = this.chain_test(this.stop_chain, word)
		prod_eng = this._prod(p_eng_list)
		prod_stop = this._prod(p_stop_list)
		if (prod_eng < 0.00001)
			return false
		if (prod_eng > prod_stop) {
			if ((word.length < 5) || (word.length > 13))
				return false
			if (this._max(this._elem_div(p_stop_list, p_eng_list)) > 8)
				return false
			return true
		}
		return false
	},

	init: function(data) {
		settings = eval('(' + data.toString() + ')')
		this.eng_chain = settings[0]
		this.stop_chain = settings[1]
	}
}
