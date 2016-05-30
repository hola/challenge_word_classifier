using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ICSharpCode.SharpZipLib.GZip;
using Newtonsoft.Json;

namespace HolaTest
{
  class Program
  {
    private static int ScriptSize;

    static void Main(string[] args)
    {
      ScriptSize = Helper.MinifySolution();

      var module = new Module();
      Console.WriteLine("Generating...");
      var data = module.Generate();
      var totalSize = module.Size + ScriptSize;
      Console.WriteLine("Data size: {0}, Total: {1}, Script: {2}, Left: {3}", module.Size, totalSize, ScriptSize, 64 * 1024 - totalSize);
      Console.WriteLine("Test...");
      //module.Init(data);
      InitModule(module);
      var testCases = JsonConvert.DeserializeObject<Dictionary<int, Dictionary<string, bool>>>(File.ReadAllText("all-test-cases-1.js"));
      var p = Test(module, testCases);

      //TuneWordLengths(module, p, testCases);
      //TuneBloomFilterSize(module, testCases);

      Console.WriteLine("Press any key to exit...");
      Console.ReadKey();
    }

    private static void InitModule(Module module)
    {
      const string fileName = "data.gz";
      if (File.Exists(fileName))
      {
        byte[] data;
        using (var fileStream = File.OpenRead(fileName))
        {
          using (GZipInputStream decompressionStream = new GZipInputStream(fileStream))
          {
            using (var memoryStream = new MemoryStream())
            {
              decompressionStream.CopyTo(memoryStream);
              data = memoryStream.ToArray();
            }
          }
        }

        module.Init(data);
      }
    }

    private static double Test(Module module, Dictionary<int, Dictionary<string, bool>> testCases)
    {
      var failed = new List<KeyValuePair<string, bool>>();
      var result = new Dictionary<int, double>();
      var corrects = 0;
      var incorrects = 0;
      var totalCorrects = 0;
      var totalIncorrects = 0;
      foreach (var testCase in testCases)
      {
        var seed = testCase.Key;
        var testItems = testCase.Value;
        var n = 0;
        foreach (var item in testItems)
        {
          if (item.Value)
          {
            totalCorrects++;
          }
          else
          {
            totalIncorrects++;
          }
          if (module.Test(item.Key) == item.Value)
          {
            if (item.Value)
            {
              corrects++;
            }
            else
            {
              incorrects++;
            }
            n++;
          }
          else
          {
            failed.Add(item);
          }
        }
        var p = (double) n/testItems.Count;
        result[seed] = p;
      }
      var res = result.Sum(_ => _.Value)/result.Count;
      Console.WriteLine("Test correct words - {0}%", (double) corrects/totalCorrects*100);
      Console.WriteLine("Test incorrect words - {0}%", (double) incorrects/totalIncorrects*100);
      Console.WriteLine("Result - {0}%", res*100);
      var lines = result.Select(_ => string.Format("{0}  {1}", _.Key, _.Value));
      File.WriteAllLines("result.txt", lines);
      File.WriteAllText("failed.js", JsonConvert.SerializeObject(failed, Formatting.Indented));
      File.WriteAllLines("failed.txt", failed.Select(_ => string.Format("\"{0}\": {1}", _.Key, _.Value)));
      return res;
    }

    private static void TuneWordLengths(Module module, double p, Dictionary<int, Dictionary<string, bool>> testCases)
    {
      var primes = GetPrimes();

      const int maxSize = 64100;

      var oldWordsLengths = StringExtensions.WordsLengths.ToArray();
      var oldBitsCount = Module.BitsCount;
      while (true)
      {
        var sourceWordsLength = StringExtensions.WordsLengths.ToArray();
        for (int i = 5; i <= 15; i++)
        {
          var startLength = Math.Max(sourceWordsLength[i] - 3, 0);
          for (int j = startLength; j <= i; j++)
          {
            StringExtensions.WordsLengths[i] = j;
            var reset = false;
            while (true)
            {
              var bytes = module.Generate();
              module.Init(bytes);
              var newP = Test(module, testCases);
              var d = maxSize - module.Size;
              if (newP > p)
              {
                if (d > 0)
                {
                  p = newP;
                  oldWordsLengths = StringExtensions.WordsLengths.ToArray();
                  oldBitsCount = Module.BitsCount;
                  var parametersStr = string.Format("p={0}% size={1}, bitsCount={2}, lengths={3}", p * 100, module.Size,
                    Module.BitsCount, string.Join(", ", StringExtensions.WordsLengths));
                  File.AppendAllLines("parameters.txt", new[] { parametersStr });
                }
              }
              else
              {
                if (d <= 0)
                {
                  reset = true;
                }
              }

              if (Math.Abs(d) > 500)
              {
                var newSize = Module.BitsCount + d * 10;
                Module.BitsCount = primes.First(_ => _ > newSize);
              }
              else
              {
                reset = true;
              }
              if (reset)
              {
                Module.BitsCount = oldBitsCount;
                StringExtensions.WordsLengths = oldWordsLengths.ToArray();
                break;
              }
            }
          }
        }
      }
    }

    private static void TuneBloomFilterSize(Module module, Dictionary<int, Dictionary<string, bool>> testCases)
    {
      var primes = GetPrimes();

      int maxSize = 64 * 1024 - ScriptSize;

      double bestP = 0;
      var bestCount = 0;
      var maxCount = Module.BitsCount + 2000;
      Module.BitsCount -= 100;
      while (Module.BitsCount < maxCount)
      {
        var bytes = module.Generate();
        module.Init(bytes);
        var newP = Test(module, testCases);
        if (newP > bestP && module.Size <= maxSize)
        {
          bestP = newP;
          bestCount = Module.BitsCount;
          var parametersStr = string.Format("p={0}% size={1}, bitsCount={2}", bestP * 100, module.Size, Module.BitsCount);
          File.AppendAllLines("bloom-filter-parameters.txt", new[] { parametersStr });
        }
        Module.BitsCount = primes.First(_ => _ > Module.BitsCount);
      }
    }

    private static IReadOnlyList<int> GetPrimes()
    {
      return File.ReadAllText("primes.txt")
        .Split(new[] { ' ', '\n' }, StringSplitOptions.RemoveEmptyEntries)
        .Select(int.Parse)
        .ToList();
    }
  }
}
