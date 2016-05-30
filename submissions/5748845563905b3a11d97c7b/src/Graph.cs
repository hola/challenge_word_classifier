using System.Collections.Generic;

namespace HolaContest
{
	public class Graph
	{
		public Dictionary<string, GraphVertex> vertices = new Dictionary<string, GraphVertex>();

		public void AddEdge(string v1, string v2)
		{
			GraphVertex current = null;
			if (!vertices.TryGetValue(v1, out current))
			{
				current = new GraphVertex();
				vertices.Add(v1, current);
			}
			if (current.Edges.ContainsKey(v2))
			{
				current.Edges[v2]++;
			}
			else
			{
				current.Edges[v2] = 1;
			}
		}

		public void SetStart(string v)
		{
			GraphVertex current = null;
			if (!vertices.TryGetValue(v, out current))
			{
				current = new GraphVertex();
				vertices.Add(v, current);
			}
			current.IsStart = true;
		}

		public void SetEnd(string v)
		{
			GraphVertex current = null;
			if (!vertices.TryGetValue(v, out current))
			{
				current = new GraphVertex();
				vertices.Add(v, current);
			}
			current.IsEnd = true;
		}

		public bool IsStart(string v)
		{
			GraphVertex current = null;
			if (!vertices.TryGetValue(v, out current))
			{
				return false;
			}
			return current.IsStart;
		}

		public bool IsEnd(string v)
		{
			GraphVertex current = null;
			if (!vertices.TryGetValue(v, out current))
			{
				return false;
			}
			return current.IsEnd;
		}
	}
}