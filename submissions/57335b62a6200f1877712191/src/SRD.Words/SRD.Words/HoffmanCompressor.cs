using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SRD.Words
{
    public class HoffmanCompressor
    {
        private readonly  Dictionary<char, int> _statistics;

        private static Tree<char> _wordsTree;
        private WordsTree wordsTree;

        protected HoffmanCompressor(Tree<char> wordsTree)
        {
            _wordsTree = wordsTree;
            _statistics = new Dictionary<char, int>();
        }

        public static HoffmanCompressor Create(Tree<char> wordsTree)
        {
            return new HoffmanCompressor(wordsTree);
        }


        public void BuildStatisctics()
        {
            foreach (Node<char> node in _wordsTree.Root.Children)
            {
                BuildNodeStatistics(node);
                RaiseOnCompressionStatisticsChanged();
            }
        }

        public event EventHandler<CompressionStatisticsChangedEventArgs> OnCompressionStatisticsChanged;

        private void RaiseOnCompressionStatisticsChanged()
        {
            if(OnCompressionStatisticsChanged != null)
            {
                OnCompressionStatisticsChanged(this, new CompressionStatisticsChangedEventArgs(_statistics));
            }
        }

        private void BuildNodeStatistics(Node<char> current)
        {
            UpdateCharacterStatistics(current.Value);
            UpdateChildren(current.Children);
        }

        
        private void UpdateCharacterStatistics(char value)
        {
            if(_statistics.ContainsKey(value))
            {
                _statistics[value]++;
            }
            else
            {
                _statistics.Add(value, Int32Constants.One);
            }
        }

        private void UpdateChildren(Node<char>[] children)
        {
            foreach (Node<char> child in children)
            {
                BuildNodeStatistics(child);
            }
        }
    }
}
