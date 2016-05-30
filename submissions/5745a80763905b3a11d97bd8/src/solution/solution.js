(function(exports) {
    var special_begin_pair = ["a'","b'","bx","bz","c'","cj","cq","cx","dq","dx","e'","f'","fq","fv","fx","fz","g'","gg","gk","gq","gz","h'","hh","hk","hq","hz","j'","jb","jd","jg","jj","jl","jm","jp","jr","jt","jv","jw","jk","k'","kf","kq","lz","m'","nq","nv","nx","nz","p'","pj","pq","px","q'","qb","qc","qd","qf","qk","ql","qn","qp","qq","qv","qy","r'","rj","rq","rx","s'","sx","t'","tq","tx","u'","v'","vb","vg","vj","vp","vv","vw","vx","w'","wd","wg","wk","wn","wv","x'","xb","xc","xd","xf","xl","xn","xp","xq","xr","xs","xv","xw","y'","yh","yy","yq","z'","zb","zd","zg","zk","zm","zp","zt","zn","ck","gv","pz","qh","rk","wj"],
        special_end_pair = ["jc","kc","pj","ql","rq","tk","xf","yh","zk","fg","yf","zc","ej","lh","bq","mj","tj","tw","wv","'i","ij","lj","bk","sq","bz","gx","cj","uj","yb","dj","dk","jt","mz","oj","dq","sx","vx","dw","'a","yy","zr","fv","fx","zs","uq","bj","gq","gw","cx","gv","hh","hj","hk","kj","hv","hw","zl","'m","px","qr","vb","vf","ww","xm","qi","jd","fk","vh","jj","jp","jv","jl","jr","kb","kd","kn","kp","qc","kv","lq","jk","jg","fh","fj","tx","xu","rj","kx","nq","xp","pk","pq","qb","qd","qe","qf","qm","qn","qp","qv","qq","qy","fq","zn","jm","hx","wx","vg","gf","vj","vl","vv","vw","zh","xb","xd","xl","xn","xq","yv","kf","zb","zg","kl","km","xr","qh","fz","qt","'y","'l","zm","xv","xw"],
        exception_words = ["ahq","aj","aoq","apj","aq","arq","ascq","abqaiq","andrej","aracaj","ardisj","bbq","bmj","boq","bsj","bstj","bajaj","bernj","bhumij","bitolj","bonnesbosq","buraq","ceq","chq","cj","coq","cq","clercq","cluj","colloq","compaq","ddj","dj","doj","dq","dimashq","dunaj","eq","esq","faq","fehq","faruq","gbj","ghq","gq","gij","hj","hkj","hq","hammarskj","hardej","icj","iq","irq","ij","inupiaq","iraq","j","jj","kackavalj","karaj","kardelj","khalq","kranj","lbj","lcj","lj","mcj","mfj","mj","mmj","msj","maj","maraj","marj","marq","nasdaq","nj","nq","nuj","narayanganj","nordenskj","oj","ondrej","pbj","pdq","posslq","pq","pontacq","pulj","q","qq","rfq","rj","rpq","rq","rsj","rafiq","raj","sj","sercq","sherj","sq","sutlej","tapaj","tokaj","vj","voq","vtarj","wsj","xq","zaqaziq","adj","aeq","aflaj","antiq","benj","conj","coreq","cuj","falaj","freq","gaj","gunj","hadj","haj","hajilij","hajj","interj","kj","kankrej","kharaj","kilij","liq","loq","maharaj","meq","munj","nasta'liq","nastaliq","obj","qepiq","req","saj","samaj","seq","seqq","shoq","sqq","subj","suq","svaraj","swaraj","taj","talaq","tranq","tsaddiq","tzaddiq","umiaq","unq","zindiq","a'asia","a's","b's","bx","bz","bz's","bziers","bziers's","c's","cj","cq","cxi","dq","dqdb","dql","dx","dxt","e's","f's","fqdn","fv","fx","fzs","g's","gg","ggp","gks","gksm","gq","gk","gza","gza's","gzhatsk","gzhatsk's","h's","hh","hhd","hhfa","hhs","hk","hkj","hq","hq's","hz","hz's","j's","jbs","jd","jds","jgr","jj","jle","jmp","jms","jmx","jp","jpeg","jpl","jrc","jtids","jtm","jv","jvnc","jwv","jbeil","jbeil's","jdavie","jdavie's","jger","jger's","jkping","jkping's","jl","jl's","jpn","jr","jr's","jtunn","jtunn's","jwanai","jwanai's","k's","kfc","kfc's","kft","kqc","lz","lzen","lzen's","m'ba","m'taggart","m's","m'sieur","nq","nqs","nv","nvh","nvlap","nvram","nxx","nz","nzbc","p's","pj's","pjs","pq","px","q's","qb","qbp","qc","qd","qda","qdcs","qf","qkt","qkt's","qktp","qli","qn","qnp","qns","qp","qqv","qv","qld","qq","qy","qy's","r's","rj","rje","rq","rqs","rqsm","rx","rjchard","rjchard's","rxs","s's","sx","sxs","t'ang","t'ang's","t's","tqc","tqm","tx","txid","u's","v's","vb","vg","vga","vgf","vgi","vj","vp","vpf","vpisu","vpn","vv","vvss","vw","vws","vx","vxi","w's","wd","wdc","wdm","wdt","wg","wgs","wks","wnn","wnp","wnw","wnw's","wv","wvs","wva","wva's","x's","xb","xbt","xcf","xd","xdmcp","xdr","xfe","xfer","xl","xl's","xn","xns","xp","xpg","xport","xq","xrm","xs","xsect","xview","xwsds","xnty","y's","yha","yhvh","yhwh","yy","yquem","yquem's","yquems","z's","zb","zbb","zbr","zd","zg","zgs","zk","zmri","zpg","zprsn","zt","zkinthos","zkinthos's","zmudz","zmudz's","zn","zn's","znaniecki","znaniecki's","ztopek","ztopek's","a'body","a'thing","b'hoy","bxs","ck","ckw","e'en","e'er","fz","g'day","ggr","gv","h'm","j'accuse","j'adoube","j'ouvert","jg","jt","k'ri","kfmmel","kfrsch","pzazz","pzazzes","qh","ql","rket","s'elp","s'help","t'other","txt","vvll","wjc","wk","wkly","x'ing","xc","xcl","xctl","xdiv","xr","xray","xref","xv","xvi","xvii","xviii","xw","y'all","ajc","akc","apj","aql","arq","atk","auxf","ayh","abourezk","afg","algarsyf","alrzc","andrej","anouilh","bbq","bmj","bstj","btw","bwv","baha'i","bayh","bhumij","bitolj","bk","bonnesbosq","bovgazk","bz","cgx","cj","cutk","cluj","cyb","ddj","ddk","dj","djt","dk","dmz","doj","dq","dql","dsx","dvx","dw","der'a","dubayy","edsx","essx","evx","esq","ezr","faql","ffv","ftw","fv","fx","fzs","faruq","gbj","gbz","gq","gw","geulincx","gij","hgv","hh","hj","hk","hkj","htk","hv","hw","hammarskj","hardej","herzl","i'm","icj","ipx","iqr","irq","ivb","ivf","iww","ixm","ij","iraqi","jc","jd","jfk","jhvh","jj","jp","jv","jwv","jl","jr","kb","kc","kd","kn","kp","kqc","kv","kackavalj","kardelj","khalq","khayy","kortrijk","lbj","lcj","lh","lj","ltjg","livvyy","mcj","mfg","mfh","mfj","mhw","mj","mmj","mtx","mxu","marianskn","marj","marq","mekn","merckx","mitzl","nq","nuj","nuww","nvh","nejd","nexu","nordenskj","oexp","oj","ojt","opx","ondrej","pacx","pbj","pdq","pk","posslq","pq","ptw","px","pulj","qb","qc","qd","qe","qf","qm","qn","qp","qqv","qr","qv","qq","qy","rfq","rhv","rj","rnzn","rpq","rq","rijswijk","scx","sjc","sjd","spqr","sqc","sqe","sql","sx","san'a","sejm","shari'a","sherj","shilh","sq","stijl","sutlej","tfx","tgv","thx","tqc","tqm","tw","twx","tx","uvb","urumqi","vb","vf","vg","vgf","vj","vl","vsx","vv","vw","vx","vivl","volapfk","volapk","voronezh","vtarj","wv","ww","www","wezn","xb","xd","xl","xn","xp","xq","xxl","yb","yhvh","yv","yy","yangkf","yaroslavl","yf","zb","zg","zk","zl","zn","zr","zs","aarrghh","adj","adjt","ahh","an'a","apx","avg","cacomixl","cafh","candyh","cfh","chivw","cuj","dkl","dkm","evg","exp","exr","fg","fiqh","fz","gv","h'm","hadj","hajilij","hajj","hdbk","hdkf","hlqn","hrzn","interj","jg","jt","kj","kankrej","kgf","kilij","kl","km","leeshyy","mijl","mxd","nabk","neritjc","npfx","nudzh","obj","ohv","ozs","pfg","pfx","plotx","qh","qi","ql","qt","reqd","rfz","rtw","sahh","satlijk","scfh","schlimazl","sec'y","seqfchk","seqq","setpfx","sfz","shh","shlimazl","slojd","sqd","sqq","stk","stuns'l","subj","suq","tk","tnpk","tpk","tranq","transcendentalizm","unq","vceskd","wakf","waqf","wjc","xr","xu","xv","xw","xxv","yrbk"]; 
    // MurmurHash Implementation
    function murmurhash3_32_gc(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 = 
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
            case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
            case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
            case 1: k1 ^= (key.charCodeAt(i) & 0xff);

            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    }

    var a_table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    var b_table = a_table.split(' ').map(function(s){ return parseInt(s,16) });
    function b_crc32 (str, seed) {
        var crc = -1;
        for(var i=0, iTop=str.length; i<iTop; i++) {
            crc = ( crc >>> 8 ) ^ b_table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    };

    function fnv_1a(v, seed) {
        var a = 2166136261;
        for (var i = 0, n = v.length; i < n; ++i) {
            var c = v.charCodeAt(i),
            d = c & 0xff00;
            if (d) a = fnv_multiply(a ^ d >> 8);
            a = fnv_multiply(a ^ c & 0xff);
        }
        return fnv_mix(a);
    }

    function fnv(v, seed) {
        var a = 2166136261;
        for (var i = 0, n = v.length; i < n; ++i) {
            var c = v.charCodeAt(i),
            d = c & 0xff00;
            if (d) a = fnv_multiply(a ^ d >> 8);
            a = fnv_multiply(a) ^ c & 0xff;
        }
        return fnv_mix(a);
    }

    function fnv_multiply(a) {
        return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
    }

    function fnv_mix(a) {
        a += a << 13;
        a ^= a >>> 7;
        a += a << 3;
        a ^= a >>> 17;
        a += a << 5;
        return (a & 0xffffffff)>>>0;
    }

    function fnv_1a_b(a, seed) {
        return fnv_mix(fnv_multiply(a));
    }

    function checkLastCharacter(word) {
        var end_ch = word[word.length - 1];
        if(end_ch == 'q' || end_ch == 'j') {
            if(exception_words.indexOf(word) != -1) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return -1;
        }
    }

    function checkLastTwoCharacters(word) {
        var two_last_characters = word.substr(word.length - 2, 2);
        if(special_end_pair.indexOf(two_last_characters) != -1) {
            if(exception_words.indexOf(word) != -1) {
                return 1; // english word
            } else {
                return 0; // not english word
            }
        } else {
            return -1; // not known
        }
    }

    function checkBeginTwoCharacters(word) {
        var two_begin_characters = word.substr(0, 2);
        if(special_begin_pair.indexOf(two_begin_characters) != -1) {
            if(exception_words.indexOf(word) != -1) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return -1;
        }
    }

    function cannotBeEnglish(word) {
        var rs1 = checkLastCharacter(word), 
            rs2 = checkLastTwoCharacters(word), 
            rs3 = checkBeginTwoCharacters(word);
        if(rs1 == -1 && rs2 == -1 && rs3 == -1) {
            return -1;
        } else {
            if(rs1*rs2*rs3 == 0) {
                return 0;
            } else {
                return 1;
            }
        }
    }

    // Bloom Filter Implementation
    var BloomFilter = function(buckets, type) {
        if(buckets != 0) {
            this.m = buckets;
            this.buff = new Buffer(this.m);
            this.type = type;
        } else {
            this.type = type;
        }
    }

    BloomFilter.prototype = {
        constructor: BloomFilter,
        add : function(value) {
            var hash;
            if(this.type == 1) {
                hash = b_crc32(value, 0);
            } else if(this.type == 2) {
                hash = fnv_1a(value, 0);
            }
            var index = Math.abs(hash % (this.m << 3));
            var pos = index >>> 3;
            this.buff[pos] |= 1 << (index % 8);
        },
        contains : function(value) {
            var hash;
            if(this.type == 1) {
                hash = b_crc32(value, 0);
            } else if(this.type == 2) {
                hash = fnv_1a(value, 0);
            }
            var index = Math.abs(hash % (this.m << 3));
            var pos = index >>> 3;
            var result = this.buff[pos] & (1 << (index % 8));
            // console.log("type" + this.type + "index:" + index + " pos:" + pos + " result:" + result + " buff:" + this.buff[pos]);
            if(result == 0) {
                return false;
            }
            return true;
        },
        getData : function() {
            return this.buff;
        },
        loadData : function(m, data, sourceStart, sourceEnd) {
            this.m = m;
            this.buff = new Buffer(m);
            data.copy(this.buff, 0, sourceStart, sourceEnd);
        }
    }

    var BloomFilterEx = function(buckets) {
        if(buckets) {
            this.m = buckets;
            this.aBloomFilter1 = new BloomFilter(buckets, 1);
            this.aBloomFilter2 = new BloomFilter(buckets, 2);
            // this.aBloomFilter3 = new BloomFilter(buckets, 3);
        }
    }

    BloomFilterEx.prototype = {
        constructor: BloomFilterEx,
        add : function(value) {
            this.aBloomFilter1.add(value);
            this.aBloomFilter2.add(value);
            // this.aBloomFilter3.add(value);
        },
        contains : function(value) {
            return this.aBloomFilter1.contains(value) && 
                        // this.aBloomFilter2.contains(value) && 
                        this.aBloomFilter2.contains(value);
        },
        getData : function() {
            var returnBuffer = new Buffer(this.m*2 + 4);
            returnBuffer.writeUInt32LE(this.m, 0);
            console.log("Write m:" + this.m);
            this.aBloomFilter1.getData().copy(returnBuffer, 4, 0);
            this.aBloomFilter2.getData().copy(returnBuffer, 4 + this.m);
            // this.aBloomFilter2.getData().copy(returnBuffer, 4 + this.m * 2);
            return returnBuffer;
        },
        loadData : function(data) {
            this.m = data.readUInt32LE(0);
            console.log("m:" + this.m);
            this.aBloomFilter1 = new BloomFilter(0, 1);
            this.aBloomFilter1.loadData(this.m, data, 4, 4 + this.m);
            this.aBloomFilter2 = new BloomFilter(0, 2);
            this.aBloomFilter2.loadData(this.m, data, 4 + this.m, 4 + this.m*2);
            // this.aBloomFilter3 = new BloomFilter(0, 3);
            // this.aBloomFilter3.loadData(this.m, data, 4 + this.m*2, 4 + this.m*3);
        }
    }

    exports.init = init;
    exports.test = test;
    exports.train = train;
    exports.data = data;
    exports.initTrain = initTrain;
    var aBloomFilter = undefined;

    function init(data) {
        aBloomFilter = new BloomFilterEx();
        aBloomFilter.loadData(data);
    }

    function test(word) {
        var rs = cannotBeEnglish(word.toLowerCase());
        if(rs == -1)
            return aBloomFilter.contains(word.toLowerCase());
        else {
            if(rs == 1) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    function initTrain(buckets) {
        aBloomFilter = new BloomFilterEx(buckets);
    }

    function train(word) {
        if(cannotBeEnglish(word.toLowerCase()) == -1) {
            aBloomFilter.add(word.toLowerCase());
        }
    }

    function data() {
        var data = aBloomFilter.getData();
        return data;
    }
})(typeof exports !== "undefined" ? exports : this);

