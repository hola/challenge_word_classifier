using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public class Perceptron
    {
        static Random rnd = new Random();

        static double Speed = 0.1;

        public int InCount;
        public int OutCount;
        public int HiddenCount;
        public double[,] V;
        public double[,] W;
        public double[] V0;
        public double[] W0;

        public Perceptron(int inCount, int hiddenCount, int outCount)
        {
            InCount = inCount;
            HiddenCount = hiddenCount;
            OutCount = outCount;
            V = new double[inCount, hiddenCount];
            V0 = new double[hiddenCount];
            InitWeights(V, V0, inCount, hiddenCount);
            W = new double[hiddenCount, outCount];
            W0 = new double[outCount];
            InitWeights(W, W0, hiddenCount, outCount);
        }

        private void InitWeights(double[,] w, double[] w0, int n1, int n2)
        {
            //double b = 0.7 * Math.Pow(HiddenCount, 1 / InCount);
            for (int i = 0; i < n2; i++)
            {
                w0[i] = rnd.NextDouble() - 0.5;
                for (int j = 0; j < n1; j++)
                    w[j, i] = rnd.NextDouble() - 0.5;
                //double v = 0;
                //for (int j = 0; j < n1; j++)
                //    v += w[i]
            }
        }

        public double[] Calc(double[] input)
        {
            var hidden = CalcOutput(input, V, V0, InCount, HiddenCount);
            var result = CalcOutput(hidden, W, W0, HiddenCount, OutCount);
            return result;
        }

        public void Teach(double[] input, double[] goal)
        {
            int cnt = 0;
            int maxCnt = 50000;
            var copyW = Copy(W);
            var copyW0 = Copy(W0);
            var copyV = Copy(V);
            var copyV0 = Copy(V0);
            while (true)
            {
                var wHidden = CalcWInput(input, V, V0, InCount, HiddenCount);
                var hidden = CalcOutput(wHidden);
                var wOutput = CalcWInput(hidden, W, W0, HiddenCount, OutCount);
                var output = CalcOutput(wOutput);

                var error = Math.Sqrt(output.Zip(goal, (o, g) => (o - g) * (o - g)).Sum());
                if (error < 0.05 || cnt > maxCnt)
                {
                    if (cnt > maxCnt)
                        Console.WriteLine("error");
                    break;
                }
                cnt++;

                // Ошибка выходного слоя.
                var sigmaOut = wOutput.Zip(goal, (o, g) => (g - Activate(o)) * ActivateD(o)).ToArray();
                var dW = new double[HiddenCount, OutCount];
                for (int i = 0; i < OutCount; i++)
                    for (int j = 0; j < HiddenCount; j++)
                        dW[j, i] = Speed * sigmaOut[i] * hidden[j];
                var dW0 = sigmaOut.Select(s => Speed * s).ToArray();

                // Ошибка скрытого слоя.
                var sigmaHidden = new double[HiddenCount];
                for (int i = 0; i < HiddenCount; i++)
                {
                    for (int j = 0; j < OutCount; j++)
                        sigmaHidden[i] += sigmaOut[j] * W[i, j];
                    sigmaHidden[i] *= ActivateD(wHidden[i]);
                }
                var dV = new double[InCount, HiddenCount];
                for (int i = 0; i < HiddenCount; i++)
                    for (int j = 0; j < InCount; j++)
                        dV[j, i] = Speed * sigmaHidden[i] * input[j];
                var dV0 = sigmaHidden.Select(s => Speed * s).ToArray();

                // Корректировка весов.
                for (int i = 0; i < OutCount; i++)
                {
                    for (int j = 0; j < HiddenCount; j++)
                        W[j, i] += dW[j, i];
                    W0[i] += dW0[i];
                }
                for (int i = 0; i < HiddenCount; i++)
                {
                    for (int j = 0; j < InCount; j++)
                        V[j, i] += dV[j, i];
                    V0[i] += dV0[i];
                }
            }
            if (cnt > maxCnt)
            {
                W = copyW;
                W0 = copyW0;
                V = copyV;
                V0 = copyV0;
            }
        }

        static double[] CalcWInput(double[] input, double[,] w, double[] w0, int n1, int n2)
        {
            double[] p = new double[n2];
            for (int i = 0; i < n2; i++)
            {
                var t = w0[i];
                for (int j = 0; j < n1; j++)
                {
                    t += input[j] * w[j, i];
                }
                p[i] = t;
            }
            return p;
        }

        static double[] CalcOutput(double[] input, double[,] w, double[] w0, int n1, int n2)
        {
            return CalcWInput(input, w, w0, n1, n2).Select(Activate).ToArray();
        }

        static double[] CalcOutput(double[] wInput)
        {
            return wInput.Select(Activate).ToArray();
        }

        static double Activate(double x)
        {
            return 1 / (1 + Math.Exp(-x));
        }

        static double ActivateD(double x)
        {
            return Activate(x) * (1 - Activate(x));
        }

        static T[,] Copy<T>(T[,] array)
        {
            T[,] newArray = new T[array.GetLength(0), array.GetLength(1)];
            for (int i = 0; i < array.GetLength(0); i++)
                for (int j = 0; j < array.GetLength(1); j++)
                    newArray[i, j] = array[i, j];
            return newArray;
        }

        static T[] Copy<T>(T[] array)
        {
            T[] newArray = new T[array.Length];
            for (int i = 0; i < array.Length; i++)
                newArray[i] = array[i];
            return newArray;
        }
    }
}
