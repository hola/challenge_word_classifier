var bloom;
var rh;

    exports.init = function(data) {
    let prefstring=data.slice(0,2025).toString('ascii');
    let suffstring = data.slice(2025,5107).toString('ascii');
    let codestring = data.slice(5107,9655).toString('ascii');
    eval(codestring);

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