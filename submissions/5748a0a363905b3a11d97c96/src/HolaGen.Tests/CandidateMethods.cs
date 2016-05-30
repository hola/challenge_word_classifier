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
	public class CandidateMethods
	{
		#region Common

		public static IEnumerable<string> GetWords()
		{
			return File.ReadLines(@"c:\temp\words.txt")
				.Where(w => !SampleSplitter.PreExcludeValue(w))
				// .Distinct(StringComparer.Ordinal)
				.ToArray();
		}

		public static IEnumerable<string> GetFalsePositives()
		{
			return File.ReadLines(@"C:\temp\ID160-false-positives.txt")
				.Where(w => !SampleSplitter.PreExcludeValue(w))
				// .Distinct(StringComparer.Ordinal)
				.ToArray();
		}

		private void Dump(object obj)
		{
			Console.WriteLine(JsonConvert.SerializeObject(obj, Formatting.Indented));
		}

		#endregion

		[Test]
		public void TestMethod1()
		{
			var data = GenerateMethod1();

			var totalWords = (double)GetWords()
				.Where(fp => fp.Length > 2)
				.Count();

			var fps = GetFalsePositives().ToArray();
			var totalFPs = (double)fps.Count();
			var pfData = fps
				.Where(fp => fp.Length > 2)
				.GroupBy(fp => fp.Length)
				.ToDictionary(
					g => g.Key, 
					g => g
						.Select(GetMethod1Tuple)
						.GroupBy(t => t)
						.ToDictionary(g2 => g2.Key, g2 => g2.Count())
				);

			var data2 = new
			{
				Length = default(int),
				MinP = default(int),
				MaxP = default(int),
				WordFreq = default(double),
				FPFreq = default(double),
				DeltaFreq = default(double),
				NormalizedDeltaFreq = default(double),
			}
			.Yield()
			.ToList();

			foreach (var length in data.Keys)
			{
				var dataLength = data[length];
				var fpDataLength = pfData.ContainsKey(length) ? pfData[length] : new Dictionary<Tuple<int, int>, int>();
				foreach (var kv in dataLength)
				{
					var percentTrue = kv.Value / totalWords * 100;
					var fpCount = fpDataLength.ContainsKey(kv.Key) ? fpDataLength[kv.Key] : 0;
					var percentFps = fpCount / totalFPs * 100;
					var percentDiff = percentFps - percentTrue;
					data2.Add(new
					{
						Length = length,
						MinP = kv.Key.Item1,
						MaxP = kv.Key.Item2,
						WordFreq = percentTrue,
						FPFreq = percentFps,
						DeltaFreq = percentDiff,
						NormalizedDeltaFreq = percentDiff / (percentTrue + percentFps),
					});

					// Console.WriteLine("{0} - W: {1:0.000} - FP: {2:0.000} - DELTA: {3:0.000}", kv.Key, percentTrue, percentFps, percentDiff);
				}
			}

			var cutData2 = data2
				.Where(d => d.DeltaFreq > 0)
				.OrderByDescending(d => d.DeltaFreq)
				.Take(100)
				.ToArray();

			var groupSizes = cutData2
				.GroupBy(d => d.Length)
				.ToDictionary(d => d.Key, d => new 
				{ 
					Count = d.Count(), 
					Ratio = d.Count() / (double)(d.Key * d.Key),
					FalseNegatives = d.Sum(x => x.WordFreq),
					FalseNegativesForLength = d.Sum(x => x.WordFreq) / (data[d.Key].Sum(x => x.Value) / totalWords),
				});

			Dump(cutData2);
			Dump(cutData2.Length);
			Dump(cutData2.Sum(d => d.DeltaFreq));

			Dump(groupSizes.OrderBy(d => d.Key));
		}

		private Dictionary<int, SortedDictionary<Tuple<int, int>, int>> GenerateMethod1()
		{
			var words = GetWords().ToArray();
			var data = new Dictionary<int, SortedDictionary<Tuple<int, int>, int>>();

			foreach (var word in words)
			{
				var length = word.Length;
				if (length < 3) continue;

				if (!data.ContainsKey(length))
				{
					data.Add(length, new SortedDictionary<Tuple<int, int>, int>());
				}

				var tuple = GetMethod1Tuple(word);

				if (!data[length].ContainsKey(tuple))
				{
					data[length].Add(tuple, 1);
				}
				else
				{
					data[length][tuple]++;
				}
			}

			return data;
		}

		private static Tuple<int, int> GetMethod1Tuple(string word)
		{
			var minLetterPosition = word
							.Select((c, i) => new { c, i })
							.OrderBy(x => x.c)
							.ThenBy(x => x.i)
							.Take(1)
							.Select(x => x.i)
							.Single();

			var maxLetterPosition = word
				.Select((c, i) => new { c, i })
				.OrderByDescending(x => x.c)
				.ThenByDescending(x => x.i)
				.Take(1)
				.Select(x => x.i)
				.Single();

			var tuple = Tuple.Create(minLetterPosition, maxLetterPosition);
			return tuple;
		}

		[Test]
		public void RejectedOneLetterWords()
		{
			var words = GetWords()
				.Where(w => w.Length == 2)
				.Distinct()
				.ToArray();

			var letters = Enumerable.Range(0, 26)
				.Select(i => ((char)(i + 'a')).ToString());

			var possibleWords = 
				from l1 in letters
				from l2 in letters
				select l1 + l2;

			var excludedWords = possibleWords
				.Where(w => !words.Contains(w))
				.ToArray();

			Dump(excludedWords);
			Dump(excludedWords.Count());
			//Dump(26*26);
		}
	}
}
