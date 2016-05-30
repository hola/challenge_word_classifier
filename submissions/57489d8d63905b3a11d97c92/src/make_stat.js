const fs = require('fs');
const readline = require('readline');
const options = require('node-options');
//const bitarray = require('./bitarray.js');
var args = process.argv.slice(2);
var digraphs = ['ER','IN','ES','ON','TI','AN','TE','IS','EN','AT','RE','AL','LE','RI','RA','NE','ST','AR','LI','IC','RO','OR','NG','NT'];//,'LA','SE','ED','IT','CO','SS','NI','UN','DE','TO','CA','MA','CH'];
digraphs = digraphs.slice(0, 4);
digraphs = [];//'TH', 'SH', 'CH', 'EA']
var COUNT = 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 3 + digraphs.length;
var BIT_LENGTH = Math.ceil(COUNT/8);
var opts = {output: '', limit: 0, length: 4, diff: false, false_positives: 0.6, diff_limit: 0.000001};
var opts2 = JSON.parse(JSON.stringify(opts));
result = options.parse(args, opts);
if (result.errors) {
    console.log('Unknown argument(s): "' + result.errors.join('", "') + '"');
    //console.log('USAGE: [--port=3000] [--verbose] [public/path/to/static/resources]');
    process.exit(-1);
}

for(var key in opts2) {
    if(typeof(opts2[key]) == 'number') {
        opts[key] = parseFloat(opts[key]);
    } 
}
//var data = fs.readFileSync(args[0]);
var all_groups = {};
var size = [];
var fnum = 0;

function myord(c) {
    if(c == ' '.charCodeAt(0)) {
        return 0;
    }
    if(c == "'".charCodeAt(0)) {
        return 1;
    }
    return c - 'A'.charCodeAt(0) + 2;
}
function save_stat(groups, fname) {
    var start, a, b, newstart, bits = 0, bits2=0;
    var keys = Object.keys(groups).sort();
    var fd = fs.openSync(fname, 'w');
    for(var i in keys) {
        var group = keys[i];
        if(groups[group] <= opts.limit && !group.match(/ /)) {
            continue;
        }
        newstart = group.slice(0,2);
        a = group.charCodeAt(2);
        if(a != b || start != newstart) {
            if(b) {
                fs.writeSync(fd, String.fromCharCode(b));
                //fs.writeSync(fd, bits);
                b = Buffer(4);
                //b.writeUInt32LE(bits >> 32, 0);
                b.writeInt32LE(bits, 0);
                fs.writeSync(fd, b, 0, b.length);
                //b.writeUInt32LE(bits &  -1, 0);
                //b.writeInt32LE(bits2, 0);
                fs.writeSync(fd, b, 0, BIT_LENGTH - b.length);
            }  
            if(start != newstart) {
                if(!start) {
                    fs.writeSync(fd, '\n');
                } else {
                    for(var j = myord(start.charCodeAt(0))*COUNT + myord(start.charCodeAt(1)); j < myord(newstart.charCodeAt(0))*COUNT + myord(newstart.charCodeAt(1)); j++) {
                        fs.writeSync(fd, '\n');
                    }
                }
            }
            bits = 0;
            bits2 = 0;
        }
        start = newstart;
        b = a;
        code = myord(group.charCodeAt(3));
        if(code<=31) {
            bits |= 1<<code;
        } else {
            bits2 |= 1 << code - 32;
        }

        //console.log(group + ':' + groups[group]);
    }
}
function save_stat2(groups, fname) {
    var keys = Object.keys(groups).sort();
    var fd = fs.openSync(fname, 'w');
    for(var i = 1; i <=4; i++) {
        bitarray.save_bitarray(keys, 32, myord, i, 4, fd);
    }
}
result.args.forEach(function(fname) {
    all_groups[fname] = {};
    var groups = all_groups[fname];
    var rd = readline.createInterface({
        input: fs.createReadStream(fname),
        terminal: false
    });
    var count = 0;
    rd.on('close', function() { 
        //console.log(groups); 
        size[fnum] = count;
        console.log(fname + ' size: ' + count);
        if(opts.diff) {
            var diff_data = [];
            if(++fnum == 2) {
                console.log('diff\tgroup');
                groups = all_groups[result.args[0]];
                false_groups = all_groups[result.args[1]];
                var keys = Object.keys(false_groups).sort();
                for(var i in keys) {
                    var group = keys[i];
                    var word_count = groups[group];
                    if(!word_count) {
                        word_count = 0;
                    }
                    var diff = false_groups[group]/size[1]*opts.false_positives - word_count/size[0];
                    //console.log('' + diff + '\t' + group + '\t' + false_groups[group] + '\t' + word_count);
                    if(diff > opts.diff_limit || false_groups[group]/size[1]*opts.false_positives/word_count*size[0]>1.5) {
                        diff_data.push([diff, group]);
                        delete groups[group];
                    }
                }
                diff_data.sort().forEach(function(item) {
                    console.log('' + item[0] + '\t' + item[1]);
                });
            }
        }
      if(opts.output) {
            save_stat(groups, opts.output);
        }  else {
            console.log(groups);
        } 
    });
    rd.on('line', function(line) {
        line = line.toUpperCase();
        for(var i in digraphs) {
            line = line.replace(new RegExp(digraphs[i], 'g'), String.fromCharCode('Z'.charCodeAt(0) + 1 + parseInt(i)));
        }
        var word = ' ' + line + ' ' + line.slice(0, opts.length - 2);
        count++;
        for(var i = 0; i < word.length - opts.length; i++) {
            var group = word.slice(i, i + opts.length);
            if(groups.hasOwnProperty(group)) {
                groups[group] += 1;
            } else {
                groups[group] = 1;
            }
        }
    });
});
