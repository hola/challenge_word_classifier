package vect

import (
      "math/rand"
)

var Alphabet = []rune("abcdefghijklmnopqrstuvwxyz'")

func RandomString(l int) string {
      runes := make([]rune, l)
      n := len(Alphabet)
      
      for i := 0; i < l; i ++ {
            runes[i] = Alphabet[rand.Intn(n)]
      }

      return string(runes)
}
