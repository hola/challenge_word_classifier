
NUMBER = ARGV[0].to_i

words = File.open("bucket_total.txt", "r").readlines.first(NUMBER).map { |word|
  i = word.strip.to_i
  first = (i >> 8).chr
  last = (i & 255).chr
  first + last
}
print words.join
#out  = File.open("out.txt", 'w').write(words.join(''))


