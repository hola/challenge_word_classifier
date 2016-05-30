using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApplication1
{
    internal class TestChecker
    {
        private Dictionary<string, bool> trueSet;
        private StringBuilder sb;

        public TestChecker()
        {
            trueSet = new Dictionary<string, bool>();
            sb = new StringBuilder();
        }

        public void StartChecking()
        {
            InitDictionary();

            //This was used to create the final data file.
            Algoritm6 algoritm1 = new Algoritm6();
            algoritm1.MAX_VALUE = 580000;
            algoritm1.Init(17, 19);
            double tempcRes = CheckAlAfterInit(algoritm1);
            long zipFsileSize = Compress(new FileInfo("raw.txt"), sb);


            /**
             *Stop Here while debugging to get the final data compress file. 
             */


            //This was used to find the best combination for the bitmap size and primary numbers.
            int[] prime = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71};
            for (algoritm1.MAX_VALUE = 200000;
                algoritm1.MAX_VALUE < 1300000;
                algoritm1.MAX_VALUE = algoritm1.MAX_VALUE + 10000)
            {
                double maxresults = 0;

                for (int i = 1; i < prime.Length; i++)
                {
                    for (int j = 1; j < prime.Length; j++)
                    {
                        algoritm1.Init(prime[i], prime[j]);

                        long zipFileSize = Compress(new FileInfo("raw.txt"), sb);

                        if (zipFileSize > 64000)
                        {
                            continue;
                        }

                        Console.WriteLine("i=" + prime[i] + "     j=" + prime[j]);
                        sb.AppendLine("i=" + prime[i] + "     j=" + prime[j]);

                        double tempRes = CheckAlAfterInit(algoritm1);
                        if (zipFileSize != 1 && tempRes > maxresults)
                        {
                            maxresults = tempRes;
                        }

                    }
                }

                sb.AppendLine("maxresults= " + maxresults);

                File.AppendAllText("output_alg3_" + algoritm1.MAX_VALUE + ".txt", sb.ToString());

                sb = new StringBuilder();
            }
        }

        private void InitDictionary()
        {
            string[] trueSetLines = File.ReadAllLines("5000_Test_Cases.txt");
            foreach (string trueSetLine in trueSetLines)
            {
                if (!trueSetLine.Contains(':'))
                {
                    continue;
                }
                string word = trueSetLine.Split(':')[0].Trim(' ').Trim('"');
                bool wordValue = bool.Parse(trueSetLine.Split(':')[1].Trim(' ').Trim(','));
                if (!trueSet.ContainsKey(word))
                {
                    trueSet.Add(word, wordValue);
                }
            }
        }


        private double CheckAlAfterInit(Algoritm6 algoritm1)
        {
            int succses = 0;
            int falseNegative = 0;
            int falsePositive = 0;

            foreach (string key in trueSet.Keys)
            {
                if (algoritm1.IsValidWord(key) == trueSet[key])
                {
                    succses++;
                }
                else
                {
                    if (algoritm1.IsValidWord(key))
                    {
                        falsePositive++;
                    }
                    else
                    {
                        falseNegative++;
                    }
                }
            }

            double results = ((double) succses/trueSet.Count)*100;
            string res = results.ToString();
            Console.WriteLine("res = " + res);
            Console.WriteLine("");

            sb.AppendLine("res = " + res);
            sb.AppendLine("");

            return results;
        }


        private long Compress(FileInfo fi, StringBuilder sb)
        {
            long finalFileSize = 1;

            try
            {
                // Get the stream of the source file.
                using (FileStream inFile = fi.OpenRead())
                {
                    // Prevent compressing hidden and 
                    // already compressed files.
                    if ((File.GetAttributes(fi.FullName)
                         & FileAttributes.Hidden)
                        != FileAttributes.Hidden & fi.Extension != ".gz")
                    {
                        // Create the compressed file.
                        using (FileStream outFile =
                            File.Create(fi.FullName + ".gz"))
                        {
                            using (GZipStream Compress =
                                new GZipStream(outFile,
                                    CompressionMode.Compress))
                            {
                                // Copy the source file into 
                                // the compression stream.
                                inFile.CopyTo(Compress);

                                Console.WriteLine("Compressed {0} from {1} to {2} bytes.",
                                    fi.Name, fi.Length.ToString(), outFile.Length.ToString());
                                sb.AppendLine(String.Format("Compressed {0} from {1} to {2} bytes.",
                                    fi.Name, fi.Length.ToString(), outFile.Length.ToString()));

                                finalFileSize = outFile.Length;
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                Console.WriteLine("Compress Error!");
                sb.AppendLine("Compress Error!");
            }

            using (FileStream outFile =
                File.OpenRead(fi.FullName + ".gz"))
            {
                finalFileSize = outFile.Length;
            }
            return finalFileSize;
        }
    }
}
