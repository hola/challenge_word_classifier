using System;
using System.Collections.Generic;
using System.Linq;

namespace HolaChallenge
{
	public class Statistics
	{
		public readonly bool IsEmpty;
		public readonly double Mean;
		public readonly int Count;

		public readonly double Min;
		public readonly double Percentile25;
		public readonly double Median;
		public readonly double Percentile75;
		public readonly double Max;

		public Statistics(IEnumerable<int> seq)
			: this(seq.Select(d => (double)d))
		{
		}

		public Statistics(IEnumerable<double> seq)
		{
			var sorted = seq.OrderBy(d => d).ToArray();

			if (sorted.Length == 0)
			{
				IsEmpty = true;
				return;
			}

			Count = sorted.Length;
			Mean = sorted.Average();
			Min = sorted[0];
			Max = sorted[sorted.Length - 1];
			Percentile25 = Percentile(sorted, 0.25);
			Median = Percentile(sorted, 0.5);
			Percentile75 = Percentile(sorted, 0.75);
		}

		public static double[] GetPercentiles(IEnumerable<double> seq, int percentilesCount)
		{
			var sorted = seq.OrderBy(d => d).ToArray();
			if (sorted.Length == 0) return new double[0];

			var step = 1d / percentilesCount;
			return Enumerable.Range(0, percentilesCount)
				.Select(i => Percentile(sorted, step * i))
				.ToArray();
		}

		public override string ToString()
		{
			if (IsEmpty) return "Count 0";

			const string format = "0.###";

			return $"Count {Count}, " +
				   $"Mean {Mean.ToString(format)} " +
				   $"[{Min.ToString(format)}, " +
				   $"{Percentile25.ToString(format)}, " +
				   $"{Median.ToString(format)}, " +
				   $"{Percentile75.ToString(format)}, " +
				   $"{Max.ToString(format)}]";
		}

		private static double Percentile(double[] sorted, double excelPercentile)
		{
			var N = sorted.Length;
			var n = (N - 1) * excelPercentile + 1;

			if (n <= 1.0000001) return sorted[0];
			if (n >= N - 0.0000001) return sorted[sorted.Length - 1];

			var k = (int)Math.Truncate(n);
			var d = n - k;
			return sorted[k - 1] + d * (sorted[k] - sorted[k - 1]);
		}

        public static void ShowHistogram<T, TGroup>(IEnumerable<T> seq, Func<T, TGroup> groupFunc, int takeCount)
        {
            var histData = seq.GroupBy(groupFunc)
                .Select(gr => new { Key = gr.Key, Count = gr.Count() })
                .OrderByDescending(k => k.Count)
                .Take(takeCount)
                .ToArray();

            foreach (var item in histData)
                Console.WriteLine(item);
        }
    }
}
