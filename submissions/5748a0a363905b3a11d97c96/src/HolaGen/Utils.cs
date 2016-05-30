using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public static class Utils
	{
		static string PATH_ZOPFLI = Path.Combine(Settings.RootFolder, @"tools\zopfli.exe");
		static string PATH_SEVENZIP = Path.Combine(Settings.RootFolder, @"tools\7za.exe");
		static int ZOPFLI_ITERATIONS = 1000; //50; // use 1000 for best results

		public static FileInfo CompressGzip(FileInfo fileToCompress)
		{
			var compressedFilename = fileToCompress.FullName + ".gz";

			ProcessStartInfo startInfo = new ProcessStartInfo();
			startInfo.FileName = PATH_ZOPFLI;
			startInfo.Arguments = String.Format("--i{1} \"{0}\"", fileToCompress.FullName, ZOPFLI_ITERATIONS);
			startInfo.RedirectStandardOutput = true;
			startInfo.RedirectStandardError = true;
			startInfo.UseShellExecute = false;
			startInfo.CreateNoWindow = true;

			Process processTemp = new Process();
			processTemp.StartInfo = startInfo;
			processTemp.EnableRaisingEvents = true;
			try
			{
				using (new Timer(String.Format("CompressGzip (zopfli --i{0})", ZOPFLI_ITERATIONS)))
				{
					var sw = Stopwatch.StartNew();
					processTemp.Start();
					processTemp.WaitForExit();
					sw.Stop();
				}
			}
			catch (Exception e)
			{
				throw;
			}

			return new FileInfo(compressedFilename);
		}

		public static FileInfo CompressBzip2(FileInfo fileToCompress)
		{
			var compressedFilename = fileToCompress.FullName + ".bz2";

			ProcessStartInfo startInfo = new ProcessStartInfo();
			startInfo.FileName = PATH_SEVENZIP;
			startInfo.Arguments = String.Format("a \"{0}\" \"{1}\"", compressedFilename, fileToCompress.FullName);
			startInfo.RedirectStandardOutput = true;
			startInfo.RedirectStandardError = true;
			startInfo.UseShellExecute = false;
			startInfo.CreateNoWindow = true;

			Process processTemp = new Process();
			processTemp.StartInfo = startInfo;
			processTemp.EnableRaisingEvents = true;
			try
			{
				var sw = Stopwatch.StartNew();
				processTemp.Start();
				processTemp.WaitForExit();
				sw.Stop();
			}
			catch (Exception e)
			{
				throw;
			}

			return new FileInfo(compressedFilename);
		}

		const string DATATXT_SIZE_PLACEHOLDER = "$DATATXT_SIZE$";
		const string DATABIN_SIZE_PLACEHOLDER = "$DATABIN_SIZE$";
		const string SCRIPT_OFFSET_PLACEHOLDER = "$SCRIPT_OFFSET$";

		internal static DataBlobInfo GenerateDataBlob(GenerationParameters parameters, string dataTxtFilePath, string dataBinaryFilePath)
		{
			var dataPath = Path.GetDirectoryName(dataTxtFilePath);
			var rawTxtData = new FileInfo(dataTxtFilePath);

			// var textData = rawTxtData.Length > (1024 * 8) ? CompressBzip2(rawTxtData) : rawTxtData;
			var textData = rawTxtData;
			var binaryData = new FileInfo(dataBinaryFilePath);
			var concatenated = CreateFullBlob(parameters, binaryData, textData, dataPath);
			var gziped = CompressGzip(concatenated);

			return new DataBlobInfo
			{
				BlobFile = gziped,
				DataTxtLength = textData.Length,
				DataBinLength = binaryData.Exists ? binaryData.Length : 0L,
			};
		}

		private static FileInfo CreateFullBlob(GenerationParameters parameters, FileInfo binaryData, FileInfo txtData, string dataPath)
		{
			var filePath = Path.Combine(dataPath, "data");
			if (File.Exists(filePath)) File.Delete(filePath);

			var binaryDataLength = binaryData.Exists ? binaryData.Length : 0L;
			var jsBlobPath = GetJsBlobPath(parameters, txtData);

			var javascriptBlob = File.ReadAllText(jsBlobPath)
				.Replace(DATATXT_SIZE_PLACEHOLDER, txtData.Length.ToString())
				.Replace(DATABIN_SIZE_PLACEHOLDER, binaryDataLength.ToString());

			using (var stream = File.OpenWrite(filePath))
			using (var dataStream = File.OpenRead(txtData.FullName))
			using (var writer = new StreamWriter(stream, Encoding.ASCII))
			{
				if (binaryData.Exists)
				{
					using (var binaryStream = File.OpenRead(binaryData.FullName))
					{
						binaryStream.CopyTo(stream);
					}
				}

				dataStream.CopyTo(stream);
				writer.Write(javascriptBlob);
			}

			return new FileInfo(filePath);
		}

		private static string GetJsBlobPath(GenerationParameters parameters, FileInfo txtData)
		{
			if (parameters.IsBloomFilterOnly()) return Settings.JavascriptBlobBloomFilterOnlyPath;
			// if (txtData.Name.EndsWith(".txt")) return Settings.JavascriptBlobNoBZ2Path;
			return Settings.JavascriptBlobPath;
		}

		internal static FileInfo GenerateJavascript(string dataPath, long dataTxtLength, long dataBinLength)
		{
			var filePath = Path.Combine(dataPath, "index.js");
			var javascript = File.ReadAllText(Settings.JavascriptBootstrapPath)
				.Replace(SCRIPT_OFFSET_PLACEHOLDER, (dataTxtLength + dataBinLength).ToString());
			File.WriteAllText(filePath, javascript, Encoding.ASCII);
			return new FileInfo(filePath);
		}
	}

	public class DataBlobInfo
	{
		public FileInfo BlobFile { get; set; }
		public long DataTxtLength { get; set; }
		public long DataBinLength { get; set; }
	}
}
