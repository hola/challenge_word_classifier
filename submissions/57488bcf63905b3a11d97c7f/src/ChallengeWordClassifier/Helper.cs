using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public static class Helper
    {
        public static IEnumerable<T> Diff<T>(this IEnumerable<T> source, Func<T, T, T> diff)
        {
            return source.Zip(source.Skip(1), (a, b) => diff(a, b));
        }

        public static string StrDiffFixed(string s1, string s2)
        {
            int len = s1.Length > s2.Length ? s2.Length : s1.Length;
            int i = 0;
            while (i < len && s1[i] == s2[i])
                i++;
            string s = s2.Substring(i);
            return s;
        }

        public static string FromDiffFixed(string str, string diff)
        {
            return str.Substring(0, str.Length - diff.Length) + diff;
        }

        public static string StrDiff(string s1, string s2)
        {
            int len = s1.Length > s2.Length ? s2.Length : s1.Length;
            int i = 0;
            while (i < len && s1[i] == s2[i])
                i++;
            int n = s1.Length - i;
            string s = s2.Substring(i);
            return n > 0 ? n + s : s;
        }

        public static string FromDiff(string str, string diff)
        {
            string nStr = "";
            int i = 0;
            while (char.IsDigit(diff[i]))
            {
                nStr += diff[i];
                i++;
            }
            int n = nStr.Length > 0 ? Convert.ToInt32(nStr) : 0;
            if (str.Length < n)
                return "";
            return str.Substring(0, str.Length - n) + diff.Substring(i);
        }

        public static string Reverse(string text)
        {
            if (text == null) return null;
            char[] array = text.ToCharArray();
            Array.Reverse(array);
            return new string(array);
        }

        public static T[][] CreateArray2D<T>(int n1, int n2)
        {
            var arr = new T[n1][];
            for (int i = 0; i < n1; i++)
                arr[i] = new T[n2];
            return arr;
        }

        // Не уникальные последовательности из len букв.
        public static IEnumerable<string> GetSequenses(this IEnumerable<string> words, int len)
        {
            return words
                .Where(w => w.Length >= len)
                .SelectMany(w => Enumerable.Range(0, w.Length - len + 1).Select(i => w.Substring(i, len)));
        }

        public static bool CheckSequenses(this IEnumerable<string> seq, string word)
        {
            return seq.Any(s => s.Length <= word.Length && word.IndexOf(s) >= 0);
        }

        // median - от 0.0 до 1.0
        public static T[][] FilterByMedians<T>(this IEnumerable<T> source, params double[] medians)
        {
            var counts = new Dictionary<T, long>();
            long count = 0;
            foreach (var item in source)
            {
                if (!counts.ContainsKey(item))
                    counts.Add(item, 0);
                counts[item]++;
                count++;
            }
            long cnt = 0;
            var percents = new List<KeyValuePair<T, double>>();
            foreach (var kv in counts.OrderByDescending(c => c.Value))
            {
                cnt += kv.Value;
                percents.Add(new KeyValuePair<T, double>(kv.Key, (double)cnt / count));
            }
            var result = new List<T[]>();
            double prevM = 0.0;
            foreach(double m in medians)
            {
                result.Add(percents.Where(c => c.Value > prevM && c.Value <= m).Select(c => c.Key).ToArray());
                prevM = m;
            }
            return result.ToArray();
        }

        // median - от 0.0 до 1.0
        public static IEnumerable<T> FilterByMedian<T>(this IEnumerable<T> source, double median)
        {
            return source.FilterByMedians(median)[0];
        }

        public static IEnumerable<T> FilterByCount<T>(this IEnumerable<T> source, int count)
        {
            return source.GroupBy(w => w)
                .Where(g => g.Count() > count)
                .SelectMany(g => g);
        }

        // Не уникальные последовательности из len букв, которые встречаются на определенной позиции.
        public static IEnumerable<string> GetSequensesByPos(this IEnumerable<string> words, int len, int pos)
        {
            return words
                .Where(w => w.Length >= pos + len)
                .Select(w => w.Substring(pos, len));
        }

        // Не уникальные последовательности из len букв, которые встречаются в конце слова.
        public static IEnumerable<string> GetSequensesFromEnd(this IEnumerable<string> words, int len)
        {
            return words
                .Where(w => w.Length >= len)
                .Select(w => w.Substring(w.Length - len));
        }

        // Уникальные последовательности из len букв, которые встречаются на всех позициях.
        public static string[][] GetSequensesByPos(this string[] words, int len)
        {
            return GetSequensesByPos(words, len, Enumerable.Range(0, words.Max(w => w.Length) - len + 1).ToArray());
        }

        // Уникальные последовательности из len букв, которые встречаются на указанных позициях.
        public static string[][] GetSequensesByPos(this string[] words, int len, int[] positions)
        {
            return positions
                .Select(i => words
                    .GetSequensesByPos(len, i)
                    .Distinct()
                    .OrderBy(_ => _)
                    .ToArray())
                .ToArray();
        }

        // Уникальные последовательности из len букв, которые встречаются на всех позициях.
        // median - от 0.0 до 1.0
        public static string[][] GetSequensesByPosMedian(this string[] words, int len, double median)
        {
            return GetSequensesByPosMedian(words, len, Enumerable.Range(0, words.Max(w => w.Length) - len + 1).ToArray(), median);
        }

        // Уникальные последовательности из len букв, которые встречаются на указанных позициях.
        // median - от 0.0 до 1.0
        public static string[][] GetSequensesByPosMedian(this string[] words, int len, int[] positions, double median)
        {
            return positions
                .Select(i => words
                    .GetSequensesByPos(len, i)
                    .FilterByMedian(median)
                    .OrderBy(_ => _)
                    .ToArray())
                .ToArray();
        }

        public static string GetAlfabet(string[] words)
        {
            return string.Join("", words.SelectMany(w => w.ToCharArray()).Distinct().OrderBy(_ => _));
        }

        public static int GetIndex(string word, string alfabet)
        {
            int b = alfabet.Length;
            int p = 1;
            int result = 0;
            for (int i = 0; i < word.Length; i++)
            {
                result += alfabet.IndexOf(word[word.Length - 1 - i]) * p;
                p *= b;
            }
            return result;
        }

        public static byte[] GetBitsArray(this string[] words)
        {
            string alfabet = GetAlfabet(words);
            int b = 8;
            var arr = new List<byte>();
            foreach (var word in words)
            {
                int index = GetIndex(word, alfabet);
                if (arr.Count < index / b + 1)
                    arr.AddRange(Enumerable.Repeat((byte)0, index / b + 1 - arr.Count));
                arr[index / b] |= (byte)(1 << (index % b));
            }
            return arr.ToArray();
        }

        public static byte[] GetBytes3(int n)
        {
            return new[] { (byte)(n & 0xff), (byte)((n >> 8) & 0xff), (byte)((n >> 16) & 0xff) };
        }
    }
}
