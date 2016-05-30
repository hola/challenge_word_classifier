using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SRD.Words.Console
{
    class Program
    {
        private const string WordsFullName = "words.txt";
        private const string WordPartsFullPath = "wordsParts.txt";
        private const string DataFullName = "data.dat";

        private const string NewWordTempalte = "Words loading in progress...\r\nUnique words total: {0}. Current word: [ {1} ].";
        private const string WordsPartsFilterOutHeaderTemplate = "Words splitting into parts in progress...\r\nWords total: {0}. Words filtered: {1}. Current word: [ {2} ].";
        private const string TopWordBasePartTempalate = "Top {0} most efficient word base parts.";
        private const string WordBasePartTemplate = "Word base part: \"{0}\". Used in the different positions count: {1}.";
        private const string CompletedTemplate = "Completed. Press any key to exit...";
        private const string GParameter = "-g";
        private static string TParameter = "-t";

        private const string HelpTemplate = "Words parts data generartor.\r\n\t[-g] generate compressed dictionary\r\n\t[-t] test compressed dictionary\r\n\t[-h] help";
        private static string TestWordTemplate = "Words testing in progress...\r\nWords tested: {0}. Fails: N/A. Current word: [ {1} ].";

        private static int _wordsTotal = CleanWel.Core.Constants.Int32.Zero;
        private static int _wordCount;
        
        
        static void Main(string[] args)
        {
            if(args.Contains(GParameter))
            {
                Generate();
            }
            else if(args.Contains(TParameter))
            {
                Test();
            }
            else
            {
                Help();
            }
            
        }

        private static void Generate()
        {
            Generator dataFileGenerator = new Generator(WordsFullName, WordPartsFullPath, DataFullName);
            dataFileGenerator.OnNewWord += (obj, arguments) =>
            {
                _wordsTotal++;
                if ((_wordsTotal % CleanWel.Core.Constants.Int32.OneHundred) == CleanWel.Core.Constants.Int32.Zero)
                {
                    System.Console.Clear(); System.Console.WriteLine(NewWordTempalte, _wordsTotal, arguments.CurrentWord);
                }
            };


            int lastPercents = CleanWel.Core.Constants.Int32.MinusOne;

            dataFileGenerator.OnWordsPartsFilterOutProgress += (obj, arguments) =>
            {
                //startTime = DateTime.Now;
                if (arguments.Percents != lastPercents)
                {
                    System.Console.Clear();
                    System.Console.WriteLine(WordsPartsFilterOutHeaderTemplate,
                        arguments.WordsCount, arguments.WordsProcessed, arguments.CurrentWord);
                    WriteProgressBar(arguments.Percents);
                    System.Console.WriteLine();
                    WriteTopWordBaseParts(arguments.WordsParts);
                    lastPercents = arguments.Percents;
                }
            };
            
            dataFileGenerator.Generate();

            System.Console.WriteLine(CompletedTemplate);
            System.Console.ReadLine();
        }

        private static void Test()
        {
            /*_wordCount = CleanWel.Core.Constants.Int32.Zero;
            using(FileStream stream = new FileStream(WordsTxtFullName, FileMode.Open))
            {
                Test(stream);
            }*/
            using(FileStream strem = new FileStream(DataFullName, FileMode.Open))
            {
                using(StreamReader reader = new StreamReader(strem))
                {
                    string result = reader.ReadToEnd();
                    //string decompressed = lz_string_csharp.LZString.decompressFromUTF16(result);
                    System.Console.WriteLine(result);
                }
            }
        }

        private static void Test(FileStream stream)
        {
            using (StreamReader reader = new StreamReader(stream))
            {
                Test(reader);
            }
        }


        private static void Test(StreamReader reader)
        {
            while(!reader.EndOfStream)
            {
                _wordCount++;
                string word = reader.ReadLine();
                WriteTestWord(word);
                // TO-DO: Add testing logic
            }
        }

        private static void WriteTestWord(string word)
        {
            if (_wordCount % CleanWel.Core.Constants.Int32.Ten == CleanWel.Core.Constants.Int32.Zero)
            {
                System.Console.Clear();
                System.Console.WriteLine(TestWordTemplate, _wordCount, word);
            }
        }

        private static void Help()
        {
            System.Console.WriteLine(HelpTemplate);
        }

        

        private static void WriteTopWordBaseParts(IDictionary<string, WordPartStatistics> wordsBasesParts)
        {
            const int OutputItemsCount = CleanWel.Core.Constants.Int32.Ten;

            System.Console.WriteLine(TopWordBasePartTempalate, OutputItemsCount);

            foreach(KeyValuePair<string, WordPartStatistics> kvp in wordsBasesParts
                .OrderByDescending(wordBasePart => wordBasePart.Value.Positions.Sum(position => position.Value))
                .Take(OutputItemsCount))
            {
                System.Console.WriteLine(WordBasePartTemplate, kvp.Key, kvp.Value.Positions.Sum(position => position.Value));
            }
        }


        private static void WriteProgressBar(int percents)
        {
            WritePercentsProgress(percents);
            WritePercentsNumber(percents);
        }

        private static void WritePercentsProgress(int percents)
        {
            WritePercentsProgressHeader();
            WritePercentsProgressBody(percents);
            WritePercentsProgressFooter(percents);
        }

        private static void WritePercentsProgressHeader()
        {
            System.Console.Write(CleanWel.Core.Constants.Character.Character.OpeningBracket.Symbol.Text);
            System.Console.Write(CleanWel.Core.Constants.Character.Character.Space.Symbol.Text);
        }

        private static void WritePercentsProgressBody(int percents)
        {
            const int divisionsCount = CleanWel.Core.Constants.Int32.Twenty;
            for (var index = CleanWel.Core.Constants.Int32.Zero; index < divisionsCount; index++)
            {
                if ((index * 100 / divisionsCount) >= percents || percents == CleanWel.Core.Constants.Int32.Zero)
                {
                    System.Console.Write(CleanWel.Core.Constants.Character.Character.Hyphen.Symbol.Text);
                }
                else
                {
                    System.Console.Write(CleanWel.Core.Constants.Character.Character.Number.Symbol.Text);
                }
            }
        }

        private static void WritePercentsProgressFooter(int percents)
        {
            System.Console.Write(CleanWel.Core.Constants.Character.Character.Space.Symbol.Text);
            System.Console.Write(CleanWel.Core.Constants.Character.Character.ClosingBracket.Symbol.Text);
            
        }

        private static void WritePercentsNumber(int percents)
        {
            System.Console.Write(CleanWel.Core.Constants.Character.Character.Space.Symbol.Text);
            System.Console.Write(percents);
            System.Console.WriteLine(CleanWel.Core.Constants.Character.Character.Procenttecken.Symbol.Text);
        }

        
    }
}
