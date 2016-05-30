package exam

import (
      "fmt"
      "io/ioutil"
      "encoding/json"
)

type Examination struct{
      Words map[string]bool
}

func NewExamination() *Examination {
      return &Examination{
            Words: map[string]bool{},
      }
}

func (ex *Examination) LoadDataSet(path string) {
      files, _ := ioutil.ReadDir(path)

      fmt.Printf("Now loading test cases: ")
      for _, f := range files {
              fmt.Printf(".")
              //fmt.Println(f.Name())
              source := map[string]bool{}
              blob, err := ioutil.ReadFile(path + "/" + f.Name())
              if err != nil {
                    panic(err)
              }

              if err := json.Unmarshal(blob, &source); err != nil {
                    panic(err)
              }

              for w, b := range source {
                    ex.Words[w] = b
              }
      }
      fmt.Println("ok!")
}

func (ex Examination) Examinate(test func(w string) bool) float64 {
      var result float64

      for w, r := range ex.Words {
            if r == test(w) {
                  result ++
            }
      }

      return result / float64(len(ex.Words))
}
