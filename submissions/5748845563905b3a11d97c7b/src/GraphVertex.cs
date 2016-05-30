using System.Collections.Generic;

namespace HolaContest
{
	public class GraphVertex
	{
		public GraphVertex()
		{
			Edges = new Dictionary<string, int>();
		}
		public Dictionary<string, int> Edges { get; private set; }

		public bool IsStart { get; set; }

		public bool IsEnd { get; set; }
	}
}