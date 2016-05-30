using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CsvHelper.Configuration;

namespace HolaGen
{
	public class CsvRecord
	{
		public GenerationParameters Parameters { get; set; }

		public bool? SizeSuccess { get; set; }

		public long? TotalSize { get; set; }

		public long? RemainingSpace { get; set; }

		public TestResult Result { get; set; }
	}

	public class CsvRecordMap : CsvClassMap<CsvRecord>
	{
		public CsvRecordMap()
		{
			this.AutoMap();

			var parametersMap = this.ReferenceMaps.Find(m => m.Data.Property.Name == "Parameters");
			var referenceMaps = parametersMap.Data.Mapping.ReferenceMaps;

			foreach (var referenceMap in referenceMaps)
			{
				referenceMap.Data.Prefix = GetPrefix(referenceMap.Data.Property.Name);
				RemoveReadOnlyProps(referenceMap.Data.Mapping);
			}
		}

		private void RemoveReadOnlyProps(CsvClassMap map)
		{
			var parametersProperties = map.PropertyMaps;
			var readonlyProps = parametersProperties
				.Where(pm => !pm.Data.Property.CanWrite)
				.ToArray();

			foreach (var prop in readonlyProps)
			{
				parametersProperties.Remove(prop);
			}
		}

		private string GetPrefix(string propName)
		{
			if (propName == "SampleExclusion_1") return "SE1_";
			if (propName == "SampleExclusion_2") return "SE2_";
			if (propName == "SampleExclusion_3") return "SE3_";
			if (propName == "PairExclusion_1") return "PE_";
			if (propName == "PairExclusion_2") return "PE2_";
			if (propName == "BloomFilter") return "BF_";
			return null;
		}
	}
}
