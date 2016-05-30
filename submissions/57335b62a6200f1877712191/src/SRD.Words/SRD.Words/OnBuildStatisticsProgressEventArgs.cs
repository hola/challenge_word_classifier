using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class OnBuildStatisticsProgressEventArgs
    {

        public byte Percents { get; set; }
        public IEnumerable<KeyValuePair<string, int>> Words { get; private set; }

        public OnBuildStatisticsProgressEventArgs(byte percents, IEnumerable<KeyValuePair<string, int>> enumerable)
        {
            this.Percents = percents;
            this.Words = enumerable;
        }
        
    }
}
