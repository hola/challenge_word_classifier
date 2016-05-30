using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class OnNewWordEventArgs
    {
        public string CurrentWord { get; private set; }

        public OnNewWordEventArgs(string currentWord)
        {
            CurrentWord = currentWord;
        }
    }
}
