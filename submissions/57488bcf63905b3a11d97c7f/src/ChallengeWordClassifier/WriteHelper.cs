using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public static class WriteHelper
    {
        public static IEnumerable<string> WriteTo(this IEnumerable<string> words, string file)
        {
            File.WriteAllLines(file, words);
            return words;
        }

        public static IEnumerable<string> WriteToGzip(this IEnumerable<string> words, string file)
        {
            var bytes = Encoding.ASCII.GetBytes(words.SelectMany(w => (w + Environment.NewLine).ToCharArray()).ToArray());
            WriteToGzip(bytes, file);
            return words;
        }

        public static void WriteToGzip(this IEnumerable<byte> array, string file)
        {
            using (var gzip = new ICSharpCode.SharpZipLib.GZip.GZipOutputStream(File.Create(file + ".gz")))
            {
                gzip.SetLevel(9);
                var buffer = array.ToArray();
                gzip.Write(buffer, 0, buffer.Length);
            }
        }
    }
}
