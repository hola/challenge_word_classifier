using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class TreeBuilder
    {

        private const int DefaultWordPartsPercentsToSave = 31;

        internal Tree<char> Build(KeyValuePair<string, WordPartStatistics>[] values, int wordPartsPercentsToSave = DefaultWordPartsPercentsToSave)
        {
            Tree<char> tree = Tree<char>.Create();

            int count = (int)(((float)values.Count() * wordPartsPercentsToSave) / Int32Constants.OneHundred);

            values
                .Take(count)
                .ToList()
                .ForEach(part => AddToTreeSafe(tree, part));

            return tree;
        }

        private void AddToTreeSafe(Tree<char> tree, KeyValuePair<string, WordPartStatistics> currentWord)
        {
            Node<char> currentNode = tree.Root;
            for (var index = Int32Constants.Zero; index < currentWord.Key.Length; index++)
            {
                char currentCharacter = currentWord.Key[index].ToString().ToLowerInvariant().First();
                currentNode = GetCharacterNode(new GetCharacterNodeParameters()
                {
                    CurrentNode = currentNode,
                    CurrentCharacter = currentCharacter,
                    IsLastCharacter = index == currentWord.Key.Length - Int32Constants.One,
                    Statistics = currentWord.Value
                });
            }
        }

        private Node<char> GetCharacterNode(GetCharacterNodeParameters parameters)
        {
            Node<char> characterNode = parameters.CurrentNode.Children.FirstOrDefault(child => child.Value == parameters.CurrentCharacter);
            if (characterNode == null)
            {
                parameters.CurrentNode.AddChild((characterNode = new Node<char>(parameters.CurrentNode, parameters.CurrentCharacter)));
            }
            SetLeafNode(characterNode, parameters.IsLastCharacter);
            UpdateNodeStatistics(characterNode, parameters.Statistics, parameters.IsLastCharacter);

            return characterNode;
        }

        private void SetLeafNode(Node<char> characterNode, bool isLastCharacter)
        {
            if (characterNode != null && isLastCharacter)
            {
                characterNode.IsLeaf = true;
            }
        }

        private void UpdateNodeStatistics(Node<char> characterNode, WordPartStatistics statistics, bool isLastCharacter)
        {
            if (isLastCharacter)
            {
                UpdateNodeStatisticsInternal(characterNode, statistics);
            }
        }

        private void UpdateNodeStatisticsInternal(Node<char> characterNode, WordPartStatistics statistics)
        {
            if (characterNode.Tag == null)
            {
                characterNode.Tag = statistics;
            }
            else
            {
                characterNode.Tag += statistics;
            }
        }
    }
}
