#!/usr/bin/env python

import argparse
from pathlib import Path


parser = argparse.ArgumentParser(description = '''
    Markov chain probabilistic vocabulary model.
''')
subparsers = parser.add_subparsers(dest = 'action')
subparsers.required = True


fit_parser = subparsers.add_parser('fit', help = 'fit model to data')
fit_parser.add_argument('words', type = Path,
                                 help = 'plain text file with whitespace separated words')
fit_parser.add_argument('nonwords', type = Path,
                                    help = 'plain text file with whitespace separated nonwords')
fit_parser.add_argument('model_dir', type = Path,
                                     help = 'resulting model directory')
fit_parser.add_argument('--max-bytes', type = int, default = 2 ** 16,
                                       help = 'resulting model size will be at most this')
fit_parser.add_argument('--transition-bits', type = int, default = 8,
                                             help = 'transition probability values have this many bits each')
fit_parser.add_argument('--max-state-size', type = int, default = 2,
                                            help = 'states have at most this many symbols')
fit_parser.add_argument('--max-symbols', type = int, default = None,
                                         help = 'inflated alphabet cannot have more than this many symbols')
fit_parser.add_argument('--no-minify', dest = 'minify', default = True, action = 'store_false',
                                       help = 'disable js minification')
fit_parser.add_argument('--no-gzip', dest = 'gzip', default = True, action = 'store_false',
                                     help = 'disable gzip compresion')
fit_parser.add_argument('--subsample', type = int, default = None,
                                       help = 'use only this many random words')

def fit():
    from tqdm import tqdm
    from pprint import pprint
    import matplotlib.pyplot as plt

    def read_strings(path):
        with path.open('r') as file:
            strings = file.read()

        strings = strings.strip()
        strings = strings.lower()
        strings = strings.split()
        strings = set(map(tuple, strings))
        
        if args.subsample is not None:
            import random
            strings = set(random.sample(strings, args.subsample))

        return strings

    print('Reading words...')
    words = read_strings(args.words)

    print('Reading nonwords...')
    nonwords = read_strings(args.nonwords)

    print('Initializing alphabet...')
    import string
    alphabet = set(string.ascii_lowercase) | {'\''}
    assert all(symbol in alphabet for word in words
                                  for symbol in word)
    assert all(symbol in alphabet for nonword in nonwords
                                  for symbol in nonword)
    alphabet = list(alphabet)

    def compile(alphabet, words, nonwords):
        print('  Generating all possible transitions...')
        from itertools import product
        all = []
        for state_size in range(args.max_state_size + 1):
            all += product(product(alphabet, repeat = state_size), [*alphabet, None])

        def of(string):
            for i in range(len(string)):
                yield string[max(0, i - args.max_state_size):i], string[i]
            yield string[max(0, len(string) - args.max_state_size):], None

        from collections import Counter
        counts = Counter()
        for word in tqdm(words, '  Counting transitions', leave = True):
            for state, symbol in of(word):
                counts[state, symbol] += 1
        state_counts = Counter()
        for state, symbol in tqdm(counts, '  Counting states', leave = True):
            state_counts[state] += counts[state, symbol]

        import numpy as np
        logprobs = np.empty(len(all))
        for i, (state, symbol) in enumerate(tqdm(all, '  Computing conditional transition probabilities', leave = True)):
            try:
                logprobs[i] = np.log(state_counts[state] / counts[state, symbol])
            except ZeroDivisionError:
                logprobs[i] = np.inf

        print('  Fitting flattening distribution...')
        from scipy.stats import gamma
        params = gamma.fit(logprobs[logprobs != np.inf])

        print('  Flattening...')
        logprobs = gamma.cdf(logprobs, *params)
        lower_bound = np.min(logprobs)
        upper_bound = np.max(logprobs[logprobs != 1])
        new_logprobs = np.empty(len(logprobs), int)
        for i, logprob in enumerate(tqdm(logprobs, '  Discretizing', leave = True)):
            if logprob == 1:
                new_logprobs[i] = 2 ** args.transition_bits - 1
            else:
                new_logprobs[i] = round((logprob - lower_bound) * ((2 ** args.transition_bits - 2) / (upper_bound - lower_bound)))
        logprobs = new_logprobs

        data = bytearray()

        bit_buffer = 0
        bit_buffer_size = 0
        for logprob in tqdm(logprobs, '  Packing', leave = True):
            bit_buffer = bit_buffer << args.transition_bits | int(logprob)
            bit_buffer_size += args.transition_bits
            if bit_buffer_size % 8 == 0:
                data += bit_buffer.to_bytes(bit_buffer_size // 8, 'big')
                bit_buffer = 0
                bit_buffer_size = 0
        while bit_buffer_size % 8 != 0:
            bit_buffer = bit_buffer << args.transition_bits
            bit_buffer_size += args.transition_bits
        data += bit_buffer.to_bytes(bit_buffer_size // 8, 'big')

        old_logprobs = np.empty(len(logprobs))
        for i, logprob in enumerate(tqdm(logprobs, '  Undiscretizing...', leave = True)):
            if logprob == 2 ** args.transition_bits - 1:
                old_logprobs[i] = 1
            else:
                old_logprobs[i] = lower_bound + logprob * ((upper_bound - lower_bound) / (2 ** args.transition_bits - 2))
        print('  Unflattening...')
        old_logprobs = gamma.ppf(old_logprobs, *params)
        old_logprobs = dict(zip(all, old_logprobs))

        def params_of(strings):
            strings_logprobs = np.empty(len(strings))
            for i, string in enumerate(strings):
                strings_logprobs[i] = sum(old_logprobs[state, symbol] for state, symbol in of(string))
            strings_params = gamma.fit(strings_logprobs[strings_logprobs != np.inf])
            _, bins, _ = plt.hist(strings_logprobs[strings_logprobs != np.inf], 500, histtype = 'step', normed = True)
            plt.plot(bins, gamma.pdf(bins, *strings_params))
            return strings_params

        print('  Fitting words distribution...')
        words_params = params_of(words)

        print('  Fitting nonwords distribution...')
        nonwords_params = params_of(nonwords)

        def minify(code):
            if args.minify:
                import subprocess
                p = subprocess.run([str(Path(__file__).parent / 'node_modules/uglify-js/bin/uglifyjs'),
                    '--screw-ie8',
                    '--mangle', 'sort,toplevel',
                    '--compress',
                    '--bare-returns',
                ], input = code.encode(),
                   stdout = subprocess.PIPE,
                   stderr = subprocess.PIPE)
                if p.returncode != 0:
                    import sys
                    sys.stderr.buffer.write(p.stderr)
                    p.check_returncode()
                code = p.stdout.decode()
            return code

        print('  Generating JS code...')
        code = minify(r'''
            exports.init = function(buffer) {
                exports.test = (new Function('buffer', buffer.utf8Slice(''' + str(len(data)) + r''')))(buffer);
            };
        ''').encode()
        data += minify(r'''
            var abs = Math.abs;
            var min = Math.min;
            var max = Math.max;

            var alphabet = [
                ''' + r'''
                '''.join('"' + symbol + '",' for symbol in alphabet) + r'''
            ];

            var of; (function() {
                function fold(string) {
                    string = Array.from(string);
                    for (var i = alphabet.length - 1; alphabet[i].length > 1; --i) {
                        for (var j = 0; j <= string.length - alphabet[i].length; ++j) {
                            if (string.slice(j, j + alphabet[i].length).join('') == alphabet[i]) {
                                string.splice(j, alphabet[i].length, alphabet[i]);
                            }
                        }
                    }
                    return string;
                }

                of = function(string) {
                    string = fold(string);
                    var ofString = [];
                    for (var i = 0; i < string.length; ++i) {
                        ofString.push([string.slice(max(0, i - ''' + str(args.max_state_size) + r'''), i), string[i]]);
                    }
                    ofString.push([string.slice(max(0, string.length - ''' + str(args.max_state_size) + r''')), null]);
                    return ofString;
                };
            })();

            var all; (function() {
                function product(xs, ys) {
                    var result = [];
                    for (var i = 0; i < xs.length; ++i) {
                        for (var j = 0; j < ys.length; ++j) {
                            result.push([xs[i], ys[j]]);
                        }    
                    }
                    return result;
                }

                function power(a, k) {
                    if (k == 0) {
                        return [[]];    
                    }
                    var result = [];
                    for (var i = 0; i < a.length; ++i) {
                        var b = power(a, k - 1);
                        for (var j = 0; j < b.length; ++j) {
                            result.push([a[i]].concat(b[j]));
                        }    
                    }
                    return result;
                }

                all = [];
                for (var stateSize = 0; stateSize <= ''' + str(args.max_state_size) + r'''; ++stateSize) {
                    all = all.concat(product(power(alphabet, stateSize), alphabet.concat([null])));
                }
            })();

            var gammaPdf, gammaPpf; (function() {
                var pow = Math.pow;
                var exp = Math.exp;
                var log = Math.log;
                var sqrt = Math.sqrt;

                var cof = [
                    76.18009172947146,
                    -86.50532032941677,
                    24.01409824083091,
                    -1.231739572450155,
                    0.1208650973866179e-2,
                    -0.5395239384953e-5,
                ];

                function ln(x) {
                    var j = 0;
                    var ser = 1.000000000190015;
                    var xx, y, tmp;

                    tmp = (y = xx = x) + 5.5;
                    tmp -= (xx + 0.5) * log(tmp);
                    for (; j < 6; j++)
                        ser += cof[j] / ++y;
                    return log(2.5066282746310005 * ser / xx) - tmp;
                }

                gammaPdf = function(x, a) {
                    if (x < 0)
                        return 0;
                    if (x === 0 && a === 1)
                        return 1;
                    return exp((a - 1) * log(x) - x - ln(a));
                };

                function lowReg(a, x) {
                    var aln = ln(a);
                    var ap = a;
                    var sum = 1 / a;
                    var del = sum;
                    var b = x + 1 - a;
                    var c = 1 / 1.0e-30;
                    var d = 1 / b;
                    var h = d;
                    var i = 1;
                    var ITMAX = -~(log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);
                    var an, endval;

                    if (x < 0 || a <= 0) {
                        return NaN;
                    } else if (x < a + 1) {
                        for (; i <= ITMAX; i++) {
                            sum += del *= x / ++ap;
                        }
                        return sum * exp(-x + a * log(x) - aln);
                    }

                    for (; i <= ITMAX; i++) {
                        an = -i * (i - a);
                        b += 2;
                        d = an * d + b;
                        c = b + an / c;
                        d = 1 / d;
                        h *= d * c;
                    }

                    return 1 - h * exp(-x + a * log(x) - aln);
                }

                gammaPpf = function(p, a) {
                    var j = 0;
                    var a1 = a - 1;
                    var EPS = 1e-8;
                    var gln = ln(a);
                    var x, err, t, u, pp, lna1, afac;

                    if (p > 1)
                        return NaN;
                    if (p == 1)
                        return Infinity;
                    if (p < 0)
                        return NaN;
                    if (p == 0)
                        return 0;
                    if (a > 1) {
                        lna1 = log(a1);
                        afac = exp(a1 * (lna1 - 1) - gln);
                        pp = (p < 0.5) ? p : 1 - p;
                        t = sqrt(-2 * log(pp));
                        x = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
                        if (p < 0.5)
                            x = -x;
                        x = max(1e-3, a * pow(1 - 1 / (9 * a) - x / (3 * sqrt(a)), 3));
                    } else {
                        t = 1 - a * (0.253 + a * 0.12);
                        if (p < t)
                            x = pow(p / t, 1 / a);
                        else
                            x = 1 - log(1 - (p - t) / (1 - t));
                    }

                    for(; j < 12; j++) {
                        if (x <= 0)
                            return 0;
                        err = lowReg(a, x) - p;
                        if (a > 1)
                            t = afac * exp(-(x - a1) + a1 * (log(x) - lna1));
                        else
                            t = exp(-x + a1 * log(x) - gln);
                        u = err / t;
                        x -= (t = u / (1 - 0.5 * min(1, u * ((a - 1) / x - 1))));
                        if (x <= 0)
                            x = 0.5 * (x + t);
                        if (abs(t) < EPS * x)
                            break;
                    }

                    return x; 
                };
            })();

            var logprobs = {};
            var bitBuffer = 0, bitBufferSize = 0;
            var bufferOffset = 0;
            for (var i = 0; i < all.length; ++i) {
                while (bitBufferSize < ''' + str(args.transition_bits) + r''') {
                    bitBuffer = bitBuffer << 8 | buffer.readUInt8(bufferOffset++); bitBufferSize += 8;
                }

                var logprob = bitBuffer >> (bitBufferSize - ''' + str(args.transition_bits) + r''') & ''' + hex(2 ** args.transition_bits - 1) + r'''; bitBufferSize -= ''' + str(args.transition_bits) + r''';

                if (logprob == ''' + str(2 ** args.transition_bits - 1) + r''') {
                    logprob = 1;
                } else {
                    logprob = ''' + str(lower_bound) + r''' + logprob * ''' + str((upper_bound - lower_bound) / (2 ** args.transition_bits - 2)) + r''';
                }
                logprob = ''' + str(params[1]) + r''' + gammaPpf(logprob, ''' + str(params[0]) + r''') * ''' + str(params[2]) + r''';
            
                logprobs[all[i]] = logprob;
            }

            return function(string) {
                var stringLogprob = 0;
                var ofString = of(string);
                for (var i = 0; i < ofString.length; ++i) {
                    stringLogprob += logprobs[ofString[i]];    
                }
                if (stringLogprob == Infinity) {
                    return false;    
                }
                var wordsDensity = gammaPdf((stringLogprob - ''' + str(words_params[1]) + r''') / ''' + str(words_params[2]) + r''', ''' + str(words_params[0]) + r''') / ''' + str(words_params[2]) + r''';
                var nonwordsDensity = gammaPdf((stringLogprob - ''' + str(nonwords_params[1]) + r''') / ''' + str(nonwords_params[2]) + r''', ''' + str(nonwords_params[0]) + r''') / ''' + str(nonwords_params[2]) + r''';
                if (wordsDensity > nonwordsDensity) {
                    return true;
                }
                if (wordsDensity < nonwordsDensity) {
                    return false;
                }
                return Math.random() >= 0.5;
            };
        ''').encode()

        data, is_gzipped = bytes(data), False

        if args.gzip:
            import gzip
            print('  Gzipping...')
            gzipped_data = gzip.compress(data)
            if len(gzipped_data) < len(data):
                data, is_gzipped = gzipped_data, True

        return code, data, is_gzipped

    print('Compiling...')
    code, data, is_gzipped = compile(alphabet, words, nonwords)
    if len(code) + len(data) > args.max_bytes:
        print('Too big at {}/{} byte(s). Try lower --max-state-size.'.format(len(code) + len(data), args.max_bytes))
        exit(1)

    def merge_pairs(strings, pair, new, where):
        new_strings = set()
        for string in tqdm(strings, '  Merging in {}'.format(where), leave = True):
            j = 1
            while j < len(string):
                if string[j - 1:j + 1] == pair:
                    string = *string[:j - 1], new, *string[j + 1:]
                j += 1
            new_strings.add(string)
        return new_strings

    while True:
        if args.max_symbols is not None and len(alphabet) >= args.max_symbols:
            print('Maximum symbols reached.')
            break

        from collections import Counter
        pair_counts = Counter()
        for word in tqdm(words, 'Searching for most common symbol pair', leave = True):
            for pair in (word[i - 1:i + 1] for i in range(1, len(word))):
                pair_counts[pair] += 1
        most_common_pair, count = pair_counts.most_common(1)[0]
        new_symbol = ''.join(most_common_pair)
        print('  Found {} with {} occurence(s) in words'.format(most_common_pair, count))

        next_alphabet = sorted([*alphabet, new_symbol], key = len)
        next_words = merge_pairs(words, most_common_pair, new_symbol, 'words')
        next_nonwords = merge_pairs(nonwords, most_common_pair, new_symbol, 'nonwords')
        
        print('Compiling...')
        next_code, next_data, next_is_gzipped = compile(next_alphabet, next_words, next_nonwords)
        if len(next_code) + len(next_data) > args.max_bytes:
            print('Too big at {}/{} byte(s), {} symbol(s). Using previous estimate.'.format(len(next_code) + len(next_data), args.max_bytes, len(next_alphabet)))
            break
        alphabet, words, nonwords = next_alphabet, next_words, next_nonwords
        code, data, is_gzipped = next_code, next_data, next_is_gzipped
        print('Ok at {}/{} byte(s), {} symbol(s). Trying more symbols.'.format(len(code) + len(data), args.max_bytes, len(alphabet)))

    print('Writing model out...')
    args.model_dir.mkdir(parents = True, exist_ok = True)
    with (args.model_dir / 'solution.js').open('wb') as code_file:
        code_file.write(code)
    with (args.model_dir / ('data.gz' if is_gzipped else 'data')).open('wb') as data_file:
        data_file.write(data)
    
    print('Done.')

fit_parser.set_defaults(action = fit)


args = parser.parse_args()
args.action()

