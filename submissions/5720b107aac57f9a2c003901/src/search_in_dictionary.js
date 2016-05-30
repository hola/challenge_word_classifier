function english_dict() {
	var english_dictionary = null;
	return {
		init: function(data) {
			english_dictionary = data;		
		},
		test: function(word) {
			// binary search
			var len = english_dictionary.length;
			var left = 0, right = len - 1, mid;
			while (left <= right) {
				mid = left + (right - left) / 2;
				var mid_value = english_dictionary[mid];
				if (mid_value == word) return true;
				else if (word < mid_value) right = mid - 1;
				else left = mid + 1;
			}
			return false;
		}
	}
};


module.export = english_dict()
