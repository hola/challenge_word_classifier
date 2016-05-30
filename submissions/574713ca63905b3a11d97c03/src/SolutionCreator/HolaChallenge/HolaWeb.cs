using System.Linq;
using System.Collections.Generic;
using System.Net;
using System;
using System.IO;

namespace HolaChallenge
{
	public class HolaWeb
	{
		private const string baseUrl = @"https://hola.org/challenges/word_classifier/testcase";

		public static void SaveTests(int requestCount, string saveToDir)
		{
			for (var i = 0; i < requestCount; i++)
			{
				using (var web = new MyWebClient())
				{
					web.BaseAddress = baseUrl;

					var json = web.DownloadString("");

					var testCaseId = Path.GetFileName(web.ResponseUri.ToString());

					File.WriteAllText(Path.Combine(saveToDir, testCaseId + ".json"), json);

					Console.WriteLine(i + ": " + testCaseId);
				}
			}
		}

		public static void CalcWordsCount(JsonSerializerMaster jsonSerializer, int requestCount)
		{
			var words = 0;
			var notWords = 0;

			for (var i = 0; i < requestCount; i++)
			{
				using (var web = new WebClient())
				{
					web.BaseAddress = baseUrl;

					var json = web.DownloadString("");

					var data = jsonSerializer.Deserialize<Dictionary<string, bool>>(json);

					var wordsHere = data.Count(kvp => kvp.Value);
					var notWordsHere = data.Count - wordsHere;

					words += wordsHere;
					notWords += notWordsHere;

					Console.WriteLine($"[{i}]: words {wordsHere}, not words {notWordsHere}");
				}
			}

			Console.WriteLine(new { words, notWords, wordsMean = (double)words / (words + notWords) });
		}
	}

	public class MyWebClient : WebClient
	{
		public Uri ResponseUri { get; private set; }

		protected override WebResponse GetWebResponse(WebRequest request)
		{
			var response = base.GetWebResponse(request);
			ResponseUri = response.ResponseUri;
			return response;
		}
	}
}
