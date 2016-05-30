using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public static class Extensions
	{
		public static double StdDev(this IEnumerable<double> values)
		{
			double ret = 0;
			int count = values.Count();
			if (count > 1)
			{
				//Compute the Average
				double avg = values.Average();

				//Perform the Sum of (value-avg)^2
				double sum = values.Sum(d => (d - avg) * (d - avg));

				//Put it all together
				ret = Math.Sqrt(sum / count);
			}
			return ret;
		}

		public static IEnumerable<T> Yield<T>(this T obj)
		{
			yield return obj;
		}

		public static string Slice(this string source, int start, int? end)
		{
			if (end == null) end = source.Length;

			if (end < 0) // Keep this for negative end support
			{
				end = source.Length + end;
			}

			int len = end.Value - start;			// Calculate length
			return source.Substring(start, Math.Min(len, source.Length));	// Return Substring of length
		}
	}
}
