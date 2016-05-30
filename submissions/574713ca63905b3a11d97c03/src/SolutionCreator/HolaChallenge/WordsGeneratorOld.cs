using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HolaChallenge
{
    public class WordsGeneratorOld
    {
        private JsonSerializerMaster jsonSerializer;
        private string[] words;
        private HashSet<string> wordsHash;
        private string alphabet;
        private Dictionary<char, int> alphabetIndexes;
		private string dir;

		const int wordLen = 4;
		const int binaryLim = 7;
		const uint maxSeed = uint.MaxValue;

		public WordsGeneratorOld(JsonSerializerMaster jsonSerializer, string dir, string[] words, string alphabet)
        {
            this.jsonSerializer = jsonSerializer;
            this.alphabet = alphabet;
			this.dir = dir;
			this.words = words.Where(w => w.Length == wordLen).ToArray();
            wordsHash = this.words.ToHashSet();
            alphabetIndexes = alphabet.Select((c, i) => new { c, i }).ToDictionary(a => a.c, a => a.i);
        }

		public void Research()
		{
			var state = LoadOrCreateState();

			FillSimpleGenerator(state);
			//MeasureGeneratorEffectiveness(state);
		}

		private void MeasureGeneratorEffectiveness(State state)
		{
			int trueWordsCount;
			int falseWordsCount;
			var generatedWords = state.CoolSeeds.SelectMany(s => GenerateStrings(state, s, out trueWordsCount, out falseWordsCount))
				.Distinct()
				.ToArray();

			trueWordsCount = generatedWords.Count(wordsHash.Contains);
			falseWordsCount = generatedWords.Length - trueWordsCount;
			var ratio = (double)falseWordsCount / trueWordsCount;

			Console.WriteLine($"Cool seeds: {state.CoolSeeds.Count}, words {trueWordsCount}, not words {falseWordsCount}, ratio {ratio.ToString("0.#####")}");
		}

		private string[] GenerateStrings(State generationState, uint seed, out int trueWordsCount, out int falseWordsCount)
		{
			var firstChar = generationState.FirstChar;
			var charToChar = generationState.CharToChar;
			var startSeed = generationState.Seed;

			var random = new MyRandom(seed);

			var trueWords = new HashSet<string>();
			var falseWords = new HashSet<string>();

			while (true)
			{
				var word = new char[wordLen];

				var state = firstChar.RandomIndex(random);

				var distribution = charToChar[state];

				word[0] = alphabet[state];
				for (var j = 1; j < wordLen; j++)
				{
					if (distribution.Sum == 0)
						distribution = firstChar;

					var newState = distribution.RandomIndex(random);

					word[j] = alphabet[newState];

					state = newState;
					distribution = charToChar[newState];
				}

				var generatedWord = new string(word);

				if (wordsHash.Contains(generatedWord))
				{
					trueWords.Add(generatedWord);
				}
				else
				{
					if (falseWords.Count >= 1)
						break;
					falseWords.Add(generatedWord);
				}
			}

			trueWordsCount = trueWords.Count;
			falseWordsCount = falseWords.Count;

			return trueWords.Concat(falseWords).ToArray();
		}

		public void FillSimpleGenerator(State generationState)
        {
			var file = Path.Combine(dir, "simple_generator.txt");

			const int precision = 10;

            for (uint seed = generationState.Seed; seed <= maxSeed; seed++)
            {
				//if (seed % 10000 == 0) Console.WriteLine("seed = " + seed);

				int trueWordsCount;
				int falseWordsCount;

				var generatedWords = GenerateStrings(generationState, seed, out trueWordsCount, out falseWordsCount); 

                if (trueWordsCount >= precision - 1)
                {
                    var ratio = (double)falseWordsCount / trueWordsCount;
                    Console.WriteLine($"seed {seed}         words {trueWordsCount}, not words {falseWordsCount}, ratio {ratio.ToString("0.#####")}");
					File.AppendAllText(file, seed + Environment.NewLine);
					generationState.CoolSeeds.Add(seed);
                }
            }
		}

		private State LoadOrCreateState()
		{
			var file = Path.Combine(dir, "simple_generator.txt");

			if (!File.Exists(file))
			{
				var firstChar = GetFirstCharProbabilities();
				var charToChar = GetCharToCharTransitionMatrix();
				var startSeed = 1u;

				firstChar.MakeDistributionBinary();
				foreach (var distr in charToChar)
					distr.MakeDistributionBinary();

				File.WriteAllLines(file, new[]
				{
					string.Join(",", firstChar.Distribution),
					Environment.NewLine,
					string.Join(Environment.NewLine, charToChar.Select(d => string.Join(",", d.Distribution))),
					Environment.NewLine,
				});
				Console.WriteLine($"Sums: {firstChar.Sum}; {string.Join(",", charToChar.Select(d => d.Sum))}");
				Console.WriteLine("File created");

				return new State
				{
					FirstChar = firstChar,
					CharToChar = charToChar,
					Seed = startSeed,
					CoolSeeds = new List<uint>()
				};
			}
			else
			{
				DistributionArray firstChar = null;
				DistributionArray[] charToChar = null;
				var coolSeeds = new List<uint>();

				var content = File.ReadAllLines(file);

				var charToCharList = new List<DistributionArray>();
				foreach (var line in content)
				{
					if (string.IsNullOrEmpty(line)) continue;

					if (firstChar == null)
					{
						firstChar = new DistributionArray { Distribution = line.Split(',').Select(int.Parse).ToArray() };
						firstChar.Sum = firstChar.Distribution.Sum();
					}
					else if (line.Contains(","))
					{
						var arr = new DistributionArray { Distribution = line.Split(',').Select(int.Parse).ToArray() };
						arr.Sum = arr.Distribution.Sum();
						charToCharList.Add(arr);
					}
					else
					{
						coolSeeds.Add(uint.Parse(line));
					}
				}
				charToChar = charToCharList.ToArray();

				var startSeed = coolSeeds.Max() + 1;

				Console.WriteLine($"Sums: {firstChar.Sum}; {string.Join(",", charToChar.Select(d => d.Sum))}");
				Console.WriteLine("Loaded seed = " + startSeed);

				return new State
				{
					FirstChar = firstChar,
					CharToChar = charToChar,
					Seed = startSeed,
					CoolSeeds = coolSeeds
				};
			}
		}

		private DistributionArray GetFirstCharProbabilities()
        {
            var result = new DistributionArray { Distribution = new int[alphabet.Length], Sum = words.Length };

            foreach (var word in words)
            {
                var index = alphabetIndexes[word[0]];
                result.Distribution[index]++;
            }
            return result;
        }

        private DistributionArray[] GetCharToCharTransitionMatrix()
        {
            var result = new DistributionArray[alphabet.Length];
			for (var i = 0; i < alphabet.Length; i++)
				result[i] = new DistributionArray
				{
					Distribution = new int[alphabet.Length],
					Sum = 0
				};

            var digrams = words.SelectMany(WordFeatureRow.GetDigrams).ToArray();

            foreach (var digram in digrams)
            {
                var i1 = alphabetIndexes[digram[0]];
                var i2 = alphabetIndexes[digram[1]];

                var distribution = result[i1];

				distribution.Distribution[i2]++;
				distribution.Sum++;
            }

            return result;
        }

		private DistributionArray[,] GetDigramToCharTransitionMatrix()
		{
			var result = new DistributionArray[alphabet.Length, alphabet.Length];
			for (var i = 0; i < alphabet.Length; i++)
				for (var j = 0; j < alphabet.Length; j++)
					result[i, j] = new DistributionArray
					{
						Distribution = new int[alphabet.Length],
						Sum = 0
					};

			var trigrams = words.SelectMany(WordFeatureRow.GetTrigrams).ToArray();

			foreach (var trigram in trigrams)
			{
				var i1 = alphabetIndexes[trigram[0]];
				var i2 = alphabetIndexes[trigram[1]];
				var i3 = alphabetIndexes[trigram[2]];

				var distribution = result[i1, i2];

				distribution.Distribution[i3]++;
				distribution.Sum++;
			}

			return result;
		}

		public class State
		{
			public DistributionArray FirstChar;
			public DistributionArray[] CharToChar;
			public uint Seed;

			public List<uint> CoolSeeds;
		}

		public class DistributionArray
        {
            public int[] Distribution;
            public int Sum;

			public int RandomIndex(MyRandom random)
			{
				var p = random.Next(Sum);
				return RandomIndex(Distribution, p);
			}

			public void MakeDistributionLessByte()
			{
				var max = Distribution.Max();
				var div = (double)max / 255;
				for (var i = 0; i < Distribution.Length; i++)
					Distribution[i] = (int)Math.Floor(Distribution[i] / div);
				Sum = Distribution.Sum();
			}

			public void MakeDistributionBinary()
			{
				var limit = Distribution.Max() / binaryLim;
				for (var i = 0; i < Distribution.Length; i++)
					Distribution[i] = Distribution[i] < limit ? 0 : 1;
				Sum = Distribution.Sum();
			}

			public static int RandomIndex(int[] weights, int randomInt)
			{
				var s = 0;

				for (var i = 0; i < weights.Length; i++)
				{
					var w = weights[i];

					s += w;

					if (s > randomInt)
						return i;
				}

				return -1;
			}
		}
    }
}
