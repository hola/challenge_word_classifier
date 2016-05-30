#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const classifier = require('.');

const rd = readline.createInterface({
    input: fs.createReadStream('words.txt')
});

const getNgrams = classifier.getNgrams(classifier.MIN_NGRAM, classifier.MAX_NGRAM);

const edges = {};

let counter = 0;

rd.on('line', (word) => {

    getNgrams(word).forEach((ngram, i, arr) => {

        if (i > 0 && ngram.length === arr[i - 1].length) {
            if (!edges[ngram.length]) edges[ngram.length] = {};
            if (!edges[ngram.length][arr[i - 1]]) edges[ngram.length][arr[i - 1]] = {};
            if (!edges[ngram.length][arr[i - 1]][ngram]) edges[ngram.length][arr[i - 1]][ngram] = 0;
            edges[ngram.length][arr[i - 1]][ngram]++;
        }
    });

    counter++;
    if (counter % 1000 === 0) {
        console.log(counter);
    }
});

rd.on('close', () => {

    const normalizedEdges = Object.keys(edges).reduce((arr, len) => {

        const edgesArray = Object.keys(edges[len]).reduce((res, prevNgram) =>
                res.concat(Object.keys(edges[len][prevNgram]).map(ngram => [prevNgram, ngram, edges[len][prevNgram][ngram]]))
            , []);

        const topEdges = edgesArray
            .sort((a, b) => b[2] - a[2])
            .slice(0, edgesArray.length * 0.1);

        console.log(edgesArray.length * 0.1);

        const totalEdgeWeights = topEdges.reduce((total, edge) => total + Math.log(edge[2]), 0);
        return arr.concat(topEdges.map(edge => [edge[0] + edge[1].substring(edge[1].length - 1), (Math.log(edge[2]) * 1000 / totalEdgeWeights).toFixed(5)]));
    }, []);

    fs.writeFileSync('data.gz', zlib.gzipSync(normalizedEdges.map(edge => edge.join('\t')).join('\n')));

    console.log('done!');
    process.exit();
});

