using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public enum Positions
    {
        First,
        Middle,
        Last
    }

    public class WordPartStatistics
    {
        private const int DefaultPositionValue = Int32Constants.One;
        private const int NotExistsPositionValue = Int32Constants.Zero;

        public IDictionary<Positions, int> Positions { get; private set; }

        public WordPartStatistics(Positions position) : this(new Positions[] { position })
        {
        }

        public WordPartStatistics(Positions[] positions)
        {
            Positions = new Dictionary<Positions, int>();
            positions.ToList().ForEach(position => Positions.Add(position, DefaultPositionValue));
        }

        internal void UpdataPosition(Positions position, int value = DefaultPositionValue)
        {
            if(Positions.ContainsKey(position))
            {
                Positions[position] += value;
            }
            else
            {
                Positions.Add(position, value);
            }
        }

        public int GetCount(Positions position)
        {
            int result;

            if(Positions.ContainsKey(position))
            {
                result = Positions[position];
            }
            else
            {
                result = NotExistsPositionValue;
            }

            return result;
        }

        public static WordPartStatistics operator + (WordPartStatistics accumulatorStatistics, WordPartStatistics statistics)
        {
            foreach(KeyValuePair<Positions, int> postionStatistics in statistics.Positions)
            {
                accumulatorStatistics.UpdataPosition(postionStatistics.Key, postionStatistics.Value);
            }

            return accumulatorStatistics;
        }
    }

    
}
