using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace ChallengeWordClassifier
{
    public static class TestsHelper
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
            for (var i = 0; i < 100; i++)
            {
                var number = random.Next(1, int.MaxValue);
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
            var allTestData = new List<KeyValuePair<string, bool>>();
            foreach (var filePath in Directory.GetFiles(Folder))
            {
                var dataStr = File.ReadAllText(filePath);
                var testData = JsonConvert.DeserializeObject<Dictionary<string, bool>>(dataStr);
                allTestData.AddRange(testData);
            }

            var fileName = "all-test-cases.js";
            using (var fileStream = File.Create(fileName))
            {
                using (var streamWriter = new StreamWriter(fileStream))
                {
                    var s = JsonConvert.SerializeObject(allTestData);
                    streamWriter.Write(s);
                }
            }
        }

        public static KeyValuePair<string, bool>[] GetTests()
        {
            var testDataStr = File.ReadAllText("all-test-cases.js");
            var testData = JsonConvert.DeserializeObject<List<KeyValuePair<string, bool>>>(testDataStr);
            return testData.ToArray();
        }

        public static KeyValuePair<string, bool>[] GetTests2()
        {
            var testDataStr = File.ReadAllText("all-test-cases-2.js");
            var testData = JsonConvert.DeserializeObject<Dictionary<int, Dictionary<string, bool>>>(testDataStr);
            return testData.SelectMany(t => t.Value.ToArray()).ToArray();
        }

        public static TestResult RunTest(KeyValuePair<string, bool>[] tests, Func<string, bool> check)
        {
            var testResult = new TestResult();
            int failures = 0;
            foreach (var test in tests)
            {
                string word = test.Key;
                bool isWord = check(word);
                if (test.Value)
                {
                    if (isWord)
                    {
                        testResult.WordsSuccess.Add(word);
                    }
                    else
                    {
                        testResult.WordsFailed.Add(word);
                        failures++;
                    }
                }
                else
                {
                    if (isWord)
                    {
                        testResult.NotWordsFailed.Add(word);
                        failures++;
                    }
                    else
                    {
                        testResult.NotWordsSuccess.Add(word);
                    }
                }
                //if ((isWord || test.Value) && (!isWord || !test.Value))
                //    failures++;
            }
            //testResult.SuccessRate = (double)(tests.Length - failures) / tests.Length;
            return testResult;
        }
    }

    public class TestResult
    {
        public double SuccessRate { get { return (double)(WordsSuccess.Count + NotWordsSuccess.Count) / (Math.Max(WordsSuccess.Count + WordsFailed.Count + NotWordsSuccess.Count + NotWordsFailed.Count, 1)); } }
        public List<string> WordsSuccess = new List<string>();
        public List<string> WordsFailed = new List<string>();
        public double WordsRate { get { return (double)WordsSuccess.Count / (Math.Max(WordsSuccess.Count + WordsFailed.Count, 1)); } }
        public List<string> NotWordsSuccess = new List<string>();
        public List<string> NotWordsFailed = new List<string>();
        public double NotWordsRate { get { return (double)NotWordsSuccess.Count / (Math.Max(NotWordsSuccess.Count + NotWordsFailed.Count, 1)); } }
    }
}
