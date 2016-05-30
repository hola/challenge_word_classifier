using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class OnWordsPartsFilterOutProgressEventArgs
    {
        public int Percents { get; private set; }

        public IDictionary<string, WordPartStatistics> WordsParts { get; private set; }

        public OnWordsPartsFilterOutProgressEventArgs(int percents, IDictionary<string, WordPartStatistics> wordsParts)
        {
            Percents = percents;
            WordsParts = wordsParts;
        }

        public string CurrentWord { get; set; }

        public int WordsCount { get; set; }

        public int WordsProcessed { get; set; }
    }
}
