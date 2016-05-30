using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class TreeOptimizer
    {
        private Tree<char> _wordsTree;

        IDictionary<string, int> _statistics;

        public TreeOptimizer(Tree<char> wordsTree)
        {
            _wordsTree = wordsTree;
            _statistics = new Dictionary<string, int>();
        }
        internal static TreeOptimizer Create(Tree<char> result)
        {
            return new TreeOptimizer(result);
        }

        internal void Optimize()
        {
            CurrentLetterCount = Int32Constants.Zero;
            BuildStatistics();
            ReplaceNodes();
        }


        private void BuildStatistics()
        {
            foreach (Node<char> child in _wordsTree.Root.Children)
            {
                CurrentLetterCount++;
                BuildStatistics(child);
                RaiseOnBuildStatisticsProgress();
            }
        }

        private void BuildStatistics(Node<char> current)
        {
            UpdateStatisticsDictionary(current);
            foreach(Node<char> child in current.Children)
            {
                BuildStatistics(child);
            }
        }

        private void UpdateStatisticsDictionary(Node<char> current)
        {
            string word = current.Value.ToString();
            while((current = current.Parent) != null && (current.Children.Count() == Int32Constants.One))
            {
                word = string.Concat(current.Value, word);
                UpdateStatisticsDictionary(word);
            }
        }

        private void UpdateStatisticsDictionary(string word)
        {
            if(word.Length > BeforeMinLength)
            {
                UpdateStatisticsDictionaryForValidWord(word);
            }
        }

        private void UpdateStatisticsDictionaryForValidWord(string word)
        {
            if (_statistics.ContainsKey(word))
            {
                _statistics[word]++;
            }
            else
            {
                _statistics.Add(word, Int32Constants.One);
            }
        }

        public event EventHandler<OnBuildStatisticsProgressEventArgs> OnBuildStatisticsProgress;
        private int CurrentLetterCount;
        private const int TotalLettersCount = 26;
        private const int EncodingCharactersCount = 75;
        private const int ItemsToReplaceCount = EncodingCharactersCount - TotalLettersCount;
        private string[] _wordsToReplace;
        private string[] _allWordsToReplace;
        private const int EncodingStartLimit = 32;

        private int _replacementsCount = Int32Constants.Zero;
        private const int BeforeMinLength = Int32Constants.One;
        private const char SingleQuote = '\'';
        

        private void RaiseOnBuildStatisticsProgress()
        {
            if(OnBuildStatisticsProgress != null)
            {
                OnBuildStatisticsProgress(this,
                    new OnBuildStatisticsProgressEventArgs(GetProgressPercents(),
                        _statistics.OrderByDescending(item => item.Value).Take(ItemsToReplaceCount)));
            }
        }

        private byte GetProgressPercents()
        {
            float ratio = (float)CurrentLetterCount / (float)TotalLettersCount;
            return (byte)(ratio * Int32Constants.OneHundred);
        }

        private void ReplaceNodes()
        {
            _allWordsToReplace = _statistics
                    .OrderByDescending(stat => stat.Value)
                    .Take(ItemsToReplaceCount)
                    .Select(item => item.Key)
                    .ToArray();

            foreach (int keyLength in _allWordsToReplace.OrderByDescending(stat => stat.Length)
                .GroupBy(stat => stat.Length).Select(grpuping => grpuping.Key))
            {
                ReplaceNodesForWordsWithLength(keyLength);
            }
        }

        private void ReplaceNodesForWordsWithLength(int keyLength)
        {
            _wordsToReplace = _allWordsToReplace.Where(word => word.Length == keyLength).ToArray();
            foreach (Node<char> node in _wordsTree.Root.Children)
            {
                ReplaceNodes(node);
            }
        }

        private void ReplaceNodes(Node<char> parent)
        {
            Node<char> current = parent;
            string word = current.Value.ToString();
            while(current != null 
                && (current = current.Parent) != null 
                && (current.Children.Count() == Int32Constants.One))
            {
                word = string.Concat(current.Value, word);
                current = ProcessNode(parent, current, word);
            }

            ReplaceNodesChildren(parent);
        }


        private Node<char> ProcessNode(Node<char> parent, Node<char> current, string word)
        {
            Node<char> result;
            if(_wordsToReplace.Contains(word))
            {
                ProcessNodeReplacement(parent, word);
                result = null;
            }
            else
            {
                result = current;
            }

            return result;
        }
        
        private Node<char> ProcessNodeReplacement(Node<char> current, string word)
        {
            Stack<Node<char>> stack = new Stack<Node<char>>(new [] {current});
            for(var index = Int32Constants.Zero; index < word.Length; index++)
            {
                current = current.Parent;
                stack.Push(current);
            }

            Node<char> newNode = new Node<char>(stack.Pop(), CheckDoubleQuote((char)(EncodingStartLimit + Array.IndexOf(_wordsToReplace, word))));
            newNode.Parent.RemoveChild(current = stack.Pop());
            newNode.Parent.AddChild(newNode);

            while(stack.Count() != Int32Constants.Zero)
            {
                current = stack.Pop();
            }

            foreach(Node<char> child in current.Children)
            {
                child.Parent = newNode;
                newNode.AddChild(child);
            }

            newNode.IsLeaf = current.IsLeaf;

            _replacementsCount++;

            return newNode;

        }


        private char CheckDoubleQuote(char value)
        {
            char result = value;
            if(value == CleanWel.Core.Constants.Character.Character.DoubleQuotes.ASCIICode)
            {
                result = (char)CleanWel.Core.Constants.Character.Character.VerticalBar.ASCIICode;
            }

            return result;
        }

        private void ReplaceNodesChildren(Node<char> current)
        {
            foreach (Node<char> child in current.Children)
            {
                ReplaceNodes(child);
            }
        }

        
    }
}
