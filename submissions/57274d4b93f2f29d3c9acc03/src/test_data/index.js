require('fs').readdirSync(__dirname + '/').forEach(function(file) {
	if (file.match(/\.json$/) !== null) {
		var name = file.replace('.json', '');
		exports[name] = require('./' + file);
	}
});