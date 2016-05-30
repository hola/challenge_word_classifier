using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using ICSharpCode.SharpZipLib.GZip;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;

namespace HolaTest
{
  public static class Helper
  {
    private const string UrlFormat = "https://hola.org/challenges/word_classifier/testcase/{0}";
    private const string Folder = "testcases";

    public static void LoadTestcases()
    {
      const int seed = 33974;
      if (!Directory.Exists(Folder))
      {
        Directory.CreateDirectory(Folder);
      }
      var random = new Random(seed);
      for (var i = 0; i < 10000; i++)
      {
        var number = 7525199 + i;
        //var number = random.Next(1, int.MaxValue);
        var url = string.Format(UrlFormat, number);
        var webRequest = WebRequest.Create(url);
        using (var response = webRequest.GetResponse())
        {
          using (var responseStream = response.GetResponseStream())
          {
            var fileName = string.Format("{0}/{1}.js", Folder, number);
            using (var fileStream = File.Create(fileName))
            {
              responseStream.CopyTo(fileStream);
            }
          }
        }
      }
    }

    public static void GenerateCommonTestFile()
    {
      var testCases = new Dictionary<int, Dictionary<string, bool>>();
      foreach (var filePath in Directory.GetFiles(Folder))
      {
        var fileName = Path.GetFileNameWithoutExtension(filePath);
        int seed;
        if (int.TryParse(fileName, out seed))
        {
          if (!testCases.ContainsKey(seed))
          {
            var dataStr = File.ReadAllText(filePath);
            var testCase = JsonConvert.DeserializeObject<Dictionary<string, bool>>(dataStr);
            testCases.Add(seed, testCase);
          }
        }
      }

      var s = JsonConvert.SerializeObject(testCases, Formatting.Indented);
      File.WriteAllText("all-test-cases.js", s);
    }

    public static long GZipFile(string name)
    {
      using (var fileStream = File.OpenRead(name))
      {
        using (var compressedFileStream = File.Create(name + ".gz"))
        {
          using (GZipOutputStream compressionStream = new GZipOutputStream(compressedFileStream))
          {
            compressionStream.SetLevel(9);
            fileStream.CopyTo(compressionStream);
            compressionStream.Finish();
            return compressionStream.Length;
          }
        }
      }
    }

    public static long GZipStream(Stream stream)
    {
      using (var compressedFileStream = new MemoryStream())
      {
        using (GZipOutputStream compressionStream = new GZipOutputStream(compressedFileStream))
        {
          compressionStream.SetLevel(9);
          stream.CopyTo(compressionStream);
          compressionStream.Finish();
          return compressionStream.Length;
        }
      }
    }

    public static long GZipStream(Stream inputStream, Stream outputStream)
    {
      using (GZipOutputStream compressionStream = new GZipOutputStream(outputStream))
      {
        compressionStream.SetLevel(9);
        inputStream.CopyTo(compressionStream);
        compressionStream.Finish();
        return compressionStream.Length;
      }
    }

    public static IReadOnlyList<string> WordsToDistances(IReadOnlyList<string> words)
    {
      string[] distances = new string[words.Count];
      distances[0] = words[0];
      for (int i = 0; i < words.Count - 1; i++)
      {
        distances[i + 1] = GetDistance(words[i], words[i + 1]);
      }
      return distances;
    }

    public static IReadOnlyList<string> WordsFromDistances(IReadOnlyList<string> distances)
    {
      string[] words = new string[distances.Count];
      words[0] = distances[0];
      for (int i = 0; i < distances.Count - 1; i++)
      {
        words[i + 1] = GetWord(words[i], distances[i + 1]);
      }
      return words;
    }

    private static string GetDistance(string word1, string word2)
    {
      int length = word1.Length > word2.Length ? word2.Length : word1.Length;
      int i = 0;
      while (i < length && word1[i] == word2[i])
      {
        i++;
      }
      int n = word1.Length - i;
      string s = word2.Substring(i);
      return n > 0 ? n + s : s;
    }

    private static string GetWord(string previous, string distance)
    {
      var length = 0;
      int i = 0;
      foreach (var c in distance)
      {
        if (char.IsDigit(c))
        {
          var n = (int)char.GetNumericValue(c);
          length = length * 10 + n;
          i++;
        }
        else
        {
          break;
        }
      }
      return previous.Substring(0, previous.Length - i) + distance.Substring(i);
    }

    public static int MinifySolution()
    {
      var source = File.ReadAllText("solution.js");
      var minifier = new Minifier();
      var minifiedScript = minifier.MinifyJavaScript(source);
      File.WriteAllText("solution.min.js", minifiedScript);
      return minifiedScript.Length;
    }
  }
}
