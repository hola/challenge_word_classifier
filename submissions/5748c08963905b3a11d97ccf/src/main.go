package main

import (
    "./parser"
    "./vect"
    "./train"
    "./exam"

    "encoding/binary"
    "bytes"
    "sort"
    "fmt"
)

func main() {
      table := map[int][]train.Matcher{}

      targets := map[int]struct{Limit int; Quotum int}{
            3: {7, 29}, 4: {14, 74}, 5: {12, 166}, 6: {13, 312}, 7: {13, 449},
            8: {14, 548}, 9: {14, 566}, 10: {15, 521}, 11: {15, 428},
            12: {16, 328}, 13: {16, 234},14: {17, 160}, 15: {21, 102}, 16: {20, 62},
            17: {24, 35}, 18: {22, 19}, 19: {22, 10}, 20: {26, 4}, 21: {26, 2},}

      factor := 2.1

      for l, target := range targets {
            bits := vect.GetSignificantBitsForLength(l)
            words := parser.LoadWords(l)
            fmt.Println("start training words len=", l, ", ", len(words))

            tr := train.NewTrainer(words, bits)

            matchers := tr.Train(target.Limit)

            quotum := int(float64(target.Quotum) * factor)

            if len(matchers) > quotum {
                  sort.Sort(train.MatcherSortAdapter{matchers, func(i, j int) bool {
                        return matchers[i].Quality > matchers[j].Quality
                  }})

                  matchers = matchers[:quotum]
            }

            fmt.Println("max quality", matchers[0])
            fmt.Println("min quality", matchers[len(matchers)-1])

            table[l] = matchers

            fmt.Println(target, len(matchers))
      }

      ex := exam.NewExamination()
      ex.LoadDataSet("./cases")

      result := ex.Examinate(func(word string) bool {
            w := vect.StringToUint64(word)

            if matchers, ok := table[len(word)]; ok == true {
                  for _, matcher := range matchers {
                        if matcher.Quality < 0 {
                              continue
                        }

                        if matcher.Match(w) {
                              return true
                        }
                  }
            }

            return false
      })

      fmt.Printf("result = %.2f\n", 100*result)

      parser.SaveMatcherAndPrintStats("./data", table)
}
