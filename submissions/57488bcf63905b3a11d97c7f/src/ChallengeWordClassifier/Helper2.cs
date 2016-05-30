using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChallengeWordClassifier
{
    public static class Helper2
    {
        // https://ru.wikibooks.org/wiki/%D0%A0%D0%B5%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8_%D0%B0%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC%D0%BE%D0%B2/%D0%A0%D0%B5%D0%B4%D0%B0%D0%BA%D1%86%D0%B8%D0%BE%D0%BD%D0%BD%D0%BE%D0%B5_%D0%BF%D1%80%D0%B5%D0%B4%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5#.D0.A1.D0.B1.D0.B0.D0.BB.D0.B0.D0.BD.D1.81.D0.B8.D1.80.D0.BE.D0.B2.D0.B0.D0.BD.D0.BD.D1.8B.D0.B9_.D0.B2.D0.B0.D1.80.D0.B8.D0.B0.D0.BD.D1.82
        public static Prescription Levenshtein3(String S1, String S2)
        {
            int m = S1.Length, n = S2.Length;
            int h = (int)Math.Sqrt(m + 1);
            int[][] D = Helper.CreateArray2D<int>(h + 1, n + 1);
            char[][] P = Helper.CreateArray2D<char>(h + 1, n + 1);

            int d = 0;
            StringBuilder route = new StringBuilder("");
            int iPos = m, jPos = n;
            do
            {
                for (int i = 0; i <= jPos; i++)
                {
                    D[0][i] = i;
                    P[0][i] = 'I';
                }
                int _i = 1;
                for (int i = 1; i <= iPos; i++)
                {
                    for (int j = 0; j <= jPos; j++)
                    {
                        if (j == 0) D[_i][j] = i;
                        else {
                            int cost = (S1[i - 1] != S2[j - 1]) ? 1 : 0;
                            if (D[_i][j - 1] < D[_i - 1][j] && D[_i][j - 1] < D[_i - 1][j - 1] + cost)
                            {
                                //Вставка
                                D[_i][j] = D[_i][j - 1] + 1;
                                P[_i][j] = 'I';
                            }
                            else if (D[_i - 1][j] < D[_i - 1][j - 1] + cost)
                            {
                                //Удаление
                                D[_i][j] = D[_i - 1][j] + 1;
                                P[_i][j] = 'D';
                            }
                            else {
                                //Замена или отсутствие операции
                                D[_i][j] = D[_i - 1][j - 1] + cost;
                                P[_i][j] = (cost == 1) ? 'R' : 'M';
                            }
                        }
                    }
                    if (i % h == 0)
                    {
                        //Выделение памяти для новых строк и копирование последней из прошлой полосы в первую строку новой
                        int[] vRow = new int[n + 1];
                        char[] cRow = new char[n + 1];
                        for (int j = 0; j <= n; j++)
                        {
                            vRow[j] = D[_i][j];
                            cRow[j] = P[_i][j];
                        }
                        D = Helper.CreateArray2D<int>(h + 1, n + 1);
                        P = Helper.CreateArray2D<char>(h + 1, n + 1);
                        for (int j = 0; j <= n; j++)
                        {
                            D[0][j] = vRow[j];
                            P[0][j] = cRow[j];
                        }
                        _i = 0;
                    }
                    _i++;
                }
                if (iPos == m && jPos == n) d = D[_i - 1][n];
                //Восстановление предписания в последних _i - 1 строках
                while (_i > 0 && iPos != 0 && jPos != 0)
                {
                    char c = P[_i - 1][jPos];
                    route.Append(c);
                    if (c == 'R' || c == 'M')
                    {
                        iPos--;
                        jPos--;
                        _i--;
                    }
                    else if (c == 'D')
                    {
                        iPos--;
                        _i--;
                    }
                    else {
                        jPos--;
                    }
                }
            } while ((iPos != 0) && (jPos != 0));

            return new Prescription(d, Helper.Reverse(route.ToString()));
        }

        public static int LevenshteinDistance(string string1, string string2)
        {
            if (string1 == null) throw new ArgumentNullException("string1");
            if (string2 == null) throw new ArgumentNullException("string2");
            int diff;
            int[,] m = new int[string1.Length + 1, string2.Length + 1];

            for (int i = 0; i <= string1.Length; i++) { m[i, 0] = i; }
            for (int j = 0; j <= string2.Length; j++) { m[0, j] = j; }

            for (int i = 1; i <= string1.Length; i++)
            {
                for (int j = 1; j <= string2.Length; j++)
                {
                    diff = (string1[i - 1] == string2[j - 1]) ? 0 : 1;

                    m[i, j] = Math.Min(Math.Min(m[i - 1, j] + 1,
                                             m[i, j - 1] + 1),
                                             m[i - 1, j - 1] + diff);
                }
            }
            return m[string1.Length, string2.Length];
        }
    }

    public class Prescription
    {
        public String route;
        public int distance;
        public Prescription(int distance, String route)
        {
            this.distance = distance;
            this.route = route;
        }
    }
}
