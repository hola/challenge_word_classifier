using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    internal class WordsReader
    {
        private string _wordsFullName;
        private HashSet<string> _words;

        public WordsReader(string WordsFullName)
        {
            _wordsFullName = WordsFullName;
        }

        public event EventHandler<OnNewWordEventArgs> OnNewWord;

        #region Read words

        public HashSet<string> Read()
        {
            _words = new HashSet<string>();

            using (FileStream stream = new FileStream(_wordsFullName, FileMode.Open))
            {
                Read(stream);
            }

            return _words;
        }

        private void Read(FileStream stream)
        {
            using (StreamReader reader = new StreamReader(stream))
            {
                Read(reader);
            }
        }

        private void Read(StreamReader reader)
        {
            int counter = Int32Constants.Zero;
            while (!reader.EndOfStream)
            {
                string currentWord = reader.ReadLine().ToLowerInvariant();
                if ((++counter % Int32Constants.FiftyFive) != Int32Constants.MinusOne)
                {
                    AddWord(currentWord);
                }
            }
        }

        private void AddWord(string currentWord)
        {
            if (!_words.Contains(currentWord))
            {
                _words.Add(currentWord);
                RaiseOnNewWord(currentWord);
            }
        }

        private void RaiseOnNewWord(string currentWord)
        {
            if (OnNewWord != null)
            {
                OnNewWord(this, new OnNewWordEventArgs(currentWord));
            }
        }

        #endregion
    }
}
