function FileHelper() 
{
    function Pop(arrays,arraysoffset,buffer) {

        let currentpos = 0;

        for (let i in arraysoffset) {
            for (let j = 0; j < arraysoffset[i]; j++) {
                arrays[i][j] = buffer.readInt32LE(currentpos * 4);
                currentpos++;
            }
        }
    }
    return{Pop:Pop};
}

function RootHelper(pr,ss) {
    var pref = pr;
    var suff = ss;

    function MakeRoot(word) {
        let root = word
        let flag = 0;

        while (flag == 0) {
            flag = 1;
            for (let j = 20; (j >= 2) && (flag == 1); j--) {
                let cursufflist = [];
                for (let z in suff)
                    if (suff[z].length == j)cursufflist.push(suff[z]);
                if (cursufflist.length == 0) continue;
                for (let cursuff in cursufflist) {
                    if (root.substring(root.length - j) != cursufflist[cursuff]) continue;
                    flag = 0;
                    root = root.substring(0, root.length - j);

                }
            }
        }

        flag = 0;
        while (flag == 0) {
            flag = 1;
            for (let j = 20; (j >= 2) && (flag == 1); j--) {
                let curpreflist = [];
                for (let z in pref)
                    if (pref[z].length == j)curpreflist.push(pref[z]);
                if (curpreflist.length == 0) continue;
                for (let curpref in curpreflist) {
                    if (root.substring(0, j) != curpreflist[curpref]) continue;
                    flag = 0;
                    root = root.substring(j);
                }
            }
        }
        return root;
    }
    return {MakeRoot:MakeRoot, pref:pref, suff:suff};
}
function readsufpref(string, count)
{
    let curpos = 0;
    let rr=[];
    for (let z=0; z<count.length; z++)
        for( let y = 0; y<count[z]; y++) {
            let p = string.substr(curpos,z);
            rr.push(string.substr(curpos,z));
            curpos = curpos + z;
        };
    return rr;
}
function Bloom(size)
{
    var bits = Bits();

    function add(string)
    {
        bits.set(hash(string) % size);
    }
    function test(string)
    {
        if (!bits.get(hash(string) % size)) return false;
        return true;
    }
    function hash(key) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        var seed = 43; //magic number
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
    return {add: add, test: test, bits:bits};
};
function Bits()
{
    let ba = [];

    function get(index)
    {
        return (ba[Math.floor(index / 32)] >>> (index % 32)) & 1;
    }

    function set(index)
    {
        ba[Math.floor(index / 32)] |= 1 << (index % 32);
    }
    return {get: get, set: set, ba: ba};
};
var bloom;
var rh;

    exports.init = function(data) {
    let prefstring=data.slice(0,2025).toString('ascii');
    let suffstring = data.slice(2025,5107).toString('ascii');
//    let codestring = data.slice(5107,9655).toString('ascii');
//    eval(codestring);

    let fh=FileHelper();
    bloom = Bloom((data.length - 9655)*8);
    var offset = [14936];
    var arrays = [bloom.bits.ba];
    fh.Pop(arrays,offset,data.slice(9655));
        
    let prefcount = [0,0,23,45,69,186,104,2];
    let suffcount = [0,0,48,119,160,147,92,56,20,13,2,1];

    let ss =readsufpref(suffstring,suffcount);
    let pr= readsufpref(prefstring,prefcount);

    rh = RootHelper(pr,ss);
    }

exports.test = function(word)
{
    let r=rh.MakeRoot(word);
    if (r.indexOf("'") >-1 || r.length>10 ) return false;
    if (r.length>=3 && r.length<=6) return true;
    return bloom.test(word);
}