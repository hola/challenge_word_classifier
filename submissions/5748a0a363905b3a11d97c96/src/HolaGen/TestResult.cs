using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public class TestResult
	{
		public double? AvgScore { get; set; }

		public int? MinScore { get; set; }

		public int? MaxScore { get; set; }

		public double? StdDevScore { get; set; }

		public double? AvgFalsePositives { get; set; }

		public double? AvgFalseNegatives { get; set; }

		public double? AvgPreExclusionMatches { get; set; }

		public double? AvgSampleExclusion1Matches { get; set; }

		public double? AvgSampleExclusion2Matches { get; set; }

		public double? AvgSampleExclusion3Matches { get; set; }

		public double? AvgPairExclusionMatches { get; set; }

		public double? AvgPairExclusion2Matches { get; set; }

		public double AvgBloomFilterMatches { get; set; }

		public double? AvgTruePositives { get; set; }

		public double? AvgTrueNegatives { get; set; }

		public IEnumerable<string> FalsePositives { get; set; }
	}
}
