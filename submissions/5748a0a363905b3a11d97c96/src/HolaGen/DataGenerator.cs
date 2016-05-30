using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HolaGen
{
	/*
	 * A faire:
	 * - 
	 * - Lors du retouch, si k>1 retoucher aussi les autres bits (devrait réduire les faux positifs)
	 *   il faut tenir une liste des ensembles de positions et réduire de 1 le poid de chaque bit correspondant
	 *   si le poid d'une position descend à 0, il faut aussi clearer ce bit
	 * - tester avec plus de retouches (et ensuite fitter précisément)
	 * 
	 * A essayer:
	 * - augmenter k et m et ensuite fitter (essayer jusqu'à 8), +k = meilleure compression
	 * - inverser le BF et la SE (seulement utile si BF retouché)
	 * - mix char order avant sample exclusion ($salut$ -> s$latu$ par exemple)
	 */
	public class DataGenerator
	{
		public static Lazy<IEnumerable<string>> Words = new Lazy<IEnumerable<string>>(GetWords);

		private static IEnumerable<string> GetWords()
		{
			return File.ReadLines(Settings.WordsPath)
				.Where(w => !SampleSplitter.PreExcludeValue(w))
				//.Distinct()
				.ToArray();
		}

		public static Lazy<IEnumerable<string>> FakeWords = new Lazy<IEnumerable<string>>(GetFakeWords);

		private static IEnumerable<string> GetFakeWords()
		{
			return Directory.GetFiles(Settings.AllTestCasesPath)
				.OrderBy(f => f)
				.Select(File.ReadAllText)
				.SelectMany(JsonConvert.DeserializeObject<Dictionary<string, bool>>)
				.Where(kv => !kv.Value)
				.Select(kv => kv.Key)
				.ToArray();
		}

		public static Lazy<IEnumerable<Tuple<string, int>>> FakeWordsByFrequency = new Lazy<IEnumerable<Tuple<string, int>>>(() => 
			FakeWords.Value
			.GroupBy(w => w)
			.Select(g => Tuple.Create(g.Key, g.Count()))
			.OrderByDescending(t => t.Item2)
			.ToArray());

		public GeneratedData Generate(GenerationParameters generationParameters)
		{
			using (new Timer("DataGenerator.Generate"))
			{
				var excludedSamples1 = GetExcludedSamples(generationParameters.SampleExclusion_1);
				var excludedSamples2 = GetExcludedSamples(generationParameters.SampleExclusion_2);
				var excludedSamples3 = GetExcludedSamples(generationParameters.SampleExclusion_3);

				var excludedPairs1 = GetExcludedPairs(generationParameters.PairExclusion_1);
				var excludedPairs2 = GetExcludedPairs(generationParameters.PairExclusion_2);

				var data = new GeneratedData
				{
					Parameters = generationParameters,
					ExcludedSamples_1 = excludedSamples1,
					ExcludedSamples_2 = excludedSamples2,
					ExcludedSamples_3 = excludedSamples3,
					ExcludedPairs_1 = excludedPairs1,
					ExcludedPairs_2 = excludedPairs2,
				};

				RemoveRedundantData(data);
			
				BuildBloomFilter(generationParameters.BloomFilter, data);

				return data;
			}
		}

		private void BuildBloomFilter(BloomFilterParameters parameters, GeneratedData data)
		{
			if (parameters.Disabled) return;

			using (new Timer("DataGenerator.BuildBloomFilter"))
			{
				var filter = new BloomFilter(parameters.FilterSizeBytes * 8, parameters.HashFunctionsCount);
				var counter = new TestExecutor.MatchCounter();
				foreach (var word in Words.Value)
				{
					// if (word.Length < 3) continue;
					if (!TestExecutor.Match(data, word, data.Parameters, counter, skipBloomFilter: true)) continue;

					var processed = ProcessWordForBloomFilter(parameters, word);
					filter.add(processed);
				}

				data.BloomFilter = filter;

				using (new Timer("DataGenerator.BuildBloomFilter[retouch]"))
				{
					if (parameters.RetouchWordCount > 0)
					{
						var retouched = FakeWordsByFrequency.Value
							.Where(t => t.Item2 > 2)
							.Where(t => TestExecutor.Match(data, t.Item1, data.Parameters, counter))
							.Take(parameters.RetouchWordCount.Value)
							.ToArray();

						foreach (var tuple in retouched)
						{
							var word = tuple.Item1;
							var processed = ProcessWordForBloomFilter(parameters, word);
							filter.retouch(processed, parameters.RetouchMaxWeight ?? 0);
						}

						// WriteRetouched(data.Parameters.Id.Value, retouched);
					}
					else if (parameters.RetouchMinRelWeight != null)
					{
						var falsePositives = FakeWordsByFrequency.Value
							.Where(t => t.Item2 > 2)
							.Where(t => TestExecutor.Match(data, t.Item1, data.Parameters, counter))
							.ToArray();

						var falsePositivesBF = new BloomFilter(filter.m, filter.k);
						foreach (var fp in falsePositives)
						{
							var processed = ProcessWordForBloomFilter(parameters, fp.Item1);
							falsePositivesBF.add(processed, fp.Item2);
						}

						filter.retouch(falsePositivesBF, parameters.RetouchMinRelWeight.Value);
					}
				}
			}
		}

		//private void WriteRetouched(int id, Tuple<string, int>[] retouched)
		//{
		//	var path = Path.Combine(Settings.TempFolder, String.Format("{0:000}-retouched.txt", id));
		//	if (File.Exists(path)) File.Delete(path);
		//	File.WriteAllLines(path, retouched.Select(r => String.Format("{0} {1}", r.Item1, r.Item2)));
		//}

		public static string ProcessWordForBloomFilter(BloomFilterParameters parameters, string word)
		{
			var processed = word;
			processed = SubstituteMostCommonSequences(processed, parameters.SubstitutionCount);
			if (parameters.SubstringStartIndex != null)
			{
				processed = SampleSplitter.PreSampleForBFValue(processed);
				var length = Math.Min(parameters.SubstringLength.Value, processed.Length);
				processed = processed.Substring(0, length);
			}
			if (parameters.CharOffset != null)
			{
				processed = new String(processed
					.Select(c => (char)(c - 'a' + parameters.CharOffset.Value))
					.ToArray());
			}
			return processed;
		}

		private static string SubstituteMostCommonSequences(string processed, int? substitutionCount)
		{
			if (substitutionCount == null) return processed;

			var mostCommonSeqs = new[] 
			{
#region Common samples
				"er",
				"in",
				"re",
				"an",
				"ar",
				"on",
				"ra",
				"ro",
				"en",
				"ri",
				"un",
				"co",
				"st",
				"te",
				"al",
				"le",
				"li",
				"la",
				"or",
				"is",
				"ch",
				"ma",
				"el",
				"at",
				"de",
				"ti",
				"nt",
				"no",
				"tr",
				"es",
				"ca",
				"ta",
				"he",
				"pe",
				"di",
				"ha",
				"ne",
				"to",
				"ol",
				"ac",
				"lo",
				"as",
				"se",
				"mi",
				"th",
				"ic",
				"et",
				"pr",
				"me",
				"ni",
				"nd",
				"il",
				"ho",
				"pa",
				"ll",
				"it",
				"na",
				"am",
				"ur",
				"mo",
				"ve",
				"po",
				"os",
				"om",
				"ea",
				"hi",
				"ec",
				"em",
				"ph",
				"ot",
				"ou",
				"si",
				"ba",
				"op",
				"be",
				"su",
				"sa",
				"ul",
				"ad",
				"oc",
				"sh",
				"pi",
				"sc",
				"ns",
				"nc",
				"ed",
				"ng",
				"ap",
				"so",
				"sp",
				"cr",
				"ge",
				"ut",
				"ga",
				"do",
				"ie"
#endregion
			}
			.Take(substitutionCount.Value)
			.ToArray();

			for (var i = 0; i < mostCommonSeqs.Length; i++)
			{
				var seq = mostCommonSeqs[i];
				var replacement = ((char)i).ToString();
				processed = processed.Replace(seq, replacement);
			}

			return processed;
		}

		private Dictionary<string, HashSet<string>> GetExcludedPairs(PairExclusionParameters parameters)
		{
			if (parameters.Disabled) return new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);

			var sampleSize = parameters.SampleSize;
			var topSampleLimit = parameters.TopSamplesLimit > 0 ? parameters.TopSamplesLimit : Int16.MaxValue;
			var maxCount = parameters.MaxCount;
			var totalLimit = parameters.TotalLimit;

			var excludedSampleCandidates = GetSamples(
				sampleSize, 
				parameters.BeginAnchor, 
				parameters.EndAnchor, 
				parameters.GetMinWordSize(), 
				parameters.StartIndex);

			var topExclusionSamples = new HashSet<string>(
				excludedSampleCandidates
					.OrderByDescending(kv => kv.Value)
					.ThenBy(kv => kv.Key, StringComparer.Ordinal)
					.Select(kv => kv.Key)
					.Take(topSampleLimit),
				StringComparer.Ordinal);

			var exclusionLastIdx = sampleSize - 1;
			var allPairs =
				from x in topExclusionSamples
				from y in topExclusionSamples
				where String.CompareOrdinal(x, y) < 0
				where
					((x[0] != SampleSplitter.ANCHOR && y[0] != SampleSplitter.ANCHOR) 
						|| ((x[0] == SampleSplitter.ANCHOR) != (y[0] == SampleSplitter.ANCHOR))) // 2 begin samples not possible
					&& ((x[exclusionLastIdx] != SampleSplitter.ANCHOR && y[exclusionLastIdx] != SampleSplitter.ANCHOR)
					|| ((x[exclusionLastIdx] == SampleSplitter.ANCHOR) != (y[exclusionLastIdx] == SampleSplitter.ANCHOR))) // 2 end samples not possible
				select x + y;

			var pairResults = allPairs
				.ToDictionary(c => c, c => 0, StringComparer.Ordinal);

			foreach (var line in Words.Value)
			{
				var lineExclusionSamples = SampleSplitter.SplitSamples(
					line, 
					sampleSize, 
					parameters.BeginAnchor, 
					parameters.EndAnchor, 
					parameters.GetMinWordSize(), 
					parameters.StartIndex);
				var lineTopSamples = new List<string>();
				foreach (var sample in lineExclusionSamples)
				{
					if (topExclusionSamples.Contains(sample))
					{
						lineTopSamples.Add(sample);
					}
				}

				var lineTopPairs =
					from x in lineTopSamples //.Select((s, i) => new { s, i })
					from y in lineTopSamples //.Select((s, i) => new { s, i })
					where String.CompareOrdinal(x, y) < 0
					select x + y;
				//where x.i < y.i
				//select x.s + y.s;

				foreach (var linePair in lineTopPairs)
				{
					if (pairResults.ContainsKey(linePair)) // Could have been excluded by ExcludeWithPreviousPairs
					{
						pairResults[linePair]++;
					}
				}
			}

			var exludedPairs = pairResults
				.Where(r => r.Value <= maxCount)
				.OrderByDescending(r => r.Value)
				.ThenBy(r => r.Key, StringComparer.Ordinal)
				.Select(r => r.Key)
				.ToArray();

			if (totalLimit != 0)
			{
				if (totalLimit > exludedPairs.Length)
				{
					Console.WriteLine("ExclusionTotalLimit ({0}) > exludedPairs.Length ({1}), you can increase ExclusionTopSampleLimit or ExclusionMaxCount",
						totalLimit, exludedPairs.Length);
				}
				else if (totalLimit < exludedPairs.Length)
				{
					Console.WriteLine("ExclusionTotalLimit ({0}) < exludedPairs.Length ({1}), croping data",
						totalLimit, exludedPairs.Length);
					exludedPairs = exludedPairs.Take(totalLimit).ToArray();
				}
				else
				{
					Console.WriteLine("ExclusionTotalLimit ({0}) = exludedPairs.Length ({1})", totalLimit, exludedPairs.Length);
				}
			}

			return exludedPairs
				.GroupBy(t => t.Substring(0, sampleSize))
				.ToDictionary(g => g.Key, g => new HashSet<string>(
					g.Select(t => t.Substring(sampleSize, sampleSize)),
					StringComparer.Ordinal),
					StringComparer.Ordinal);
		}

		private static HashSet<string> GetExcludedSamples(SampleExclusionParameters parameters)
		{
			if (parameters.Disabled) return new HashSet<string>(StringComparer.Ordinal);

			var existingSamples = GetSamples(
				parameters.SampleSize, 
				parameters.BeginAnchor, 
				parameters.EndAnchor, 
				parameters.GetMinWordSize(), 
				parameters.StartIndex,
				parameters.Length);
			var possibleSamples = GetAllPossibleSamples(parameters.SampleSize, parameters.BeginAnchor, parameters.EndAnchor);

			foreach (var s in possibleSamples)
			{
				if (!existingSamples.ContainsKey(s))
				{
					existingSamples.Add(s, 0);
				}
			}

			var excludedSamples = new HashSet<string>(
				existingSamples
					.Where(d => d.Value <= parameters.MaxCount)
					.Select(kv => kv.Key),
				StringComparer.Ordinal);

			return excludedSamples;
		}

		private static IEnumerable<string> GetAllPossibleSamples(int sampleSize, bool beginAnchor, bool endAnchor)
		{
			var chars = SampleSplitter.GetPossibleChars();
			var charsNoAnchor = chars.Where(c => c != SampleSplitter.ANCHOR);

			var samples = (beginAnchor ? chars : charsNoAnchor).Select(l => l.ToString());
			for (var i = 1; i < sampleSize; i++)
			{
				var possibleChars = (i == (sampleSize - 1) && endAnchor)
					? chars
					: charsNoAnchor;

				samples =
					from s in samples
					from c in possibleChars
					select s + c;
			}

			samples = SampleSplitter.ExcludeImpossibleSamples(samples, sampleSize, beginAnchor, endAnchor);

			return samples;
		}

		public static Dictionary<string, int> GetSamples(int size, bool beginAnchor, bool endAnchor, int minWordSize, int startIndex, int? length = null)
		{
			var samples = new Dictionary<string, int>(StringComparer.Ordinal);
			foreach (var line in Words.Value)
			{
				var word = line;
				var wordSamples = SampleSplitter.SplitSamples(word, size, beginAnchor, endAnchor, minWordSize, startIndex, length);
				foreach (var sample in wordSamples)
				{
					if (samples.ContainsKey(sample)) samples[sample]++;
					else samples[sample] = 1;
				}
			}
			return samples;
		}

		private void RemoveRedundantData(GeneratedData data)
		{
			var excludedSamplesSets = data.GetExcludedSamples()
				.Where(es => es.Count > 0)
				.OrderBy(es => es.First().Length)
				.ToArray();

			// step 1: remove excluded samples already covered by smaller sized excluded samples
			{
				for (var index = 1; index < excludedSamplesSets.Length; index++)
				{
					for (var pIndex = 0; pIndex < index; pIndex++)
					{
						var excludedSamples = excludedSamplesSets[index];
						var alreadyExcludedSamples = excludedSamplesSets[pIndex];
						RemoveRedundantExclusionSamples(excludedSamples, alreadyExcludedSamples);
					}
				}
			}

			//// step 2: remove excluded samples already covered by pairs
			//{

			//	for (var index = 0; index < excludedSamplesSets.Length; index++)
			//	{
			//		var excludedSamples = excludedSamplesSets[index];
			//		var excludedSampleSize = excludedSamples.First().Length;
			//		var excludedPairsSets = data.GetExcludedPairs()
			//			.Where(s => s.Count > 0)
			//			.ToArray();

			//		foreach (var pairExclusion in excludedPairsSets)
			//		{
			//			var pairSampleSize = pairExclusion.First().Key.Length;

			//			if (excludedSampleSize <= pairSampleSize) continue;

			//			foreach (var excludedSample in excludedSamples.ToArray())
			//			{
			//				var lineSamples = SampleSplitter.SplitSamples(excludedSample, pairSampleSize);
			//				var linePairs =
			//					from x in lineSamples //.Select((s, i) => new { s, i })
			//					from y in lineSamples //.Select((s, i) => new { s, i })
			//					where x.CompareTo(y) < 0
			//					select Tuple.Create(x, y);
			//				//where x.i < y.i
			//				//select Tuple.Create(x.s, y.s);

			//				foreach (var linePair in linePairs)
			//				{
			//					var excludedItem2s = default(HashSet<string>);
			//					if (pairExclusion.TryGetValue(linePair.Item1, out excludedItem2s))
			//					{
			//						if (excludedItem2s.Contains(linePair.Item2))
			//						{
			//							excludedSamples.Remove(excludedSample);
			//							break;
			//						}
			//					}
			//				}
			//			}
			//		}
			//	}
			//}

			//// step 3: remove pairs already covered by smaller pairs
			//{
			//	var excludedPairsSets = data.GetExcludedPairs()
			//		.Where(es => es.Count > 0)
			//		.OrderBy(es => es.First().Key.Length)
			//		.ToArray();

			//	for (var index = 1; index < excludedPairsSets.Length; index++)
			//	{
			//		for (var pIndex = 0; pIndex < index; pIndex++)
			//		{
			//			var excludedPairs = excludedPairsSets[index];
			//			var alreadyExcludedPairs = excludedPairsSets[pIndex];
			//			RemoveRedundantExclusionPairs(excludedPairs, alreadyExcludedPairs);
			//		}
			//	}
			//}
		}

		private void RemoveRedundantExclusionPairs(Dictionary<string, HashSet<string>> excluded, Dictionary<string, HashSet<string>> alreadyExcluded)
		{
			var sampleSize = excluded.First().Key.Length;
			var previousSampleSize = alreadyExcluded.First().Key.Length;

			var pairs = 
				from e in excluded
				from y in e.Value
				where String.CompareOrdinal(e.Key, y) < 0
				select Tuple.Create(e.Key, y);

			foreach (var pair in pairs.ToArray())
			{
				var subSamples1 = SampleSplitter.SplitSamples(pair.Item1, previousSampleSize);
				var subSamples2 = SampleSplitter.SplitSamples(pair.Item2, previousSampleSize);

				var itemPairs =
					from x in subSamples1
					from y in subSamples2
					where String.CompareOrdinal(x, y) < 0
					select Tuple.Create(x, y);

				foreach (var ip in itemPairs)
				{
					var excludedItem2s = default(HashSet<string>);
					if (alreadyExcluded.TryGetValue(ip.Item1, out excludedItem2s))
					{
						if (excludedItem2s.Contains(ip.Item2))
						{
							excluded[pair.Item1].Remove(pair.Item2);
							break;
						}
					}
				}
			}

			foreach (var p in excluded.ToArray())
			{
				if (!p.Value.Any())
				{
					excluded.Remove(p.Key);
				}
			}
		}

		private static void RemoveRedundantExclusionSamples(HashSet<string> excluded, HashSet<string> alreadyExcluded)
		{
			var sampleSize = excluded.First().Length;
			var previousSampleSize = alreadyExcluded.First().Length;

			foreach (var sample in excluded.ToArray())
			{
				var subSamples = SampleSplitter.SplitSamples(sample, previousSampleSize);
				foreach (var subSample in subSamples)
				{
					if (alreadyExcluded.Contains(subSample))
					{
						excluded.Remove(sample);
						break;
					}
				}
			}
		}
	}
}
