using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace HolaTest
{
  public class Module
  {
    private class AbsentData
    {
      public byte StartIndex;
      public byte EndIndex;
      public byte MinLength;
      public byte MaxLength;
      public List<string> Substrings = new List<string>();
    }

    private const int ByteSize = 8;
    private const int EndingsBitsCount = 9697;
    public static int BitsCount = 520019;

    private const int VowelsMaxCountInRow = 4;
    private const int ConsonantsMaxCountInRow = 4;

    private const string Apostrophe = "'";
    private const string Vowels = "aeiouy";
    private const string Alphabet = "abcdefghijklmnopqrstuvwxyz";

    private static readonly Func<string, int, int>[] HashFuncs =
    {
      //GetHashCode,
      Fnv1a
    };

    private static IReadOnlyList<string> Postfixes = new[] { "ing", "es", "ed", "ly", "s", "e" };
    private static IReadOnlyList<string> Prefixes = new[] { "dis", "un", "co", "re", "pr", "no", "in", "de" };

    //private static Dictionary<int, Dictionary<short, int>> Masks;
    //private static HashSet<string> Masks;

    private static AbsentData[] Absents =
    {
      new AbsentData
      {
        StartIndex = 0,
        EndIndex = 1,
        MinLength = 1,
        MaxLength = 15
      },
      new AbsentData
      {
        StartIndex = 1,
        EndIndex = 3,
        MinLength = 2,
        MaxLength = 5
      },
      new AbsentData
      {
        StartIndex = 6,
        EndIndex = 9,
        MinLength = 7,
        MaxLength = 12
      },
      new AbsentData
      {
        StartIndex = 10,
        EndIndex = 14,
        MinLength = 11,
        MaxLength = 15
      },
      new AbsentData
      {
        StartIndex = 2,
        EndIndex = 9,
        MinLength = 9,
        MaxLength = 11
      },
      new AbsentData
      {
        StartIndex = 4,
        EndIndex = 6,
        MinLength = 8,
        MaxLength = 11
      },
      new AbsentData
      {
        StartIndex = 3,
        EndIndex = 5,
        MinLength = 5,
        MaxLength = 7
      }
    };

    private IReadOnlyList<string> _endings;
    private IReadOnlyList<string> _clippedWords;

    private byte[] _endingsBytes;
    private byte[] _bytes;
    private long _size;

    public int Size
    {
      get { return (int)_size; }
    }

    public void Init(byte[] bytes)
    {
      var endingsBytesCount = (int) Math.Ceiling((double) EndingsBitsCount/ByteSize);
      var bytesCount = (int) Math.Ceiling((double) BitsCount/ByteSize);
      using (var ms = new MemoryStream(bytes))
      {
        using (var binaryReader = new BinaryReader(ms))
        {
          _bytes = binaryReader.ReadBytes(bytesCount);
          foreach (var absent in Absents)
          {
            absent.MinLength = binaryReader.ReadByte();
            absent.MaxLength = binaryReader.ReadByte();
            absent.StartIndex = binaryReader.ReadByte();
            absent.EndIndex = binaryReader.ReadByte();
            var substringsCount = binaryReader.ReadInt16();
            absent.Substrings = new List<string>();
            for (int i = 0; i < substringsCount; i++)
            {
              var s = string.Concat(binaryReader.ReadChars(2));
              absent.Substrings.Add(s);
            }
          }
          _endingsBytes = binaryReader.ReadBytes(endingsBytesCount);
        }
      }
    }

    public bool Test(string word)
    {
      var index = word.LastIndexOf(Apostrophe, StringComparison.Ordinal);
      if (index == word.Length - 1)
      {
        return false;
      }
      var testWord = index >= 0 ? word.Substring(0, index) : word;
      var ending = index >= 0 ? word.Substring(index + 1) : null;
      testWord = testWord.Replace(Apostrophe, string.Empty);

      if (string.IsNullOrEmpty(testWord))
      {
        return false;
      }

      if (!string.IsNullOrEmpty(ending) && !HashFuncs.Select((func, i) => GetBit(_endingsBytes, func(ending, EndingsBitsCount))).All(_ => _))
      {
        return false;
      }

      foreach (var absent in Absents)
      {
        foreach (var str in absent.Substrings)
        {
          if (testWord.Length >= absent.MinLength && testWord.Length <= absent.MaxLength)
          {
            var i = testWord.IndexOf(str, absent.StartIndex, StringComparison.Ordinal);
            if (i >= absent.StartIndex && i <= absent.EndIndex)
            {
              return false;
            }
          }
        }
      }

      if (!Validate(testWord) || !Validate(word.Replace(Apostrophe, string.Empty)))
      {
        return false;
      }

      //Dictionary<short, int> masks;
      //if (testWord.Length >= 10 && testWord.Length <= 15)
      //{
      //  if (Masks.TryGetValue(testWord.Length, out masks))
      //  {
      //    var mask = GetMask(testWord);
      //    if (!masks.ContainsKey(mask))
      //    {
      //      return false;
      //    }
      //  }
      //}

      //if (testWord.Length >= 1 && testWord.Length <= 15)
      //{
      //  if (!Masks.Contains(GetMask(testWord)))
      //  {
      //    return false;
      //  }
      //}

      foreach (var postfix in Postfixes)
      {
        if (testWord.Length > 5 && testWord.EndsWith(postfix))
        {
          testWord = testWord.Substring(0, testWord.Length - postfix.Length);
          break;
        }
      }

      foreach (var prefix in Prefixes)
      {
        if (testWord.Length > 7 && testWord.StartsWith(prefix))
        {
          testWord = testWord.Substring(prefix.Length);
          break;
        }
      }

      testWord = testWord.Clip();
      if (string.IsNullOrEmpty(testWord))
      {
        return false;
      }

      return HashFuncs.Select((func, i) => GetBit(_bytes, func(testWord, BitsCount))).All(_ => _);
    }

    private static int GetHashCode(string word, int size)
    {
      var y = 33974 * 37 ^ 359;
      var x = Math.Abs(word.Aggregate((long) 1, (current, t) => y*current + (byte) t));
      return (int)(x % size);
    }

    private static int Fnv1a(string word, int size)
    {
      uint hash = 2166136261;
      foreach (var c in word)
      {
        var b = (byte)c;
        hash ^= b;
        unchecked
        {
          hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
      }
      return (int)(hash % size);
    }

    private bool GetBit(byte[] bytes, int index)
    {
      var byteIndex = index/ByteSize;
      var b = bytes[byteIndex];
      var bitIndex = index%ByteSize;
      return ((b >> bitIndex) & 1) == 1;
    }


    // generating
    public byte[] Generate()
    {
      IReadOnlyList<string> masksDiff = new List<string>();
      IReadOnlyList<string> wordsWithoutEndings = new List<string>();

      //var failed = JsonConvert.DeserializeObject<List<KeyValuePair<string, bool>>>(File.ReadAllText("failed.js"));
      //var incorrects = failed.Where(_ => !_.Value).Select(_ => _.Key).ToList();
      //Dictionary<string, int> endingsMap1;
      //var failedWordsWithoutEndings = GetEndings(incorrects, out endingsMap1);
      //GetStatistics(failedWordsWithoutEndings);

      if (_clippedWords == null)
      {
        var lines = File.ReadAllLines("words.txt");
        var words = PrepareWords(lines);
        File.WriteAllLines("prepared-words.txt", words);
        //IReadOnlyList<string> words = File.ReadAllLines("prepared-words.txt");

        Dictionary<string, int> endingsMap;
        wordsWithoutEndings = GetEndings(words, out endingsMap);
        _endings = endingsMap.Keys.OrderBy(_ => _).ToList();
        File.WriteAllLines("endings.txt", _endings);
        File.WriteAllLines("words-without-endings.txt", wordsWithoutEndings);

        //_endings = File.ReadAllLines("endings.txt");
        //wordsWithoutEndings = File.ReadAllLines("words-without-endings.txt");

        Console.WriteLine("Endings count {0}", _endings.Count);
        Console.WriteLine("Words without endings count {0}", wordsWithoutEndings.Count);

        var valids = wordsWithoutEndings.Where(Validate).ToList();

        //var masks = GetMasks(valids);
        //var masksList = masks.Where(_ => _.Key >= 1 && _.Key <= 15)
        //  .SelectMany(x => x.Value.OrderByDescending(_ => _.Value).Select(_ => _.Key))
        //  .OrderBy(_ => _)
        //  .ToList();
        //masksDiff = Helper.WordsToDistances(masksList);
        //Masks = new HashSet<string>(masksList);

        IReadOnlyList<string> postfixes;
        postfixes = GetPostfixes(wordsWithoutEndings.Where(_ => _.Length > 5).ToList()).Take(4000).ToList();
        File.WriteAllLines("all-postfixes.txt", postfixes);
        //postfixes = File.ReadAllLines("all-postfixes.txt");
        postfixes = postfixes.Take(5).OrderByDescending(_ => _.Length).ToList();
        File.WriteAllLines("postfixes.txt", postfixes);
        //postfixes = File.ReadAllLines("postfixes.txt");
        //Postfixes = postfixes;

        var wordsWithoutPostfixes = new List<string>();
        foreach (var word in valids)
        {
          string newWord = word;
          foreach (var postfix in Postfixes)
          {
            if (word.Length > 5 && word.EndsWith(postfix))
            {
              newWord = word.Substring(0, word.Length - postfix.Length);
              break;
            }
          }
          wordsWithoutPostfixes.Add(newWord);
        }
        wordsWithoutPostfixes =
          wordsWithoutPostfixes.Where(_ => !string.IsNullOrEmpty(_)).Distinct().OrderBy(_ => _).ToList();
        File.WriteAllLines("words-without-postfixes.txt", wordsWithoutPostfixes);
        //IReadOnlyList<string> wordsWithoutPostfixes = File.ReadAllLines("words-without-postfixes.txt");
        Console.WriteLine("Words without postfixes count {0}", wordsWithoutPostfixes.Count);

        IReadOnlyList<string> prefixes;
        prefixes = GetPrefixes(wordsWithoutPostfixes.Where(_ => _.Length > 7).ToList());
        File.WriteAllLines("all-prefixes.txt", prefixes);
        //prefixes = File.ReadAllLines("all-prefixes.txt");
        prefixes = prefixes.Take(6).OrderByDescending(_ => _.Length).ToList();
        File.WriteAllLines("prefixes.txt", prefixes);
        //prefixes = File.ReadAllLines("prefixes.txt");
        //Prefixes = prefixes;

        var wordsWithoutPrefixes = new List<string>();
        foreach (var word in wordsWithoutPostfixes)
        {
          string newWord = word;
          foreach (var prefix in Prefixes)
          {
            if (word.Length > 7 && word.StartsWith(prefix))
            {
              newWord = word.Substring(prefix.Length);
              break;
            }
          }
          wordsWithoutPrefixes.Add(newWord);
        }
        wordsWithoutPrefixes = wordsWithoutPrefixes.Where(_ => !string.IsNullOrEmpty(_)).Distinct().OrderBy(_ => _).ToList();
        File.WriteAllLines("words-without-prefixes.txt", wordsWithoutPrefixes);
        //IReadOnlyList<string> wordsWithoutPrefixes = File.ReadAllLines("words-without-prefixes.txt");
        Console.WriteLine("Words without prefixes count {0}", wordsWithoutPrefixes.Count);

        _clippedWords = wordsWithoutPrefixes
          .Select(_ => _.Clip())
          .Distinct()
          .OrderBy(_ => _)
          .ToList();
        File.WriteAllLines("clipped-words.txt", _clippedWords);
        //_clippedWords = File.ReadAllLines("clipped-words.txt");
        Console.WriteLine("Clipped words count {0}", _clippedWords.Count);
      }

      CollectAnalysesData(wordsWithoutEndings);
      CollectStatistics();
      File.WriteAllText("absents.js", JsonConvert.SerializeObject(Absents));
      //Absents = JsonConvert.DeserializeObject<AbsentData[]>(File.ReadAllText("absents.js"));

      var bytes = BloomFilter(_clippedWords, BitsCount);
      var endingsBytes = BloomFilter(_endings, EndingsBitsCount);

      using (var ms = new MemoryStream())
      {
        using (var binaryWriter = new BinaryWriter(ms))
        {
          binaryWriter.Write(bytes);
          foreach (var absent in Absents)
          {
            binaryWriter.Write(absent.MinLength);
            binaryWriter.Write(absent.MaxLength);
            binaryWriter.Write(absent.StartIndex);
            binaryWriter.Write(absent.EndIndex);
            binaryWriter.Write((short)absent.Substrings.Count);
            foreach (var str in absent.Substrings)
            {
              binaryWriter.Write(str.ToCharArray());
            }
          }
          binaryWriter.Write(endingsBytes);
          ms.Position = 0;
          //using (var stream = new MemoryStream())
          using (var stream = File.Create("data.gz"))
          {
            _size = Helper.GZipStream(ms, stream);
          }
          return ms.ToArray();
        }
      }
    }

    private static bool Validate(string word)
    {
      return !(word.MaxCountInRow(letter => !Vowels.Contains(letter)) > ConsonantsMaxCountInRow
               || word.MaxCountInRow(letter => Vowels.Contains(letter)) > VowelsMaxCountInRow
               //|| word.Length > 14 && "jq".Contains(word[14])
               || word.Length > 15);
    }

    //private static Dictionary<int, Dictionary<short, int>> GetMasks(IEnumerable<string> words)
    //{
    //  var result = new Dictionary<int, Dictionary<short, int>>();
    //  foreach (var word in words)
    //  {
    //    Dictionary<short, int> masks;
    //    if (!result.TryGetValue(word.Length, out masks))
    //    {
    //      masks = new Dictionary<short, int>();
    //      result[word.Length] = masks;
    //    }
    //    masks.Increase(GetMask(word));
    //  }
    //  return result;
    //}

    //private static short GetMask(string word)
    //{
    //  short mask = 0;
    //  for (int i = 0; i < word.Length; i++)
    //  {
    //    if (Vowels.Contains(word[i]))
    //    {
    //      mask |= (short)(1 << i);
    //    }
    //  }
    //  return mask;
    //}

    private static Dictionary<int, Dictionary<string, int>> GetMasks(IEnumerable<string> words)
    {
      var result = new Dictionary<int, Dictionary<string, int>>();
      foreach (var word in words)
      {
        Dictionary<string, int> masks;
        if (!result.TryGetValue(word.Length, out masks))
        {
          masks = new Dictionary<string, int>();
          result[word.Length] = masks;
        }
        masks.Increase(GetMask(word));
      }
      return result;
    }

    private static string GetMask(string word)
    {
      return string.Concat(word.Select(l => Vowels.Contains(l) ? 1 : 0));
    }

    private static IReadOnlyList<string> PrepareWords(IEnumerable<string> words)
    {
      return words
        .Where(_ => !string.IsNullOrWhiteSpace(_))
        .Select(_ => _.ToLowerInvariant())
        .Distinct()
        .OrderBy(_ => _)
        .ToList();
    }

    private static IReadOnlyList<string> GetEndings(IReadOnlyList<string> words, out Dictionary<string, int> endings)
    {
      var newWords = new HashSet<string>();
      endings = new Dictionary<string, int>();
      foreach (var word in words)
      {
        var newWord = word;
        var index = word.LastIndexOf(Apostrophe, StringComparison.Ordinal);
        if (index >= 0)
        {
          var str = word.Substring(index + 1);
          if (!string.IsNullOrEmpty(str))
          {
            endings.Increase(str);
          }
          newWord = word.Substring(0, index);
        }
        newWord = newWord.Replace(Apostrophe, string.Empty);
        if (!newWords.Contains(newWord))
        {
          newWords.Add(newWord);
        }
      }

      foreach (var item in endings.OrderByDescending(_ => _.Value))
      {
        //Console.WriteLine("{0} {1}", item.Key, item.Value);
      }
      return newWords.OrderBy(_ => _).ToList();
    }

    private static IReadOnlyList<string> GetPostfixes(IReadOnlyList<string> words)
    {
      var checkedWords = new HashSet<string>();
      var postfixes = new Dictionary<string, int>();
      for (var i = 0; i < words.Count; i++)
      {
        var word = words[i];
        var str = word;
        while (str.Length > 1)
        {
          if (checkedWords.Contains(str))
          {
            break;
          }
          checkedWords.Add(str);
          for (int j = i + 1; j < words.Count; j++)
          {
            var nextWord = words[j];
            if (nextWord.StartsWith(str))
            {
              var postfix = nextWord.Substring(str.Length);
              postfixes.Increase(postfix);
            }
            else
            {
              break;
            }
          }
          str = word.Substring(0, word.Length - 1);
        }
      }
      var temp = postfixes.OrderByDescending(_ => _.Value);
      return temp.Select(_ => _.Key).ToList();
    }

    private static IReadOnlyList<string> GetPrefixes(IReadOnlyList<string> words)
    {
      var checkedWords = new HashSet<string>();
      var prefixes = new Dictionary<string, int>();
      for (var i = 0; i < words.Count; i++)
      {
        var word = words[i];
        var n = 2;
        while (n <= word.Length)
        {
          var prefix = word.Substring(0, n);
          if (checkedWords.Contains(prefix))
          {
            break;
          }
          checkedWords.Add(prefix);
          for (int j = i + 1; j < words.Count; j++)
          {
            var nextWord = words[j];
            if (nextWord.StartsWith(prefix))
            {
              prefixes.Increase(prefix);
            }
            else
            {
              break;
            }
          }
          n++;
        }
      }
      var temp = prefixes.OrderByDescending(_ => _.Value);
      return temp.Select(_ => _.Key).ToList();
    }

    private static Dictionary<int, int> GetStatistics(IReadOnlyList<string> words)
    {
      var statistics = new Dictionary<int, int>();
      foreach (var word in words)
      {
        var length = word.Length;
        statistics.Increase(length);
      }
      foreach (var item in statistics.OrderByDescending(_ => _.Value))
      {
        Console.WriteLine("{0} {1}", item.Key, item.Value);
      }
      return statistics;
    }

    [Serializable]
    private class AnalyseData
    {
      public string Str;
      public int Length;
      public int Index;
    }

    private static void CollectAnalysesData(IReadOnlyList<string> words)
    {
      var data = new List<AnalyseData>();
      foreach (var word in words)
      {
        if (word.Length <= 20)
        {
          data.AddRange(GetAnalysesData(word, 0, 2));
        }
      }

      //BinaryFormatter formatter = new BinaryFormatter();
      //using (FileStream fs = new FileStream("stat.dat", FileMode.OpenOrCreate))
      //{
      //  formatter.Serialize(fs, data);
      //}

      File.WriteAllText("stat.js", JsonConvert.SerializeObject(data));

      //var failed = JsonConvert.DeserializeObject<List<KeyValuePair<string, bool>>>(File.ReadAllText("failed-test.js"));
      //var incorrects = failed.Where(_ => !_.Value).Select(_ => _.Key).ToList();

      //var incorrectData = new List<AnalyseData>();
      //foreach (var word in incorrects)
      //{
      //  if (word.Length <= 20)
      //  {
      //    var testWord = GetTestWord(word);
      //    if (!string.IsNullOrEmpty(testWord))
      //    {
      //      incorrectData.AddRange(GetAnalysesData(testWord, 0, 2));
      //    }
      //  }
      //}

      //File.WriteAllText("failed-stat.js", JsonConvert.SerializeObject(incorrectData));
    }

    private static string GetTestWord(string word)
    {
      var index = word.LastIndexOf(Apostrophe, StringComparison.Ordinal);
      if (index == word.Length - 1)
      {
        return null;
      }
      var testWord = index >= 0 ? word.Substring(0, index) : word;
      return testWord.Replace(Apostrophe, string.Empty);
    }

    private static void CollectStatistics()
    {
      //List<AnalyseData> data;
      //BinaryFormatter formatter = new BinaryFormatter();
      //using (FileStream fs = new FileStream("stat.dat", FileMode.Open))
      //{
      //  data = (List<AnalyseData>) formatter.Deserialize(fs);
      //}

      var consonants = Alphabet.Except(Vowels).ToList();
      //List<string> all = Vowels.SelectMany(s1 => Vowels, (s1, s2) => string.Concat(s1, s2)).ToList();
      List<string> all = Alphabet.SelectMany(s1 => Alphabet, (s1, s2) => string.Concat(s1, s2)).ToList();

      var data = JsonConvert.DeserializeObject<List<AnalyseData>>(File.ReadAllText("stat.js"));
      //var failedData = JsonConvert.DeserializeObject<List<AnalyseData>>(File.ReadAllText("failed-stat.js"));

      foreach (var absent in Absents)
      {
        //var presentInFailedGroups = failedData
        //  .Where(
        //    _ =>
        //      _.Length >= absent.MinLength && _.Length <= absent.MaxLength && _.Index >= absent.StartIndex &&
        //      _.Index <= absent.EndIndex)
        //  //.Select(_ => _.Str)
        //  //.Distinct()
        //  .GroupBy(_ => _.Str)
        //  .Select(_ => new
        //  {
        //    Str = _.Key,
        //    Count = _.Count()
        //  })
        //  .OrderByDescending(_ => _.Count)
        //  .ToList();

        //var totalSum = presentInFailedGroups.Sum(_ => _.Count);
        //var sum = 0;

        //var presentInFailed = presentInFailedGroups
        //  .Take((int)Math.Ceiling(presentInFailedGroups.Count * 0.73))
        //  //.TakeWhile(_ =>
        //  //{
        //  //  sum += _.Count;
        //  //  return (double) sum/totalSum < 0.5;
        //  //})
        //  .Select(_ => _.Str)
        //  .ToList();

        var present = data
          .Where(
            _ =>
              _.Length >= absent.MinLength && _.Length <= absent.MaxLength && _.Index >= absent.StartIndex &&
              _.Index <= absent.EndIndex)
          .Select(_ => _.Str)
          //.Where(s => Vowels.Contains(s[0]) && Vowels.Contains(s[1]))
          //.Where(s => !Vowels.Contains(s[0]) && !Vowels.Contains(s[1]))
          .Distinct()
          .ToList();

        var absentInCorrect = all.Except(present).ToList();
        absent.Substrings = absentInCorrect;
        //absent.Substrings = absentInCorrect.Intersect(presentInFailed).ToList();
      }
      Console.WriteLine("Absents size {0}", Absents.Sum(_ => _.Substrings.Count*2 + 6));
    }

    private static IEnumerable<AnalyseData> GetAnalysesData(string word, int startIndex, int length)
    {
      for (int i = startIndex; i < word.Length - length + 1; i++)
      {
        var str = word.Substring(i, length);
        yield return new AnalyseData
        {
          Str = str,
          Index = i,
          Length = word.Length
        };
      }
    }

    private static byte[] BloomFilter(IReadOnlyList<string> words, int bitsCount)
    {
      var bits = new bool[bitsCount];
      foreach (var word in words)
      {
        for (int i = 0; i < HashFuncs.Length; i++)
        {
          var hashFunction = HashFuncs[i];
          var index = hashFunction(word, bitsCount);
          bits[index] = true;
        }
      }

      var bytesCount = (int)Math.Ceiling((double)bitsCount / ByteSize);
      var bytes = new byte[bytesCount];
      for (int i = 0; i < bytesCount; i++)
      {
        var b = bytes[i];
        var startIndex = i*ByteSize;
        for (int j = 0; j < ByteSize; j++)
        {
          var bitIndex = startIndex + j;
          if (bitIndex >= bitsCount)
          {
            break;
          }
          if (bits[bitIndex])
          {
            b |= (byte) (1 << j);
          }
        }
        bytes[i] = b;
      }
      return bytes;
    }
  }
}