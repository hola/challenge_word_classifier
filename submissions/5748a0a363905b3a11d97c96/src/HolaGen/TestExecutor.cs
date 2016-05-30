using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HolaGen
{
	public class TestExecutor
	{
		public static Lazy<IEnumerable<Tuple<string, IEnumerable<KeyValuePair<string, bool>>>>> TestCases = new Lazy<IEnumerable<Tuple<string,IEnumerable<KeyValuePair<string,bool>>>>>(GetTestCases);

		private static IEnumerable<Tuple<string,IEnumerable<KeyValuePair<string,bool>>>> GetTestCases()
		{
			var testCases = Directory.GetFiles(Settings.TestCasesPath)
				.OrderBy(f => f);

			return testCases
				.Select(testCase => Tuple.Create(
					testCase, 
					JsonConvert.DeserializeObject<Dictionary<string, bool>>(File.ReadAllText(testCase))
						.AsEnumerable()))
				.ToArray();
		}

		public TestResult Test(GenerationParameters generationParameters, string dataTxtPath, string dataBinPath)
		{
			using (new Timer("TestExecutor.Test"))
			{
				var serializer = new DataSerializer();
				var data = serializer.Deserialize(generationParameters, dataTxtPath, dataBinPath);
				return Test(data);
			}
		}

		public TestResult Test(GeneratedData data)
		{
			//Console.WriteLine(new 
			//{
			//	samples = data.ExcludedSamples_2.Count,
			//	pairs = data.ExcludedPairs_2.Count,
			//});

			var generationParameters = data.Parameters;

			var scores = new List<int>();
			var falsePositives = new List<string>();
			var totalTruePositiveCount = 0;
			var totalTrueNegativeCount = 0;
			var totalFalsePositiveCount = 0;
			var totalFalseNegativeCount = 0;
			var matchCounter = new MatchCounter();

			// var results = new List<string>();

			var testCases = TestCases.Value;
			foreach (var testCase in testCases)
			{
				var score = 0;
				// Console.WriteLine("Testing {0}", sample);
				var testData = testCase.Item2;
				foreach (var value in testData)
				{
					var word = value.Key;
					var expected = value.Value;

					//word = "aq's";
					//expected = testData[word];

					var result = Match(
						data, 
						word,
						generationParameters,
						matchCounter);

					var success = result == expected;

					// results.Add(String.Format("{0} - {1} - {2}\n", word, result, success).ToLowerInvariant());

					if (success)
					{
						score++;
						if (result)
						{
							totalTruePositiveCount++;
						}
						else
						{
							totalTrueNegativeCount++;
						}
					}
					else
					{
						if (result)
						{
							falsePositives.Add(value.Key);
							totalFalsePositiveCount++;
						}
						else
						{
							totalFalseNegativeCount++;
						}
					}
				}

				// Console.WriteLine("score: {0}", score);
				scores.Add(score);
			}

			// File.WriteAllText(String.Format("c:/temp/results-dotnet-{0}.txt", data.Parameters.Id), String.Concat(results));

			return new TestResult
			{
				FalsePositives = falsePositives,
				AvgPreExclusionMatches = matchCounter.PreExclusion / (double)testCases.Count(),
				AvgSampleExclusion1Matches = matchCounter.SampleExclusion_1 / (double)testCases.Count(),
				AvgSampleExclusion2Matches = matchCounter.SampleExclusion_2 / (double)testCases.Count(),
				AvgSampleExclusion3Matches = matchCounter.SampleExclusion_3 / (double)testCases.Count(),
				AvgPairExclusionMatches = matchCounter.PairExclusion / (double)testCases.Count(),
				AvgPairExclusion2Matches = matchCounter.PairExclusion2 / (double)testCases.Count(),
				AvgBloomFilterMatches = matchCounter.BloomFilter / (double)testCases.Count(),
				AvgFalsePositives = totalFalsePositiveCount / (double)testCases.Count(),
				AvgFalseNegatives = totalFalseNegativeCount / (double)testCases.Count(),
				AvgTruePositives = totalTruePositiveCount / (double)testCases.Count(),
				AvgTrueNegatives = totalTrueNegativeCount / (double)testCases.Count(),
				MinScore = scores.Min(),
				MaxScore = scores.Max(),
				StdDevScore = scores.Select(score => (double)score).StdDev(),
				AvgScore = scores.Average(),
			};
		}

		public static bool Match(GeneratedData data, string value, GenerationParameters parameters, MatchCounter counter, bool skipBloomFilter = false)
		{
			if (SampleSplitter.PreExcludeValue(value))
			{
				// if (!skipBloomFilter) Console.WriteLine("preex: " + value);
				counter.PreExclusion++;
				return false;
			}

			if (!MatchSampleExclusion(value, data.ExcludedSamples_1, parameters.SampleExclusion_1))
			{
				counter.SampleExclusion_1++;
				return false;
			}

			if (!MatchSampleExclusion(value, data.ExcludedSamples_2, parameters.SampleExclusion_2))
			{
				// if (!skipBloomFilter) Console.WriteLine("se: " + value);
				counter.SampleExclusion_2++;
				return false;
			}

			if (!MatchSampleExclusion(value, data.ExcludedSamples_3, parameters.SampleExclusion_3))
			{
				counter.SampleExclusion_3++;
				return false;
			}

			if (!MatchPairExclusion(value, data.ExcludedPairs_1, parameters.PairExclusion_1))
			{
				counter.PairExclusion++;
				return false;
			}

			if (!MatchPairExclusion(value, data.ExcludedPairs_2, parameters.PairExclusion_2))
			{
				//if (!skipBloomFilter) Console.WriteLine("pe: " + value);
				counter.PairExclusion2++;
				return false;
			}

			if (!skipBloomFilter && !MatchBloomFilter(value, data.BloomFilter, data.Parameters.BloomFilter))
			{
				// if (!skipBloomFilter) Console.WriteLine("bf: " + value);
				counter.BloomFilter++;
				return false;
			}

			// if (!skipBloomFilter) Console.WriteLine("pass: " + value);

			return true;
		}

		private static bool MatchBloomFilter(string word, BloomFilter filter, BloomFilterParameters parameters)
		{
			if (parameters.Disabled) return true;

			var processed = DataGenerator.ProcessWordForBloomFilter(parameters, word);
			// Console.WriteLine("processed: " + processed);
			return filter.test(processed);
		}

		public static bool MatchPairExclusion(string value, Dictionary<string, HashSet<string>> data, PairExclusionParameters parameters)
		{
			if (parameters.Disabled) return true;

			var wordSamples = SampleSplitter.SplitSamples(value,
				parameters.SampleSize,
				parameters.BeginAnchor,
				parameters.EndAnchor,
				parameters.GetMinWordSize(),
				parameters.StartIndex);

			var linePairs =
				from x in wordSamples //.Select((s, i) => new { s, i })
				from y in wordSamples //.Select((s, i) => new { s, i })
				where x.CompareTo(y) < 0
				select Tuple.Create(x, y);
			//where x.i < y.i
			//select Tuple.Create(x.s, y.s);

			foreach (var linePair in linePairs)
			{
				var excludedItem2s = default(HashSet<string>);
				if (data.TryGetValue(linePair.Item1, out excludedItem2s))
				{
					if (excludedItem2s.Contains(linePair.Item2)) return false;
				}
			}

			return true;
		}

		private static bool MatchSampleExclusion(string value, HashSet<string> data, SampleExclusionParameters parameters)
		{
			if (parameters.Disabled) return true;

			var exclusionParameters = parameters;
			var wordSamples = SampleSplitter.SplitSamples(value,
				exclusionParameters.SampleSize,
				exclusionParameters.BeginAnchor,
				exclusionParameters.EndAnchor,
				exclusionParameters.GetMinWordSize(),
				exclusionParameters.StartIndex,
				exclusionParameters.Length);

			foreach (var sample in wordSamples)
			{
				if (data.Contains(sample)) return false;
			}

			return true;
		}

		public class MatchCounter
		{
			public int PreExclusion { get; set; }
			public int SampleExclusion_1 { get; set; }
			public int SampleExclusion_2 { get; set; }
			public int SampleExclusion_3 { get; set; }
			public int PairExclusion { get; set; }
			public int PairExclusion2 { get; set; }
			public int BloomFilter { get; set; }
		}
	}
}
