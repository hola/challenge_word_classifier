using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaJSChallenge
{
    class Pair3
    {
        int sizeLimit;
        int elementsCount;

        public Pair3(string ends, int a, int b, int sizeLimit, int elementsCount)
        {
            Ends = ends;
            Count = a;
            Correlations = b;
            this.sizeLimit = sizeLimit;
            this.elementsCount = elementsCount;
        }

        public string Ends { get; set; }
        public int Count { get; set; }
        public int Correlations { get; set; }

        public double Error
        {
            get
            {
                double errCurrent = Math.Pow(0.6185, (double)sizeLimit / (double)elementsCount);

                int newCount = elementsCount - Count;
                double errNew = Math.Pow(0.6185, (double)sizeLimit / (double)newCount);
                double errCorr =((double)Count - (double)Correlations) / (double)Count;
                double good = (double)Correlations / (double)Count;
                double weight = (double)Count / (double)elementsCount;

                double errM = Math.Sqrt((errNew*errNew + errCorr * errCorr*weight));

                return errM;
            }
        }
        public override string ToString()
        {
            return string.Format("{0}, count:{1}, corr:{2}, error:{3}", Ends, Count, Correlations, Error);
        }
    }
}
