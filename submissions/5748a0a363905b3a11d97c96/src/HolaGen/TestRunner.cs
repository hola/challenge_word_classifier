using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;

namespace HolaGen
{
	public class TestRunner
	{
		public object _lock = new object();

		public void Init(IEnumerable<GenerationParameters> candidates)
		{
			if (File.Exists(Settings.TestRuns)) File.Delete(Settings.TestRuns);

			var config = GetConfig();

			var records = candidates.Select(c => new CsvRecord
			{
				Parameters = c,
			});

			using (var file = File.AppendText(Settings.TestRuns))
			{
				var writer = new CsvWriter(file, config);
				writer.WriteRecords(records);
			}
		}

		private IEnumerable<CsvRecord> GetRecords()
		{
			if (!File.Exists(Settings.TestRuns)) return Enumerable.Empty<CsvRecord>();

			var config = GetConfig();

			using (var file = File.OpenText(Settings.TestRuns))
			{
				var reader = new CsvReader(file, config);
				return reader.GetRecords<CsvRecord>().ToArray();
			}
		}

		public void Run(bool force = false, bool generate = true)
		{
			if (File.Exists(Settings.TestRuns)) File.Copy(Settings.TestRuns, Settings.TestRuns + ".backup", true);

			var records = GetRecords();

			CheckDupes(records);
			CompleteMissingData(records);

			var recordsToRun = records
				.Where(r => r.Parameters.Id != null && (force || r.Result.AvgScore == null))
				.ToArray();

			Console.WriteLine("Found {0} candidates to evaluate", recordsToRun.Length);

			var results = recordsToRun
				.AsParallel()
				.Select(r => Evaluate(r.Parameters, _lock, generate))
				.ToArray();

			var config = GetConfig();

			var completedRecords = results
				.Select(r => new CsvRecord
				{
					Parameters = r.Parameters,
					SizeSuccess = r.SizeSuccess,
					TotalSize = r.TotalSize,
					RemainingSpace = (64 * 1024) - r.TotalSize,
					Result = r.TestResult,
				})
				.ToArray();

			if (File.Exists(Settings.TestRuns)) File.Delete(Settings.TestRuns);

			var recordsDict = records
				.ToDictionary(r => r.Parameters.Id ?? -1);

			foreach (var record in completedRecords)
			{
				recordsDict[record.Parameters.Id.Value] = record;
			}

			var sortedRecords = recordsDict.Values
				.OrderBy(r => r.Parameters.Id ?? Int16.MaxValue)
				.ToArray();

			using (var file = File.AppendText(Settings.TestRuns))
			{
				var writer = new CsvWriter(file, config);
				writer.WriteRecords(sortedRecords);
			}
		}

		private void CompleteMissingData(IEnumerable<CsvRecord> records)
		{
			var maxId = records
				.Where(r => r.Parameters.Id != null)
				.Max(r => r.Parameters.Id) ?? 0;

			foreach (var record in records)
			{
				if (record.Parameters.Id == null)
				{
					maxId++;
					record.Parameters.Id = maxId;
					record.Result.AvgScore = null; // force process these ones
				}
			}
		}

		private void CheckDupes(IEnumerable<CsvRecord> records)
		{
			var dupes = records
				.Where(r => r.Parameters.Id != null)
				.GroupBy(r => r.Parameters.Id)
				.Where(g => g.Count() > 1)
				.Select(g => g.Key)
				.ToArray();

			if (dupes.Any())
			{
				throw new Exception("id dupes in csv files: " + String.Join(", ", dupes));
			}
		}

		private static EvaluationResult Evaluate(GenerationParameters candidate, object @lock, bool generate = true)
		{
			using (new Timer(String.Format("TestRunner.Evaluate(ID{0:000})", candidate.Id)))
			{
				try
				{
					Console.WriteLine("Starting evaluation of candidate {0}...", candidate.Id);

					var dataPath = Path.Combine(Settings.TempFolder, String.Format("ID{0:000}", candidate.Id));
					var dataTxtFilePath = Path.Combine(dataPath, "data.txt");
					var dataBinaryFilePath = Path.Combine(dataPath, "data.bin");

					if (generate && Directory.Exists(dataPath))
					{
						foreach (var file in Directory.GetFiles(dataPath))
						{
							File.Delete(file);
						}
					}

					Directory.CreateDirectory(dataPath);

					if (generate)
					{
						var generator = new DataGenerator();
						var generated = generator.Generate(candidate);

						var serializer = new DataSerializer();
						serializer.Serialize(generated, dataTxtFilePath, dataBinaryFilePath);
					}

					var dataBlobInfo = Utils.GenerateDataBlob(candidate, dataTxtFilePath, dataBinaryFilePath);
					var javascriptFile = Utils.GenerateJavascript(dataPath, dataBlobInfo.DataTxtLength, dataBlobInfo.DataBinLength);
					var totalSize = dataBlobInfo.BlobFile.Length + javascriptFile.Length;
					var sizeSuccess = totalSize <= (64 * 1024);

					var executor = new TestExecutor();
					var testResult = executor.Test(candidate, dataTxtFilePath, dataBinaryFilePath);

					lock (@lock)
					{
						Console.BackgroundColor = sizeSuccess ? ConsoleColor.Green : ConsoleColor.Red;
						Console.ForegroundColor = sizeSuccess ? ConsoleColor.Black : ConsoleColor.White;
						Console.WriteLine("Evaluation of candidate {0} finished! Size: {1} Score: {2}",
							candidate.Id,
							sizeSuccess ? "OK" : "TOO BIG",
							testResult.AvgScore);
						Console.ResetColor();
					}

					WriteFalsePositives(dataPath, testResult.FalsePositives.OrderBy(v => v, StringComparer.Ordinal));

					return new EvaluationResult
					{
						Parameters = candidate,
						TestResult = testResult,
						TotalSize = totalSize,
						SizeSuccess = sizeSuccess,
					};
				}
				catch (Exception)
				{
					Console.WriteLine("Evaluation of candidate {0} has yielded an error", candidate.Id);
					throw;
				}
			}
		}

		private static void WriteFalsePositives(string dataPath, IEnumerable<string> falsePositives)
		{
			var path = String.Format("{0}-false-positives.txt", dataPath);
			var orderedWords = falsePositives.OrderBy(v => v, StringComparer.Ordinal);
			File.WriteAllText(path, String.Join("\n", orderedWords));
		}

		private static CsvConfiguration GetConfig()
		{
			var config = new CsvConfiguration
			{
				Delimiter = ";",
				CultureInfo = CultureInfo.CreateSpecificCulture("fr-BE"),
				WillThrowOnMissingField = false,
			};

			config.RegisterClassMap<CsvRecordMap>();

			return config;
		}
	}
}
