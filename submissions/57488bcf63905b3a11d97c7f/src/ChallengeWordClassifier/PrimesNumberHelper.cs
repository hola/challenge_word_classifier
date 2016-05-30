using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public static class PrimeNumbersHelper
    {
        public static IEnumerable<int> PrimeNumbers(int start = 1)
        {
            int n = start % 2 == 0 ? start + 1 : start;
            while (n < int.MaxValue)
            {
                if (IsPrime(n))
                    yield return n;
                n += 2;
            }
        }

        public static bool IsPrime(int n)
        {
            for (int i = 2; i < n / 2; i++)
                if (n % i == 0)
                    return false;
            return true;
        }
    }
}
