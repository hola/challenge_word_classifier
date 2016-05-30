package train

import (
      "math"
)

func GetBitEntropy(source []float64) float64 {
      var entropy float64 = 0

      for _, p := range source  {
            if p == 0 {
                   continue
            }

            entropy += p * math.Log2(p)
      }

      return - entropy
}

func CalcEntropy(words []uint64, i int) float64 {
      p := []float64{0, 0}

      for _, w := range words {
            b := (w >> uint(i)) & 1
            p[b] ++
      }

      p[0] /= float64(len(words))
      p[1] /= float64(len(words))

      return GetBitEntropy(p)
}
