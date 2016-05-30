using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace HolaChallenge
{
	public static class Helpers
	{
		public static IEnumerable<string> CartesianPower(this string elements, int len)
		{
			foreach (var el in elements)
			{
				if (len <= 1)
					yield return el.ToString();
				else
					foreach (var sub in CartesianPower(elements, len - 1))
						yield return el.ToString() + sub;
			}
		}

		public static IEnumerable<IEnumerable<T>> Combinations<T>(this IEnumerable<T> elements, int k)
		{
			return k == 0 ? new[] { new T[0] } :
			  elements.SelectMany((e, i) =>
				elements.Skip(i + 1).Combinations(k - 1).Select(c => (new[] { e }).Concat(c)));
		}

		public static IEnumerable<IEnumerable<T>> GetPowerSet<T>(this IList<T> list)
		{
			return from m in Enumerable.Range(0, 1 << list.Count)
				   select
					   from i in Enumerable.Range(0, list.Count)
					   where (m & (1 << i)) != 0
					   select list[i];
		}

		public static int FirstIndexOf<T>(this IEnumerable<T> seq, Func<T, bool> clause)
		{
			var i = 0;
			foreach (var item in seq)
			{
				if (clause(item)) return i;
				i++;
			}
			return -1;
		}

		public static HashSet<T> ToHashSet<T>(this IEnumerable<T> seq)
		{
			return new HashSet<T>(seq);
		}

		public static double Entropy(this int[] array)
		{
			var result = 0d;

			var counts = array.GroupBy(i => i).Select(gr => gr.Count()).ToArray();

			if (counts.Length <= 1)
				return 0;

			foreach (var count in counts)
			{
				var px = (double)count / array.Length;
				result -= px * Math.Log(px, 2);
			}

			return result;
		}

		public static byte[] ToByteArray(this BitArray bits)
		{
			byte[] ret = new byte[(bits.Length - 1) / 8 + 1];
			bits.CopyTo(ret, 0);
			return ret;
        }

        public static IEnumerable<T> BreadthFirstSearch<T>(this T root, Func<T, IEnumerable<T>> getChildren)
        {
            var queue = new Queue<T>();
            queue.Enqueue(root);

            while (queue.Count > 0)
            {
                var item = queue.Dequeue();

                yield return item;

                foreach (var child in getChildren(item))
                    queue.Enqueue(child);
            }
        }

        public static IEnumerable<T> EnumerateSafe<T>(this IEnumerable<T> seq)
        {
            if (seq == null) return Enumerable.Empty<T>();
            return seq;
        }

		public static T BestElementByCompare<T>(this IEnumerable<T> seq, Func<T, T, bool> isFirstBigger)
		{
			var any = false;
			var best = default(T);
			foreach (var item in seq)
			{
				if (!any)
				{
					any = true;
					best = item;
				}
				else if (isFirstBigger(item, best))
					best = item;
			}
			return best;
		}
    }
}
