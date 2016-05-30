package org.quinto.ldap.jeneticstest;

import static java.lang.Math.pow;
import static java.lang.Math.sqrt;
import java.util.DoubleSummaryStatistics;

/**
 * Algorithms derived from: Philippe Pébay, Formulas for Robust, One-Pass Parallel
 * Computation of Covariances and Arbitrary-Order Statistical Moments.
 */
public class MoreDoubleSummaryStatistics extends DoubleSummaryStatistics {

    private double M1, M2, M3, M4;

    @Override
    public void accept(double x) {
        super.accept(x);

        long n = getCount();

        double delta = x - M1;                       // δ
        double delta_n = delta / n;                  // δ / n
        double delta2_n = delta * delta_n;           // δ^2 / n
        double delta2_n2 = delta_n * delta_n;        // δ^2 / n^2
        double delta3_n2 = delta2_n * delta_n;       // δ^3 / n^2
        double delta4_n3 = delta3_n2 * delta_n;      // δ^4 / n^3

        M4 += (n - 1) * (n * n - 3 * n + 3) * delta4_n3
                + 6 * M2 * delta2_n2
                - 4 * M3 * delta_n;
        M3 += (n - 1) * (n - 2) * delta3_n2
                - 3 * M2 * delta_n;
        M2 += (n - 1) * delta2_n;
        M1 += delta_n;
    }

    @Override
    public void combine(DoubleSummaryStatistics other) {
      throw new UnsupportedOperationException(
              "Can't combine a standard DoubleSummaryStatistics with this class");
    }

    public void combine(MoreDoubleSummaryStatistics other) {
        MoreDoubleSummaryStatistics s1 = this;
        MoreDoubleSummaryStatistics s2 = other;

        long n1 = s1.n();
        long n2 = s2.n();
        long n = n1 + n2;

        double delta = s2.M1 - s1.M1;                // δ
        double delta_n = delta / n;                  // δ / n
        double delta2_n = delta * delta_n;           // δ^2 / n
        double delta2_n2 = delta_n * delta_n;        // δ^2 / n^2
        double delta3_n2 = delta2_n * delta_n;       // δ^3 / n^2
        double delta4_n3 = delta3_n2 * delta_n;      // δ^4 / n^3

        this.M4 = s1.M4 + s2.M4 + n1 * n2 * (n1 * n1 - n1 * n2 + n2 * n2) * delta4_n3
                + 6.0 * (n1 * n1 * s2.M2 + n2 * n2 * s1.M2) * delta2_n2
                + 4.0 * (n1 * s2.M3 - n2 * s1.M3) * delta_n;

        this.M3 = s1.M3 + s2.M3 + n1 * n2 * (n1 - n2) * delta3_n2
                + 3.0 * (n1 * s2.M2 - n2 * s1.M2) * delta_n;

        this.M2 = s1.M2 + s2.M2 + n1 * n2 * delta2_n;

        this.M1 = s1.M1 + n2 * delta;

        super.combine(other);
    }

    private long n() { return getCount(); }

    public double mean() { return getAverage(); }
    public double variance() { return n() <= 1 ? 0 : M2 / (n() - 1); }
    public double stdDev() { return sqrt(variance()); }
    public double skew() { return M2 == 0 ? 0 : sqrt(n()) * M3/ pow(M2, 1.5); }
    public double kurtosis() { return M2 == 0 ? 0 : n() * M4 / (M2 * M2) - 3.0; }

  @Override
  public String toString() {
    return "n="+n()+", min="+getMin()+", low="+(mean()-stdDev())+", avg="+getAverage()+", high="+(mean()+stdDev())+", max="+getMax();
  }
}