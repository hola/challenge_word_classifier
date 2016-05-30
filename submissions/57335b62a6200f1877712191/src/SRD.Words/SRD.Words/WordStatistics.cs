using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class WordStatistics
    {
        public IDictionary<string, HashSet<string>> Prefixes { get; private set; }

        public WordStatistics(string prefix, string suffix) : this()
        {
            Add(prefix, suffix);
        }

        public WordStatistics()
        {
            Prefixes = new Dictionary<string, HashSet<string>>();
        }

        internal void Add(string prefix, string suffix)
        {
            if (Prefixes.ContainsKey(prefix))
            {
                Prefixes[prefix].Add(suffix);
            }
            else
            {
                Prefixes.Add(prefix, new HashSet<string>() { suffix });
            }
        }
    }
}
