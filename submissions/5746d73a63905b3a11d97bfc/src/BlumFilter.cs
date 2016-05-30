using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaJSChallenge
{
    class BlumFilter
    {
        byte[] arr;
        int arrSizeInBits;
        int hashCount;

        public BlumFilter(int sizeLimit)
        {
            arrSizeInBits = sizeLimit;
            arr = new byte[(sizeLimit+7)/8];

            //double errProbability = Math.Pow(0.6185, (double)sizeLimit / (double)elementsCount);
            hashCount = 1;// (int)(0.6931 * ((double)sizeLimit / (double)elementsCount));
            if (hashCount == 0) hashCount = 1;

            //Debug.WriteLine("Error:{0}, hashes:{1}", errProbability, hashCount);
        }

        public void SetArray(byte[] buf)
        {
            Array.Copy(buf, arr, buf.Length);
        }
        public byte[] GetArray()
        {
            return arr;
        }

        void SetBit(long pos)
        {
            long idx = pos / 8;
            int offset = (int)(pos % 8);

            byte b = (byte)(1 << offset);

            arr[idx] |= b;
        }

        bool IsBitSet(long pos)
        {
            long idx = pos / 8;
            int offset = (int)(pos % 8);

            byte b = (byte)(1 << offset);

            return (arr[idx] & b) != 0;
        }

        int Hash1(string s)
        {
            int hash = 0;
            if (s.Length == 0) return hash;

            for (var i = 0; i < s.Length; i++)
            {
                var ch = s[i];
                hash = ((hash << 5) - hash) + ch;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        }

        int Hash3(string s)
        {
            int hash = 0;
            if (s.Length == 0) return hash;

            for (var i = 0; i < s.Length; i++)
            {
                var ch = (int)s[i];
                if (ch != 39)
                    ch -= 95;
                else ch = 1;

                hash = ch + hash * 47;
            }

            return hash;
        }

        int ComputeHash(int primaryHash)
        {
            int resultingHash = (primaryHash) % arrSizeInBits;

            return Math.Abs((int)resultingHash);
        }

        public void Add(string item)
        {
            // start flipping bits for each hash of item
            int primaryHash = Hash3(item);
                int hash = ComputeHash(primaryHash);
                SetBit(hash);
        }

        public void AddRange(IEnumerable<string> items)
        {
            foreach (var s in items)
            {
                Add(s);
            }
        }

        public bool Contains(string item)
        {
            int primaryHash = Hash3(item);
                int hash = ComputeHash(primaryHash);

                if (!IsBitSet(hash))
                    return false;

            return true;
        }
    }
}
