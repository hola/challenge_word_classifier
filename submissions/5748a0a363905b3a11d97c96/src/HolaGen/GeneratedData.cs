using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public class GeneratedData
	{
		public GeneratedData()
		{
			this.ExcludedSamples_1 = new HashSet<string>(StringComparer.Ordinal);
			this.ExcludedSamples_2 = new HashSet<string>(StringComparer.Ordinal);
			this.ExcludedSamples_3 = new HashSet<string>(StringComparer.Ordinal);
			this.ExcludedPairs_1 = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
			this.ExcludedPairs_2 = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
		}

		public GenerationParameters Parameters { get; set; }

		public HashSet<string> ExcludedSamples_1 { get; set; }

		public HashSet<string> ExcludedSamples_2 { get; set; }

		public HashSet<string> ExcludedSamples_3 { get; set; }

		public Dictionary<string, HashSet<string>> ExcludedPairs_1 { get; set; }

		public Dictionary<string, HashSet<string>> ExcludedPairs_2 { get; set; }

		public BloomFilter BloomFilter { get; set; }

		public IEnumerable<HashSet<string>> GetExcludedSamples()
		{
			if (!Parameters.SampleExclusion_1.Disabled) yield return ExcludedSamples_1;
			if (!Parameters.SampleExclusion_2.Disabled) yield return ExcludedSamples_2;
			if (!Parameters.SampleExclusion_3.Disabled) yield return ExcludedSamples_3;
		}

		public IEnumerable<Dictionary<string, HashSet<string>>> GetExcludedPairs()
		{
			if (!Parameters.PairExclusion_1.Disabled) yield return ExcludedPairs_1;
			if (!Parameters.PairExclusion_2.Disabled) yield return ExcludedPairs_2;
		}
	}
}
