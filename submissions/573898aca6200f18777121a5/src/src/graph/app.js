#!/usr/bin/env node

var fs = require('fs');

fs.readFile('small.txt', function (err, buffer) {

    var s = '';

    if (err) {
        console.error(err);
        process.exit(1);
    }

    for (let i = 0, end = buffer.length; i < end; ++i) {
        var ch = String.fromCharCode(buffer[i]);
        if (ch == '\n') {
            line(s);
            s = '';
        }
        else {
            s += ch;
        }
    }

    if (s) {
        line(s);
    }

    done();

});

class Node
{
    constructor() {
        this.c = {};
        this.leaf = 0;
    }

    get children() {
        return this.c;
    }

    add(path) {
        var p = this;
        for (let i = 0, end = path.length; i < end; ++i) {
            let key = path[i];
            if (typeof p.children[key] === 'undefined') {
                p.children[key] = new this.constructor();
            }
            p = p.children[key];
        }
        p.leaf += 1;
    }
}

var graph = new Node();

function line(s)
{
    graph.add(s.split(''));
}

function done()
{
    console.log(JSON.stringify(graph, null, '  '));
}
