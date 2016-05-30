using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;

namespace Words
{
	class Program
	{
		static public string FOLDER = "d:/Documents/Sergey/Work_My/31_language/data/";
		
		static public char[] VOWELS = new char[] { 'a', 'e', 'i', 'o', 'u', 'y' };
		static public string[] ENDINGS = new string[] { "ness", "ing", "ly", "s" };

		static private string[] _words;
		static private string[] _wrong;
		
		private static byte[] _table;

		public const uint TABLE_SIZE = 65536 - 62 - 33 - 6 - 2;

		private static int WORD_LENGTH_MIN = 2;
		private static int WORD_LENGTH_MAX = 15;

		private static int COUNT_CHARS_MIN = 2;

		private static int BEGIN_REMOVE = 0;
		private static int END_REMOVE = 8;

		private static int MAX_VOWELS = 3;
		private static int MAX_CONSONANTS = 4;
		private static int MAX_SIMILAR = 1;

		private static Dictionary<string, double> _results = new Dictionary<string, double>();

		static void Main(string[] args)
		{
			_words = readWords(FOLDER + "words.txt");// source normal words
			_wrong = readWords(FOLDER + "words_wrong_sorted.txt"); // wrong words for check
			
			Console.WriteLine("words: " + _words.Length);
			Console.WriteLine("wrong: " + _wrong.Length);

			//findBestParameters();
			finalTest();

			Console.WriteLine("complete");
			Console.ReadKey();
		}
		
		private static void setTableValue(string word)
		{
			uint hash = HashFAQ6(word);
			
			uint num = hash % (TABLE_SIZE * 8);

			uint index = num / 8;
			
			byte offset = (byte)(num % 8);

			byte value = _table[index];

			value = setBit(offset, value);

			_table[index] = value;
		}

		private static bool getTableValue(string word)
		{
			uint hash = HashFAQ6(word);
			
			uint num = hash % (TABLE_SIZE * 8);

			uint index = num / 8;

			byte offset = (byte)(num % 8);

			byte value = _table[index];
			
			return getBit(offset, value);
		}
		
		private static uint HashFAQ6(string word)
		{
			uint hash = 0;
			uint temp = 0;

			for (int i = 0; i < word.Length; i++)
			{
				char symbol = word[i];
				
				hash += word[i];

				temp = hash << 10;
				hash += temp;

				temp = hash >> 6;
				hash ^= temp;
			}

			temp = hash << 3;
            hash += temp;
			
			temp = hash >> 11;
			hash ^= temp;
			
			temp = hash << 15;
            hash += temp;
			
			return hash;
		}

		static bool getBit(byte bitNum, byte value)
		{
			return (value & (1 << bitNum)) != 0;
		}

		static byte setBit(byte bitNum, byte value)
		{
			return (byte)(value | (1 << bitNum));
		}

		private static void writeTable(string[] words)
		{
			_table = new byte[TABLE_SIZE];

			Dictionary<string, bool> dictionary = new Dictionary<string, bool>();

            foreach (string source in words)
			{
				string word = source.ToLower();

				word = correctApostrof(word);
				
				if (word != null)
				{
					if (word.Length <= WORD_LENGTH_MIN)
					{
						
					}
					else if (word.Length > WORD_LENGTH_MAX)
					{

					}
					else if (countChars(word) < COUNT_CHARS_MIN)
					{
						
					}
					else
					{
						if (isNormalWord(word))
						{
							word = removeEnding(word);
							
							if (word.Length > 0)
							{
								setTableValue(word);

								dictionary[word] = true;
							}
						}
					}
				}
            }

			File.WriteAllBytes(FOLDER + "data", _table);

			Console.WriteLine("write table complete: " + dictionary.Count);
		}
		
		private static bool checkData(string word)
		{
			word = word.ToLower();

			word = correctApostrof(word);
			
			if (word != null)
			{
				if (word.Length <= WORD_LENGTH_MIN)
				{
					return true;
				}
				else if (word.Length > WORD_LENGTH_MAX)
				{
					return false;
				}
				else if (countChars(word) < COUNT_CHARS_MIN)
				{
					return true;
				}
				else
				{
					if (isNormalWord(word))
					{
						word = removeEnding(word);

						if (word.Length > 0)
						{
							return getTableValue(word);
						}
						else
						{
							return true;
						}
					}
					else
					{
						return false;
					}
				}
			}
			else
			{
				return false;
			}
		}
		
		private static string removeEnding(string word)
		{
			foreach (string end in ENDINGS)
			{
				if (word.Length > end.Length && word.IndexOf(end) == word.Length - end.Length)
				{
					word = word.Substring(0, word.Length - end.Length);
					break;
				}
			}

			if (END_REMOVE < word.Length)
			{
				word = word.Substring(0, END_REMOVE);
			}

			return word;
        }

		private static void findBestParameters()
		{
			for (WORD_LENGTH_MIN = 2; WORD_LENGTH_MIN < 4; WORD_LENGTH_MIN++)
			{
				for (WORD_LENGTH_MAX = 14; WORD_LENGTH_MAX < 17; WORD_LENGTH_MAX++)
				{
					for (COUNT_CHARS_MIN = 2; COUNT_CHARS_MIN < 4; COUNT_CHARS_MIN++)
					{
						for (END_REMOVE = 7; END_REMOVE < 10; END_REMOVE++)
						{
							for (MAX_VOWELS = 2; MAX_VOWELS < 4; MAX_VOWELS++)
							{
								for (MAX_CONSONANTS = 3; MAX_CONSONANTS < 5; MAX_CONSONANTS++)
								{
									for (MAX_SIMILAR = 1; MAX_SIMILAR < 3; MAX_SIMILAR++)
									{
										writeTable(_words);
										check("checkTable", checkData);
									}
								}
							}
						}
					}
				}
			}

			List<KeyValuePair<string, double>> list = _results.ToList();

			list.Sort(delegate (KeyValuePair<string, double> pair1, KeyValuePair<string, double> pair2)
			{
				return pair2.Value.CompareTo(pair1.Value);
			});

			List<string> output = new List<string>();

			foreach(KeyValuePair<string, double> pair in list)
			{
				output.Add(pair.Key + " = " + string.Format("{0:0.000}", pair.Value));
            }

			writeWords(FOLDER + "complex_result.txt", output.ToArray());
		}

		private static void finalTest()
		{
			writeTable(_words);
			check("checkTable", checkData);
		}

		private static void check(string name, Func<string, bool> method)
		{
			int count = Math.Min(_words.Length, _wrong.Length);

			Console.WriteLine();
			Console.WriteLine("CHECK " + name);

			Random random = new Random();

			int totalErrors = 0;

			int errors;
			string word;

			errors = 0;
			
			foreach (string w in _words)
			{
				word = w;

				if (!method(word))
				{
					errors++;
					//Console.WriteLine(word);
				}
			}

			totalErrors += errors;

			Console.WriteLine("WORDS ERRORS: " + errors + " / " + count + " (" + Math.Round((double)errors / (double)count * 100) + "%)");

			errors = 0;
			
			foreach (string w in _wrong)
			{
				word = w;

				if (method(word))
				{
					errors++;
					//Console.WriteLine(word);
                }
			}

			totalErrors += errors;

			double result = (1 - (double)totalErrors / (double)(count + count)) * 100;
			string parameters = WORD_LENGTH_MIN + " " + WORD_LENGTH_MAX + " " + COUNT_CHARS_MIN + " " + BEGIN_REMOVE + " " + END_REMOVE + " " + MAX_VOWELS + " " + MAX_CONSONANTS + " " + MAX_SIMILAR + " " + String.Join(",", ENDINGS);

			Console.WriteLine("NO-WORDS ERRORS: " + errors + " / " + count + " (" + Math.Round((double)errors / (double)count * 100) + "%)");

			Console.WriteLine("TOTAL ERRORS: " + totalErrors + " / " + (count + count) + " (" + Math.Round((double)totalErrors / (double)(count + count) * 100) + "%)");
			Console.WriteLine("PARAMETERS: " + parameters);
			Console.WriteLine("RESULT: " + string.Format("{0:0.000}", result));
			Console.WriteLine();

			_results.Add(parameters, result);
		}

		private static int countChars(String word)
		{
			List<char> chars = new List<char>();
			
			for (int i = 0; i < word.Length; i++)
			{
				char current = word[i];

                if (chars.IndexOf(current) == -1)
				{
					chars.Add(current);
				}
			}

			return chars.Count;
		}

		private static bool isNormalWord(string word)
		{
			int vowels = 0;
			int consonants = 0;
			int similar = 0;
			
			char last = ' ';

			for (int i = 0; i < word.Length; i++)
			{
				char current = word[i];

				if (isVowel(current))
				{
					vowels++;
					consonants = 0;
				}
				else
				{
					vowels = 0;
					consonants++;
				}

				if (current == last)
				{
					similar++;
				}
				else
				{
					similar = 0;
				}

				if (vowels > MAX_VOWELS || consonants > MAX_CONSONANTS || similar > MAX_SIMILAR)
				{
					return false;
				}

				last = current;
			}
			
			return true;
		}

		private static bool isVowel(char current)
		{
			return Array.IndexOf(VOWELS, current) != -1;
		}
		
		private static string correctApostrof(string word)
		{
			int apostrof = word.IndexOf("'");

			if (apostrof != -1)
			{
				if (word.IndexOf("'s") == word.Length - 2)
				{
					word = word.Substring(0, apostrof);
				}
				else
				{
					word = null;
				}
			}

			return word;
		}

		private static string[] readWords(string path)
		{
			string data = File.ReadAllText(path);

			string[] words = data.Split('\n');

			return words;
        }

		private static void writeWords(string path, string[] words)
		{
			string data = string.Join("\n", words);

			File.WriteAllText(path, data);
		}
	}
}
