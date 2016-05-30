using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace SRD.Words
{
    class WordsPartsWriter
    {
        private string _wordPartsFullPath;

        private IEnumerable<KeyValuePair<string, WordPartStatistics>> _wordsParts;

        public WordsPartsWriter(string wordPartsFullPath)
        {
            _wordPartsFullPath = wordPartsFullPath;
        }


        #region Save words bases parts

        public void Write(IEnumerable<KeyValuePair<string, WordPartStatistics>> wordsParts)
        {
            _wordsParts = wordsParts;
            using (FileStream stream = new FileStream(_wordPartsFullPath, FileMode.Create))
            {
                SaveWordsParts(stream);
            }
        }

        private void SaveWordsParts(FileStream stream)
        {
            using (StreamWriter writer = new StreamWriter(stream))
            {
                SaveWordsParts(writer);
            }
        }

        private const string WordPartTemplate = "F:{0}-M:{1}-L:{2}+{3}";
        
        private void SaveWordsParts(StreamWriter writer)
        {
            foreach (KeyValuePair<string, WordPartStatistics> kvp in _wordsParts)
            {
                writer.WriteLine(WordPartTemplate,
                    kvp.Value.GetCount(Positions.First),
                    kvp.Value.GetCount(Positions.Middle),
                    kvp.Value.GetCount(Positions.Last),
                    kvp.Key);
                //writer.WriteLine(kvp.Key);
            }
        }

        #endregion

    }
}
