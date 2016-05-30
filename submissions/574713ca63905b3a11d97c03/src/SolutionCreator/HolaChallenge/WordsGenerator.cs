using System;
using System.Collections.Generic;
using System.Linq;

namespace HolaChallenge
{
	public class WordsGenerator
	{
		private readonly JsonSerializerMaster jsonSerializer;
		private readonly string dir;

		public WordsGenerator(JsonSerializerMaster jsonSerializer, string dir)
		{
			this.jsonSerializer = jsonSerializer;
			this.dir = dir;
		}

		public void Generate(string[] words)
		{
			var stats = words.SelectMany(w => w).GroupBy(c => c)
				.Select(gr => new { c = gr.Key, count = gr.Count() })
				.OrderByDescending(a => a.count)
				.ToArray();

			var wordsHashSet = words.ToHashSet();

			const string code = "eits.";

			var bestGeneratedWordsSeed = 0u;
			var bestGeneratedWordsSet = new HashSet<string>();

			for (var seed = 1u; seed < uint.MaxValue; seed++)
			{
				if (seed % 10000000 == 0)
				{
					Console.WriteLine($"{code} {bestGeneratedWordsSeed} #{bestGeneratedWordsSet.Count}: {(string.Join(",", bestGeneratedWordsSet))}");
				}

				var random = new MyRandom(seed);

				var generatedWords = new HashSet<string>();
				var chars = new char[20];
				var charsLen = 0;

				while (true)
				{
					var letter = code[random.Next(code.Length)];
					if (charsLen == 7) letter = '.';
					if (letter != '.')
					{
						chars[charsLen] = letter;
						charsLen++;
					}
					else if (charsLen > 0)
					{
						var str = new string(chars, 0, charsLen);
						if (!wordsHashSet.Contains(str))
							break;
						generatedWords.Add(str);
						charsLen = 0;
					}
				}

				if (generatedWords.Count > bestGeneratedWordsSet.Count)
				{
					bestGeneratedWordsSeed = seed;
					bestGeneratedWordsSet = generatedWords;
				}
			}

			Console.WriteLine($"{code} {bestGeneratedWordsSeed} #{bestGeneratedWordsSet.Count}: {(string.Join(",", bestGeneratedWordsSet))}");
		}
	}
}
