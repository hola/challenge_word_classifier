using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public class BloomFilter
	{
		public int[] buckets;
		private int[] _locations;
		public int m;
		public int k;

		public int[] _weights;
		public List<int[]> _positions;
		public int _totalWeight;

		// Creates a new bloom filter.  If *m* is an array-like object, with a length
		// property, then the bloom filter is loaded with data from the array, where
		// each element is a 32-bit integer.  Otherwise, *m* should specify the
		// number of bits.  Note that *m* is rounded up to the nearest multiple of
		// 32.  *k* specifies the number of hashing functions.
		public BloomFilter(int m, int k) : this(m, null, k) { }

		public BloomFilter(int[] a, int k) : this(0, a, k) { }

		public BloomFilter(int m, int[] a, int k)
		{
			if (a != null)
			{
				m = a.Length * 32;
			}

			var n = m / 32;
			var i = -1;
			this.m = m = n * 32;
			this.k = k;


			var buckets = this.buckets = new int[n];
			if (a != null) while (++i < n) buckets[i] = a[i];
			else while (++i < n) buckets[i] = 0;
			this._locations = new int[k];
			this._weights = new int[m];
			this._positions = new List<int[]>(DataGenerator.Words.Value.Count());
		}

		// See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
		private int[] locations(string v)
		{
			var k = this.k;
			var m = this.m;
			var r = this._locations;
			var a = fnv_1a(v);
			var b = fnv_1a_b(a);
			var x = a % m;
			for (var i = 0; i < k; ++i)
			{
				r[i] = x < 0 ? (x + m) : x;
				x = (int)(((long)x + (long)b) % (long)m);
			}
			return r;
		}

		public void add(string v, int weight = 1)
		{
			var l = this.locations(v);
			var k = this.k;
			var buckets = this.buckets;
			for (var i = 0; i < k; ++i)
			{
				buckets[l[i] / 32] |= 1 << (l[i] % 32);
				this._weights[l[i]] += weight;
			}

			this._totalWeight += (weight * k);
			this._positions.Add(l.ToArray());
		}

		public bool test(string v)
		{
			var l = this.locations(v);
			var k = this.k;
			var buckets = this.buckets;
			for (var i = 0; i < k; ++i)
			{
				var b = l[i];
				if ((buckets[b / 32] & (1 << (b % 32))) == 0)
				{
					return false;
				}
			}
			return true;
		}

		//// Estimated cardinality.
		//private double size()
		//{
		//	var buckets = this.buckets;
		//	var bits = 0;
		//	var n = buckets.Length;
		//	for (var i = 0; i < n; ++i) bits += popcnt(buckets[i]);
		//	return -this.m * Math.Log(1 - bits / this.m) / this.k;
		//}

		// http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
		private int popcnt(int v)
		{
			v -= (v >> 1) & 0x55555555;
			v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
			return ((v + (v >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
		}

		// Fowler/Noll/Vo hashing.
		private int fnv_1a(string v)
		{
			var a = 2166136261;
			var n = v.Length;
			for (var i = 0; i < n; ++i)
			{
				var c = (int)v[i];
				var d = c & 0xff00;
				if (d != 0) a = (UInt32)fnv_multiply((int)(a ^ d >> 8));
				a = (UInt32)fnv_multiply((int)(a ^ c & 0xff));
			}
			return fnv_mix((int)a);
		}

		// a * 16777619 mod 2**32
		private int fnv_multiply(int a)
		{
			return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
		}

		// One additional iteration of FNV, given a hash.
		private int fnv_1a_b(int a)
		{
			return fnv_mix(fnv_multiply(a));
		}

		// See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
		private int fnv_mix(int a)
		{
			a += a << 13;
			// a ^= a >>> 7;
			var x = (uint)a >> 7;
			a ^= (int)x;
			a += a << 3;
			//a ^= a >>> 17;
			var y = (uint)a >> 17;
			a ^= (int)y;
			a += a << 5;
			return (int)(a & 0xffffffff);
		}

		public static void Serialize(BloomFilter filter, string path)
		{
			if (File.Exists(path)) File.Delete(path);

			using (var file = File.OpenWrite(path))
			using (var writer = new BinaryWriter(file))
			{
				foreach (var bucket in filter.buckets)
				{
					writer.Write(bucket);
				}
			}
		}

		public static BloomFilter Deserialize(string path, int k)
		{
			var size = new FileInfo(path).Length;
			var bucketCount = size / 4;
			var buckets = new List<int>();

			using (var file = File.OpenRead(path))
			using (var reader = new BinaryReader(file))
			{
				while (bucketCount > 0)
				{
					buckets.Add(reader.ReadInt32());
					bucketCount--;
				}
			}

			return new BloomFilter(buckets.ToArray(), k);
		}

		public void retouch(string v, int maxWeight)
		{
			var l = this.locations(v);
			var k = this.k;
			var buckets = this.buckets;

			var lMin = l.OrderBy(p => this._weights[p]).First();
			var wMin = this._weights[lMin];
			if (wMin > maxWeight) return;

			buckets[lMin / 32] &= ~(1 << (lMin % 32));
			this._weights[lMin] = 0;

			if (k > 1)
			{
				var positions = FindPositions(lMin);
				for (var i = positions.Count - 1; i >= 0; i--)
				{
					var position = positions[i];
					for (var j = this.k - 1; j >= 0; j--)
					{
						var p = position[j];
						if (p == lMin) continue;
						if (this._weights[p] == 0) continue;
						if (this._weights[p] == 1)
						{
							buckets[p / 32] &= ~(1 << (p % 32));
							this._weights[p] = 0;
						}
						else
						{
							this._weights[p]--;
						}
					}
				}
			}
		}

		private List<int[]> FindPositions(int l)
		{
			var positions = new List<int[]>();
			for (var j = this._positions.Count - 1; j >= 0; j--)
			{
				var position = this._positions[j];
				for (var i = this.k - 1; i >= 0 ; i--)
				{
					if (position[i] == l)
					{
						positions.Add(position);
						break;
					}
				}
			}
			return positions;
		}

		internal void retouch(BloomFilter fpFilter, double minRatio)
		{
			var margin = 0.5 / (double)this._totalWeight;

			for (var i = 0; i < m; i++)
			{
				if (this._weights[i] == 0) continue;
				if (fpFilter._weights[i] == 0) continue;

				var thisWeight = this._weights[i] / (double)this._totalWeight;
				var fpWeight = fpFilter._weights[i] / (double)fpFilter._totalWeight;

				if ((fpWeight + margin) >= minRatio * thisWeight)
				{
					buckets[(int)Math.Floor(i / (double)32)] &= ~(1 << (i % 32));
				}
			}
		}
	}
}
