package train

import "C"

func Popcount(x uint64) int {
      return int(C.__builtin_popcountll(C.ulonglong(x)))
}

type Matcher struct{
      Inversions uint64
      Mask uint64
      CountOfSignificantBits int
      Quality float64
}

type MatcherSortAdapter struct {
    Matchers []Matcher
    LessFunc func(i, j int) bool
}

func (s MatcherSortAdapter) Len() int{
    return len(s.Matchers)
}

func (s MatcherSortAdapter) Less(i, j int) bool{
    return s.LessFunc(i, j)
}

func (s MatcherSortAdapter) Swap(i, j int) {
    s.Matchers[i], s.Matchers[j] = s.Matchers[j], s.Matchers[i]
}

func NewMatcher(bits []int, mask map[int]int) Matcher {
      m := Matcher{
            CountOfSignificantBits: len(bits),
      }

      for position, value := range mask {
            m.Inversions |= (uint64(value) << uint(position))
            m.Mask |= (1 << uint(position))
      }

      return m
}

func (m Matcher) Match(word uint64) bool {
      return (word ^ m.Inversions) & m.Mask == 0
}
