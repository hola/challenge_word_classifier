package vect

import(
      "strings"
)

func RuneToInt5(r rune) uint32 {
      if 'a' <= r && r <= 'z' {
            return uint32(r) - uint32('a') + 1
      }

      if r == '\'' {
            return 28
      }

      return 0
}

func StringToUint64(source string) uint64 {
      var result uint64
      var base uint32 = 5
      var mask uint32 = 32
      l := len(source)

      switch {
      case l <= 12:
            base = 5
            mask = 31
      case (12 < l) && (l <= 16):
            base = 4
            mask = 15
      case (16 < l) && (l <= 21):
            base = 3
            mask = 7
      default:
            base = 2
            mask = 3
      }

      for _, r := range []rune(strings.ToLower(source)) {
            b := RuneToInt5(r) & mask
            for j := uint32(0); j < base; j ++ {
                  result = result << 1;

                  if (b & (1 << j)) != 0 {
                        result |= 1
                  }
            }
      }

      return result
}

func GetSignificantBitsForLength(l int) map[int]bool {
      significantBits := map[int]bool{}
      base := 5

      switch {
      case l <= 12:
            base = 5
      case (12 < l) && (l <= 16):
            base = 4
      case (16 < l) && (l <= 21):
            base = 3
      default:
            base = 2
      }

      for i := 0; i < l * base; i ++ {
            significantBits[i] = true
      }

      return significantBits
}

func BruteForce(n uint64, f func(uint64)) {
      for i := uint64(0); (1 << n) & i == 0; i ++ {
            f(i)
      }
}
