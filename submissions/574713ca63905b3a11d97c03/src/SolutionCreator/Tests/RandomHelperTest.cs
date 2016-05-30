using HolaChallenge;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Linq;

namespace Tests
{
    [TestClass]
    public class RandomHelperTest
    {
        [TestMethod]
        public void CanGetTrivial()
        {
            for (var i = 0; i < 42; i++)
                Assert.AreEqual(0, WordsGeneratorOld.DistributionArray.RandomIndex(new[] { 42 }, 0));
        }

        [TestMethod]
        public void CanGetComplicated()
        {
            var random = new Random();

            var arr = new int[] { 1, 2, 3, 0, 4 };

            var stat = Enumerable.Repeat(0, 10000)
                .Select(_ => WordsGeneratorOld.DistributionArray.RandomIndex(arr, random.Next(10)))
                .GroupBy(i => i)
                .Select(gr => new { index = gr.Key, count = gr.Count() })
                .ToArray();

            foreach (var item in stat)
                Console.WriteLine(item);

            Assert.AreEqual(4, stat.Length);
            Assert.IsTrue(stat.Any(item => item.index == 0));
            Assert.IsTrue(stat.Any(item => item.index == 1));
            Assert.IsTrue(stat.Any(item => item.index == 2));
            Assert.IsFalse(stat.Any(item => item.index == 3));
            Assert.IsTrue(stat.Any(item => item.index == 4));
        }

        [TestMethod]
        public void CanGetUniform()
        {
            var random = new Random();

            var arr = new int[] { 1, 1, 1 };

            var stat = Enumerable.Repeat(0, 10000)
                .Select(_ => WordsGeneratorOld.DistributionArray.RandomIndex(arr, random.Next(3)))
                .GroupBy(i => i)
                .Select(gr => new { index = gr.Key, count = gr.Count() })
                .ToArray();

            foreach (var item in stat)
                Console.WriteLine(item);

            Assert.AreEqual(3, stat.Length);
            Assert.IsTrue(stat.Any(item => item.index == 0));
            Assert.IsTrue(stat.Any(item => item.index == 1));
            Assert.IsTrue(stat.Any(item => item.index == 2));
        }

        [TestMethod]
        public void MyRandomTest()
        {
            var random = new MyRandom(1);
            for (var i = 0; i < 100; i++)
                Console.WriteLine(random.Next(5));
        }
    }
}
