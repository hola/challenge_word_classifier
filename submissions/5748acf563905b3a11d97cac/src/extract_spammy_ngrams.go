// This program finds "spammy" 1-5-grams in the test data and outputs them in order of their contribution.
package main

import (
	"fmt"
	"sort"
	"strconv"
)

func appendUniq(a []string, s string) []string {
	for _, v := range a {
		if v == s {
			return a
		}
	}
	return append(a, s)
}

func features(s string, n int) []string {
	var feat []string
	for i := 0; i < len(s)-n+1; i++ {
		ng := s[i : i+n]
		feat = appendUniq(feat, ng)
		feat = append(feat, ng+strconv.Itoa(i))
	}
	return feat
}

type Word struct {
	w    string
	good bool
}

type FeatScore struct {
	feat  string
	score int
}
type ByScore []FeatScore

func (r ByScore) Len() int { return len(r) }
func (r ByScore) Less(i, j int) bool {
	return r[i].score > r[j].score || r[i].score == r[j].score && r[i].feat < r[j].feat
}
func (r ByScore) Swap(i, j int) { r[i], r[j] = r[j], r[i] }

func main() {
	words, numberGood, numberBad := MustLoadTestData()
	var scores []FeatScore
	for n := 1; n <= 5; n++ {
		featFreq := map[string][2]int{}
		for _, c := range words {
			for _, feat := range features(c.w, n) {
				v := featFreq[feat]
				if c.good {
					v[0]++
				} else {
					v[1]++
				}
				featFreq[feat] = v
			}
		}

		featSpammy := map[string]bool{}
		for feat, v := range featFreq {
			if v[1]-v[0] < 3 {
				continue
			}
			p1 := float64(v[1]) / float64(numberBad)
			p2 := float64(v[0]) / float64(numberGood)
			spamicity := p1 / (p1 + p2)
			if spamicity > 0.95 {
				featSpammy[feat] = true
			}
		}

		for feat := range featSpammy {
			frq := featFreq[feat]
			scores = append(scores, FeatScore{feat, frq[1] - frq[0]})
		}
	}
	sort.Sort(ByScore(scores))
	for _, s := range scores {
		fmt.Println(s.feat)
	}
}
