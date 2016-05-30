using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SRD.Words
{
    public class Tree<T>
    {
        private const int Zero = 0;

        public Node<T> Root { get; private set; }

        private Tree(bool isNetwork = false)
        {
            IsNetwork = isNetwork;
            Root = new Node<T>(null, default(T));
        }

        internal static Tree<T> Create(bool isNetwork = false)
        {
            return new Tree<T>(isNetwork);
        }

        public bool IsNetwork { get; private set; }
    }
}
