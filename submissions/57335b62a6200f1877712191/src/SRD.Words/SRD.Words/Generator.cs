using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    public class Generator
    {
        private string _wordsFullName;
        private string _wordPartsFullPath;
        private string _dataFullName;

        private readonly WordsReader _wordsLoader;
        private readonly WordsPartsGenerator _wordPartsGenerator;
        private readonly WordsPartsWriter _wordsPartsWriter;
        private readonly TreeBuilder _treeBuilder;
        private readonly TreeConverter _treeConverter;
        private readonly DataWriter _dataWriter;


        private HashSet<string> _words;
        private KeyValuePair<string, WordPartStatistics>[] _wordsParts;

        private Tree<int> _additionsTree;
        private Tree<char> _wordsPartsTree;
        

        public Generator(string WordsFullName, string WordPartsFullPath, string DataFullName)
        {
            _wordsFullName = WordsFullName;
            _wordPartsFullPath = WordPartsFullPath;
            _dataFullName = DataFullName;

            _wordsLoader = new WordsReader(WordsFullName);
            _wordsLoader.OnNewWord += (sender, args) => { if (OnNewWord != null) { OnNewWord(this, args); } };
            _wordsPartsWriter = new WordsPartsWriter(_wordPartsFullPath);
            _treeBuilder = new TreeBuilder();
            _treeConverter = new TreeConverter();
            _dataWriter = new DataWriter(_dataFullName);

            _wordPartsGenerator = new WordsPartsGenerator();
            _wordPartsGenerator.OnWordsPartsFilterOutProgress += (sender, args) => { if(OnWordsPartsFilterOutProgress != null){ OnWordsPartsFilterOutProgress(this, args); } };

            

        }

        public event EventHandler<OnNewWordEventArgs> OnNewWord;

        public event EventHandler<OnWordsPartsFilterOutProgressEventArgs> OnWordsPartsFilterOutProgress;
        
        
        public void Generate()
        {
            _words = _wordsLoader.Read();
            _wordsParts = _wordPartsGenerator.Generate(_words);
            _additionsTree = _wordPartsGenerator.AdditionsTree;
            _wordsPartsTree = _treeBuilder.Build(_wordsParts);
            _wordsPartsWriter.Write(_wordsParts);
            _dataWriter.Write(_treeConverter.ConvertIntToCharTree(_additionsTree), _wordsPartsTree);
        }
    }
}
