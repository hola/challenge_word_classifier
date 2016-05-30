using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaJSChallenge
{
    public class DataPack
    {
        public static void Pack(int maxLen, int goodLen, int bufLen, string pathOut, params string[] paths)
        {
            if(File.Exists(pathOut))
                File.Delete(pathOut);

            using(var strm = File.OpenWrite(pathOut))
            {
                var len = BitConverter.GetBytes(sizeof(int) * 2);
                strm.Write(len, 0, len.Length);
                len = BitConverter.GetBytes(maxLen);
                strm.Write(len, 0, len.Length);
                len = BitConverter.GetBytes(bufLen);
                strm.Write(len, 0, len.Length);

                foreach (var path in paths)
                {
                    byte[] arr = File.ReadAllBytes(path);
                    len = BitConverter.GetBytes(arr.Length);
                    strm.Write(len, 0, len.Length);
                    strm.Write(arr, 0, arr.Length);
                }

                strm.Close();
            }
        }

        public static byte[] Unpack(byte[] arr, int idx)
        {
            int index=0;
            int pos=0;
            byte[] res = null;
            while (index <= idx)
            {
                var len = BitConverter.ToInt32(arr, pos); pos+=sizeof(int);
                if (index == idx)
                {
                    res = new byte[len];
                    Array.Copy(arr, pos, res, 0, len);
                    break;
                }
                pos += len;
                index++;
            }

            return res;
        }
    }
}
