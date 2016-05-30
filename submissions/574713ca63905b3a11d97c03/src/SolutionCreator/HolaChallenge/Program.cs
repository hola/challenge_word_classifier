using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HolaChallenge
{
	class Program
	{
		private static JsonSerializerMaster jsonSerializer;

		private static string[] originalWords;
		private static string[] originalNotWords;

		private static string[] words;
		private static string[] notWords;
		private static WordFeatureRow[] wordFeatures;
		private static SubstCalc substCalc;
		private static InfixCalc infixCalc;
		private static LettersCount lettersCount;
		private static SolutionCreator solutionCreator;

		const string dir = @"D:\Develop\holachallenge";
		public const string Alphabet = "'abcdefghijklmnopqrstuvwxyz";
		private static int mainBloomLength = 61600;

		// Сохранить тесты с сайта
		// HolaWeb.SaveTests(9000, @"D:\Develop\holachallenge\js\testcases");

		// Создать файл всех используемых в фильтре слов
		// File.WriteAllLines(Path.Combine(dir, "words_out.txt"), wordFeatures.Select(f => f.Word).ToArray());

		public static void Main()
		{
			try
			{
				jsonSerializer = new JsonSerializerMaster();
				infixCalc = new InfixCalc(jsonSerializer, dir);

				originalWords = File.ReadAllLines(Path.Combine(dir, "words_uniq.txt"));
				originalNotWords = File.ReadAllLines(Path.Combine(dir, "notwords_uniq.txt"));

                words = originalWords.Where(w => !w.EndsWith("'s")).ToArray();

				substCalc = new SubstCalc(jsonSerializer, dir);
				lettersCount = new LettersCount(jsonSerializer);
				solutionCreator = new SolutionCreator(dir, substCalc);

				//substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "suffix first.json", 6), false);
				//substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "prefix first.json", 7), true);
				//substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "suffix second.json", 6), false);
				//substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "prefix second.json", 7), false);
				//substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "suffix third.json", 6), false); // 4.8 по "ing"->"ed"
				//words = substCalc.ReplaceByCommands(words);

				substCalc.AddCommand(substCalc.GetFirstPopularSuffixReplaces(), false);
				substCalc.AddCommand(substCalc.GetPrefixReplaceMap(words), true);
				substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "trash\\suffix second 3 5 50.json", 5), false);
				substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "trash\\prefix second 3 5 50.json", 6), true);
				substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "trash\\suffix third.json", 5), false);
				substCalc.AddCommand(substCalc.GetAffixReplaceMap(words, "trash\\prefix third.json", 6), true);
				words = substCalc.ReplaceByCommands(words);

				mainBloomLength = 61450;

				Func<WordFeatureRow, bool> isWord =
					w => w.Length <= 14
					&& w.VowInRow <= 3
					&& w.ConsInRow <= 4
					&& w.Word.Count(c => c == '\'') <= 1;
				wordFeatures = WordFeatureRow.Convert(words).Where(isWord).ToArray();

				ApostropheEnd_C2_LetterPositions_BloomPrefix_Func_Bloom(isWord);
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex);
			}
		}

		private static void ApostropheEnd_C2_LetterPositions_BloomPrefix_Func_Bloom(Func<WordFeatureRow, bool> isWord_Word)
		{
			const int infixFreqsThreshold = 15;

			// Вычитание невозможных (и маловероятных) подстрок из 2х символов
			var notWordsC2strings = infixCalc.CalcInfixFreqs(wordFeatures, infixFreqsThreshold);
			solutionCreator.NotWordsC2strings = notWordsC2strings;

			// Вычитание невозможных символов на конкретных позициях
			var notPresentLetters = Enumerable.Range(0, wordFeatures.Max(f => f.Length))
				.Select(i => wordFeatures.Where(f => f.Word.Length > i).Select(f => f.Word[i]).Distinct().ToArray())
				.Select(a => new string(Alphabet.Except(a).ToArray()))
				.ToArray();

			for (var i = 0; i < notPresentLetters.Length; i++)
				if (notPresentLetters[i].Length > 0)
					Console.WriteLine($"On position {i} can't use letters {notPresentLetters[i]}");

			// Блюм фильтр возможных подстрок
			var substrBloomStarts = new[] { 0 };
			var substrBloomCutLength = new[] { 3 };
			var substrBloomMinLength = new[] { 4 };
			var substrBlooms = Enumerable.Range(0, substrBloomStarts.Length)
				.Select(i =>
				{
					var start = substrBloomStarts[i];
					var minLength = substrBloomMinLength[i];
					var cutLength = substrBloomCutLength[i];
					var substrBloom = new BloomFilter(1000 * 8, 1);
					var substrs = wordFeatures.Where(f => f.Length >= minLength)
						.Select(f => start < 0 ? f.Word.Substring(f.Word.Length - cutLength, cutLength) : f.Word.Substring(start, cutLength))
						.Distinct().ToArray();
					foreach (var substr in substrs)
						substrBloom.Add(substr);
					substrBloom.ShowInfo();
					return substrBloom;
				}).ToArray();
			solutionCreator.PrefixFilter = substrBlooms[0];

			ApostropheEnd_Func_Bloom(
				isWord_Word, 
				w =>
				{
					if (w.C2Parts.Any(c2 => notWordsC2strings.Contains(c2))) return false;

					var word = w.Word;

					for (var i = 0; i < word.Length; i++)
						if (notPresentLetters[i].Contains(word[i]))
							return false;

					for (var i = 0; i < substrBloomStarts.Length; i++)
					{
						var start = substrBloomStarts[i];
						var minLength = substrBloomMinLength[i];
						var cutLength = substrBloomCutLength[i];
						if (word.Length >= minLength
							&& !substrBlooms[i].Contains(start < 0 ? word.Substring(word.Length - cutLength, cutLength) : word.Substring(start, cutLength)))
							return false;
					}

					return true;
				},
				mainBloomLength * 8);
		}

		private static void ApostropheEnd_Func_Bloom(Func<WordFeatureRow, bool> isWord_Word, Func<WordFeatureRow, bool> isUnknown_Word, int bloomFilterSize)
		{
			var n = 0;
			var filter = new BloomFilter(bloomFilterSize, 1);
			//var filter = new ArrayBloomFilter(6000, 60000 * 8, 2);
			foreach (var feature in wordFeatures)
			{
				filter.Add(feature.Word);
				n++;
			}

			filter.ShowInfo();

			solutionCreator.WriteData(filter);

			var negativeStats = new WeightedSet<string>();

			CalcErrors(word =>
			{
				var w = GetApostropheEndBase(word);

				w = substCalc.SubstituteWordByCommands(w);

				if (!filter.Contains(w)) { negativeStats.Increment("!filter.Contains", 1); return false; }

				var feature = new WordFeatureRow(w);
				if (!isWord_Word(feature)) { negativeStats.Increment("!isWord_Word", 1); return false; }
				if (!isUnknown_Word(feature)) { negativeStats.Increment("!isUnknown_Word", 1); return false; }

				return true;
			});

			Console.WriteLine("Negative stats:");
			foreach (var kvp in negativeStats)
				Console.WriteLine(new { reason = kvp.Key, count = kvp.Value });

			Console.WriteLine();
		}

		private static void BloomAndApostropheS()
		{
			Console.WriteLine("Bloom and 's trick");

			var filter = new BloomFilter(60000 * 8, 1);
			var n = 0;

			foreach (var s in words)
				if (!s.EndsWith("'s"))
				{
					filter.Add(s);
					n++;
				}

			Console.WriteLine($"Bloom filter contains {n} words");

			CalcErrors(w => w.EndsWith("'s") ? filter.Contains(w.Substring(0, w.Length - 2)) : filter.Contains(w) );
		}

		private static void BloomTrivial()
		{
			Console.WriteLine("Bloom trivial");

			var filter = new BloomFilter(60000 * 8, 1);
			foreach (var s in words)
				filter.Add(s);

			CalcErrors(filter.Contains);
		}

		private static void CalcErrors(Func<string, bool> check)
		{
			var errors = 0;
			foreach (var notWord in originalNotWords)
				if (check(notWord))
					errors++;

			var falsePositive = (double)errors / originalNotWords.Length;

			errors = 0;
			foreach (var word in originalWords)
				if (!check(word))
					errors++;

			var falseNegative = (double)errors / originalWords.Length;

			Console.WriteLine($"False Negative: {falseNegative.ToString("0.#####")}. " +
				$"False Positive: {falsePositive.ToString("0.#####")}. " +
				$"Score: {(1 - falsePositive / 2 - falseNegative / 2).ToString("0.#####")}");
		}

		private static PartStat[] LoadStatsCount(string file)
		{
			var json = File.ReadAllText(Path.Combine(dir, file));
			return jsonSerializer.Deserialize<PartStat[]>(json);
		}

		private static void SaveC3StatsCount()
		{
			var c2strings = Alphabet.SelectMany(c => Alphabet.Select(cc => c.ToString() + cc).ToArray()).ToArray();
			var c3strings = Alphabet.SelectMany(c => c2strings.Select(cc => c + cc)).ToArray();

			var c3stats = c3strings.Select(c3 =>
			{
				Console.WriteLine(c3);
				return new PartStat { Part = c3, Count = CountOfWordsContaining(words, c3) };
			}).ToArray();

			File.WriteAllText(Path.Combine(dir, "c3.json"), jsonSerializer.SerializeUserFriendly(c3stats));
		}

		private static void SaveC2StatsCount()
		{
			var c2strings = Alphabet.SelectMany(c => Alphabet.Select(cc => c.ToString() + cc).ToArray()).ToArray();
			var c2stats = c2strings.Select(c2 => new PartStat { Part = c2, Count = CountOfWordsContaining(words, c2) }).ToArray();

			File.WriteAllText(Path.Combine(dir, "c2.json"), jsonSerializer.SerializeUserFriendly(c2stats));
		}

		private static int CountOfWordsContaining(string[] words, string part)
		{
			var cnt = 0;
			for (var i = 0; i < words.Length; i++)
				if (words[i].Contains(part))
					cnt++;
			return cnt;
		}

		private static void ShowWordsStat()
		{
			Console.WriteLine($"Words: {words.Length}, not words {notWords.Length}");
		}

		private static void ResearchCombinatorics()
		{
			var wordsHash = new HashSet<string>(words);

			for (var len = 1; len <= 4; len++)
			{
				var notWords = Alphabet.CartesianPower(len).Where(w => !wordsHash.Contains(w)).ToArray();
				var wordsLen = words.Count(w => w.Length == len);
				Console.WriteLine($"Len {len}, words {wordsLen}, not words in cartesian power {notWords.Length}");
			}
		}

		private static void CalcApostropheSTrickStats()
		{
			var withBase = 0;
			var noBase = 0;
			var wordsSet = new HashSet<string>(words);
			foreach (var word in words)
				if (word.EndsWith("'s"))
				{
					var cut = word.Substring(0, word.Length - 2);
					if (wordsSet.Contains(cut))
						withBase++;
					else
					{
						Console.WriteLine(word);
						noBase++;
					}
				}
			Console.WriteLine(new { withBase, noBase });
		}

		private static void CalcAffixStrippingStats()
		{
			var withBase = 0;
			var noBase = 0;
			var wordsSet = new HashSet<string>(words);
			foreach (var word in words)
				if (word.StartsWith("re") && word.Length > 2)
				{
					var cut = "in" + word.Substring(2);
					if (wordsSet.Contains(cut))
						withBase++;
					else
					{
						Console.WriteLine(word);
						noBase++;
					}
				}
			Console.WriteLine(new { withBase, noBase });
		}

		private static string GetApostropheEndBase(string w)
		{
			return w.EndsWith("'s") ? w.Substring(0, w.Length - 2) : w;
		}

		private static void ResearchC3()
		{
			const int maxStart = 15;
			for (var spread = 3; spread <= 10; spread++)
			{
				for (var start = 0; start < maxStart - spread; start++)
				{
					var parts = new HashSet<string>();
					var wordsCount = 0;

					foreach (var word in words)
						if (word.Length >= start + spread)
						{
							wordsCount++;
							parts.Add(word.Substring(start, spread));
						}

					var ratio = (double)parts.Count / wordsCount;
					Console.WriteLine($"spread {spread}, start {start}, parts {parts.Count}, words {wordsCount}, ratio {ratio.ToString("0.####")}");
				}
				Console.WriteLine();
			}
		}

		private static void ResearchNotExistingC3OnStart()
		{
			for (var len = 5; len <= 10; len++)
			{
				var c3parts = words.Where(w => w.Length >= len).SelectMany(w =>
				{
					var arr = new string[len - 2];
					for (var i = 2; i < len; i++)
						arr[i - 2] = w[i - 2].ToString() + w[i - 1] + w[i];
					return arr;
				}).ToArray();

				var notExistingC3s = Alphabet.CartesianPower(3).Except(c3parts).ToArray();

				Console.WriteLine(new { len, c3exist = c3parts.Length, c3notExist = notExistingC3s.Length });
			}
		}
	}
}
