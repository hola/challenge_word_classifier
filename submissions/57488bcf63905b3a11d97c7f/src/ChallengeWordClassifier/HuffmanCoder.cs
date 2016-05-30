using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public class HuffmanCoder<T> where T : IComparable
    {
        private class Node
        {
            public T Element;
            public int Frequency;
            public Node Left;
            public Node Right;
        }

        private KeyValuePair<T, int>[] _freq;
        private Node _root;
        private Dictionary<T, List<bool>> _mapEncode;

        private List<bool> Traverse(T element)
        {
            return Traverse(element, _root, new List<bool>());
        }

        private List<bool> Traverse(T element, Node node, List<bool> data)
        {
            if (node.Right == null && node.Left == null)
            {
                return element.Equals(node.Element) ? data : null;
            }
            else
            {
                List<bool> left = null;
                List<bool> right = null;

                if (node.Left != null)
                {
                    List<bool> leftPath = new List<bool>();
                    leftPath.AddRange(data);
                    leftPath.Add(false);

                    left = Traverse(element, node.Left, leftPath);
                }

                if (node.Right != null)
                {
                    List<bool> rightPath = new List<bool>();
                    rightPath.AddRange(data);
                    rightPath.Add(true);
                    right = Traverse(element, node.Right, rightPath);
                }

                return left != null ? left : right;
            }
        }

        public void Build(KeyValuePair<T, int>[] freq)
        {
            _freq = freq;
            var tree = _freq.Select(f => new Node { Element = f.Key, Frequency = f.Value }).ToList();
            while (tree.Count > 1)
            {
                var lowNodes = tree.OrderBy(t => t.Frequency).Take(2).ToArray();
                var n1 = lowNodes[0];
                var n2 = lowNodes[1];
                tree.Remove(n1);
                tree.Remove(n2);
                tree.Add(new Node { Frequency = n1.Frequency + n2.Frequency, Left = n1, Right = n2 });
            }
            _root = tree.FirstOrDefault();

            _mapEncode = new Dictionary<T, List<bool>>();
            foreach (var elem in _freq)
            {
                _mapEncode.Add(elem.Key, Traverse(elem.Key));
            }
        }

        public void Build(T[] source)
        {
            var freq = new Dictionary<T, int>();
            foreach (var elem in source)
            {
                if (!freq.ContainsKey(elem))
                    freq.Add(elem, 0);
                freq[elem]++;
            }

            Build(freq.ToArray());
        }

        public KeyValuePair<T, int>[] GetFrequencies()
        {
            return _freq.ToArray();
        }

        public BitArray Encode(T[] source)
        {
            var code = new List<bool>();
            foreach(T elem in source)
            {
                code.AddRange(_mapEncode[elem]);
            }
            return new BitArray(code.ToArray());
        }

        public T[] Decode(BitArray bits)
        {
            Node current = _root;
            var result = new List<T>();

            foreach (bool bit in bits)
            {
                if (bit)
                {
                    if (current.Right != null)
                        current = current.Right;
                }
                else
                {
                    if (current.Left != null)
                        current = current.Left;
                }

                if (current.Left == null && current.Right == null)
                {
                    result.Add(current.Element);
                    current = _root;
                }
            }

            return result.ToArray();
        }
    }

    public static class HuffmanHelper
    {
        public static byte[] ToByteArray(BitArray bits)
        {
            byte[] ret = new byte[(bits.Length - 1) / 8 + 1];
            bits.CopyTo(ret, 0);
            return ret;
        }

        public static byte[] ToByteArray(KeyValuePair<byte, int>[] freq)
        {
            return freq.SelectMany(f => new byte[] { f.Key }.Concat(BitConverter.GetBytes(f.Value))).ToArray();
        }

        public static byte[] ToByteArray(KeyValuePair<int, int>[] freq)
        {
            return freq.SelectMany(f => BitConverter.GetBytes(f.Key).Concat(BitConverter.GetBytes(f.Value))).ToArray();
        }

        public static byte[] EncodeBytes(byte[] source)
        {
            var coder = new HuffmanCoder<byte>();
            coder.Build(source);
            var encoded = coder.Encode(source);

            var freq = coder.GetFrequencies();
            return BitConverter.GetBytes((short)(freq.Length))
                .Concat(ToByteArray(freq))
                .Concat(ToByteArray(encoded))
                .ToArray();
        }

        public static byte[] DecodeBytes(byte[] encoded)
        {
            var count = BitConverter.ToInt16(encoded, 0);
            var freq = new KeyValuePair<byte, int>[count];
            int pos = 2;
            for (int i = 0; i < count; i++)
            {
                var element = encoded[pos];
                var elemFreq = BitConverter.ToInt32(encoded, pos + 1);
                freq[i] = new KeyValuePair<byte, int>(element, elemFreq);
                pos += 5;
            }
            var bits = new BitArray(encoded.Skip(pos).ToArray());

            var coder = new HuffmanCoder<byte>();
            coder.Build(freq);
            return coder.Decode(bits);
        }
    }
}
