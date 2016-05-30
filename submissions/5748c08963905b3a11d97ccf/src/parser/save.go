package parser

import (
      "os"
      "bytes"
      //"encoding/binary"
      "fmt"
)

func SaveMatchers(path string, data []byte){
      buf := new(bytes.Buffer)

      fo, err := os.Create(path)
      if err != nil {
          panic(err)
      }

      defer func() {
          if err := fo.Close(); err != nil {
              panic(err)
          }
      }()

      buf.Write(data)
      /*
      for _, d := range data {
            err := binary.Write(buf, binary.LittleEndian, d)
            if err != nil {
                  fmt.Println("binary.Write failed:", err)
            }
      }*/

      if saved, err := buf.WriteTo(fo); err != nil {
          panic(err)
      } else {
            fmt.Printf("saved bytes %x\n", saved)
      }
}
