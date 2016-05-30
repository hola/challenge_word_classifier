using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;
using CsvHelper;
using CsvHelper.Configuration;
using Newtonsoft.Json;
using NUnit.Framework;

namespace HolaGen.Tests
{
    public class Tests
    {
		[Test]
		[Timeout(Int16.MaxValue)]
		public void ExploreData()
		{
			//var samples = DataGenerator.GetSamples(2, false, false, 2);

			//Console.WriteLine("existing pairs: " + samples.Count);

			//Console.WriteLine("possible pairs: " + (28 * 28));

			//var letters = Enumerable.Range(0, 26)
			//	.Select(i => (char)(i + 'a'))
			//	.Concat(new[] { '\'', '$' });

			// var combinations =
			//	from x in letters
			//	from y in letters
			//	select new String(new[] { x, y });

			//foreach (var c in combinations)
			//{
			//	if (!samples.ContainsKey(c))
			//	{
			//		samples.Add(c, 0);
			//	}
			//}

			//// Dump(samples.OrderBy(s => s.Value));

			//var path = @"c:\temp\words-2letters-frequency.csv";
			//using (var file = File.OpenWrite(path))
			//using (var textWriter = new StreamWriter(file))
			//{
			//	var config = new CsvConfiguration { Delimiter = ";", CultureInfo = CultureInfo.CreateSpecificCulture("fr-BE") };
			//	var writer = new CsvWriter(textWriter, config);

			//	writer.WriteHeader(new
			//	{
			//		Sample = default(string),
			//		Freq = default(int)
			//	}
			//	.GetType());

			//	foreach (var sample in samples.OrderByDescending(s => s.Value))
			//	{
			//		writer.WriteRecord(new
			//		{
			//			Sample = sample.Key,
			//			Freq = sample.Value,
			//		});
			//	}
			//}

			//var samples = DataGenerator.GetSamples(1, false, false, 1);

			//var letters = Enumerable.Range(0, 26)
			//	.Select(i => (char)(i + 'a'))
			//	.Concat(new[] { '\'' });

			//var path = @"c:\temp\words-1letters-frequency.txt";

			//using (var file = File.OpenWrite(path))
			//using (var textWriter = new StreamWriter(file))
			//{
			//	var config = new CsvConfiguration { Delimiter = ";", CultureInfo = CultureInfo.CreateSpecificCulture("fr-BE") };
			//	var writer = new CsvWriter(textWriter, config);

			//	writer.WriteHeader(new
			//	{
			//		Sample = default(string),
			//		Freq = default(int)
			//	}
			//	.GetType());

			//	foreach (var sample in samples.OrderByDescending(s => s.Value))
			//	{
			//		writer.WriteRecord(new
			//		{
			//			Sample = sample.Key,
			//			Freq = sample.Value,
			//		});
			//	}
			//}

			// BeginEndWord();


		}

		private void BeginEndWord()
		{
			var fpSamples = GetWords()
				.Where(w => w.Length > 1)
				.Select(w => w.First() + SampleSplitter.ANCHOR_STR + w.Last())
				.ToArray();

			var fpFreqSamples = fpSamples
				.GroupBy(s => s)
				.ToDictionary(g => g.Key, g => g.Count());

			var total = fpFreqSamples.Values.Sum();

			// Dump(samples.OrderBy(s => s.Value));

			var path = @"c:\temp\words-beginend-frequency.csv";
			using (var file = File.OpenWrite(path))
			using (var textWriter = new StreamWriter(file))
			{
				var config = new CsvConfiguration { Delimiter = ";", CultureInfo = CultureInfo.CreateSpecificCulture("fr-BE") };
				var writer = new CsvWriter(textWriter, config);

				writer.WriteHeader(new
				{
					Sample = default(string),
					Freq = default(int),
					Percent = default(double),
				}
				.GetType());

				foreach (var sample in fpFreqSamples
					.OrderByDescending(s => s.Value)
					.ThenBy(s => s.Key))
				{
					writer.WriteRecord(new
					{
						Sample = sample.Key,
						Freq = sample.Value,
						Percent = sample.Value / (double)total * 100,
					});
				}
			}
		}

		private static IEnumerable<string> GetWords()
		{
			return File.ReadLines(@"c:\temp\words.txt")
				//.Where(w => !SampleSplitter.PreExcludeValue(w))
				//.Distinct()
				.ToArray();
		}

		private static IEnumerable<string> GetWordsTC()
		{
			return File.ReadLines(@"c:\temp\words-testcases.txt")
				//.Where(w => !SampleSplitter.PreExcludeValue(w))
				//.Distinct()
				.ToArray();
		}

		private static IEnumerable<string> GetFalsePositives()
		{
			return File.ReadLines(@"C:\temp\false-positives.txt")
				//.Where(w => !SampleSplitter.PreExcludeValue(w))
				//.Distinct()
				.ToArray();
		}

		private void Dump(object obj)
		{
			Console.WriteLine(JsonConvert.SerializeObject(obj, Formatting.Indented));
		}

		[Test]
		public void WordsLength()
		{
			var words = GetWords().ToArray();
			var path = @"c:\temp\words-length-frequency.csv";
			OutputLengthFreq(words, path, "DICT");

			var words2 = GetFalsePositives().ToArray();
			OutputLengthFreq(words2, path, "FP", true);
		}

		[Test]
		public void WordsByLength()
		{
			var words = GetWords().ToArray();
			var path = @"c:\temp\words-bylength-frequency.csv";
			OutputByLength(words, path, "DICT");
		}

		private static void OutputLengthFreq(string[] words, string path, string type, bool append = false)
		{
			var groups = words
				.GroupBy(s => s.Length)
				.ToDictionary(g => g.Key, g => g.Count());

			var total = groups.Values.Sum();

			// Dump(samples.OrderBy(s => s.Value));

			using (var file = File.OpenWrite(path))
			using (var textWriter = new StreamWriter(file))
			{
				if (append) file.Seek(0, SeekOrigin.End);

				var config = new CsvConfiguration { Delimiter = ";", CultureInfo = CultureInfo.CreateSpecificCulture("fr-BE") };
				var writer = new CsvWriter(textWriter, config);

				writer.WriteHeader(new
				{
					Length = default(string),
					Freq = default(int),
					Percent = default(double),
					Type = default(string),
				}
				.GetType());

				foreach (var group in groups
					.OrderBy(s => s.Key))
				{
					writer.WriteRecord(new
					{
						Length = group.Key,
						Freq = group.Value,
						Percent = group.Value / (double)total * 100,
						Type = type,
					});
				}
			}
		}

		private static void OutputByLength(string[] words, string path, string type, bool append = false)
		{
			var data = words
				.Distinct()
				.OrderBy(s => s.Length)
				.ThenBy(s => s, StringComparer.Ordinal);

			using (var file = File.OpenWrite(path))
			using (var textWriter = new StreamWriter(file))
			{
				if (append) file.Seek(0, SeekOrigin.End);

				foreach (var line in data)
				{
					textWriter.WriteLine(line);
				}
			}
		}

		[Test]
		public void Output3LettersWords()
		{
			var words = GetWords()
				.Select(w => w.EndsWith("'s") ? w.Substring(0, w.Length - 2) : w)
				.Where(w => w.Length == 3)
				.Distinct();

			using (var file = File.OpenWrite(@"c:\temp\words-3letters.txt"))
			using (var writer = new StreamWriter(file, Encoding.ASCII))
			{
				WriteSameSizeLines(words, writer);
			}
		}

		private static void WriteSameSizeLines(IEnumerable<string> data, TextWriter writer)
		{
			var prev = default(string);
			foreach (var line in data)
			{
				if (prev == null)
				{
					writer.Write(line);
					writer.Write("\n");
				}
				else
				{
					var written = false;
					for (var index = line.Length - 1; index >= 0 && !written; index--)
					{
						if (prev.Substring(0, index) == line.Substring(0, index))
						{
							writer.Write(line.Substring(index));
							writer.Write("\n");
							written = true;
						}
					}
				}

				prev = line;
			}
			writer.Write("\n");
		}

		[Test]
		public void TestcaseWords()
		{
			var testcases = @"C:\Users\guill_000\Documents\Visual Studio 2013\Projects\HolaGen\testcases";
			var files = Directory.GetFiles(testcases);

			var testcaseWords = files
				.Select(File.ReadAllText)
				.Select(JsonConvert.DeserializeObject<Dictionary<string, bool>>)
				.SelectMany(dict => dict)
				.Select(kv => kv.Key)
				.ToArray();

			using (var file = File.OpenWrite(@"c:\temp\words-testcases.txt"))
			using (var writer = new StreamWriter(file, Encoding.ASCII))
			{
				foreach (var word in testcaseWords.OrderBy(w => w, StringComparer.Ordinal))
				{
					writer.WriteLine(word);
				}
			}
		}

		[Test]
		public void WordsLengthOUTPUT()
		{
			var words = GetWords();
			var wordsTC = GetWordsTC();

			var lengths = Enumerable.Range(1, 50);
			using (var file = File.OpenWrite(@"c:\temp\words-length.csv"))
			using (var writer = new StreamWriter(file, Encoding.ASCII))
			{
				writer.WriteLine("Length;Dict;Tests");
				foreach (var length in lengths)
				{
					var wordsLength = words.Where(w => w.Length == length).Count();
					var wordsTCLength = wordsTC.Where(w => w.Length == length).Count();
					writer.WriteLine("{0};{1};{2}", length, wordsLength, wordsTCLength);
				}
			}
		}

		[Test]
		public void WordsPrefixesOUTPUT()
		{
			var words = GetWords();
			var wordsTC = GetWordsTC();

			var data = Enumerable.Range(2, 4)
				.Select(length =>
					words
					.Where(word => word.Length > length)
					.Select(word => word.Substring(0, length))
					.GroupBy(w => w)
					.Select(g => new { Prefix = g.Key, Count = g.Count() })
					.OrderByDescending(p => p.Count)
					.Take(10)
				);

			using (var file = File.OpenWrite(@"c:\temp\words-prefixes.csv"))
			using (var writer = new StreamWriter(file, Encoding.ASCII))
			{
				writer.WriteLine("Prefix;Count");
				foreach (var length in data)
				{
					foreach (var prefix in length)
					{
						writer.WriteLine("{0};{1}", prefix.Prefix, prefix.Count);
					}
				}
			}
		}

		private static IEnumerable<string> GetWordsPreExcluded()
		{
			return File.ReadLines(@"c:\temp\words.txt")
				.Where(w => !SampleSplitter.PreExcludeValue(w))
				// .Distinct()
				.ToArray();
		}

		[Test]
		public void OutputMostFreq2Letters()
		{
			var samples = GetWordsPreExcluded()
				.Select(w => w.Substring(0, Math.Min(6, w.Length)))
				.SelectMany(w => SampleSplitter.SplitSamples(w, 2))
				.ToArray()
				.GroupBy(s => s)
				.Select(s => new { Sample = s.Key, Count = s.Count() })
				.ToArray()
				.OrderByDescending(s => s.Count)
				//.Take(26)
				.Take(96)
				.ToArray();

			Dump(samples.Select(s => s.Sample));
		}

		[Test]
		public void Output()
		{
			var line = File.ReadAllLines(@"C:\temp\ID315-false-positives.txt");
			var data = line.GroupBy(l => l)
				.OrderByDescending(g => g.Count())
				.Select(g => new { Word = g.Key, Count = g.Count() })
				.Take(100)
				.ToArray();

			Dump(data);
		}

		[Test]
		public void FPsByFrequency()
		{
			var id = "509";

			var lines = File.ReadAllLines(@"C:\Users\guill_000\Documents\Visual Studio 2013\Projects\HolaGen\temp\ID" + id + "-false-positives.txt")
				.GroupBy(w => w)
				.Select(g => new { word = g.Key, count = g.Count() })
				.OrderByDescending(x => x.count)
				.ToArray();

			var total = lines.Sum(x => x.count);

			File.WriteAllLines(@"C:\temp\ID" + id + "-false-positives-byfreq.txt", lines
				.Select(x => x.count + " " + x.word));

			//var limit = total / 100;
			//var data = lines
			//	.TakeWhile(l => (limit -= l.count) > 0)
			//	.Select(l => l.word)
			//	.OrderBy(l => l);

			//using (var file = File.OpenWrite(@"C:\temp\ID" + id + "-false-positives-1pc.txt"))
			//using (var writer = new StreamWriter(file))
			//{
			//	writer.Write(String.Join("0", data));
			//	// foreach (var d in data) writer.WriteLine(d);
			//	// WriteSameSizeLines(data, writer);
			//}
		}

		//[Test]
		//public void TrueWordsByFrequency()
		//{
		//	var lines = DataGenerator.TrueWordsByFrequency.Value.Select(t => t.ToString());
		//	File.WriteAllLines(@"C:\temp\true-words-by-freq.txt", lines);
		//}

		[Test]
		[Timeout(Int16.MaxValue)]
		public void RegexFinder()
		{
			var fakes = DataGenerator.FakeWords.Value
				.Where(w => !SampleSplitter.PreExcludeValue(w))
				.ToArray();

			var words = GetWords()
				.Where(w => !SampleSplitter.PreExcludeValue(w))
				.ToArray();

			var path = @"c:/temp/hc-regex-bruteforce.txt";
			// File.Create(path).Dispose();
			var lines = File.ReadAllLines(path).ToList();
			var done = lines
				.Select(line => line.Split(';')[0])
				.ToList();

			//lines = done
			//	.Select(pattern => EvalRegex(fakes, words, pattern))
			//	.ToList();

			var random = new Random();
			var i = 16;
			var newLines = Enumerable.Range(0, i)
				.AsParallel()
				.Select(_ =>
				{
					var pattern = GetRandomPattern(done, random);
					var result = EvalRegex(fakes, words, pattern);
					return result;
				})
				.ToArray();

			lines.AddRange(newLines);

			lines = lines
				.Select(line => line.Split(';'))
				.Select(line => new
				{
					p = String.Join(";", line),
					fakeRatio = double.Parse(line[1].Slice(0, -1)),
					wordRatio = double.Parse(line[2].Slice(0, -1)),
					boost = double.Parse(line[3].Slice(0, -1)),
					diffRatio = double.Parse(line[4].Slice(0, -1)),
				})
				.OrderByDescending(x => x.diffRatio * Math.Max(x.boost - 0.7, 0))
				.Select(x => x.p)
				.ToList();

			File.WriteAllLines(path, lines);
		}

		private static string EvalRegex(string[] fakes, string[] words, string pattern)
		{
			var regex = new Regex(pattern, RegexOptions.Compiled);
			var ratioFakes = fakes.Where(w => regex.IsMatch(w)).Count() / (double)fakes.Count() * 100;
			var ratioWords = words.Where(w => regex.IsMatch(w)).Count() / (double)words.Count() * 100;
			var diffRatio = ratioFakes - ratioWords;
			var fakeBoost = ratioFakes / (ratioFakes + ratioWords);

			var result = String.Format("{0};{1:0.000}%;{2:0.000}%;{3:0.00}x;{4:0.000}%", pattern, ratioFakes, ratioWords, fakeBoost, diffRatio);
			Console.WriteLine(result);
			return result;
		}

		private string GetRandomPattern(List<string> done, Random random)
		{
			var voyels = new[] { "a", "e", "y", "u", "i", "o" };
			var consonnants = new[] { "z", "r", "t", "p", "q", "s", "d", "f", "g", "h", "j", "k", "l", "m", "w", "x", "c", "v", "b", "n" };
			var pattern = "";
			while (pattern == "" || done.Contains(pattern))
			{
				var length = random.Next(4) + 2;
				var count = random.Next(11) + 2;
				var letters = Enumerable.Range(0, count)
					.Select(i => 
						{
							var v = random.Next(7) == 0;
							if (v)
							{
								return voyels[random.Next(voyels.Length)];
							}
							else
							{
								return consonnants[random.Next(consonnants.Length)];
							}
						})
					.Distinct()
					.ToArray();

				pattern = "[" + String.Concat(letters) + "]{" + length + "}";
			}
			done.Add(pattern);
			return pattern;
		}

		[Test]
		[Timeout(Int32.MaxValue)]
		public void TestEvalRegex()
		{
			var fakes = DataGenerator.FakeWords.Value
				// .Where(w => !SampleSplitter.PreExcludeValue(w))
				.ToArray();

			var words = GetWords()
				// .Where(w => !SampleSplitter.PreExcludeValue(w))
				.ToArray();

			var l = "abcdefghijklmnopqrstuvwxyz";
			var c = "bcdfghjklmnpqrstvwxz";
			var y = "aeiouy";
			// [zywxjkqhv]{3};0,753%;0,083%;0,90x;0,670%
			// [fhjkqvwxyz]{3};0,985%;0,118%;0,89x;0,867%
			// [fghjkqvwxyz]{3};1,350%;0,278%;0,83x;1,073%
			// [fhjkmqvwxyz]{3};1,429%;0,360%;0,80x;1,070%
			// [fhjknqvwxyz]{3};1,516%;0,479%;0,76x;1,037%

			foreach (var length in Enumerable.Range(1, 25))
			{
				var result = EvalRegex(fakes, words, @"^.{" + length + "}$");
			}

			//var icon = new NotifyIcon();
			//icon.ShowBalloonTip(1000, "Regex finder", result, ToolTipIcon.Info);
			//icon.Visible = true;
		}
    }
}
