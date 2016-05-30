using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace HolaGen
{
	public class DataSerializer
	{
		public static bool DELTA_ENCODING = true;

		public void Serialize(GeneratedData data, string txtFilePath, string dataBinaryFilePath)
		{
			if (File.Exists(txtFilePath)) File.Delete(txtFilePath);
			if (File.Exists(dataBinaryFilePath)) File.Delete(dataBinaryFilePath);

			using (var file = File.OpenWrite(txtFilePath))
			using (var writer = new StreamWriter(file, Encoding.ASCII))
			{
				foreach (var excludedSamples in data.GetExcludedSamples())
				{
					var excludedSamplesSorted = excludedSamples
						.OrderBy(v => v, StringComparer.Ordinal);

					WriteSameSizeLines(excludedSamplesSorted, writer);
				}

				foreach (var excludedPairs in data.GetExcludedPairs())
				{
					foreach (var kv in excludedPairs)
					{
						var sortedValues = kv.Value
							.OrderBy(v => v, StringComparer.Ordinal);

						var lines = kv.Key.Yield().Concat(sortedValues);
						WriteSameSizeLines(lines, writer);
					}
				}

				writer.Flush();
			}

			if (!data.Parameters.BloomFilter.Disabled)
			{
				BloomFilter.Serialize(data.BloomFilter, dataBinaryFilePath);
			}
		}

		private static void WriteSameSizeLines(IEnumerable<string> data, TextWriter writer, bool newLine = true)
		{
			var prev = default(string);
			foreach (var line in data)
			{
				if (prev == null)
				{
					writer.Write(line);
					writer.Write("\n");
				}
				else
				{
					if (DELTA_ENCODING)
					{
						for (var index = line.Length - 1; index >= 0; index--)
						{
							if (prev.Substring(0, index) == line.Substring(0, index))
							{
								writer.Write(line.Substring(index));
								writer.Write("\n");
								break;
							}
						}
					}
					else
					{
						writer.Write(line);
						writer.Write("\n");
					}
				}

				prev = line;
			}
			if (newLine) writer.Write("\n");
		}

		public GeneratedData Deserialize(GenerationParameters parameters, string txtPath, string binPath)
		{
			var data = new GeneratedData 
			{
				Parameters = parameters,
			};

			var prev = default(string);
			var exclusionSampleIndex = 0;

			var allSampleExclusionParameters = parameters.GetSampleExclusions()
				.Concat(default(SampleExclusionParameters).Yield())
				.ToArray();

			var allExcludedParameters = data.GetExcludedSamples()
				.Concat(default(HashSet<string>).Yield())
				.ToArray();

			var excludedSamples = allExcludedParameters[exclusionSampleIndex];
			var sampleExclusionParameters = allSampleExclusionParameters[exclusionSampleIndex];

			var exclusionPairKey = default(string);
			var exclusionPairValues = default(List<string>);

			foreach (var line in File.ReadLines(txtPath))
			{
				if (exclusionSampleIndex < allSampleExclusionParameters.Length - 1)
				{
					if (line.Length == 0)
					{
						exclusionSampleIndex++;
						sampleExclusionParameters = allSampleExclusionParameters[exclusionSampleIndex];
						excludedSamples = allExcludedParameters[exclusionSampleIndex];
						prev = null;
						continue;
					}

					var exclusionSample = line;

					if (DELTA_ENCODING)
					{
						if (line.Length < sampleExclusionParameters.SampleSize)
						{
							exclusionSample = prev.Substring(0, sampleExclusionParameters.SampleSize - line.Length) + line;
						}
					}

					excludedSamples.Add(exclusionSample);
					prev = exclusionSample;
				}
				else
				{
					if (line.Length == 0)
					{
						var excludedPairs = exclusionPairKey.Length == data.Parameters.PairExclusion_1.SampleSize ? 
							data.ExcludedPairs_1 : data.ExcludedPairs_2;
						excludedPairs.Add(exclusionPairKey, new HashSet<string>(exclusionPairValues, StringComparer.Ordinal));
						exclusionPairKey = null;
						exclusionPairValues = null;
						prev = null;
						continue;
					}
					else if (exclusionPairKey == null)
					{
						exclusionPairKey = line;
						exclusionPairValues = new List<string>();
						prev = line;
					}
					else
					{
						var sampleSize = exclusionPairKey.Length;
						var exclusionValue = line;
						if (DELTA_ENCODING)
						{
							if (line.Length < sampleSize)
							{
								exclusionValue = prev.Substring(0, sampleSize - line.Length) + line;
							}
						}
						exclusionPairValues.Add(exclusionValue);
						prev = exclusionValue;
					}
				}
			}

			if (exclusionPairKey != null)
			{
				throw new Exception("Unexpected end of data");
			}

			if (!parameters.BloomFilter.Disabled)
			{
				data.BloomFilter = BloomFilter.Deserialize(binPath, parameters.BloomFilter.HashFunctionsCount);
			}

			return data;
		}
	}
}
