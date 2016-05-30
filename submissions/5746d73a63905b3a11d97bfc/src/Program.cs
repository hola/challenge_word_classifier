using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HolaJSChallenge
{

    class Program
    {
        static void LoadAndOrderByLength(string path, string path2)
        {
            var lst = new List<string>();

            // read entire file
            var words = File.ReadAllLines(path);

            // fill list and make all strings lowercase
            foreach (var word in words)
            {
                var ss = word.Trim().ToLower();
                lst.Add(ss);
            }

            lst.Sort();
            Debug.WriteLine("initial lines:{0}", lst.Count);

            // remove duplicates
            var lst2 = new List<string>();
            string s = null;

            lst.ForEach(item =>
            {
                if (item != s)
                {
                    lst2.Add(item);
                    s = item;
                }
            });

            lst2.Sort((x, y) =>
            {
                // order by length
                if (x.Length < y.Length)
                    return -1;
                if (x.Length > y.Length)
                    return 1;

                // order by chars
                for (int i = 0; i < x.Length; i++)
                {
                    if (x[i] < y[i])
                        return -1;
                    if (x[i] > y[i])
                        return 1;
                }

                return 0;
            });

            Debug.WriteLine("result lines:{0}", lst2.Count);

            if (File.Exists(path2))
                File.Delete(path2);

            File.WriteAllLines(path2, lst2.ToArray());
        }

        static string excp2s = "a'b'bjbqc'cxd'e'ejekf'fhfjfkfqg'gfgjgxgzh'hxi'ihj'jbjfjhjkjmjnjqjwjxjzk'kfkhkkkqkxkzl'lklqm'mqmzn'nknnnxo'oqp'pjpzq'qgqjqkqoqwqxqzr'rkrzs'szt'tftjtqtzu'ueufujuouquyuzv'vhvkvqvyvzw'wjwnwqwxwzx'xfxgxhxjxkxmxyxzy'ycygyhyjykylyqywyxyzz'zczezfzhzjzmzpzqzvzwzxzy";

        /// <summary>
        /// Removes one symbold words - all acceptable
        /// Removes the longest words - write them into exceptions file
        /// Removes 2 words as there is 128 exceptions only
        /// </summary>
        /// <param name="path"></param>
        /// <param name="path2"></param>
        /// <param name="path3"></param>
        /// <param name="repls"></param>
        /// <returns></returns>
        static int LoadAndOrderAndSave(string path, string path2,string path3,  int maxLen)
        {
            var lst = new SortedDictionary<string,bool>();

            // read entire file
            var words = File.ReadAllLines(path);

            // fill list and make all strings lowercase
            foreach (var word in words)
            {
                var ss = word.Trim().ToLower();

                if (ss.Length < 3 || ss.Length > maxLen)
                {
                    continue;
                }

                lst[ss] = true;
            }

            Debug.WriteLine("initial lines:{0}", words.Length);

            Debug.WriteLine("result lines:{0}", lst.Count);

            if (File.Exists(path2))
                File.Delete(path2);

            File.WriteAllLines(path2, lst.Keys);

            List<string> exc = new List<string>();
            for (int i = 0; i < excp2s.Length; i += 2)
                exc.Add(excp2s.Substring(i, 2));

            if (File.Exists(path3))
                File.Delete(path3);

            File.WriteAllLines(path3, exc);

            return lst.Count;
        }


        static List<string> GenerateInvalids(List<string> start,Dictionary<string,bool> goodWords, int maxLength, int count)
        {
            var rnd = new Random(Environment.TickCount);
            char[] arr = new char[28];
            arr[0] = '\0';
            arr[1] = '\'';

            for (char k = 'a', i = (char)2; k <= 'z'; k++, i++)
                arr[i] = k;

            var lst = new Dictionary<string, bool>();


            while (lst.Count < count)
            {
                var idx = rnd.Next(0, start.Count-1);

                var b = new StringBuilder(start[idx]);
                var newLength = rnd.Next(1, maxLength - start[0].Length);

                for (int i = 0; i < newLength; i++)
                {
                    char c = arr[rnd.Next(1, 27)];
                    b.Append(c);
                }

                if (goodWords.ContainsKey(b.ToString()))
                    continue;

                while (b.Length < maxLength)
                    b.Append(' ');


                if (!lst.ContainsKey(b.ToString()))
                    lst[b.ToString()] = true;
            }

            var lst2 = lst.Keys.ToList();

            lst2.Sort();

            return lst2;
        }

        /// <summary>
        /// Get all two symbol combinations that are not exist as single word
        /// </summary>
        /// <param name="path"></param>
        /// <param name="pathe"></param>
        static void GetNSaveExceptions(string path, string pathe)
        {
            var hs = File.ReadAllLines(path).AsQueryable().ToDictionary(k => k, v => true);
            var vec = new char[27];
            vec[0] = '\'';
            for (int i = 0; i < 26; i++)
                vec[i + 1] = (char)(i + 'a');

            var res = new List<string>();

            for (int j = 1; j < 27; j++)
            {
                for (int i = 0; i < 27; i++)
                {
                    var s = "" + vec[j]+vec[i];
                    if (!hs.ContainsKey(s))
                        res.Add(s);
                }
            }

            if (File.Exists(pathe))
                File.Delete(pathe);

            File.WriteAllLines(pathe, res.ToArray());
        }

        static Dictionary<string,bool> LoadTestFiles(string folder)
        {
            var res = new Dictionary<string, bool>();

            foreach (var fl in Directory.EnumerateFiles(folder, "*"))
            {
                var s = File.ReadAllText(fl);
                var r = JsonConvert.DeserializeObject<Dictionary<string,bool>>(s);

                foreach (var kvp in r)
                    res[kvp.Key] = kvp.Value;
            }

            return res;
        }

        static readonly string path = @"C:\imz3\HolaJSChallenge\Files";

        static readonly string spath0 = Path.Combine(path, "words.txt"); // initial
        static readonly string spath2 = Path.Combine(path, "words_2.txt"); // to lower case, ordered and without duplicates
        static readonly string spath3 = Path.Combine(path, "words_3.txt");
        static readonly string spath_coding = Path.Combine(path, "words_coding.txt");
        static readonly string spath_ends = Path.Combine(path, "words_ends.txt");
        static readonly string spath_gaps = Path.Combine(path, "words_gaps.txt");
        static readonly string spath4 = Path.Combine(path, "words_4.txt");
        static readonly string spath5 = Path.Combine(path, "words_5.txt");
        static readonly string spathe = Path.Combine(path, "exceptions.txt");
        static readonly string spathe3 = Path.Combine(path, "exceptions3.txt");
        static readonly string spathel = Path.Combine(path, "exceptions_longest.txt");
        static readonly string spath_splits = Path.Combine(path, "splits_.txt");
        static readonly string spath_results = Path.Combine(path, "common_results.txt");
        static readonly string spath_filter = Path.Combine(path, "filter.bin");
        static readonly string spath_data = Path.Combine(path, "data.bin");
        static readonly string spath2e = Path.Combine(path, "2begins.txt");

        static readonly string spath_tests_folder = @"C:\imz3\HolaJSChallenge\Files\tests";
        static readonly string spath_tests_2 = @"C:\imz3\HolaJSChallenge\Files\tests\figtests.txt";

        static void CombineTests(string folder, string path2)
        {
            var res = new Dictionary<string, bool>();

            foreach (var fl in Directory.EnumerateFiles(folder, "*"))
            {
                var s = File.ReadAllText(fl);
                var r = JsonConvert.DeserializeObject<Dictionary<string, bool>>(s);

                foreach (var kvp in r)
                    res[kvp.Key] = kvp.Value;
            }

            if (File.Exists(path2))
                File.Delete(path2);

            var ss = JsonConvert.SerializeObject(res);

            File.WriteAllText(path2, ss);
        }

        static void loadTests(string path)
        {
            for (int i = 0; i < 10000; i++)
            {
                try
                {
                    using (var client = new HttpClient())
                    {
                        client.BaseAddress = new Uri("https://hola.org");
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        var tsk = client.GetAsync("challenges/word_classifier/testcase");
                        tsk.Wait();
                        HttpResponseMessage response = tsk.Result;

                        response.EnsureSuccessStatusCode(); // Throw if not a success code.

                        var tsk2 = response.Content.ReadAsStringAsync();
                        tsk2.Wait();
                        var acc = tsk2.Result;
                        File.WriteAllText(Path.Combine(path, Guid.NewGuid().ToString().Replace("-", "")), acc);
                    }
                }
                catch (Exception)
                {
                    Thread.Sleep(1000);
                }

                //Console.WriteLine($"iteration:{i}");
            }
        }

        static void SaveAvailable2Beg(string path, string path2, string path3, double err)
        {
            var dic = new Dictionary<string, int>();
            var lss = File.ReadAllLines(path).ToList();
            foreach (var ss in lss)
            {
                var sb = ss.Substring(0, 2);
                int cnt=1;

                if(dic.TryGetValue(sb,out cnt))
                   cnt++;

                dic[sb] = cnt;
            }

            var lst = dic.ToList();
            lst.Sort((x, y) => -x.Value.CompareTo(y.Value));

            var maxCount = lst.Select(l => l.Value).Sum();

            var res = new List<KeyValuePair<string, int>>();
            int sum = 0;
            lst.ForEach(l =>
            {
                if ((double)(maxCount - sum) / (double)maxCount > err)
                {
                    sum += l.Value;
                    res.Add(l);
                }
            });

            dic = res.ToDictionary(k => k.Key, v => v.Value);


            if (File.Exists(path2))
                File.Delete(path2);

            File.WriteAllLines(path2, res.Select(l=>l.Key));

            res.Clear();

            var res2 = new List<string>();
            foreach (var ss in lss)
            {
                var sb = ss.Substring(0, 2);

                if (dic.ContainsKey(sb))
                    res2.Add(ss);
            }

            if (File.Exists(path3))
                File.Delete(path3);

            File.WriteAllLines(path3, res2);
        }

        static void TreeAnalyze(string path, string path2, int maxStringLen, int arrLen, int endsLimit)
        {
            var dic = new Dictionary<string, Pair3>();
            var dic2 = new Dictionary<string, bool>();

            PreFilter flt = new PreFilter(new List<string>(), new List<string>(), new List<string>(), maxStringLen);
            var fsl = new List<string>();

            foreach(var ss in File.ReadAllLines(path))
            {
                string bs;
                if (flt.WordStatus(ss, out bs) == 2)
                    fsl.Add(ss);
            }

            foreach (var s in fsl)
            {
                    dic2[s] = true;
            }

            // *********************************************
            int sizeLimit = arrLen;
            int elementsCount = dic2.Count;

            foreach (var s in fsl)
            {

                // get all endings
                for (int i = 1; i < (s.Length-1); i++)
                {
                    var sb = s.Substring(i);
                    var sbase = s.Substring(0, i);

                    Pair3 v;

                    if (dic2.ContainsKey(sbase))
                    {
                        if (!dic.TryGetValue(sb, out v))
                        {
                            v = new Pair3(sb, 0, 0, sizeLimit, elementsCount);
                            dic[sb] = v;
                        }

                        v.Correlations++;
                    }

                    if (dic.TryGetValue(sb, out v))
                        v.Count++;
                }
            }

            Debug.WriteLine("Endings:{0}",dic.Count);

            var lst = dic.Values.ToList();

            lst.Sort((x, y) =>
            {
                return x.Error.CompareTo(y.Error);
            });

            var dic3 = new Dictionary<string, Pair3>();

            lst.ForEach(l =>
            {
                bool isFound = false;
                for (int i = 0; i < (l.Ends.Length - 1); i++)
                {
                    var sv = l.Ends.Substring(i);
                    if (dic3.ContainsKey(sv))
                    {
                        isFound = true;
                        break;
                    }
                }

                if (!isFound)
                    dic3.Add(l.Ends, l);
            });

            lst = dic3.Values.ToList();

            lst.Sort((x, y) =>
            {
                return x.Error.CompareTo(y.Error);
            });

            Debug.WriteLine("Endings reduced:{0}",lst.Count);
            dic3.Clear();
            // go from the end

            for (int j=lst.Count-1;j>=0;j--)
            {
                for (int i = 0; i < (lst[j].Ends.Length - 1); i++)
                {
                    var sv = lst[j].Ends.Substring(i);
                    if (dic3.ContainsKey(sv))
                    {
                        dic3.Remove(sv);
                    }
                }

                dic3.Add(lst[j].Ends, lst[j]);
            }

            lst = dic3.Values.ToList();

            lst.Sort((x, y) =>
            {
                return x.Error.CompareTo(y.Error);
            });

            Debug.WriteLine("Endings reduced:{0}",lst.Count);

            if (File.Exists(path2))
                File.Delete(path2);

            var ends = lst.Select(l => l.Ends).Take(endsLimit);

            File.WriteAllLines(path2, ends);
        }

        static void TestBlum(string path)
        {
            var buf = File.ReadAllBytes(path);

            var tests = LoadTestFiles(spath_tests_folder);

            // load 
            int maxStringLen = BitConverter.ToInt32(DataPack.Unpack(buf, 0),0);
            //int count = BitConverter.ToInt32(DataPack.Unpack(buf, 0),sizeof(int));
            int filterBufLen = BitConverter.ToInt32(DataPack.Unpack(buf, 0), sizeof(int));
            byte[] arr = DataPack.Unpack(buf, 1);

            var excs2 = SplitString(ASCIIEncoding.ASCII.GetString(DataPack.Unpack(buf, 2)));
            var ends = SplitString(ASCIIEncoding.ASCII.GetString(DataPack.Unpack(buf, 3)));
            var d2b = SplitString(ASCIIEncoding.ASCII.GetString(DataPack.Unpack(buf, 4)));

            var bf = new BlumFilter(filterBufLen);
            bf.SetArray(arr);

            var flt = new PreFilter(excs2, ends, d2b, maxStringLen);

            int errcount = 0;

            foreach (var t in tests)
            {
                bool isWord = false;
                var s = t.Key.ToLower().Trim();
                string sb;

                var sf = flt.WordStatus(s, out sb);
                if (sf == 0) isWord = false;
                else if (sf == 1) isWord = true;
                else
                {
                    isWord = bf.Contains(sb);
                }

                if (isWord && !t.Value)
                    errcount++;
                if (!isWord && t.Value)
                    errcount++;
            }

            Console.WriteLine("Errors:{0} from {1}, {2}",
                errcount, tests.Count, (float)errcount / (float)(tests.Count) * 100.0F);

        }

        static List<string> SplitString(string s)
        {
            var res = s.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries).ToList();
            return res;
        }

        static long CalcSources()
        {
            string fg = @"C:\imz3\HolaJSChallenge\Files\data.bin.gz";
            if (File.Exists(fg))
                File.Delete(fg);

            var p = Process.Start(@"C:\imz3\HolaJSChallenge\Files\compress.bat");
            p.WaitForExit();

            var f = new FileInfo(fg);
            var sz = f.Length;

            f = new FileInfo(@"C:\imz3\HolaJSChallenge\Files\module.min.js");
            sz += f.Length;

            return sz;
        }

        static void Main(string[] args)
        {
            // loadTests(spath_tests_folder);
            // CombineTests(spath_tests_folder, spath_tests_2);

            int filterBufLen = 506464;
            int maxStringLen = 12;
            int endingsCount = 23;
            double err = 0.04;

            var sz = LoadAndOrderAndSave(spath0, spath2, spathe, maxStringLen);
            SaveAvailable2Beg(spath2, spath2e, spath3, err);

            TreeAnalyze(spath3, spath_ends, maxStringLen, filterBufLen, endingsCount);

            var buf = File.ReadAllLines(spath3);

            var excs2 = File.ReadAllLines(spathe).ToList();
            var ends = File.ReadAllLines(spath_ends).ToList();
            var d2b = File.ReadAllLines(spath2e).ToList();

            Console.WriteLine("d2b:{0}",d2b.Count);

            var flt = new PreFilter(excs2, ends, d2b, maxStringLen);

            Dictionary<string, bool> dicf = new Dictionary<string, bool>();

            List<string> buf2 = new List<string>();

            Console.WriteLine("Words before filtering:{0}",buf.Length);
            // filter buffer
            foreach(var sb in buf)
            {
                string sbase;
                if (flt.WordStatus(sb, out sbase) == 2)
                    dicf[sbase] = true;
            }

            buf2 = dicf.Keys.ToList();
            buf2.Sort();

            Console.WriteLine("Words after {0} level filtering:{1}",ends.Count,buf2.Count);

            var bf = new BlumFilter(filterBufLen);
            bf.AddRange(buf2);

            if (File.Exists(spath_filter))
                File.Delete(spath_filter);

            File.WriteAllBytes(spath_filter, bf.GetArray());

            // pack data
            DataPack.Pack(maxStringLen, buf2.Count, filterBufLen, spath_data, spath_filter, spathe, spath_ends, spath2e);

            TestBlum(spath_data);
            var cs = CalcSources();
            Console.WriteLine("Packet size:{0} Kb, overflow:{1} bytes", cs/1024.0, cs - 64*1024);
            Console.ReadLine();

            return;
        }

    }
}
