using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HolaGen
{
	public static class Program
	{
		public static int Main(string[] args)
		{
			var command = args.FirstOrDefault();
			var runner = new TestRunner();

			if (command == null)
			{
				Console.WriteLine("Running...");
				runner.Run();
			}
			else if (command == "nogen")
			{
				Console.WriteLine("Running [nogen]...");
				runner.Run(force: false, generate: false);
			}
			else if (command == "force")
			{
				Console.WriteLine("Running [force]...");
				runner.Run(force: true);
			}
			else if (command == "init")
			{
				Console.WriteLine("Running [init]...");
				runner.Init(new[]
				{
					INIT_PARAMETERS,
				});
			}

			// Console.WriteLine("Done! Press a key to quit");
			// Console.ReadKey();

			Console.Beep();

			return 0;
		}

		public static GenerationParameters INIT_PARAMETERS = new GenerationParameters
		{
			Id = 1,
			SampleExclusion_1 = new SampleExclusionParameters
			{
				BeginAnchor = true,
				EndAnchor = true,
				SampleSize = 2,
				MaxCount = 100,
				MinWordSize = 2,
			},
		};
	}
}
