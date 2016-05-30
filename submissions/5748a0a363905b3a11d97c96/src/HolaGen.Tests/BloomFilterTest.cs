using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using NUnit.Framework;

namespace HolaGen.Tests
{
	public class BloomFilterTest
	{
		[Test]
		public void TestResult()
		{
			TestSerialize();

			var bloom = BloomFilter.Deserialize("C:/temp/bloom.txt", 1);
			var data = File.ReadAllLines("c:/temp/ID025-false-positives.txt");

			var score = data
				.Select(word => bloom.test(ProcessWord(word)))
				.Where(r => !r)
				.Count();

			var percent = score * 100 / (double)data.Count();
			Console.WriteLine(Math.Round(percent, 2) + "%");

			var dictData = File.ReadAllLines("c:/temp/words.txt");
			var dictScore = dictData
				.Select(word => bloom.test(ProcessWord(word)))
				.Where(r => r)
				.Count();

			var dictPercent = dictScore * 100 / (double)dictData.Count();
			Console.WriteLine(Math.Round(dictPercent, 2) + "%");
		}

		private string ProcessWord(string word)
		{
			return word.Substring(0, Math.Min(word.Length, 6));
		}

		public void TestSerialize()
		{
			var size = 32 * 1024;
			var filter = new BloomFilter(size * 8, 1);
			var words = File.ReadAllLines("c:/temp/words.txt");

			foreach (var word in words)
			{
				filter.add(ProcessWord(word));
			}

			BloomFilter.Serialize(filter, "C:/temp/bloom.txt");
		}
	}
}
