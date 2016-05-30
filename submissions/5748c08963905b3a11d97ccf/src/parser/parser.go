package parser

import (
      "bufio"
      "log"
      "os"
      "strings"
)

func ParseWords(path string) []string {
      words := map[string]bool{}

      file, err := os.Open(path)
      if err != nil {
            log.Fatal(err)
      }
      defer file.Close()

      scanner := bufio.NewScanner(file)
      for scanner.Scan() {
            word := strings.ToLower(scanner.Text())
            words[word] = true
      }

      result := []string{}

      for word, _ := range words {
            //fmt.Println(StringToArray(word))
            result = append(result, word)
      }

      if err := scanner.Err(); err != nil {
            log.Fatal(err)
      }

      return result
}

func LoadWords(length int) []uint64 {
      words := parser.ParseWords("./words.txt")
      shortWords := []string{}
      correctSet := []uint64{}

      for _, word := range words {
            if len(word) != length {
                  continue
            }

            shortWords = append(shortWords, word)
            correctSet = append(correctSet, vect.StringToUint64(word))
      }

      return correctSet
}

func SaveMatcherAndPrintStats(path string,
      table map[int][]train.Matcher) {

      count := 0

      inversions := []uint64{}
      masks := []uint64{}

      fmt.Println("let layout = [")
      for l, matchers := range table {
            fmt.Printf("{l:%v, b:0x%x, e:0x%x},\n", l, count, count + len(matchers))
            count += len(matchers)
            sort.Sort(train.MatcherSortAdapter{matchers, func(i, j int) bool {
                  return matchers[i].Mask > matchers[j].Mask
            }})

            for _, matcher := range matchers {
                  inversions = append(inversions, matcher.Inversions)
                  masks = append(masks, matcher.Mask)
            }
      }
      fmt.Println("];")

      data := []byte{}
      for i := 0; i < 8; i ++ {
            for _, inv  := range inversions {
                  buf := bytes.NewBuffer([]byte{})
                  err := binary.Write(buf, binary.LittleEndian, inv)

                  if err != nil {
                        panic(err)
                  }

                  data = append(data, buf.Bytes()[i])
            }
      }

      for i := 0; i < 8; i ++ {
            for _, msk  := range masks {
                  buf := bytes.NewBuffer([]byte{})
                  err := binary.Write(buf, binary.LittleEndian, msk)

                  if err != nil {
                        panic(err)
                  }

                  data = append(data, buf.Bytes()[i])
            }
      }


      //data = append(data, inversions...)
      //data = append(data, masks...)

      fmt.Println("matchers size in bytes =", count * 2 * 8)
      fmt.Println("matchers", count)

      parser.SaveMatchers(path, data)
}
