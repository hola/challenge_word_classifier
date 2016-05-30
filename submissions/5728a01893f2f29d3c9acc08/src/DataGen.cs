using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

class DataGen
{
    static uint HashCode(string s)
    {
        uint hash = (uint)(75797 * s.Length);
        for (int i = 0; i < s.Length; i++)
            hash = ((hash << 7) - hash) + s[i];
        return hash;
    }

    static void Main(string[] args)
    {
        int maxHash = 0x7CEFF;

        string repls = "'s-|s-|ly-|ed-|ing-|nes-|ion-|les-|ful-|lie-|ive-|ie-y|us-u|st-r|te-t|sse-s|se-s|cal-c|ble-b";
        var replsArr = new List<Tuple<Regex, string>>();
        foreach (string repl in repls.Split('|'))
        {
            string[] temp = repl.Split('-');
            replsArr.Add(new Tuple<Regex, string>(new Regex(temp[0] + "$"), temp[1]));
        }

        var hashes = new HashSet<int>();
        var words = new HashSet<string>();
        string[] wordsOrig = File.ReadAllLines("words_orig.txt");
        foreach (string word in wordsOrig)
        {
            string lowWord = word.ToLower();
            foreach (var repl in replsArr)
                lowWord = repl.Item1.Replace(lowWord, repl.Item2);
            if (lowWord.Length > 14)
                continue;
            int hash = (int)(HashCode(lowWord) % maxHash);
            hashes.Add(hash);
            words.Add(lowWord);
        }

        File.WriteAllLines("words_flt.txt", words);

        byte[] map = new byte[(maxHash + 7) / 8];
        foreach (int hash in hashes)
        {
            int i = hash / 8;
            int j = hash % 8;
            map[i] |= (byte)(1 << j);
        }

        byte[] raw = new byte[maxHash];
        foreach (int hash in hashes)
            raw[hash] = 0xFF;
        File.WriteAllBytes("hashmap.raw", raw);

        var partList = new List<string>();
        if (!File.Exists("partList.txt"))
        {
            var parts = new Dictionary<string, int>();
            for (char i = 'a'; i <= 'z'; i++)
                for (char j = 'a'; j <= 'z'; j++)
                    parts[i.ToString() + j] = 0;

            string[] partKeys = parts.Keys.ToArray();
            foreach (string s in words)
                foreach (string pk in partKeys)
                    if (s.Contains(pk))
                        parts[pk]++;

            var srp = parts.ToList().OrderBy(v => v.Value);
            foreach (var kv in srp)
                partList.Add(kv.Key + ' ' + kv.Value);

            File.WriteAllLines("partList.txt", partList);
        }
        else
            partList = File.ReadAllLines("partList.txt").ToList();

        var partListSlice = partList.Take(142).Select(s => s.Split(' ')[0]).ToList();
        partListSlice.Sort();
        string badRe = "(" + string.Join("|", partListSlice) + ")";
        string strData = badRe + "*" + repls;

        FileStream fs = File.Create("hashmap.bin");
        fs.Write(map, 0, map.Length);
        fs.Write(Encoding.ASCII.GetBytes(strData), 0, strData.Length);
        fs.Close();

        Console.WriteLine("Word count: " + words.Count);
        Console.WriteLine("Hash count: " + hashes.Count);
    }
}