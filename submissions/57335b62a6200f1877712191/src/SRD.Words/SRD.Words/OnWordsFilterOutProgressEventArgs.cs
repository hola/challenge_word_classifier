using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class OnWordsFilterOutProgressEventArgs
    {
        public int Percents { get; private set; }
        public IDictionary<string, WordStatistics> WordsBases {get; private set;}

        public OnWordsFilterOutProgressEventArgs(int percents, IDictionary<string, WordStatistics> wordsBases)
        {
            Percents = percents;
            WordsBases = wordsBases;
        }
    }
}
