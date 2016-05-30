package train

import (
      "math"
      "fmt"
)

type Trainer struct{
      Words []uint64
      SignificantBits map[int]bool
}

type Solution struct{
      BestBits []int
      Mask map[int]int
      Quality float64
}

func NewTrainer(words []uint64, bits map[int]bool) *Trainer {
      return &Trainer{
            Words: words,
            SignificantBits: bits,
      }
}

func (t Trainer) Train(limit int) []Matcher {
      words := make([]uint64, len(t.Words))
      matchers := []Matcher{}

      copy(words, t.Words)

      var fullQuality float64
      for len(words) != 0 {
            bits := map[int]bool{}

            for k, v := range t.SignificantBits {
                  bits[k] = v
            }

            solution := t.Improve(limit, words, bits, Solution{[]int{}, map[int]int{}, -64})

            matcher := NewMatcher(solution.BestBits, solution.Mask)

            unrecognized := []uint64{}
            for _, w := range words {
                  if matcher.Match(w) {
                        continue
                  }

                  unrecognized = append(unrecognized, w)
            }

            matcher.Quality = solution.Quality

            //fmt.Println("bits: ", len(solution.BestBits), " quality: ", solution.Quality)
            //fmt.Println("unrecognized=", len(unrecognized), " matchers=", len(matchers))
            fullQuality += solution.Quality

            words = unrecognized
            matchers = append(matchers, matcher)
      }

      fmt.Println("full quality: ", fullQuality)
      fmt.Println("quality / per matcher", fullQuality / float64(len(matchers)))

      return matchers
}

func (t Trainer) Improve(limit int, words []uint64, bits map[int]bool, base Solution) Solution {
      var minEntropy float64 = 1.0
      var minEntropyIndex int = 0

      stop := true
      for i, ok := range bits {
            if ok != true {
                  continue
            }

            stop = false

            entropy := CalcEntropy(words, i)
            if entropy <= minEntropy {
                  minEntropy = entropy
                  minEntropyIndex = i
            }
      }

      if stop {
            return base
      }


      if len(base.BestBits) > limit {
            return base
      }

      count := 0
      for _, w := range words {
            count += int((w >> uint64(minEntropyIndex)) & 1)
      }

      ones := make([]uint64, count)
      zeros := make([]uint64, len(words) - count)
      i, j := 0, 0

      for _, w := range words {
            if (w >> uint64(minEntropyIndex)) & 1 == 1 {
                  ones[i] = w
                  i ++
            } else {
                  zeros[j] = w
                  j ++
            }
      }

      countOfRecognized := math.Max(float64(len(ones)), float64(len(zeros)))
      countOfWords := float64(len(t.Words))
      quality := float64(len(base.BestBits) + 1) + math.Log2(countOfRecognized / countOfWords)

      bits[minEntropyIndex] = false
      base.BestBits = append(base.BestBits, minEntropyIndex)

      if len(ones) > len(zeros) {
            base.Mask[minEntropyIndex] = 1
            return t.Improve(limit, ones, bits, Solution{base.BestBits, base.Mask, quality})
      }

      base.Mask[minEntropyIndex] = 0
      return t.Improve(limit, zeros, bits, Solution{base.BestBits, base.Mask, quality})
}
