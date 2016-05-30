using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public class GenerationParameters
	{
		public GenerationParameters()
		{
			this.SampleExclusion_1 = new SampleExclusionParameters();
			this.SampleExclusion_2 = new SampleExclusionParameters();
			this.SampleExclusion_3 = new SampleExclusionParameters();
			this.PairExclusion_1 = new PairExclusionParameters();
			this.PairExclusion_2 = new PairExclusionParameters();
			this.BloomFilter = new BloomFilterParameters();
		}

		public int? Id { get; set; }

		public SampleExclusionParameters SampleExclusion_1 { get; set; }

		public SampleExclusionParameters SampleExclusion_2 { get; set; }

		public SampleExclusionParameters SampleExclusion_3 { get; set; }

		public PairExclusionParameters PairExclusion_1 { get; set; }

		public PairExclusionParameters PairExclusion_2 { get; set; }

		public BloomFilterParameters BloomFilter { get; set; }

		public IEnumerable<SampleExclusionParameters> GetSampleExclusions()
		{
			if (!SampleExclusion_1.Disabled) yield return SampleExclusion_1;
			if (!SampleExclusion_2.Disabled) yield return SampleExclusion_2;
			if (!SampleExclusion_3.Disabled) yield return SampleExclusion_3;
		}

		public IEnumerable<PairExclusionParameters> GetPairExclusions()
		{
			if (!PairExclusion_1.Disabled) yield return PairExclusion_1;
			if (!PairExclusion_2.Disabled) yield return PairExclusion_2;
		}

		internal bool IsBloomFilterOnly()
		{
			if (BloomFilter.Disabled) return false;
			if (GetSampleExclusions().Any()) return false;
			if (GetPairExclusions().Any()) return false;
			return true;
		}
	}

	public class BloomFilterParameters
	{
		public BloomFilterParameters()
		{
			// MinWordSize = 3;
		}

		// public int MinWordSize { get; set; }

		public int FilterSizeBytes { get; set; }

		public int HashFunctionsCount { get; set; }

		public int? SubstringStartIndex { get; set; }

		public int? SubstringLength { get; set; }

		public int? SubstitutionCount { get; set; }

		public int? CharOffset { get; set; }

		public int? RetouchWordCount { get; set; }

		public int? RetouchMaxWeight { get; set; }

		public double? RetouchMinRelWeight { get; set; }

		public bool Disabled { get { return FilterSizeBytes == 0; } }
	}

	public class SampleExclusionParameters
	{
		public SampleExclusionParameters()
		{
			MinWordSize = 2;
		}

		public bool BeginAnchor { get; set; }

		public bool EndAnchor { get; set; }

		public int MinWordSize { get; set; }

		public int SampleSize { get; set; }

		public int MaxCount { get; set; }

		public int StartIndex { get; set; }

		public int? Length { get; set; }

		public bool Disabled { get { return SampleSize == 0; } }

		public int GetMinWordSize()
		{
			return Math.Min(SampleSize, MinWordSize);
		}
	}

	public class PairExclusionParameters
	{
		public bool BeginAnchor { get; set; }

		public bool EndAnchor { get; set; }

		public int MinWordSize { get; set; }

		public int SampleSize { get; set; }

		public int MaxCount { get; set; }

		public int TopSamplesLimit { get; set; }

		public int TotalLimit { get; set; }

		public int StartIndex { get; set; }

		public bool Disabled { get { return SampleSize == 0; } }

		public int GetMinWordSize()
		{
			return Math.Min(SampleSize + 1, MinWordSize);
		}
	}
}
