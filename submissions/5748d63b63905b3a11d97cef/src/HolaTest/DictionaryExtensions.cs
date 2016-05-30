using System.Collections.Generic;

namespace HolaTest
{
  public static class DictionaryExtensions
  {
    public static void Increase<TKey>(this Dictionary<TKey, int> dictionary, TKey key)
    {
      int count;
      if (dictionary.TryGetValue(key, out count))
      {
        count++;
      }
      else
      {
        count = 1;
      }
      dictionary[key] = count;
    }
  }
}
