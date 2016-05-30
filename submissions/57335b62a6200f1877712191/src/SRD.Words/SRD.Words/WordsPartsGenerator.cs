using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class WordsPartsGenerator
    {
        private HashSet<string> _words;
        private IDictionary<string, WordPartStatistics> _wordsParts;
        private KeyValuePair<string, WordPartStatistics>[] _orderedWordsParts;


        private const bool AdditionsTreeIsNetwork = true;
        public Tree<int> AdditionsTree { get; private set; }

        public event EventHandler<OnWordsPartsFilterOutProgressEventArgs> OnWordsPartsFilterOutProgress;

        public WordsPartsGenerator()
        {
            AdditionsTree = Tree<int>.Create(AdditionsTreeIsNetwork);
        }

        public KeyValuePair<string, WordPartStatistics>[] Generate(HashSet<string> words)
        {
            _words = words;
            _wordsParts = new Dictionary<string, WordPartStatistics>();

            FilterOutWordParts();
            OrderWordsParts();

            return _orderedWordsParts;
        }


        #region Filter out word parts

        private int _wordsProcessed;

        private void FilterOutWordParts()
        {
            _wordsProcessed = Int32Constants.Zero;
            RaiseOnWordsBasesPartsFilterOutProgress(string.Empty);

            FilterOutWordBasesPartsInternal();
        }

        private void FilterOutWordBasesPartsInternal()
        {
            foreach (string word in _words)
            {
                AddWordBaseParts(word);
                _wordsProcessed++;
                RaiseOnWordsBasesPartsFilterOutProgress(word);
            }
        }

        private void RaiseOnWordsBasesPartsFilterOutProgress(string currentWord)
        {
            if (OnWordsPartsFilterOutProgress != null)
            {
                OnWordsPartsFilterOutProgress(this, new OnWordsPartsFilterOutProgressEventArgs(
                    (int)(((float)_wordsProcessed / _words.Count()) * Int32Constants.OneHundred),
                    _wordsParts)
                {
                    CurrentWord = currentWord,
                    WordsCount = _words.Count,
                    WordsProcessed = _wordsProcessed,
                });
            }
        }

        private void AddWordBaseParts(string word)
        {
            if (word.Length < WordPartSizes.Min())
            {
                AddWordPart(word);
            }
            else
            {
                AddWordPartsWithProcessing(word);
            }
        }

        private void AddWordPartsWithProcessing(string word, bool isFirst = true)
        {
            if (!string.IsNullOrEmpty(word))
            {
                AddWordPartsWithProcessingSafe(word, isFirst);
            }
        }

        private void AddWordPartsWithProcessingSafe(string word, bool isFirst)
        {
            Node<int> sizeSets = GetPossibleSizeSets(word.Length);
            int minSize = sizeSets.Children.Min(child => child.Value);
            Node<int> partSizeNode = sizeSets.Children.FirstOrDefault(child => child.Value == minSize);

            if (partSizeNode != null)
            {
                CutOffWordPart(word, isFirst, partSizeNode);
            }
            else
            {
                throw new Exception("Word can't be splitted into parts.");
            }
        }

        private void CutOffWordPart(string word, bool isFirst, Node<int> partSizeNode)
        {
            int partSize = word.Length - partSizeNode.Value;
            string wordPart = word.Substring(Int32Constants.Zero, partSize);
            AddWordPart(wordPart, GetPosition(partSizeNode, isFirst));
            if (!partSizeNode.IsLeaf)
            {
                AddWordPartsWithProcessing(word.Substring(partSize), false);
            }
        }

        private Positions[] GetPosition(Node<int> partSizeNode, bool isFirst)
        {
            IList<Positions> result = new List<Positions>();

            AddFirst(result, isFirst);

            AddLast(result, partSizeNode.IsLeaf);

            AddMiddle(result, isFirst, partSizeNode.IsLeaf);

            return result.ToArray();
        }

        private void AddFirst(IList<Positions> result, bool isFirst)
        {
            if (isFirst)
            {
                result.Add(Positions.First);
            }
        }

        private void AddLast(IList<Positions> result, bool isLast)
        {
            if (isLast)
            {
                result.Add(Positions.Last);
            }
        }

        private void AddMiddle(IList<Positions> result, bool isFirst, bool isLast)
        {
            if (!isFirst && !isLast)
            {
                result.Add(Positions.Middle);
            }
        }

        private void AddWordPart(string wordPart, Positions position = Positions.First)
        {
            AddWordPart(wordPart, new Positions[] { position });
        }

        private void AddWordPart(string wordPart, Positions[] positions)
        {
            if (_wordsParts.ContainsKey(wordPart))
            {
                positions.ToList().ForEach(position => _wordsParts[wordPart].UpdataPosition(position));
            }
            else
            {
                _wordsParts.Add(wordPart, new WordPartStatistics(positions));
            }
        }

        #region Build natural number additions as tree

        private Node<int> GetPossibleSizeSets(int size)
        {
            Node<int> currentNode = AdditionsTree.Root;

            if (!AdditionsTree.Root.Children.Any(child => child.Value == size))
            {
                BuildSizeSets(currentNode, size);
            }

            Node<int> result = AdditionsTree.Root.Children.FirstOrDefault(child => child.Value == size);

            return result;
        }

        private int[] WordPartSizes = new int[] { 5, 4, 3 };

        private void BuildSizeSets(Node<int> parent, int size)
        {
            Node<int> current = new Node<int>(parent, size);

            for (int index = Int32Constants.Zero; index < WordPartSizes.Length; index++)
            {
                int wordPartSize = WordPartSizes[index];
                BuildSizeSetsInternal(current, wordPartSize);
            }

            AddCurrentNode(parent, current);
        }

        private void AddCurrentNode(Node<int> parent, Node<int> current)
        {
            if (current.Children.Count() > Int32Constants.Zero)
            {
                parent.AddChild(current);
            }
        }

        private void BuildSizeSetsInternal(Node<int> currentPartSizeNode, int wordPartSize)
        {
            int nextSize = currentPartSizeNode.Value - wordPartSize;

            if (nextSize == Int32Constants.Zero)
            {
                currentPartSizeNode.AddChild(new Node<int>(currentPartSizeNode, nextSize) { IsLeaf = true });
            }
            else if (nextSize > Int32Constants.Zero)
            {
                AddNextNode(currentPartSizeNode, nextSize);
            }
        }

        private void AddNextNode(Node<int> current, int nextSize)
        {
            Node<int> nextNode = GetPossibleSizeSets(nextSize);
            if (nextNode != null)
            {
                current.AddChild(nextNode);
            }
        }

        #endregion

        #endregion

        #region Order word parts

        private void OrderWordsParts()
        {
            _orderedWordsParts = _wordsParts
                .OrderByDescending(wordPart => wordPart.Value.Positions.Sum(position => position.Value))
                .ToArray();
        }


        private void AddToOrderedWordBasesParts(IList<KeyValuePair<string, WordPartStatistics>> addedParts,
            KeyValuePair<string, WordPartStatistics> partToAdd)
        {
            RemoveFromOrderedWordBasesParts(addedParts, partToAdd);
            AddToOrderedWordBasesPartsInternal(addedParts, partToAdd);
        }

        private void RemoveFromOrderedWordBasesParts(IList<KeyValuePair<string, WordPartStatistics>> addedParts,
            KeyValuePair<string, WordPartStatistics> partToAdd)
        {
            if (addedParts.Any(part => part.Key.Contains(partToAdd.Key)))
            {
                var partToRemove = addedParts.First(part => part.Key.Contains(partToAdd.Key));
                addedParts.Remove(partToRemove);
            }
        }

        private void AddToOrderedWordBasesPartsInternal(IList<KeyValuePair<string, WordPartStatistics>> addedParts,
            KeyValuePair<string, WordPartStatistics> partToAdd)
        {
            if (!addedParts.Any(part => partToAdd.Key.Contains(part.Key)))
            {
                addedParts.Add(partToAdd);
            }
        }

        #endregion
    }
}
