using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public class Timer : IDisposable
	{
		private string _operation;
		private Stopwatch _sw;

		public Timer(string operation)
		{
			this._operation = operation;
			this._sw = Stopwatch.StartNew();
		}

		public void Dispose()
		{
			this._sw.Stop();
			Console.WriteLine("{0} completed in {1}", this._operation, this._sw.Elapsed);
		}
	}
}
