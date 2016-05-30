using System;
using System.Collections.Generic;
using System.Linq;

namespace HolaChallenge
{
	public class DictionaryList<TKey, TValue>
	{
		private readonly Dictionary<TKey, List<TValue>> dict = new Dictionary<TKey, List<TValue>>();

		public IEnumerable<TKey> Keys => dict.Select(kvp => kvp.Key);

		public List<TValue> this[TKey key] => dict[key];

		public void AddToList(TKey key, TValue val)
		{
			List<TValue> list;
			if (!dict.TryGetValue(key, out list))
			{
				list = new List<TValue>();
				dict.Add(key, list);
			}
			list.Add(val);
		}

		public void RemoveWhere(Func<TKey, List<TValue>, bool> clause)
		{
			var toRemove = dict.Where(kvp => clause(kvp.Key, kvp.Value)).Select(kvp => kvp.Key).ToArray();
			foreach (var key in toRemove)
				dict.Remove(key);
		}
	}
}
