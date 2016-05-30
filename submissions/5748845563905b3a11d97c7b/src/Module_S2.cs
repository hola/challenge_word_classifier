using System.IO;

namespace HolaContest
{
	public class Module_S2 : IModule
	{
		private BloomFilter graph;

		public Module_S2()
		{
			var bytes = BloomFilter.LoadFromBuffer(File.ReadAllBytes(@"D:\Downloads\mine\Projects\Hola_May_2016\s2_bloom.dat"));
			graph = new BloomFilter(bytes, 64500 * 8, 2);
		}

		public bool Test(string word)
		{
			var syllabes = CalcData.SplitSyllabes(word);
			if (syllabes.Count == 1)
				return syllabes[0].Length <= 3;

			for (int i = 0; i < syllabes.Count - 1; i++)
			{
				var s1 = syllabes[i];
				var s2 = syllabes[i+1];

				var bw = CreateBloomWord(s1, s2);

				if (!graph.Check(bw))
					return false;
			}
			return true;
		}

		public static string CreateBloomWord(string s1, string s2)
		{
			var bloomWord = s1 + "_" + s2;
			return bloomWord;
		}
	}
}