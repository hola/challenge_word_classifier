using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public static class MasksHelper
    {
        public static string[] GetLetters(string[] words, params double[] medians)
        {
            var letters = words.SelectMany(w => w.ToCharArray()).FilterByMedians(medians).Select(s => string.Join("", s)).ToArray();
            return letters;
        }

        public static string[] GetLetters(string[] words, int count, double start = 0.5)
        {
            var medians = new double[count];
            medians[0] = start;
            for (int i = 1; i < count - 1; i++)
            {
                medians[i] = (medians[i - 1] + 1) / 2;
            }
            medians[count - 1] = 1;
            return GetLetters(words, medians);
        }

        public static string[] GetLetters2(string[] words, int count)
        {
            var result = Enumerable.Range(0, count).Select(_ => "").ToArray();
            var letters = words.SelectMany(w => w.ToCharArray()).FilterByMedian(1).ToArray();
            for (int i = 0; i < letters.Length; i++)
            {
                result[i % count] += letters[i];
            };
            return result;
        }

        public static string GetMask(string w, string[] letters1, string[] letters2, string[] letters3)
        {
            int l1 = 4;
            int l2 = 6;
            int maxLen = 15;
            string mask = GetMask(w.Substring(0, l1 > w.Length ? w.Length : l1), letters1);
            if (w.Length > l1)
                mask += GetMask(w.Substring(l1, l1 + l2 > w.Length ? w.Length - l1 : l2), letters2);
            if (w.Length > l1 + l2)
                mask += GetMask(w.Substring(l1 + l2, maxLen > w.Length ? w.Length - l1 - l2 : maxLen - l1 - l2), letters3);
            return mask;
        }

        public static string GetMask(string w, string[] letters1, string[] letters2)
        {
            int start = 5;
            int l1 = 10;
            int maxLen = 15;
            if (w.Length > start)
                w = w.Substring(start);
            string mask = GetMask(w.Substring(0, l1 > w.Length ? w.Length : l1), letters1);
            if (w.Length > l1)
                mask += GetMask(w.Substring(l1, maxLen > w.Length ? w.Length - l1 : maxLen - l1), letters2);
            return mask;
        }

        public static string GetMask(string word, string[] letters)
        {
            return string.Join("", word.Select(l => letters.First(q => q.Contains(l))[0]));
        }

        public static string[][] GetLettersN(string[] words)
        {
            var result = new List<string[]>();
            int count = 16;
            for (int i = 0; i < 20; i++)
            {
                var chars = words.Where(w => w.Length > i).Select(w => w[i]).FilterByMedian(1).ToArray();
                if (chars.Length == 0)
                    break;
                var letters = Enumerable.Range(0, count).Select(_ => "").ToArray();//new string[i + 1];
                int d = chars.Length / count + 1;
                for (int j = 0; j < chars.Length; j++)
                {
                    letters[j / d] += chars[j];
                }
                result.Add(letters);
                count = count >> 1;
                if (count <= 1)
                    count = 2;
            }
            return result.ToArray();
        }

        public static string GetMaskN(string word, string[][] letters)
        {
            return string.Join("", word.Select((l, i) => (letters[i].FirstOrDefault(q => q.Contains(l)) ?? "#")[0]));
        }
    }
}
