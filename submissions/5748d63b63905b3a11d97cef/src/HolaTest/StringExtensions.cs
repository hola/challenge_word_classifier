using System;

namespace HolaTest
{
  public static class StringExtensions
  {
    public static int[] WordsLengths = { 0, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8 };

    public static int MaxCountInRow(this string str, Func<char, bool> predicate)
    {
      var count = 0;
      var maxCount = 0;
      foreach (var letter in str)
      {
        count = predicate(letter) ? count + 1 : 0;
        if (count > maxCount)
        {
          maxCount = count;
        }
      }
      return maxCount;
    }

    public static string Clip(this string str)
    {
      var index = Math.Min(str.Length, 15);
      return str.Substring(0, WordsLengths[index]);
      //return str.Clip(7, 17);
    }

    public static string Clip(this string str, int count, int percent)
    {
      var length = str.Length;
      var result = str;
      if (length > count)
      {
        length = count + (length - count) * percent / 100;
        result = result.Substring(0, length);
      }
      return result;
    }
  }
}
