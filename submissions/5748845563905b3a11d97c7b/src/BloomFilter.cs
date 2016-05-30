using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NUnit.Framework;

namespace HolaContest
{
	public class BloomFilter
	{
		private readonly int bits;
		private readonly int hashes;
		private readonly HashSet<int> set;

		public BloomFilter(int bits, int hashes)
		{
			this.bits = bits;
			this.hashes = hashes;
			set = new HashSet<int>();
		}

		public BloomFilter(HashSet<int> hs, int bits, int hashes)
		{
			this.bits = bits;
			this.hashes = hashes;
			set = new HashSet<int>(hs);
		}

		public void Add(List<string> words)
		{
			foreach (var word in words)
			{
				Add(word);
			}
		}

		public void Add(string word)
		{
			var hash = MakeHash(word, bits);
			for (int i = 0; i < hashes; i++)
			{
				set.Add(hash[i]);
			}
		}

		public static int[] MakeHash(string word, int bits)
		{
			var h1 = HashCode(word)%bits;
			if (h1 < 0)
				h1 += bits;
			var h2 = HashCode(word + "str1")%bits;
			if (h2 < 0)
				h2 += bits;
			var h3 = HashCode(word + "abra")%bits;
			if (h3 < 0)
				h3 += bits;
			return new[] {h1, h2, h3};
		}

		private static int HashCode(string s)
		{
			//			return w.GetHashCode();
			var hash = 0;
			var len = s.Length;
			if (s.Length == 0)
				return hash;
			for (var i = 0; i < len; i++)
			{
				var chr = s[i];
				hash = ((hash << 5) - hash) + chr;
				hash |= 0;
			}
			return hash;
		}

		public bool Check(string word)
		{
			var hash = MakeHash(word, bits);
			for (int i = 0; i < hashes; i++)
			{
				if (!set.Contains(hash[i]))
					return false;
			}
			return true;
		}

		public byte[] GetBuffer()
		{
			var ms = new MemoryStream();
			for (int i = 0; i < bits; i += 8)
			{
				byte b1 = (byte)(set.Contains(i + 7) ? 1 : 0);
				byte b2 = (byte)(set.Contains(i + 6) ? 2 : 0);
				byte b3 = (byte)(set.Contains(i + 5) ? 4 : 0);
				byte b4 = (byte)(set.Contains(i + 4) ? 8 : 0);
				byte b5 = (byte)(set.Contains(i + 3) ? 16 : 0);
				byte b6 = (byte)(set.Contains(i + 2) ? 32 : 0);
				byte b7 = (byte)(set.Contains(i + 1) ? 64 : 0);
				byte b8 = (byte)(set.Contains(i + 0) ? 128 : 0);

				byte b = (byte)(b1 | b2 | b3 | b4 | b5 | b6 | b7 | b8);
				ms.WriteByte(b);
			}
			return ms.ToArray();
		}

		public static HashSet<int> LoadFromBuffer(byte[] buffer)
		{
			var hs = new HashSet<int>();
			int i = 0;
			foreach (var b in buffer)
			{
				var s = Convert.ToString((int) b, 2);
				s = s.PadLeft(8, '0');
				foreach (var ch in s.ToCharArray())
				{
					if (ch == '1')
						hs.Add(i);
					i++;
				}
			}
			return hs;
		}
	}

	[TestFixture]
	public class BloomFilter_Test
	{
		[Test]
		public void StoreTest()
		{
			var words = KnownSets.words.Take(1000).ToList();
			var bits = 8*50;
			var hashes = 1;
			var bf = new BloomFilter(bits, hashes);
			bf.Add(words);
			var buffer = bf.GetBuffer();
			var hs = BloomFilter.LoadFromBuffer(buffer);
			var bf2 = new BloomFilter(hs, bits, hashes);
			var buffer2 = bf2.GetBuffer();

			Assert.That(buffer2, Is.EqualTo(buffer));
		}

		[Test]
		public void Hash()
		{
			var h0 = BloomFilter.MakeHash("www", 62000*8)[0];
			Console.WriteLine("Hash1: " + h0);

			var h1 = BloomFilter.MakeHash("www", 62000*8)[1];
			Console.WriteLine("Hash2: " + h1);

			var h2 = BloomFilter.MakeHash("www", 62000*8)[2];
			Console.WriteLine("Hash3: " + h2);
		}

	}
}