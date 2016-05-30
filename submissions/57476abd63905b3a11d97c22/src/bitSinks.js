var exports = module.exports = {};

exports.Writer= bitBufferingWriter;
exports.Counter = bitCountingWriter;

function bitBufferingWriter(bufSize) {
	this.buf = Buffer.alloc(bufSize);
	this.bitIndex=0;
	this.byteIndex=0;
	this.bitcnt=0;

	this.logbit=function(d,bit,cmt) {
		/*
		var c=[];
		for (var i=0;i<d;i++) {c.push(".");}
		c.push(bit);
		c.push(' ');
		c.push(cmt);
		c.push(' @');
		c.push(this.byteIndex);
		c.push('-');
		c.push(this.bitIndex);
		c.push('#');
		c.push(this.bitcnt);
		console.log(c.join(''));
		*/
	}

	this.write1=function(d,cmt){
		this.logbit(d,1,cmt);
		var mask=1<<this.bitIndex;
		this.buf.writeUInt8(this.buf.readUInt8(this.byteIndex)|mask,this.byteIndex);
		this.next();
	}
	this.write0=function(d,cmt){
		this.logbit(d,0,cmt);
		var mask=1<<this.bitIndex;
		this.buf.writeUInt8(this.buf.readUInt8(this.byteIndex)&~mask,this.byteIndex);
		this.next();
	}	
	this.next=function(){
		this.bitcnt++;
		this.bitIndex++;
		if (this.bitIndex==8) {
			this.bitIndex=0;
			this.byteIndex++;
		}
	}	
}

function bitCountingWriter() {
	this.bitIndex=0;
	this.byteIndex=0;
	this.write1=this.write0=this.next=function(){
		this.bitIndex++;
		if (this.bitIndex==8) {
			this.bitIndex=0;
			this.byteIndex++;
		}
	}	
	this.getByteCount=function(){
		return this.byteIndex + (this.bitIndex>0?1:0);
	}
}
