using System;
using System.Collections.Generic;
using System.Linq;

namespace HolaChallenge
{
    public class Pairs<TKey, TValue> : List<KeyValuePair<TKey, TValue>>
    {
        public Pairs()
        {
        }

        public Pairs(int capacity) : base(capacity)
        {
        }

        public void Add(TKey key, TValue value)
        {
            Add(new KeyValuePair<TKey, TValue>(key, value));
        }

		public bool ContainsKey(TKey key)
		{
			foreach (var kvp in this)
				if (EqualityComparer<TKey>.Default.Equals(kvp.Key, key))
					return true;
			return false;
		}

		public IEnumerable<TValue> GetValuesByKey(TKey key)
		{
			foreach (var kvp in this)
				if (EqualityComparer<TKey>.Default.Equals(kvp.Key, key))
					yield return kvp.Value;
		}

        public TValue FirstValueOrDefault(Func<TKey, TValue, bool> where)
        {
            foreach (var kvp in this)
                if (where(kvp.Key, kvp.Value))
                    return kvp.Value;
            return default(TValue);
        }

        public IEnumerable<TKey> Keys() => this.Select(kvp => kvp.Key);
        public IEnumerable<TValue> Values() => this.Select(kvp => kvp.Value);
    }

    public static class PairsHelper
    {
        public static Pairs<TKey, TValue> ToPairs<T, TKey, TValue>(this IEnumerable<T> seq, Func<T, TKey> getKey, Func<T, TValue> getValue)
        {
            var pairs = new Pairs<TKey, TValue>();

            foreach (var item in seq)
                pairs.Add(getKey(item), getValue(item));

            return pairs;
        }
    }
}
