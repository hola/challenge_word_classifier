// This program outputs an "optimized" Bloom filter given the dictionary and the test data.
package main

import (
	"bufio"
	"io"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/opennota/bit"
)

type Bloom struct {
	Size int
	Seed uint32
	Bits []byte
	good [][]string
	bad  [][]string
}

func NewBloom(size int, seed uint32) *Bloom {
	bloom := Bloom{
		Size: size,
		Seed: seed,
		Bits: make([]byte, size),
		good: make([][]string, size),
		bad:  make([][]string, size),
	}
	return &bloom
}

func (b *Bloom) Add(s string) {
	i := Hash(s, b.Seed) % b.Size
	b.Bits[i] = 1
}

func (b *Bloom) Probe(w string, good bool) {
	ngrams := Ngrams(w)
	for _, ng := range ngrams {
		i := Hash(ng, b.Seed) % b.Size
		if b.Bits[i] == 0 {
			return
		}
	}

	for _, ng := range ngrams {
		i := Hash(ng, b.Seed) % b.Size
		if good {
			b.good[i] = append(b.good[i], w)
		} else {
			b.bad[i] = append(b.bad[i], w)
		}
	}
}

func (b *Bloom) Optimize() {
	for {
		minScore := 0x7fffffff
		index := -1

		for i := 0; i < b.Size; i++ {
			if b.Bits[i] == 0 {
				continue
			}
			score := len(b.good[i]) - len(b.bad[i])
			if score < minScore {
				minScore = score
				index = i
			}
		}

		if minScore >= 0 {
			break
		}

		for _, w := range b.good[index] {
			for _, ng := range Ngrams(w) {
				i := Hash(ng, b.Seed) % b.Size
				b.good[i] = remove(b.good[i], w)
			}
		}
		for _, w := range b.bad[index] {
			for _, ng := range Ngrams(w) {
				i := Hash(ng, b.Seed) % b.Size
				b.bad[i] = remove(b.bad[i], w)
			}
		}

		b.Bits[index] = 0
	}

	for i := 0; i < b.Size; i++ {
		if b.Bits[i] > 0 && len(b.good[i]) == 0 {
			b.Bits[i] = 0
		}
	}
}

func (b *Bloom) WriteTo(w io.Writer) (int64, error) {
	arr := bit.NewArray(b.Size)
	for i, b := range b.Bits {
		if b > 0 {
			arr.Set(i)
		}
	}
	return arr.WriteTo(w)
}

func remove(a []string, s string) []string {
	var r []string
	for _, t := range a {
		if s == t {
			continue
		}
		r = append(r, t)
	}
	return r
}

func Ngrams(w string) (ng []string) {
	if len(w) <= 7 {
		return []string{"^" + w + "$"}
	}
	return []string{"^" + w[:7], w[7:] + "$"}
}

func Hash(s string, seed uint32) int {
	hash := uint32(1)
	for i := 0; i < len(s); i++ {
		hash = seed*hash + uint32(s[i])
	}
	return int(hash)
}

func MustLoadDictionary() []string {
	f, err := os.Open("words.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	var words []string
	scan := bufio.NewScanner(f)
	for scan.Scan() {
		words = append(words, scan.Text())
	}
	if err := scan.Err(); err != nil {
		log.Fatal(err)
	}
	return words
}

func main() {
	rand.Seed(time.Now().Unix())

	dictWords := MustLoadDictionary()
	testWords := MustLoadTestData()

	bloom := NewBloom(65536*8, rand.Uint32())
	for _, w := range dictWords {
		for _, ng := range Ngrams(w) {
			bloom.Add(ng)
		}
	}

	for _, w := range testWords {
		bloom.Probe(w.w, w.good)
	}
	bloom.Optimize()

	if _, err := bloom.WriteTo(os.Stdout); err != nil {
		log.Fatal(err)
	}
}
