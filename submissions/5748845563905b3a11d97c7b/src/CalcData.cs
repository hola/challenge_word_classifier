using System.Collections.Generic;
using System.Linq;

namespace HolaContest
{
	public class CalcData
	{
		public CalcData(List<string> dict)
		{
			var syllabes = new Dictionary<string, int>();
			var splittedWords = new List<List<string>>();
			var oneSyllabeWords = new List<string>();
			foreach (var word in dict)
			{
				//if (word.Contains('\''))
				//    continue;

				var splitted = SplitSyllabes(word.ToLower());
				if (splitted.Count == 1)
				{
					oneSyllabeWords.Add(splitted[0]);
					continue;
				}
				splittedWords.Add(splitted);

				foreach (var s in splitted)
				{
					if (syllabes.ContainsKey(s))
					{
						syllabes[s]++;
					}
					else
					{
						syllabes[s] = 1;
					}
				}
			}

			Syllabes = syllabes;
			OneSyllabeWords = oneSyllabeWords;
			SplittedWords = splittedWords;
		}

		public static List<string> SplitSyllabes(string word)
		{
			var result = new List<string>();
			var splitAp = word.Split('\'');
			foreach (var str in splitAp)
			{
				var lastVowelIndex = -1;
				var startIndex = 0;
				for (var i = 0; i < str.Length; i++)
				{
					if (IsVowel(str[i]))
					{
						if (lastVowelIndex >= 0)
						{
							if (lastVowelIndex == i - 1)
							{
								result.Add(str.Substring(startIndex, i - startIndex));
								startIndex = i;
							}
							else
							{
								result.Add(str.Substring(startIndex, i - startIndex - 1));
								startIndex = i - 1;
							}
						}
						lastVowelIndex = i;
					}
				}
				result.Add(str.Substring(startIndex, str.Length - startIndex));
			}
			return result;
		}

		static bool IsVowel(char a)
		{
			return _vowels.Contains(a);
		}

		static char[] _vowels = new char[] {'e', 'y', 'u', 'i', 'o', 'a'};


		public List<List<string>> SplittedWords { get; private set; }

		public Graph SplittingGraph { get; private set; }

		public Dictionary<string, int> Syllabes { get; private set; }

		public List<string> OneSyllabeWords { get; private set; }
	}
}