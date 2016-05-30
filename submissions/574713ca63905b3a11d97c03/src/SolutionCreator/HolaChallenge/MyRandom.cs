namespace HolaChallenge
{
    public class MyRandom
    {
        private uint seed;
        private const uint a = 2147483629;
        private const uint c = 2147483587;
        private const uint m = 0x80000000 - 1;

        public MyRandom(uint seed)
        {
            this.seed = seed;
        }

        public int Next(int maxValueExclusive)
        {
            seed = (a * seed + c) % m;
            return (int)(seed % (uint)maxValueExclusive);
        }
    }
}
