using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class WriteCurrentNodeParameters
    {
        public StringBuilder Writer { get; set; }

        public Tree<char> Tree { get; set; }

        public Node<char> Node { get; set; }

        public bool IsFromRoot { get; set; }
    }
}
