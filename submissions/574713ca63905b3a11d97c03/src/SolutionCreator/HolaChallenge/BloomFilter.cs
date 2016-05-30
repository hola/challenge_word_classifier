using System;
using System.Collections;
using System.IO;
using System.Linq;

namespace HolaChallenge
{
	public class BloomFilter
	{
		private readonly ulong _hashFunctionCount;
		private readonly ulong _hashBitsCount;
		private readonly BitArray _hashBits;
		private int _wordsCount;

		public void Clear()
		{
			_hashBits.SetAll(false);
		}

		public BloomFilter(int m, int k)
		{
			_hashFunctionCount = (ulong)k;
			_hashBits = new BitArray(m);
			_hashBitsCount = (ulong)_hashBits.Count;
		}

		public void ShowInfo()
		{
			Console.WriteLine($"Bloom info: words {_wordsCount}, filled {Truthiness.ToString("0.####")}");
		}

		public byte[] Body => _hashBits.ToByteArray();

		public void Save(string path)
		{
			var array = _hashBits.ToByteArray();
			File.WriteAllBytes(path, array);
			Console.WriteLine("Bloom saved, first bytes: " + string.Join(",", array.Take(5)));
		}

		public void ShowZipInfo()
		{
			var array = _hashBits.ToByteArray();

			byte[] zipped;
			ZipHelper.CompressData(array, out zipped);
			Console.WriteLine($"Bloom zipped size: " + zipped.Length);
		}

		public delegate int HashFunction(string input);

		public double Truthiness => (double)TrueBits() / _hashBitsCount;

		public void Add(string item)
		{
			_hashBits[(int)(JavascriptHashString(item) % _hashBitsCount)] = true;
			_wordsCount++;
		}

		public bool Contains(string item)
		{
			return _hashBits[(int)(JavascriptHashString(item) % _hashBitsCount)];
		}

		private static int GetHashPrimary(string src)
		{
			int hash1 = 5381;
			int hash2 = hash1;

			int c;
			int si = 0;

			while (si < src.Length && (c = src[si]) != 0)
			{
				hash1 = ((hash1 << 5) + hash1) ^ c;

				if (si + 1 >= src.Length)
					break;

				c = src[si + 1];
				if (c == 0)
					break;

				hash2 = ((hash2 << 5) + hash2) ^ c;
				si += 2;
			}

			return hash1 + (hash2 * 1566083941);
		}

		private static int BestK(int capacity, float errorRate)
		{
			return (int)Math.Round(Math.Log(2.0) * BestM(capacity, errorRate) / capacity);
		}

		private static int BestM(int capacity, float errorRate)
		{
			return (int)Math.Ceiling(capacity * Math.Log(errorRate, (1.0 / Math.Pow(2, Math.Log(2.0)))));
		}

		private static float BestErrorRate(int capacity)
		{
			float c = (float)(1.0 / capacity);
			if (Math.Abs(c) > 0.000000001)
			{
				return c;
			}

			// default
			// http://www.cs.princeton.edu/courses/archive/spring02/cs493/lec7.pdf
			return (float)Math.Pow(0.6185, int.MaxValue / capacity);
		}

		/// <summary>
		/// Hashes a string using Bob Jenkin's "One At A Time" method from Dr. Dobbs (http://burtleburtle.net/bob/hash/doobs.html).
		/// Runtime is suggested to be 9x+9, where x = input.Length. 
		/// </summary>
		/// <param name="input">The string to hash.</param>
		/// <returns>The hashed result.</returns>
		private static uint HashString(string s)
		{
			uint hash = 0;

			for (var i = 0; i < s.Length; i++)
			{
				hash += s[i];
				hash += (hash << 10);
				hash ^= (hash >> 6);
			}

			hash += (hash << 3);
			hash ^= (hash >> 11);
			hash += (hash << 15);
			return hash;
		}

		public static uint JavascriptHashString(string str)
		{
			uint hash = 5381;
			var i = str.Length;
			while (i > 0)
				hash = (hash * 33) ^ str[--i];
			return hash;
		}

		private int TrueBits()
		{
			int output = 0;
			foreach (bool bit in this._hashBits)
			{
				if (bit == true)
				{
					output++;
				}
			}

			return output;
		}

		/// <summary>
		/// Performs Dillinger and Manolios double hashing. 
		/// </summary>
		/// <param name="primaryHash"> The primary hash. </param>
		/// <param name="secondaryHash"> The secondary hash. </param>
		/// <param name="i"> The i. </param>
		/// <returns> The <see cref="int"/>. </returns>
		private int ComputeHash(ulong primaryHash, ulong secondaryHash, ulong i)
		{
			var resultingHash = (primaryHash + (i * secondaryHash)) % _hashBitsCount;
			return (int)resultingHash;
		}
	}
}