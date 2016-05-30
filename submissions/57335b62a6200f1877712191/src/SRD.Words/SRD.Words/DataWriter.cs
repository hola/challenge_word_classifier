using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class DataWriter
    {
        private string _dataFullName;

        private Tree<char> _additionsTree;
        public Tree<char> _wordsPartsTree;

        public DataWriter(string dataFullName)
        {
            _dataFullName = dataFullName;
        }

        #region Save tree

        public void Write(Tree<char> additionsTree, Tree<char> wordsPartsTree)
        {
            _additionsTree = additionsTree;
            _wordsPartsTree = wordsPartsTree;

            using (FileStream stream = new FileStream(_dataFullName, FileMode.Create))
            {
                Write(stream);
            }
        }

        private void Write(FileStream stream)
        {
            using (StreamWriter writer = new StreamWriter(stream))
            {
                Write(writer);
            }
        }

        private const char TreeSeparator = (char)CleanWel.Core.Constants.ASCII.PrintableCode.Semicolon;
        

        private void Write(StreamWriter writer)
        {
            StringBuilder builder = new StringBuilder();

            WriteTree(builder, _additionsTree);
            builder.Append(TreeSeparator);
            WriteTree(builder, _wordsPartsTree);

            writer.Write(builder.ToString());
        }

        private const bool IsFromRoot = true;
        private const bool IsNotFromRoot = false;

        private void WriteTree(StringBuilder builder, Tree<char> tree)
        {
            foreach (Node<char> child in tree.Root.Children)
            {
                if (GetIsFirstChild(tree, child))
                {
                    builder.Append(YLetter);
                }

                WriteCurrentNode(new WriteCurrentNodeParameters()
                {
                    Writer = builder,
                    Tree = tree,
                    Node = child,
                    IsFromRoot = IsFromRoot
                });
            }
        }

        private bool GetIsFirstChild(Tree<char> tree, Node<char> child)
        {
            return !child.Equals(tree.Root.Children.First());
        }


        private void WriteBegin(StreamWriter writer)
        {
            const string Begin = "var words = \"";
            writer.Write(Begin);
        }

        private void WriteEnd(StreamWriter writer)
        {
            writer.Write((char)CleanWel.Core.Constants.Character.Character.DoubleQuotes.ASCIICode);
            writer.Write((char)CleanWel.Core.Constants.Character.Character.Semicolon.ASCIICode);
        }



        private const char OpenCurlyBracket = '{';
        private const char Colon = ':';
        private const char CloseCurlyBracket = '}';
        private const char CCharacter = 'c';
        private const char OpenSquareBracket = '[';
        private const char CloseSquareBracket = ']';
        private const char Comma = ',';
        private const char SingleQuote = '\'';
        private const char ZLetter = 'Z';
        private const char SSmallLetter = 's';
        private const char XLetter = 'X';
        private const char YLetter = 'Y';

        private void WriteCurrentNode(WriteCurrentNodeParameters parameters)
        {
            parameters.Writer.Append(parameters.Node.Value);
            WriteCurrentNodeEnd(parameters.Writer, parameters.Node);
            if (!(parameters.Tree.IsNetwork && !parameters.IsFromRoot && parameters.Tree.Root.Children.Any(child => child.Value == parameters.Node.Value)))
            {
                WriteCurrentNodeChildren(parameters.Writer, parameters.Tree, parameters.Node.Children);
            }
        }

        private Node<T> GetTreeRoot<T>(Node<T> node)
        {
            while (node.Parent != null)
            {
                node = node.Parent;
            }

            return node;
        }



        private void WriteCurrentNodeEnd(StringBuilder writer, Node<char> node)
        {
            if (node.IsLeaf)
            {
                writer.Append(GetLeafLetter(node.Tag));
            }
        }

        private const char DefaultLeafNodeCharacter = ZLetter;

        private readonly char[] StatisticsLeafNodeCharacters = new char[] { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' };

        private char GetLeafLetter(WordPartStatistics wordPartStatistics)
        {
            char result;

            if (wordPartStatistics == null)
            {
                result = DefaultLeafNodeCharacter;
            }
            else
            {
                result = GetLeafLetterByStatistics(wordPartStatistics);
            }

            return result;
        }

        private char GetLeafLetterByStatistics(WordPartStatistics wordPartStatistics)
        {
            int result = Int32Constants.Zero;

            result = BoolToInt32(wordPartStatistics.Positions.Any(position => position.Key == Positions.First && position.Value > Int32Constants.Zero));
            result = result << Int32Constants.One;
            result += BoolToInt32(wordPartStatistics.Positions.Any(position => position.Key == Positions.Middle && position.Value > Int32Constants.Zero));
            result = result << Int32Constants.One;
            result += BoolToInt32(wordPartStatistics.Positions.Any(position => position.Key == Positions.Last && position.Value > Int32Constants.Zero));

            return StatisticsLeafNodeCharacters[result];
        }

        private int BoolToInt32(bool value)
        {
            byte result;
            if (value)
            {
                result = Int32Constants.One;
            }
            else
            {
                result = Int32Constants.Zero;
            }

            return result;
        }

        private void WriteCurrentNodeChildren(StringBuilder writer, Tree<char> tree, Node<char>[] nodes)
        {
            if (nodes.Length > Int32Constants.Zero)
            {
                WriteCurrentNodeChildrenNodes(writer, tree, nodes);
            }
        }

        private void WriteCurrentNodeChildrenNodes(StringBuilder writer, Tree<char> tree, Node<char>[] nodes)
        {
            writer.Append(OpenSquareBracket);
            WriteCurrentNodeChildrenNodesItems(writer, tree, nodes);
            writer.Append(CloseSquareBracket);
        }

        private void WriteCurrentNodeChildrenNodesItems(StringBuilder writer, Tree<char> tree, Node<char>[] nodes)
        {
            for (int index = Int32Constants.Zero; index < nodes.Length; index++)
            {
                WriteCurrentNode(new WriteCurrentNodeParameters()
                {
                    Writer = writer,
                    Tree = tree,
                    Node = nodes[index],
                    IsFromRoot = IsNotFromRoot
                });
            }
        }

        #endregion

        
    }
}
