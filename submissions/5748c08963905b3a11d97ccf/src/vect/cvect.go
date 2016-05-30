package vect

import "C"

func Popcount(x uint64) int {
      return int(C.__builtin_popcountll(C.ulonglong(x)))
}
