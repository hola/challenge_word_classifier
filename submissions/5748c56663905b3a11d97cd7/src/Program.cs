using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EnglishWords
{
    class Program
    {
        private static readonly int bytesCount = 64104;
        private static String[] rareDigrams = new[] { "gk", "qa", "wg", "cb", "fb", "fd", "zb", "kg", "mk", "fh", "cf", "cg", "xf", "xb", "bk", "fp", "xm", "fw", "vn", "zm", "kj", "fg", "zk", "zs", "lj", "xw", "zw", "cw", "qi", "zt", "zn", "pv", "hz", "vt", "vd", "zd", "fk", "wz", "pj", "mj", "gj", "lq", "vc", "zc", "zr", "zv", "js", "jr", "rx", "vk", "xd", "cv", "hj", "jn", "gz", "qs", "hq", "mz", "vm", "yy", "zp", "gv", "tq", "xn", "jc", "jd", "xv", "yj", "dq", "xx", "zg", "lx", "wv", "xr", "vg", "vp", "bz", "xg", "jh", "jy", "xq", "jp", "qe", "fj", "jk", "vh", "qr", "bq", "jl", "jm", "jt", "dx", "mq", "qt", "tx", "bx", "jj", "mx", "ql", "qq", "vf", "yq", "zf", "fv", "qm", "wj", "fz", "pq", "pz", "qd", "qo", "qw", "sx", "zq", "cj", "jf", "jg", "jw", "qn", "vz", "cx", "fx", "jb", "gq", "jv", "kq", "px", "qb", "qc", "qf", "qv", "vb", "vw", "vx", "fq", "kz", "qk", "qp", "xk", "xz", "kx", "qg", "qh", "qy", "wq", "zj", "gx", "hx", "vj", "wx", "jq", "jx", "jz", "qj", "qx", "qz", "vq", "xj", "zx" };

        static void Main(string[] args)
        {
            //RemoveBelongings();
            //CountFirstLetters();
            CountLastLetters();
            //CountLetters();
            //CountDigrams();
            //LoadTestCases();
            //CreareBloomSource();
            //GenerateBloomFilter();
            Console.WriteLine("Done");
            Console.ReadKey();
        }

        private static void RemoveBelongings()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words.txt");
            var uniqueWords = words.Where(w => !w.EndsWith("'s")).Select(w => w.ToLower()).ToArray();
            File.WriteAllLines(@"D:\Projects\EnglishWords\Info\words-unique.txt", uniqueWords);
        }

        private static void CreareBloomSource()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words-unique-filtered.txt");
            var uniqueWords = words
                .Where(w => !w.EndsWith("'s"))
                .Select(w => w.ToLower())
                .Select(w => w.Length > 8 ? w.Substring(0, 8) : w)
                .Distinct()
                .ToArray();
            File.WriteAllLines(@"D:\Projects\EnglishWords\Info\words-bloom.txt", uniqueWords);
        }

        private static void CountFirstLetters()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words-unique.txt");
            var groups = words.GroupBy(w => w.First()).OrderByDescending(g => g.Count());
            Console.Write("\r\n\r\n\r\nFirst letters: \r\n\r\n");
            foreach (var g in groups)
            {
                Console.WriteLine(g.Key + " - " + (double)g.Count() / words.Length * 100);
            }
        }

        private static void CountLastLetters()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words-unique.txt");
            var groups = words.GroupBy(w => w.Last()).OrderByDescending(g => g.Count());
            Console.Write("\r\n\r\n\r\nLast letters: \r\n\r\n");
            foreach (var g in groups)
            {
                Console.WriteLine(g.Key + " - " + (double)g.Count() / words.Length * 100);
            }
        }

        private static void CountLetters()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words-unique.txt");
            var dict = new Dictionary<char, int>();
            var total = 0;
            foreach(var word in words)
            {
                total += word.Length;
                foreach(var c in word)
                {
                    if (!dict.ContainsKey(c))
                    {
                        dict[c] = 0;
                    }
                    dict[c]++;
                }
            }
            Console.Write("\r\n\r\n\r\nTotal letters: \r\n\r\n");
            foreach (var g in dict.OrderByDescending(g => g.Value))
            {
                Console.WriteLine(g.Key + " - " + (double)g.Value / total * 100);
            }
        }

        private static void CountDigrams()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words-unique.txt");
            var dict = new Dictionary<string, int>();
            var total = 0;
            for (var i = 97; i <= 122; i++)
            {
                for (var j = 97; j <= 122; j++)
                {
                    dict.Add((char)i + "" + (char)j, 0);
                }
            }
            foreach (var word in words)
            {
                total += word.Length;
                for (var i = 0; i < word.Length - 1; i++)
                {
                    var c = word.Substring(i, 2);
                    if (dict.ContainsKey(c))
                    {
                        dict[c]++;
                    }
                }
            }
            Console.Write("\r\n\r\n\r\nTotal letters: \r\n\r\n");
            foreach (var g in dict.OrderByDescending(g => g.Value))
            {
                Console.WriteLine(g.Key + " - " + (double)g.Value / total * 100);
            }
        }

        private static void LoadTestCases()
        {
            var writer = new StreamWriter(@"D:\Projects\EnglishWords\Info\testcase.txt", false);
            using (WebClient client = new WebClient())
            {
                for (var i = 0; i < 500; i++)
                {
                    string s = client.DownloadString("https://hola.org/challenges/word_classifier/testcase/" + i);
                    var s1 = s.Replace("{\r\n", "").Replace("\r\n}", ",");
                    writer.Write(s1);
                }
            }
            writer.Close();
        }

        private static void GenerateBloomFilter()
        {
            var words = File.ReadAllLines(@"D:\Projects\EnglishWords\Info\words-bloom.txt");
            var buffer = new Byte[bytesCount];
            foreach(var word in words) {
                var hash = GetHash(word);
                var position = hash / 8;
                var mask = 128 >> (hash % 8);
                buffer[position] = (Byte)(buffer[position] | mask);
            }
            File.WriteAllBytes(@"D:\Projects\EnglishWords\Info\bloom", buffer);
        }

        private static int GetHash(String str)
        {
            var hash = 0;
            if (str.Length == 0) {
                return hash;
            }
            for (var i = 0; i < str.Length; i++)
            {
                var chr = str[i];
                hash = ((hash << 5) - hash) + chr;
            }
            return Math.Abs(hash) % (bytesCount * 8);
        }
    }
}
