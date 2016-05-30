using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HolaChallenge
{
	public class SubstCalc
	{
		private readonly JsonSerializerMaster jsonSerializer;
		private readonly string dir;
		private readonly List<SubstReplaceCommand> replaceCommands;

		private readonly Dictionary<bool, Func<string, string, bool>> checkAffixFuncs =
			new Dictionary<bool, Func<string, string, bool>>
			{
				{ true, (w, a) => w.StartsWith(a) },
				{ false, (w, a) => w.EndsWith(a) },
			};

		public SubstCalc(JsonSerializerMaster jsonSerializer, string dir)
		{
			this.jsonSerializer = jsonSerializer;
			this.dir = dir;
			replaceCommands = new List<SubstReplaceCommand>();
		}

		public List<SubstReplaceCommand> Commands => replaceCommands;

		public void AddCommand(Dictionary<string, string> replaceMap, bool isPrefixNotSuffix)
		{
			replaceCommands.Add(new SubstReplaceCommand
			{
				ReplaceMap = replaceMap,
				IsPrefixNotSuffix = isPrefixNotSuffix,
				Affixes = replaceMap.Keys.ToArray(),
			});
		}

		public string[] ReplaceByCommands(string[] words)
		{
			foreach (var command in replaceCommands)
			{
				var check = checkAffixFuncs[command.IsPrefixNotSuffix];
				words = words.Where(w => !command.Affixes.Any(a => check(w, a))).ToArray();
			}

			return words;
		}

		public string SubstituteWordByCommands(string word)
		{
			foreach (var command in replaceCommands)
			{
				var check = checkAffixFuncs[command.IsPrefixNotSuffix];

				var affixIndex = command.Affixes.FirstIndexOf(a => check(word, a));
				if (affixIndex >= 0)
				{
					var affixFrom = command.Affixes[affixIndex];
					var affixTo = command.ReplaceMap[affixFrom];
					word = command.IsPrefixNotSuffix
						? (word = affixTo + word.Substring(affixFrom.Length))
						: (word.Substring(0, word.Length - affixFrom.Length) + affixTo);
				}
			}

			return word;
		}

		public Dictionary<string, string> GetFirstPopularSuffixReplaces()
		{
			// created with:
			// const int minLenRemaining = 3;
			// const int minRatio = 5;
			// const int minPopularSuffixesCount = 1000;

			return new Dictionary<string, string>
			{
				{ "rs", "r"},  // Ok 10434, fail 231, r 45.17
				{ "ns", "n"},  // Ok 9834, fail 361, r 27.24
				{ "ts", "t"},  // Ok 8908, fail 142, r 62.73
				{ "as", "a"},  // Ok 4128, fail 659, r 6.26
				{ "ms", "m"},  // Ok 4051, fail 61, r 66.41
				{ "gs", "g"},  // Ok 3966, fail 82, r 48.37
				{ "ls", "l"},  // Ok 3487, fail 71, r 49.11
				{ "ds", "d"},  // Ok 3426, fail 100, r 34.26
				{ "ks", "k"},  // Ok 2056, fail 87, r 23.63
				{ "ps", "p"},  // Ok 1383, fail 143, r 9.67
				{ "cs", "c"},  // Ok 1315, fail 184, r 7.15
				{ "hs", "h"},  // Ok 1307, fail 17, r 76.88
				{ "ies", "y"},  // Ok 8303, fail 450, r 18.45
				{ "tes", "te"},  // Ok 3626, fail 354, r 10.24
				{ "est", "er"},  // Ok 2477, fail 280, r 8.85
				{ "les", "le"},  // Ok 2124, fail 402, r 5.28
				{ "nes", "ne"},  // Ok 2034, fail 255, r 7.98
				{ "ier", "y"},  // Ok 1909, fail 358, r 5.33
				{ "ely", "e"},  // Ok 2022, fail 82, r 24.66
				{ "gly", "g"},  // Ok 1809, fail 49, r 36.92
				{ "sly", "s"},  // Ok 1583, fail 16, r 98.94
				{ "ces", "ce"},  // Ok 1409, fail 174, r 8.10
				{ "res", "re"},  // Ok 1328, fail 172, r 7.72
				{ "hes", "h"},  // Ok 1221, fail 191, r 6.39
				{ "bly", "ble"},  // Ok 1322, fail 39, r 33.90
				{ "dly", "d"},  // Ok 1185, fail 43, r 27.56
				{ "tly", "t"},  // Ok 1114, fail 39, r 28.56
				{ "men", "man"},  // Ok 972, fail 92, r 10.57
				{ "ful", ""},  // Ok 943, fail 114, r 8.27
				{ "ily", "y"},  // Ok 930, fail 82, r 11.34
				{ "ness", ""},  // Ok 8255, fail 1515, r 5.45
				{ "sses", "ss"},  // Ok 4935, fail 109, r 45.28
				{ "ting", "ted"},  // Ok 3944, fail 633, r 6.23
				{ "sing", "sed"},  // Ok 1972, fail 118, r 16.71
				{ "less", ""},  // Ok 1831, fail 46, r 39.80
				{ "iest", "y"},  // Ok 1684, fail 44, r 38.27
				{ "like", ""},  // Ok 1478, fail 86, r 17.19
				{ "ning", "ned"},  // Ok 1258, fail 192, r 6.55
				{ "ship", ""},  // Ok 1082, fail 43, r 25.16
				{ "ying", "y"},  // Ok 919, fail 124, r 7.41
				{ "cally", "c"},  // Ok 2450, fail 320, r 7.66
				{ "ingly", "ed"},  // Ok 1545, fail 251, r 6.16
				{ "ility", "le"},  // Ok 1451, fail 196, r 7.40
				{ "ising", "ise"},  // Ok 1197, fail 58, r 20.64
				{ "ering", "er"},  // Ok 864, fail 157, r 5.50
				{ "usness", "usly"},  // Ok 1030, fail 117, r 8.80
				{ "enesses", "e"},  // Ok 1145, fail 9, r 127.22
			};
		}

		public Dictionary<string, string> GetAffixReplaceMap(string[] words, string fileName, double minRatio)
		{
			var items = jsonSerializer.Deserialize<SubstData[]>(File.ReadAllText(Path.Combine(dir, fileName)));

			items = items
				.Where(i => i.Ok >= i.Fail * minRatio)
				.GroupBy(i => i.SuffixFrom).Select(gr =>
				{
					var sameFromItems = gr.ToArray();
					if (sameFromItems.Length == 1) return sameFromItems[0];

					var bestByCount = sameFromItems.BestElementByCompare((x, y) => (x.Ok > y.Ok) || (x.Ok == y.Ok && x.Fail < y.Fail));

					if (bestByCount.Fail > sameFromItems.Min(i => i.Fail))
						throw new InvalidOperationException(jsonSerializer.SerializeUserFriendly(sameFromItems));

					return bestByCount;
				}).ToArray();

			var totalLen = items.Length + items.Sum(i => i.SuffixFrom.Length + i.SuffixTo.Length);
			Console.WriteLine($"{fileName}, min ratio {minRatio}, loaded {items.Length} affixes to replace, length {totalLen}");

			//foreach (var item in items)
			//	Console.WriteLine(item);

			return items.ToDictionary(i => i.SuffixFrom, i => i.SuffixTo);
		}

		public void CalcSuffixSubstitutions(string[] words)
		{
			CalcAffixSubstitutions(words, false, (w, al) => w.Substring(0, w.Length - al), (w, al) => w.Substring(w.Length - al, al));
		}

		public void CalcPrefixSubstitutions(string[] words)
		{
			CalcAffixSubstitutions(words, true, (w, al) => w.Substring(al), (w, al) => w.Substring(0, al));
		}

		public void CalcAffixSubstitutions(string[] words, bool isPrefixNotSuffix, Func<string, int, string> toBase, Func<string, int, string> toAffix)
		{
			var wordsHash = new HashSet<string>(words);

			const int minLenRemaining = 1;
			const int minRatio = 2;
			const int minPopularAffixesCount = 30;

			var affixesDict = new Dictionary<string, string[]>();

			for (var len = 1; len <= 12; len++)
			{
				var groups = words.Where(w => w.Length - len >= minLenRemaining)
					.GroupBy(w => toAffix(w, len))
					.Select(gr => new { affix = gr.Key, words = gr.ToArray() })
					.Where(a => a.words.Length >= minPopularAffixesCount)
					.OrderByDescending(a => a.words.Length)
					.ToDictionary(a => a.affix, a => a.words);

				foreach (var a in groups)
					affixesDict.Add(a.Key, a.Value);
			}

			var affixes = affixesDict.Keys.ToArray();
			var affixSubsts = new Pairs<string, string>();
			var result = new List<SubstData>();
			var name = isPrefixNotSuffix ? "prefix" : "suffix";

			for (var i = 0; i < affixes.Length; i++)
			{
				for (var j = 0; j < affixes.Length; j++)
				{
					var affixFrom = affixes[i];
					var affixTo = i == j ? "" : affixes[j];

					if (affixTo.Length > affixFrom.Length) continue;

					var substOk = 0;
					var substFail = 0;

					foreach (var wordFrom in affixesDict[affixFrom])
					{
						var subWord = toBase(wordFrom, affixFrom.Length);

						var wordTo = isPrefixNotSuffix
							? (affixTo + subWord)
							: (subWord + affixTo);

						if (wordsHash.Contains(wordTo))
							substOk++;
						else
							substFail++;
					}

					if (substOk >= substFail * minRatio)
					{
						var cutLen = Math.Min(affixFrom.Length, affixTo.Length);
						var isOk = true;
						for (var c = 1; c <= cutLen; c++)
						{
							var aFrom = isPrefixNotSuffix ? affixFrom.Substring(0, affixFrom.Length - c) : affixFrom.Substring(c);
							var aTo = isPrefixNotSuffix ? affixTo.Substring(0, affixTo.Length - c) : affixTo.Substring(c);

							if (affixSubsts.ContainsKey(aFrom) && affixSubsts.GetValuesByKey(aFrom).Any(v => v == aTo))
							{
								//Console.WriteLine($"// Skip because exist: {aFrom} -> {aTo}");
								isOk = false;
								break;
							}
						}
						if (isOk)
						{
							affixSubsts.Add(affixFrom, affixTo);
							var okRatio = ((double)substOk / substFail).ToString("0.00");
							Console.WriteLine($"{name} subst: {{\"{affixFrom}\", \"{affixTo}\"}},  // Ok {substOk}, fail {substFail}, r {okRatio}");
							result.Add(new SubstData
							{
								SuffixFrom = affixFrom,
								SuffixTo = affixTo,
								Ok = substOk,
								Fail = substFail,
							});
						}
					}
				}
			}

			File.WriteAllText(Path.Combine(dir, $"{name}.json"), jsonSerializer.SerializeUserFriendly(result));
		}

		public Dictionary<string, string> GetPrefixReplaceMap(string[] words)
		{
			return new Dictionary<string, string>
			{
				{ "non", ""},  // Ok 6276, fail 221, r 28.40
				{ "uns", "s"},  // Ok 1947, fail 108, r 18.03
				{ "out", ""},  // Ok 1833, fail 98, r 18.70
				{ "unp", "p"},  // Ok 1237, fail 81, r 15.27
				{ "unr", "r"},  // Ok 937, fail 70, r 13.39
				{ "over", ""},  // Ok 3595, fail 255, r 14.10
				{ "semi", ""},  // Ok 1299, fail 78, r 16.65
				{ "unco", "co"},  // Ok 731, fail 65, r 11.25
				{ "fore", ""},  // Ok 619, fail 55, r 11.25
				{ "super", ""},  // Ok 1547, fail 150, r 10.31
				{ "under", ""},  // Ok 1319, fail 47, r 28.06
			};
		}
	}

	public class SubstData
	{
		public string SuffixFrom;
		public string SuffixTo;
		public int Ok;
		public int Fail;

		public override string ToString()
		{
			return $"Subst {SuffixFrom} -> {SuffixTo}, ok {Ok}, fail {Fail}, ratio {(double)Ok / Fail}";
		}
	}

	public class SubstReplaceCommand
	{
		public Dictionary<string, string> ReplaceMap;
		public string[] Affixes;
		public bool IsPrefixNotSuffix;
	}
}
