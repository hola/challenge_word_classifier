// This program transforms a list of strings into a serialized trie.
package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"log"
	"os"
	"sort"
)

type node struct {
	b byte    // byte
	c []*node // children
	f bool    // final state?
	p *node   // parent
}

func serialize(n *node, buf *bytes.Buffer) {
	if n.f {
		buf.WriteByte(' ')
	}
	for _, child := range n.c {
		buf.WriteByte(child.b)
		serialize(child, buf)
		buf.WriteByte('<')
	}
}

func main() {
	var r io.Reader
	if len(os.Args) < 2 || os.Args[1] == "-" {
		r = os.Stdin
	} else {
		f, err := os.Open(os.Args[1])
		if err != nil {
			log.Fatal(err)
		}
		defer f.Close()

		r = f
	}

	var words []string
	scan := bufio.NewScanner(r)
	for scan.Scan() {
		words = append(words, scan.Text())
	}
	if err := scan.Err(); err != nil {
		log.Fatal(err)
	}
	sort.Strings(words)

	root := &node{}
	var nodes []*node
	nodes = append(nodes, root)

	for _, w := range words {
		cur := root
		for i := 0; i < len(w); i++ {
			b := w[i]
			var n *node
			found := false

			for _, n = range cur.c {
				if n.b == b {
					found = true
					break
				}
			}

			if !found {
				n = &node{b: b, p: cur}
				cur.c = append(cur.c, n)
				nodes = append(nodes, n)
			}

			cur = n
		}
		cur.f = true
	}

	var buf bytes.Buffer
	serialize(root, &buf)
	fmt.Print(string(bytes.TrimRight(buf.Bytes(), "<")))
}
