// https://habrahabr.ru/company/hola/blog/282624/

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Ajax.Utilities;

namespace ChallengeWordClassifier
{
    class Program
    {
        static void Main(string[] args)
        {
            var source = File.ReadAllText("solution.js");
            var minifier = new Minifier();
            var minified = minifier.MinifyJavaScript(source);
            File.WriteAllText("solution\\solution.js", minified);

            //Helper.LoadTestcases();
            //TestsHelper.GenerateCommonTestFile();

            //string[] words = File.ReadAllLines("words.txt");
            //words = PrepareWords(words);
            string[] allWords = File.ReadAllLines("words-prepared.txt");
            allWords = allWords.Select(w => w.Replace('\'', '0')).ToArray();
            string[] words = allWords.Where(w => w.Length < 19).ToArray();

            //string[] abbrs;
            //string[] wordsWOAbbrs;
            //ExcludeAbbrs(words, out abbrs, out wordsWOAbbrs);
            //wordsWOAbbrs = PrepareWords(wordsWOAbbrs);

            //var alfabet = "0abcdefghijklmnopqrstuvwxyz";
            var frequentChars = string.Join("", words.SelectMany(w => w.ToCharArray()).FilterByMedian(0.5));
            var lettersVCA = new[] { "0", "aeiouy", "bcdfghjklmnpqrstvwxz" };
            var lettersA = new[] { "0", "aeiouybcdfghjklmnpqrstvwxz" };


            //var possibleStarts = words.Where(w => w.Length >= 2).Select(w => w.Substring(0, 2)).Distinct().ToArray();
            //var possiblePairs = allWords.GetSequenses(2).FilterByMedian(0.9);
            //var possibleTriples = allWords.GetSequenses(3).Distinct().ToArray();
            //SaveSequensesFixedLen(possibleTriples, "possible-3");
            //var possibleQuads = words.Where(w => w.Length <= 80).GetSequenses(4)
            //    //.FilterByMedian(0.98)
            //    .Distinct()
            //    .ToArray();
            //SaveSequensesFixedLen(possibleQuads, "possible-4");
            //var possible5 = words.Where(w => w.Length <= 80).GetSequenses(5)
            //    .FilterByMedian(0.7)
            //    //.Distinct()
            //    .ToArray();

            //var allPairs = alfa.ToCharArray().SelectMany(a => alfa.ToCharArray().Select(b => a.ToString() + b)).ToArray();
            //var allTriples = alfabet.ToCharArray().SelectMany(a => alfabet.ToCharArray().SelectMany(b => alfabet.ToCharArray().Select(c => a.ToString() + b + c))).ToArray();
            //var allQuads = alfabet.ToCharArray().SelectMany(a => alfabet.ToCharArray().SelectMany(b => alfabet.ToCharArray().SelectMany(c => alfabet.ToCharArray().Select(d => a.ToString() + b + c + d)))).ToArray();

            //wrongStarts = new HashSet<string>(allPairs.Except(possibleStarts));
            //var wrongPairs = new HashSet<string>(allPairs.Except(possiblePairs));
            //var wrongTriples = allTriples.Except(possibleTriples).ToArray();
            //var wrongQuads = allQuads.Except(possibleQuads).ToArray();

            //var sequenses2 = words.GetSequensesByPos(2);
            //sequenses3.SelectMany(_ => _).Diff(Helper.StrDiffFixed).WriteToGzip("sequenses-3-diff.txt");
            //var sequenses4 = words.GetSequensesByPosMedian(4, Enumerable.Range(2, 18).ToArray(), 0.85);
            //sequenses4.SelectMany(_ => _).Diff(Helper.StrDiffFixed).WriteToGzip("sequenses-4-diff.txt");
            //var sequenses5 = words.GetSequensesByPos(5);
            //sequenses5.SelectMany(_ => _).Diff(Helper.StrDiffFixed).WriteToGzip("sequenses-5-diff.txt");
            //var sequenses6 = words.GetSequensesByPos(6);
            //sequenses6.SelectMany(_ => _).Diff(Helper.StrDiffFixed).WriteToGzip("sequenses-6-diff.txt");

            var wordsCutAp = words.Select(w => { int i = w.LastIndexOf('0'); return i < 0 ? w : w.Substring(0, i); }).Distinct().ToArray();
            wordsCutAp = wordsCutAp.Select(w => w.Replace("0", "")).Distinct().ToArray();
            //var prefixes2f = wordsCutAp.GetSequensesByPos(2, 0).FilterByMedian(0.2).OrderBy(_ => _).ToArray();
            //var prefixes3f = wordsCutAp.GetSequensesByPos(3, 0).FilterByMedian(0.2).OrderBy(_ => _).ToArray();
            //var prefixes4f = wordsCutAp.GetSequensesByPos(4, 0).FilterByMedian(0.15).OrderBy(_ => _).ToArray();
            //var prefixesf = prefixes2f.Concat(prefixes3f).Concat(prefixes4f).ToArray();
            //var postfixes2f = wordsCutAp.GetSequensesFromEnd(2).FilterByMedian(0.35).OrderBy(_ => _).ToArray();
            //var postfixes3f = wordsCutAp.GetSequensesFromEnd(3).FilterByMedian(0.25).OrderBy(_ => _).ToArray();
            //var postfixes4f = wordsCutAp.GetSequensesFromEnd(4).FilterByMedian(0.25).OrderBy(_ => _).ToArray();
            //var postfixesf = postfixes2f.Concat(postfixes3f).Concat(postfixes4f).ToArray();
            //var wordsCutList = new List<string>();
            //foreach (var w in wordsCutAp)
            //{
            //    string wcut = WordCut(w, prefixesf, postfixesf);
            //    if (!string.IsNullOrEmpty(wcut))
            //        wordsCutList.Add(wcut);
            //}
            //wordsCut = wordsCutList.Distinct().OrderBy(_ => _).ToArray();
            //wordsCut.WriteTo("words-cut.txt");
            //var wordsCut = File.ReadAllLines("words-cut.txt");

            Func<string, string> cutAp = w => { int i = w.LastIndexOf('0'); return (i < 0 ? w : w.Substring(0, i)).Replace("0", ""); };
            //Func<string, string> cut = w => WordCut(cutAp(w), prefixesf, postfixesf);
            //Func<string, string> clip = w => Clip(w, 6, 22);

            //var wordsClip = wordsCutAp.Select(clip).Distinct().ToArray();

            var postfixes3 = words.GetSequensesFromEnd(3)
                //.FilterByMedian(0.9)
                .Distinct()
                .OrderBy(_ => _)
                .ToArray();
            //SaveSequensesFixedLen(postfixes3, "postfixes-3");

            //var masksA = words.Select(w => MasksHelper.GetMask(w, lettersA))
            //    .Distinct()
            //    .OrderBy(_ => _)
            //    .ToArray();
            //masksA.Diff(Helper.StrDiff).WriteToGzip("masksA-diff.txt");
            //var masksAHash = new HashSet<string>(masksA);

            var masksVCA = words.Select(w => MasksHelper.GetMask(w, lettersVCA))
                .FilterByMedian(0.94)
                //.Distinct()
                .OrderBy(_ => _)
                .ToArray();
            var masksVCABytes = SaveStrDiff(masksVCA, "masksVCA-diff.txt");
            var masksVCAHash = new HashSet<string>(masksVCA);

            //var letters = MasksHelper.GetLetters(words, 0.5, 1);
            //var masks = words.Select(w => MasksHelper.GetMask(w, letters))
            //    .FilterByMedian(0.94)
            //    //.Distinct()
            //    .OrderBy(_ => _)
            //    .ToArray()
            //    .WriteTo("masks.txt");
            //masks.Diff(Helper.StrDiff).WriteToGzip("masks-diff.txt");
            //var masksHash = new HashSet<string>(masks);

            //var unusedChars = UnusedChars(words);

            int hashseed = 0;
            int hashmax = 512503;//PrimeNumbersHelper.PrimeNumbers(512500).First();
            var hashs = wordsCutAp.Select(w => HashHelper.GetHashCode2(w, hashseed, hashmax)).Distinct().OrderBy(_ => _).ToArray();
            //SaveSequenses(hashs, "hashs");
            var hashsBytes = SaveBlum(hashs, "hashs");
            var hashsHash = new HashSet<int>(hashs);

            BitConverter.GetBytes(hashsBytes.Length).Concat(hashsBytes).Concat(masksVCABytes).WriteToGzip("solution\\data");

            // --------------  ТЕСТ  ------------------
            var res1 = TestsHelper.RunTest(TestsHelper.GetTests(),
                w =>
                {
                    w = w.Replace('\'', '0');
                    return true
                 && w.Length < 19
                 && !(w[0] == '0' || (w.Length > 14 && "jq".Contains(w[14])) || (w.Length > 15 && "jqw".Contains(w[15])) || (w.Length > 16 && "jqw".Contains(w[16])) || (w.Length > 17 && "fjkqw".Contains(w[17])) || (w.Length > 18 && "jkqw".Contains(w[18])) || (w.Length > 19 && "bfjkvx".Contains(w[19])) || (w.Length > 20 && "dfjkqvwxz".Contains(w[20])))
                 && masksVCAHash.Contains(MasksHelper.GetMask(w, lettersVCA))
                 && hashsHash.Contains(HashHelper.GetHashCode2(cutAp(w), hashseed, hashmax))
                 ;
                });

            Console.WriteLine(res1.SuccessRate);
            Console.WriteLine("Press enter");
            Console.ReadLine();
        }

        static byte[] SaveNumDiff(int[] seq, string name)
        {
            var seqdiff = seq.Distinct().Diff((a, b) => b - a).ToArray();
            int dmax = seqdiff.Max();
            var bytes = new List<byte>();
            if (dmax < 0xf)
            {
                for (int i = 0; i < seqdiff.Length - 1; i += 2)
                {
                    var b = (byte)((seqdiff[i] << 4) | seqdiff[i + 1]);
                    bytes.Add(b);
                }
            }
            else if (dmax < 0xff)
                bytes = seqdiff.Select(n => (byte) n).ToList();
            else if (dmax < 0xffff)
                bytes = seqdiff.SelectMany(n => BitConverter.GetBytes((short) n)).ToList();
            else
                bytes = seqdiff.SelectMany(n => BitConverter.GetBytes(n)).ToList();
            bytes.WriteToGzip(name + "-numdiff");
            return bytes.ToArray();
        }

        static byte[] SaveHuffman(int[] seq, string name)
        {
            var seqdiff = seq.Distinct().Diff((a, b) => b - a).ToArray();
            var coder = new HuffmanCoder<int>();
            coder.Build(seqdiff);
            var encoded = coder.Encode(seqdiff);
            var freq = coder.GetFrequencies();
            var seqhuff = BitConverter.GetBytes((short)(freq.Length))
                .Concat(HuffmanHelper.ToByteArray(freq))
                .Concat(HuffmanHelper.ToByteArray(encoded))
                .ToArray();
            seqhuff.WriteToGzip(name + "-huff");
            return seqhuff;
        }

        static byte[] SaveBlum(int[] seq, string name)
        {
            var min = seq.Min();
            var max = seq.Max();
            var blum = new BitArray(max - min + 1, false);
            foreach (var n in seq)
            {
                blum[n - min] = true;
            }
            var bytes = BitConverter.GetBytes(min).Concat(HuffmanHelper.ToByteArray(blum)).ToArray();
            bytes.WriteToGzip(name + "-blum");
            return bytes;
        }

        static void SaveSequenses(int[] seq, string name)
        {
            SaveNumDiff(seq, name);
            SaveHuffman(seq, name);
            SaveBlum(seq, name);
        }

        static byte[] SaveStrDiff(string[] seq, string file)
        {
            var seqdiff = new[] {seq[0]}.Concat(seq.Select(s => s.Replace("0", "'")).Diff(Helper.StrDiff).ToArray());
            var bytes = Encoding.ASCII.GetBytes(seqdiff.SelectMany(w => (w + "$").ToCharArray()).ToArray());
            bytes.WriteToGzip(file);
            return bytes;
        }

        static void SaveSequensesFixedLen(string[] seq, string name)
        {
            var seqdiff = seq.Diff(Helper.StrDiffFixed).ToArray();
            seqdiff.WriteToGzip(name + "-diff.txt");

            var alfabet = Helper.GetAlfabet(seq);
            var seqnum = seq
                .Select(w => Helper.GetIndex(w, alfabet))
                .OrderBy(_ => _)
                .ToArray();
            SaveSequenses(seqnum, name);
        }

        static string Clip(string str, int count, int percent)
        {
            var length = str.Length;
            var result = str;
            if (length > count)
            {
                length = count + (length - count) * percent / 100;
                result = result.Substring(0, length);
            }
            return result;
        }

        static Dictionary<int, string> UnusedChars(string[] words)
        {
            string alfabet = Helper.GetAlfabet(words);
            int maxLen = words.Max(w => w.Length);
            var result = new Dictionary<int, string>();
            for (int i = 0; i < maxLen; i++)
            {
                var chars = words.Where(w => w.Length > i).Select(w => w[i]).Distinct().ToArray();
                if (chars.Length < alfabet.Length)
                {
                    result.Add(i, string.Join("", alfabet.Except(chars).OrderBy(_ => _)));
                }
            }
            return result;
        }

        static string WordCut(string w, string[] prefixes, string[] postfixes)
        {
            string wcut = w;
            var post = postfixes.FirstOrDefault(p => wcut.EndsWith(p));
            if (post != null)
                wcut = wcut.Substring(0, wcut.Length - post.Length);
            var pref = prefixes.FirstOrDefault(p => wcut.StartsWith(p));
            if (pref != null)
                wcut = wcut.Substring(pref.Length);
            return wcut;
        }

        static Dictionary<object, HashSet<string>> hashSets = new Dictionary<object, HashSet<string>>();

        static bool CheckPrefix(string word, string[] prefixes)
        {
            if (!hashSets.ContainsKey(prefixes))
                hashSets.Add(prefixes, new HashSet<string>(prefixes));
            var hash = hashSets[prefixes];
            return Enumerable.Range(0, word.Length).Any(i => hash.Contains(word.Substring(0, i + 1)));
        }

        static bool CheckPostfix(string word, string[] postfixes)
        {
            if (!hashSets.ContainsKey(postfixes))
                hashSets.Add(postfixes, new HashSet<string>(postfixes));
            var hash = hashSets[postfixes];
            return Enumerable.Range(0, word.Length).Any(i => hash.Contains(word.Substring(word.Length - 1 - i)));
        }

        static bool CheckSequensesByPos(string[][] sequenses, string word, int len)
        {
            return CheckSequensesByPos(sequenses, Enumerable.Range(0, sequenses.Length).ToArray(), word, len);
        }

        static bool CheckSequensesByPos(string[][] sequenses, int[] positions, string word, int len)
        {
            for (int i = 0; i < positions.Length; i++)
            {
                int pos = positions[i];
                if (pos > word.Length - len)
                    break;
                if (!sequenses[i].Contains(word.Substring(pos, len)))
                    return false;
            }
            return true;
        }

        static bool CheckPossibleSequenses(string[] sequense, string word, int len)
        {
            if (!hashSets.ContainsKey(sequense))
                hashSets.Add(sequense, new HashSet<string>(sequense));
            var hash = hashSets[sequense];
            if (word.Length < len)
                return true;
            return Enumerable.Range(0, word.Length - len + 1).All(i => hash.Contains(word.Substring(i, len)));
        }

        static string[] PrepareWords(IEnumerable<string> words)
        {
            return words
              .Where(_ => !string.IsNullOrWhiteSpace(_))
              .Select(_ => _.ToLowerInvariant())
              .Distinct()
              .OrderBy(_ => _)
              .ToArray();
        }

        // Ищем аббревиатуры. Если первые две буквы в слове заглавные, считаем, что это аббревиатура.
        static void ExcludeAbbrs(string[] words, out string[] abbrs, out string[] wordsWOAbbrs)
        {
            List<string> abbrsList = new List<string>();
            List<string> wordsWOAbbrsList = new List<string>();
            foreach (string word in words)
            {
                if (string.IsNullOrEmpty(word))
                    continue;
                if (word.Length == 1 || (char.IsUpper(word[0]) && char.IsUpper(word[1])))
                    abbrsList.Add(word);
                else
                    wordsWOAbbrsList.Add(word);
            }
            abbrs = abbrsList.ToArray();
            wordsWOAbbrs = wordsWOAbbrsList.ToArray();
        }

        // Статистика символов.
        static Dictionary<char, int> CharCounts(string[] words)
        {
            Dictionary<char, int> counts = new Dictionary<char, int>();
            foreach (var c in words.SelectMany(w => w.ToCharArray()))
            {
                //c = char.ToLower(c);
                if (!counts.ContainsKey(c))
                    counts.Add(c, -1);
                counts[c]++;
            }
            return counts;
        }
    }
}
