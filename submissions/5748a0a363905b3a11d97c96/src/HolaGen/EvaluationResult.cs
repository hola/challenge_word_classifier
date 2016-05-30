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
	public class EvaluationResult
	{
		public GenerationParameters Parameters { get; set; }

		public bool SizeSuccess { get; set; }

		public long TotalSize { get; set; }

		public TestResult TestResult { get; set; }
	}
}
