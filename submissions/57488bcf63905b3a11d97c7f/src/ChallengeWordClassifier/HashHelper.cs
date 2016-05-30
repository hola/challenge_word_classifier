using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public static class HashHelper
    {
        static HashHelper()
        {
            Crc16Init();
            Crc32Init();
        }

        //http://www.sanity-free.org/134/standard_crc_16_in_csharp.html
        const ushort polynomial = 0xA001;
        static ushort[] table16 = new ushort[256];
        static void Crc16Init()
        {
            ushort value;
            ushort temp;
            for (ushort i = 0; i < table16.Length; ++i)
            {
                value = 0;
                temp = i;
                for (byte j = 0; j < 8; ++j)
                {
                    if (((value ^ temp) & 0x0001) != 0)
                    {
                        value = (ushort)((value >> 1) ^ polynomial);
                    }
                    else {
                        value >>= 1;
                    }
                    temp >>= 1;
                }
                table16[i] = value;
            }
        }

        public static ushort Crc16(byte[] bytes)
        {
            ushort crc = 0;
            for (int i = 0; i < bytes.Length; ++i)
            {
                byte index = (byte)(crc ^ bytes[i]);
                crc = (ushort)((crc >> 8) ^ table16[index]);
            }
            return crc;
        }

        public static ushort Crc16(int n)
        {
            return Crc16(BitConverter.GetBytes(n));
        }

        //http://www.sanity-free.org/12/crc32_implementation_in_csharp.html
        static uint[] table32;
        static void Crc32Init()
        {
            uint poly = 0xedb88320;
            table32 = new uint[256];
            uint temp = 0;
            for (uint i = 0; i < table32.Length; ++i)
            {
                temp = i;
                for (int j = 8; j > 0; --j)
                {
                    if ((temp & 1) == 1)
                    {
                        temp = (uint)((temp >> 1) ^ poly);
                    }
                    else {
                        temp >>= 1;
                    }
                }
                table32[i] = temp;
            }
        }

        public static uint Crc32(byte[] bytes)
        {
            uint crc = 0xffffffff;
            for (int i = 0; i < bytes.Length; ++i)
            {
                byte index = (byte)(((crc) & 0xff) ^ bytes[i]);
                crc = (uint)((crc >> 8) ^ table32[index]);
            }
            return ~crc;
        }

        public static uint Crc32(int n)
        {
            return Crc32(BitConverter.GetBytes(n));
        }

        public static int GetHashCode2(string word, int seed, int max)
        {
            var bytes = Encoding.ASCII.GetBytes(word);
            return (int)(Crc32(bytes) % max);
        }

        public static int GetHashCode3(string word, int seed, int max)
        {
            var bytes = Encoding.ASCII.GetBytes(word);
            using (var stream = new MemoryStream(bytes))
                return (int)((uint)MurMurHash3.Hash(stream) % max);
        }
    }
}
