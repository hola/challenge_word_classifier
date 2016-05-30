using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class TreeConverter
    {
        #region Convert int to char tree

        public Tree<char> ConvertIntToCharTree(Tree<int> tree)
        {
            Tree<char> result = Tree<char>.Create(tree.IsNetwork);

            ConvertChildren(result, tree.Root, result.Root);

            return result;
        }

        private void ConvertChildren(Tree<char> targetTree, Node<int> source, Node<char> target)
        {
            foreach (var child in source.Children)
            {
                target.AddChild(ConvertNode(targetTree, target, child));
            }
        }

        private const int CharOffset = 96;
        private Node<char> ConvertNode(Tree<char> targetTree, Node<char> parent, Node<int> source)
        {
            Node<char> result;
            char targetValue = (char)(source.Value + CharOffset);
            if (targetTree.Root.Children.Any(child => child.Value == targetValue))
            {
                result = targetTree.Root.Children.First(child => child.Value == targetValue);
            }
            else
            {
                result = new Node<char>(parent, targetValue) { IsLeaf = source.IsLeaf };
                ConvertChildren(targetTree, source, result);
            }

            return result;
        }

        #endregion
    }
}
