using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApplication1
{
    internal class Algoritm6
    {
        private bool[] bitmap;
        public int MAX_VALUE = 580000;
        public int SUB3_MAX_VALUE = 19684;

        private int tFirst;
        private int tSecond;

        private uint firstBoolean = 999999999;

        private int CONST_SUBSTRING_SIZE = 8;
        private const string ALL_CHARS = "abcdefghijklmnopqrstuvwxyz'";
        private Dictionary<string, int> letter3WordDoesNotConatains;


        private int CONST_SUBSTRING_SIZE2 = 2;
        private Dictionary<string, int> letter3NC;
        private Dictionary<string, int> letter33NC;

        public Algoritm6()
        {

        }

        public void Init(int first, int second)
        {
            string[] origWords = File.ReadAllLines("lower.txt");
            bitmap = new bool[MAX_VALUE];

            tFirst = first;
            tSecond = second;

            letter3NC = GetDeltaDictionaryForSize2(origWords);

            string allOneAndTwoNegative = "{";
            foreach (string key in letter3NC.Keys)
            {
                allOneAndTwoNegative += key + ",";
            }
            allOneAndTwoNegative += "}";

            letter33NC = GetDeltaDictionaryForSize3(origWords);
            letter3WordDoesNotConatains = GetAllSubWords(origWords, CONST_SUBSTRING_SIZE);

            string[] prmutations = new string[letter3WordDoesNotConatains.Keys.Count];
            int i = 0;
            foreach (string key in letter3WordDoesNotConatains.Keys)
            {
                prmutations[i] = key;
                i++;
            }

            InitBitMap(prmutations);
        }


        private void InitBitMap(string[] origWords)
        {
            foreach (string word in origWords)
            {
                uint sum = CalculateValue(word);
                bitmap[sum] = true;
            }

            bool[] bools = new bool[bitmap.Length + SUB3_MAX_VALUE];
            for (int i = 0; i < bitmap.Length; i++)
            {
                bools[i] = bitmap[i];
            }


            //Adding the 3letPermutations
            foreach (string key in letter33NC.Keys)
            {
                int stringPosition = letter33NC[key];
                bools[stringPosition + MAX_VALUE] = true;
            }


            // basic - same count
            byte[] arr1 = Array.ConvertAll(bools, b => b ? (byte) 1 : (byte) 0);

            // pack (in this case, using the first bool as the lsb.
            int bytes = bools.Length/8;
            if ((bools.Length%8) != 0) bytes++;
            byte[] arr2 = new byte[bytes];
            int bitIndex = 0, byteIndex = 0;
            for (int i = 0; i < bools.Length; i++)
            {
                if (bools[i])
                {
                    arr2[byteIndex] |= (byte) (((byte) 1) << bitIndex);
                }
                bitIndex++;
                if (bitIndex == 8)
                {
                    bitIndex = 0;
                    byteIndex++;
                }
            }

            File.WriteAllBytes("raw.txt", arr2);
        }


        public uint CalculateValue(string word)
        {
            uint sumL = 1;
            for (int i = 1; i <= word.Length; i++)
            {
                char a = word[i - 1];
                sumL = (uint) (((sumL + a*tSecond)*tFirst)%MAX_VALUE);
            }

            if (sumL < firstBoolean)
            {
                firstBoolean = sumL;
            }

            return sumL;
        }


        public bool IsValidWord(string word)
        {

            if (word.Length >= 23)
            {
                return false;
            }


            List<string> subWords = GetAllSubWords(word, CONST_SUBSTRING_SIZE);

            foreach (string subWord in subWords)
            {
                uint sum = CalculateValue(subWord);
                if (bitmap[sum] == false)
                {
                    return false;
                }
            }

            subWords = GetAllSubWords(word, CONST_SUBSTRING_SIZE2);

            foreach (string subWord in subWords)
            {
                if (letter3NC.ContainsKey(subWord))
                {
                    return false;
                }
            }

            subWords = GetAllSubWords(word, 3);

            foreach (string subWord in subWords)
            {
                if (letter33NC.ContainsKey(subWord))
                {
                    return false;
                }
            }
            return true;
        }


        private Dictionary<string, int> GetAllSubWords(string[] words, int size)
        {
            Dictionary<string, int> dic = new Dictionary<string, int>();
            foreach (string word in words)
            {
                List<string> temp = GetAllSubWords(word, size);

                foreach (string tempWord in temp)
                {
                    if (!dic.ContainsKey(tempWord))
                    {
                        dic.Add(tempWord, 1);
                    }
                    else
                    {
                        dic[tempWord] = dic[tempWord] + 1;
                    }
                }
            }

            return dic;
        }


        private List<string> GetAllSubWords(string word, int size)
        {
            List<string> ans = new List<string>();
            if (word.Length < size)
            {
                ans.Add(word);
                return ans;
            }

            int index = 0;
            while (index + size <= word.Length)
            {
                ans.Add(word.Substring(index, size));
                index++;
            }
            return ans;
        }

        private Dictionary<string, int> GetDeltaDictionaryForSize3(string[] origWords)
        {
            Dictionary<string, int> delta = new Dictionary<string, int>();
            Dictionary<string, int> fullDict = GetAllPermutationsForSize3();
            Dictionary<string, int> letter3WordDoesNotConatains = GetAllSubWords(origWords, 3);

            foreach (string key in fullDict.Keys)
            {
                if (!letter3WordDoesNotConatains.ContainsKey(key))
                {
                    delta.Add(key, fullDict[key]);
                }
            }
            return delta;
        }



        private Dictionary<string, int> GetDeltaDictionaryForSize2(string[] origWords)
        {
            Dictionary<string, int> delta = new Dictionary<string, int>();
            Dictionary<string, int> fullDict = GetAllPermutationsForSize2();
            Dictionary<string, int> letter3WordDoesNotConatains = GetAllSubWords(origWords, 2);

            foreach (string key in fullDict.Keys)
            {
                if (!letter3WordDoesNotConatains.ContainsKey(key))
                {
                    delta.Add(key, fullDict[key]);
                }
            }
            return delta;
        }



        private Dictionary<string, int> GetAllPermutationsForSize3()
        {
            int counter = 0;
            Dictionary<string, int> dict = new Dictionary<string, int>();
            for (int i = 0; i < ALL_CHARS.Length; i++)
            {
                for (int j = 0; j < ALL_CHARS.Length; j++)
                {
                    for (int t = 0; t < ALL_CHARS.Length; t++)
                    {
                        counter++;
                        string currentWord = "" + ALL_CHARS[i] + ALL_CHARS[j] + ALL_CHARS[t];
                        dict.Add(currentWord, counter);
                    }
                }
            }
            return dict;
        }

        private Dictionary<string, int> GetAllPermutationsForSize2()
        {
            int counter = 0;
            Dictionary<string, int> dict = new Dictionary<string, int>();

            for (int t = 0; t < ALL_CHARS.Length; t++)
            {
                counter++;
                string currentWord = "" + ALL_CHARS[t];
                dict.Add(currentWord, counter);
            }
            for (int j = 0; j < ALL_CHARS.Length; j++)
            {
                for (int t = 0; t < ALL_CHARS.Length; t++)
                {
                    counter++;
                    string currentWord = "" + ALL_CHARS[j] + ALL_CHARS[t];
                    dict.Add(currentWord, counter);
                }
            }
            return dict;
        }

    }
}
