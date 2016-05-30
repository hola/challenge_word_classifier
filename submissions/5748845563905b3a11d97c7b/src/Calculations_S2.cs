using System;
using System.IO;
using System.Linq;
using NUnit.Framework;

namespace HolaContest
{
	[TestFixture]
	public class Calculations_S2
	{
		[Test]
		public void PrepareSolution2()
		{
			var bits = 64500 * 8;
			var bf = new BloomFilter(bits, 2);

			var dict = KnownSets.words;
			Console.WriteLine("Dictionary size: " + dict.Count);
			var calcData = new CalcData(dict);

			var limit = 1;
			var filteredSyllabes = calcData.Syllabes.Where(x => x.Value >= limit).ToDictionary(x => x.Key, x => x.Value);
			var graph = Processor.CreateGraph(filteredSyllabes, calcData.SplittedWords);

			var graphList = graph.vertices.ToList();
			foreach (var v in graphList)
			{
				var s1 = v.Key;
				var edges = v.Value.Edges;

				foreach (var edge in edges)
				{
					var s2 = edge.Key;

					var bloomWord = Module_S2.CreateBloomWord(s1, s2);
					bf.Add(bloomWord);
				}
			}

			var buffer = bf.GetBuffer();
			File.WriteAllBytes(@"D:\Downloads\mine\Projects\Hola_May_2016\s2_bloom.dat", buffer);
		}
	}
}