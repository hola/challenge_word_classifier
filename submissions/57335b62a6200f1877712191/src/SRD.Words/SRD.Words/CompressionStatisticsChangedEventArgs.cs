using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class CompressionStatisticsChangedEventArgs
    {
        public IDictionary<char, int> Statistics { get; private set; }

        public CompressionStatisticsChangedEventArgs(IDictionary<char, int> statistics)
        {
            Statistics = statistics;
        }
    }
}
