using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace HolaGen
{
	public static class SampleSplitter
	{
		// Use this because it's just before "a" in the ASCII table
		public const char ANCHOR = '`';
		public const string ANCHOR_STR = "`";

		public static bool REMOVE_TRAILING_APOS_S = true;

		public static bool EXCLUDE_APOS = true;

		public static bool REGEX_5CONSONNANTS = true;

		public static bool EXCLUDE_OVER16LETTERS = true;

		//static Regex[] REGEXES = new []
		//{
		//	"[jhkqwx]{3}",//;0,172%;0,011%;0,94x;0,162%
		//	"[wvtdgp]{3}",//0,217%;0,039%;0,85x;0,178%
		//	"[wj]{2}",//0,162%;0,026%;0,86x;0,136%
		//	"[qgsx]{3}",//0,104%;0,017%;0,86x;0,087%
		//	"[dptbv]{3}",//0,135%;0,027%;0,83x;0,107%
		//	"[qpvh]{3}",//0,080%;0,011%;0,88x;0,069%
		//	"[vqnc]{3}",//0,074%;0,010%;0,88x;0,065%
		//	"[qkb]{3}",//0,023%;0,001%;0,96x;0,022%
		//	"[qfb]{3}",//0,032%;0,004%;0,90x;0,028%
		//	"[fpk]{3}",//0,036%;0,006%;0,86x;0,030%
		//	"[zgw]{3}",//0,026%;0,004%;0,88x;0,022%
		//	"[xbz]{3}",//0,027%;0,005%;0,84x;0,022%
		//	"[jqwsn]{4}",//0,015%;0,002%;0,91x;0,014%
		//	"[fwtp]{3}",//0,112%;0,040%;0,74x;0,072%
		//	"[qt]{3}",//0,013%;0,001%;0,93x;0,012%
		//	"[bxwtnp]{3}",//0,380%;0,153%;0,71x;0,228%
		//	"[wj]{3}",//0,007%;0,000%;0,94x;0,006%
		//	"[xgtq]{4}",//0,004%;0,000%;1,00x;0,004%
		//	"[vl]{4}",//0,004%;0,000%;0,97x;0,004%
		//	"[jylrsxhv]{5}",//0,063%;0,024%;0,72x;0,039%
		//	"[kwnyd]{5}",//0,006%;0,001%;0,82x;0,005%
		//	"[zvq]{4}",//0,001%;0,000%;1,00x;0,001%
		//	"[nvbdkp]{3}",//0,326%;0,141%;0,70x;0,185%
		//	"[rzkgj]{3}",//0,206%;0,087%;0,70x;0,119%
		//	"[swxr]{3}",//0,184%;0,078%;0,70x;0,106%
		//	"[mzjc]{3}",//0,082%;0,037%;0,69x;0,046%
		//	"[vrbpgjz]{3}",//0,685%;0,343%;0,67x;0,342%
		//	"[vxlzbhgk]{3}",//0,818%;0,404%;0,67x;0,414%
		//	"[gljk]{3}",//0,203%;0,100%;0,67x;0,103%
		//	"[wqkbng]{3}",//0,477%;0,253%;0,65x;0,223%
		//	"[rqknzbcx]{3}",//1,001%;0,548%;0,65x;0,453%
		//}
		//.Select(p => new Regex(p, RegexOptions.Compiled))
		//.ToArray();

		public static string PreSampleValue(string value)
		{
			if (REMOVE_TRAILING_APOS_S)
			{
				if (value.EndsWith("'s"))
				{
					value = value.Substring(0, value.Length - 2);
				}
			}

			return value;
		}

		public static string PreSampleForBFValue(string value)
		{
			if (REMOVE_TRAILING_APOS_S && value.Length > 5)
			{
				if (value.EndsWith("'s"))
				{
					value = value.Substring(0, value.Length - 2);
				}
			}

			// Because of char offsetting
			// value = value.Replace("'", ((char)('z' + 1)).ToString());

			return value;
		}

		static Regex RE_Consonants = new Regex(@"[^aeyuio]{5}", RegexOptions.Compiled);
		static Regex RE_Voyels = new Regex(@"[aeyuio]{4}", RegexOptions.Compiled);

		static Regex RE_01 = new Regex(@"[fghjkqvwxyz]{3}", RegexOptions.Compiled);

		//^.{12}'s$;1,429%;1,022%;0,58x;0,407%
		//^.{13}'s$;1,150%;0,669%;0,63x;0,481%
		//^.{14}'s$;0,916%;0,426%;0,68x;0,490%
		//^.{15}'s$;0,735%;0,231%;0,76x;0,504%
		//^.{16}'s$;0,558%;0,127%;0,81x;0,431%
		//^.{8,}'s$;12,917%;12,269%;0,51x;0,648%
		//^.{9,}'s$;10,606%;8,875%;0,54x;1,731%
		//^.{10,}'s$;8,423%;6,075%;0,58x;2,348%
		//^.{11,}'s$;6,479%;3,965%;0,62x;2,514%
		//^.{12,}'s$;4,788%;2,475%;0,66x;2,313%
		//^.{13,}'s$;3,359%;1,453%;0,70x;1,906%
		//^.{14,}'s$;2,209%;0,784%;0,74x;1,425%
		//^.{15,}'s$;1,292%;0,358%;0,78x;0,935%
		//^.{16,}'s$;0,558%;0,127%;0,81x;0,431%
		// static Regex RE_02 = new Regex(@"^.{16,}'s$", RegexOptions.Compiled);

		public static bool PreExcludeValue(string value)
		{
			if (value.Length > 17) return true;

			// if (RE_Consonants.IsMatch(value)) return true;
			// if (RE_01.IsMatch(value)) return true;
			// if (RE_02.IsMatch(value)) return true;

			if (REMOVE_TRAILING_APOS_S)
			{
				if (value.EndsWith("'s"))
				{
					value = value.Substring(0, value.Length - 2);
				}
			}

			if (EXCLUDE_APOS)
			{
				if (value.Contains("'")) return true;
			}

			if (REGEX_5CONSONNANTS)
			{
				if (RE_Consonants.IsMatch(value)) return true;
				if (RE_01.IsMatch(value)) return true;
			}

			if (EXCLUDE_OVER16LETTERS)
			{
				// if (value.Length > 16) return true;
			}

			if (value.Length == 0) return true;

			return false;
		}

		internal static IEnumerable<char> GetPossibleChars()
		{
			var chars = Enumerable.Range(0, 26)
				.Select(i => (char)(i + 'a'))
				.Concat('\''.Yield())
				.Concat(SampleSplitter.ANCHOR.Yield())
				.Concat(SampleSplitter.GetAdditionalChars());

			if (EXCLUDE_APOS)
			{
				chars = chars.Where(c => c != '\'');
			}

			return chars;
		}

		internal static IEnumerable<char> GetAdditionalChars()
		{
			yield break;
		}

		public static IEnumerable<string> ExcludeImpossibleSamples(IEnumerable<string> samples, int sampleSize, bool beginAnchor, bool endAnchor)
		{
			if (REMOVE_TRAILING_APOS_S)
			{
				if (endAnchor)
				{
					if (sampleSize >= 3)
					{
						samples = samples.Where(s => !s.EndsWith("'s" + SampleSplitter.ANCHOR));
					}
				}
			}

			return samples;
		}

		public static IEnumerable<string> SplitSamples(string value, int size)
		{
			var samplesLimit = value.Length - size + 1;
			for (var index = 0; index < samplesLimit; index++)
			{
				yield return value.Substring(index, size);
			}
		}

		public static IEnumerable<string> SplitSamples(string value, int size, bool beginAnchor, bool endAnchor, int minWordSize, int startIndex, int? length = null)
		{
			value = PreSampleValue(value);
			if (startIndex > 0)
			{
				value = value.Substring(Math.Min(value.Length, startIndex));
			}
			if (length != null)
			{
				value = value.Slice(0, length);
			}
			if (value.Length < minWordSize) return Enumerable.Empty<string>();
			value = (beginAnchor ? ANCHOR_STR : "") + value + (endAnchor ? ANCHOR_STR : "");
			return SplitSamples(value, size);
		}
	}
}
