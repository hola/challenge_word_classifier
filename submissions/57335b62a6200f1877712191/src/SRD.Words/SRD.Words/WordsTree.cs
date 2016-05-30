#define IsUseSemantics

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class WordsTree
    {
        private string _wordsTxtFullName;

        private readonly Tree<char> _wordsPartsMultiTree;

        private HashSet<string> _words;

        private IDictionary<string, WordPartStatistics> _wordsParts;

        private KeyValuePair<string, WordPartStatistics>[] _orderedWordsParts;

        public WordsTree(string wordsTxtFullName)
        {
            _words = new HashSet<string>();
            _wordsTxtFullName = wordsTxtFullName;

            _wordsPartsMultiTree = Tree<char>.Create();
            _wordsParts = new Dictionary<string, WordPartStatistics>();
        }

        public void Process()
        {
           
        }

        private void Process(FileStream stream)
        {
            
        }

        
        //private const int WordsBasesPartsCountInMultiTree = 50000;
        
        

    }
}