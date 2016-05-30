using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaJSChallenge
{
    class PreFilter
    {
        Dictionary<string, bool> exc2w = new Dictionary<string, bool>();
        Dictionary<string, int> ends = new Dictionary<string, int>();
        Dictionary<string, bool> starts = new Dictionary<string, bool>();
        int maxLength = 100;

        public PreFilter(List<string> twoWordsExceptions, List<string> ends, List<string> starts, int maxLength)
        {
            int st = 0;
            exc2w = twoWordsExceptions.ToDictionary(k => k, v => true);
            this.ends = ends.ToDictionary(k => k, v => st++);
            this.starts = starts.ToDictionary(k => k, v => true);
            this.maxLength = maxLength;
        }

        public int WordStatus(string word, out string baseWord)
        {
            baseWord = word;

            // check word length
            if (string.IsNullOrEmpty(word)) return 0;

            // check max length
            if (word.Length > maxLength)
                return 0;

            // check one word
            if (word.Length == 1)
            {
                if (word[0] >= 'a' && word[0] <= 'z')
                    return 1;
                else
                    return 0;
            }

            // check two words exceptions
            if (word.Length == 2)
            {
                return !exc2w.ContainsKey(word) ? 1 : 0;
            }

            // check starts
            var s = word.Substring(0,2);
            if (starts.Count>0 && !starts.ContainsKey(s))
                return 0;

            // check endings
            List<KeyValuePair<string, int>> lst = new List<KeyValuePair<string, int>>();

            for(int i = 1; i < (word.Length - 1); i++)
            {
                s = word.Substring(i);
                var bs = word.Substring(0, i);
                if (ends.ContainsKey(s))
                {
                    lst.Add(new KeyValuePair<string, int>(bs, ends[s]));
                }
            }

            if (lst.Count > 0)
            {
                lst.Sort((x, y) => x.Value.CompareTo(y.Value));
                baseWord = lst[0].Key;
            }

            return 2;
        }
    }
}
