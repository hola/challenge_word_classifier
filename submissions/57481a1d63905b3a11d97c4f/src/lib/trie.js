//STRIP
const fs = require('fs');
//SEND


let LETTERS = 'abcdefghijklmnopqrstuvwxyz\'', E='END';

class Trie {
    constructor() {
        this.nodes = new Map();
    }

    //STRIP
    addWord(word, data) {
        if (!word.length) {
            this.nodes.set(E, data);
            return;
        }
        let letter = word[0];
        if (this.nodes.has(letter)) {
            this.nodes.get(letter).addWord(word.substr(1), data);
        } else {
            let subtree = new Trie();
            subtree.addWord(word.substr(1), data);
            this.nodes.set(letter, subtree);
        }
    }

    updateData(word, updater) {
        if (word == '') {
            if (this.nodes.has(E)) {
                let val = this.nodes.get(E);
                val = updater(val);
                this.nodes.set(E, val);
                return true;
            }

            return false;
        }

        const letter = word[0];
        if (this.nodes.has(letter)) {
            return this.nodes.get(letter).updateData(word.substr(1), updater);
        }
        return false;
    }

    getCommonSubstring() {
        if (this.nodes.size > 1) {
            return {
                str: '',
                trie: this,
                data: null
            };
        }

        const [key] = [...this.nodes.keys()];
        if (key === E) {
            return {
                str: '',
                trie: null,
                data: this
            }
        }

        const {str, trie, data} = this.nodes.get(key).getCommonSubstring();
        return {
            str: key + str,
            trie,
            data
        };
    }

    getCharCode(char) {
        // 0: last char in word
        // 1: last char in substr
        // 2-27: a-z
        // 28: '
        if (char == '') {
            return 0;
        } else if (char == '\'') {
            return 28;
        } else {
            return char.charCodeAt(0) - 95;
        }
    }

    /**
     * @param {int} fd
     */
    write(fd) {
        if (this.nodes.size > 1) {
            this.encodeNode(fd);
        } else {
            this.encodeSingle(fd);
        }
    }

    // 32 bit:
    // 0: 0 - node block
    // 1: have END singleblock
    // 2-28: a..z '
    /**
     * @param {int} fd
     */
    encodeNode(fd) {
        let bitMask = 0;
        if (this.nodes.has(E)) {
            bitMask = 2;
        }
        for (let i = 0; i < LETTERS.length; ++i) {
            if (this.nodes.has(LETTERS[i])) {
                bitMask |= 1 << (i + 2);
            }
        }
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(bitMask, 0);
        fs.writeSync(fd, buffer, 0, 4);

        if (this.nodes.has(E)) {
            this.encodeEntry(fd);
        }

        for (let i = 0; i < LETTERS.length; ++i) {
            if (this.nodes.has(LETTERS[i])) {
                this.nodes.get(LETTERS[i]).write(fd);
            }
        }
    }

    encodeEntry(fd) {
        let {aff} = this.nodes.get(E);
        let arr = [...aff.values()];
        arr.sort();
        arr.forEach(i => {
            const buffer = Buffer.alloc(1);
            buffer.writeUInt8(i, 0);
            fs.writeSync(fd, buffer, 0, 1);
        });

        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(255, 0);
        fs.writeSync(fd, buffer, 0, 1);
    }

    // 16 bit
    // 0: 1 - str block
    // 1-5: 1st char
    // 6-11: 2nd char
    // 12-16: 3rd char
    /**
     * @param {int} fd
     */
    encodeSingle(fd) {
        const {str, trie, data} = this.getCommonSubstring();

        let bitMask = 1;
        let count = 0;
        for (let i = 0; i < str.length; ++i) {
            const char = this.getCharCode(str[i]);
            bitMask |= char << (count * 5 + 1);

            ++count;
            if (count == 3) {
                count = 0;

                const buffer = Buffer.alloc(2);
                buffer.writeUInt16LE(bitMask, 0);
                fs.writeSync(fd, buffer, 0, 2);
                bitMask = 1;
            }
        }

        if (count == 0) {
            bitMask = trie == null ? 1 : 3;
            const buffer = Buffer.alloc(1);
            buffer.writeUInt8(bitMask, 0);
            fs.writeSync(fd, buffer, 0, 1);
        } else {
            bitMask |= (trie ? 1 : 0) << (count * 5 + 1);
            const buffer = Buffer.alloc(2);
            buffer.writeUInt16LE(bitMask, 0);
            fs.writeSync(fd, buffer, 0, 2);
        }

        if (trie) {
            trie.write(fd);
        } else {
            data.encodeEntry(fd);
        }
    }

    /**
     * @param idx
     * @param {Buffer} buf
     */
    //SEND
    d(idx,buf){
        return(buf.readUInt8(idx)&1)==0?this.dn(idx,buf):this.ds(idx,buf)
    }
    dn(idx,buf){
        let m=buf.readUInt32LE(idx),off=idx+4

        if((m&2)>0)off=this.de(off,buf)

        for(let i=0;i<LETTERS.length;++i)
            if((m&(1<<(i+2)))>0){
                let s=new Trie
                off=s.d(off,buf)
                this.nodes.set(LETTERS[i],s)
            }
        return off
    }
    de(idx,buf){
        let y=false,a=[];
        while(!y){
            let aff=buf.readUInt8(idx)
            idx++
            if (aff==255)y=true;else a.push(aff)
        }
        this.nodes.set(E, a)
        return idx
    }
    ds(idx,buf) {
        let st=this,i=0,mask;
        while(true){
            if(i==0){
                mask=buf.readUInt8(idx)
                if(mask==1)return st.de(idx+1,buf)
                if(mask==3)return st.d(idx+1,buf)
                mask=buf.readUInt16LE(idx)
            }

            let letter=(mask>>(i*5+1))&31
            if(letter==0)return st.de(idx+2,buf)
            else if(letter == 1)return st.d(idx+2,buf)

            let ss=new Trie
            st.nodes.set(LETTERS[letter-2],ss)
            st=ss

            ++i
            if(i==3){idx+=2;i=0}
        }
    }
    get(w) {
        if(w=='')return this.nodes.get(E)
        return this.nodes.has(w[0])?this.nodes.get(w[0]).get(w.substr(1)):null
    }

    //STRIP
    find(word) {
        if (word == '') {
            return this.nodes.has(E);
        }

        let letter = word[0];
        return this.nodes.has(letter) ?
            this.nodes.get(letter).find(word.substr(1)) :
            false;
    }

    walk(prefix, fn) {
        if (this.nodes.has(E)) {
            fn(prefix, this.nodes.get(E));
        }

        for (let i = 0; i < LETTERS.length; ++i) {
            if (this.nodes.has(LETTERS[i])) {
                this.nodes.get(LETTERS[i]).walk(prefix + LETTERS[i], fn);
            }
        }
    }
    //SEND
}

//STRIP
module.exports = Trie;
//SEND
