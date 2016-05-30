using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class Node<T>
    {
        private IList<Node<T>> _children;

        public Node(Node<T> parent, T value)
        {
            Parent = parent;
            Value = value;
            _children = new List<Node<T>>();
        }

        public Node<T> Parent { get; set; }
        public Node<T>[] Children
        {
            get
            {
                return _children.ToArray();
            }
        }

        public T Value { get; private set; }
        public bool IsLeaf { get; set; }

        public void AddChild(Node<T> child)
        {
            _children.Add(child);
        }

        public void RemoveChild(Node<T> node)
        {
            if(_children.Contains(node))
            {
                _children.Remove(node);
            }
        }

        public WordPartStatistics Tag { get; set; }
    }
}
