using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    class GetCharacterNodeParameters
    {
        public Node<char> CurrentNode { get; set; }

        public char CurrentCharacter { get; set; }

        public bool IsLastCharacter { get; set; }

        public WordPartStatistics Statistics { get; set; }
    }
}
