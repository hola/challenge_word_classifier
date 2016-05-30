module.exports = 
{
	init : function (data)
	{
		//c0 = 0;
		//c1 = 0;
		//c2 = 0;
		//c3 = 0;
		//c4 = 0;
		//c5 = 0;
		//c6 = 0;
		//c7 = 0;
		//c8 = 0;
		//c9 = 0;
		
		//eval('m=data.slice(0,65074),g=data.slice(65074,65227),c=data.slice(65227,65577),r=new Map,p=new Set,s=new Set;for(var i=65577;65697>i;i+=2)p.add(data.readUInt16LE(i));for(;65873>i;i+=2)s.add(data.readUInt16LE(i));for(;66233>i;i+=3)r.set(data.readUInt16LE(i),data[i+2]>>>0);');

		m = data.slice(0, 65074);
		g = data.slice(65074,65227);
//		v = data.slice(0,0);
		c = data.slice(65227, 65577);
		r = new Map();
		p = new Set();
		s = new Set();
		
		for (var i = 65577; i < 65695; i += 2)
			p.add(data.readUInt16LE(i));
		
		for (; i < 65849; i += 2)
			s.add(data.readUInt16LE(i));
		
		for (; i < 66209; i += 3)
			r.set(data.readUInt16LE(i), data[i + 2] >>> 0);
	},
	
	test : function (text)
	{
		//eval('function e(t,r){return r=(r>>>0)%(8*t.length),0!=(t[r/8|0]>>r%8&1)}function n(t,r){for(var e=r||19,n=0;n<t.length;n++)e=(1664525*e>>>0)+t.charCodeAt(n)+1013904223;return e}function u(t){t=t.replace(/\'s$/,""),t=t.replace(/s$/,"");for(var r=0;2>r;r++)for(var e=o(7,t.length-4);e>1;e--){if(!r&&s.has(65535&n(t.slice(-e)))){t=t.slice(0,-e);break}if(r&&p.has(65535&n(t.substr(0,e)))){t=t.substr(e);break}}return n(t)}function f(t){for(var r=0,s=0;r<t.length;r++)if(h.indexOf(t[r])<0)s++;else{if(s>2&&!e(c,n(t.substr(r-s,s))))return!1;s=0}return!0}function i(t){for(var r=0;r<t.length-2;r++)if(!e(g,n(t.substr(r,2))))return!1;return!0}function a(t){for(var e=[1,1,43,29,47,39,43,61,58,70,72,80,84,92,98,106],s=tests=hits=0;s<t.length;s++)for(var u=1;u<=o(t.length-s,3);u++,tests++)hits+=0|r.get(65535&n(t.substr(s,u)));return!(!tests||hits/tests<e[o(t.length,16)-1])}var h="aeouiy",o=Math.min,l=t.length,v=t.indexOf("\'"),b=!(1!=l&&(v>=0&&v!=l-2||l>16||l>3&&t[0]==t[1]||!f(t)||!i(t)||!e(m,u(t))||!a(t)))');
		//return b;

		var vowels = "aeouiy";
		var min = Math.min;
		
		function getBit(buffer, index)
		{
			index = (index >>> 0) % (buffer.length * 8);
			return ((buffer[(index / 8) | 0] >> (index % 8)) & 1) != 0;
		}
		
		// Ly
		function getHash(str, seed)
		{
			var hash = seed || 19;
			
			for (var i = 0; i < str.length; i++)
				hash = ((hash * 1664525) >>> 0) + str.charCodeAt(i) + 1013904223;
			
			return hash;
		}
		
		function getWordCode(text)
		{
			text = text.replace(/\'s$/, "");
			text = text.replace(/s$/, "");
			
			for (var n = 0; n < 2; n++)
				for (var len = min(7, text.length - 4); len > 1; len--)
				{
					if (!n && s.has(getHash(text.slice(-len)) & 65535))
					{
						text = text.slice(0, -len);
						break;
					}
					if (n && p.has(getHash(text.substr(0, len)) & 65535))
					{
						text = text.substr(len);
						break;
					}
				}
			
			return getHash(text);
		}
/*		
		function testMultiVows(text)
		{
			for (var pos = 0, vowCnt = 0; pos < text.length; pos++)
			{
				if (vowels.indexOf(text[pos]) >= 0)
					vowCnt++;
				else
				{
					if (vowCnt > 2 && !getBit(v, getHash(text.substr(pos - vowCnt, vowCnt))))
						return false;
					
					vowCnt = 0;
				}
			}
			
			return true;
		}
*/		
		function testMultiCons(text)
		{
			for (var pos = 0, conCnt = 0; pos < text.length; pos++)
			{
				if (vowels.indexOf(text[pos]) < 0)
					conCnt++;
				else
				{
					if (conCnt > 2 && !getBit(c, getHash(text.substr(pos - conCnt, conCnt))))
						return false;
					
					conCnt = 0;
				}
			}
			
			return true;
		}
		
		function testValidGrams(text)
		{
			for (var pos = 0; pos < text.length - 2; pos++)
				if (!getBit(g, getHash(text.substr(pos, 2))))
					return false;
			
			return true;
		}
		
		function testMorphStats(text)
		{
			var thresholds = [
				1,
				1,
				43,
				29,
				47,
				39,
				43,
				61,
				58,
				70,
				72,
				80,
				84,
				92,
				98,
				106,
			];
			
			for (var pos = tests = hits = 0; pos < text.length; pos++)
				for (var len = 1; len <= min(text.length - pos, 3); len++, tests++)
					hits += r.get(getHash(text.substr(pos, len)) & 0xFFFF) | 0;
			
			return !(!tests || hits / tests < thresholds[min(text.length, 16) - 1]);
		}
/*		
			c0 ++;
			c1 += (length != 1);
			c2 += (apos >= 0 && apos != length - 2);
			c3 += (length > 16);
			c4 += (length > 3 && text[0] == text[1]);
			c5 += (!testMultiVows(text));
			c6 += (!testMultiCons(text));
			c7 += (!testValidGrams(text));
			c8 += (!getBit(m, getWordCode(text)));
			c9 += (!testMorphStats(text));
		
			console.log("c0=", c0, "c1=", c1, "c2=", c2, "c3=", c3, "c4=", c4, "c5=", c5, "c6=", c6, "c7=", c7, "c8=", c8, "c9=", c9);		
*/
		var length = text.length;
		var apos = text.indexOf('\'');
		var result = !(length != 1 &&
			(apos >= 0 && apos != length - 2 ||
			(length > 16) ||
			(length > 3 && text[0] == text[1]) ||
			//(!testMultiVows(text)) ||
			(!testMultiCons(text)) ||
			(!testValidGrams(text)) ||
			(!getBit(m, getWordCode(text))) ||
			(!testMorphStats(text))));
		
		return result;
	}
}