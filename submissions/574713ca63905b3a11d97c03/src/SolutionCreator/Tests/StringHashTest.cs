using HolaChallenge;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Tests
{
	[TestClass]
	public class StringHashTest
	{
		[TestMethod]
		public void FixJavascriptHash()
		{
			Assert.AreEqual(193409700u, BloomFilter.JavascriptHashString("aaa"));
			Assert.AreEqual(177604u, BloomFilter.JavascriptHashString("a"));
			Assert.AreEqual(5381u, BloomFilter.JavascriptHashString(""));
			Assert.AreEqual(5861062u, BloomFilter.JavascriptHashString("ab"));
			Assert.AreEqual(487211102u, BloomFilter.JavascriptHashString("abcdefghijklmnopqrstuvwxyz"));
			Assert.AreEqual(1449298689u, BloomFilter.JavascriptHashString("adsfsdfbdfbdfsfdsaf"));
		}
	}
}
