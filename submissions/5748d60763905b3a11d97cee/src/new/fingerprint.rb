require 'digest/sha1'

N = 16
MODN  = 2 ** N

type = ARGV[0]
A = ARGV[1].to_i
B = ARGV[2].to_i

def sha(text)
  Digest::SHA1.hexdigest(text)[0...4]
end

def indexes(str)
  str.rjust(MODN, '0').reverse.enum_for(:scan,/1/).
  map { Regexp.last_match.begin(0) }.
  map { |i| i + 1 }
end

$words = File.open("words.txt", "r").readlines.map { |word| word.strip.downcase }
out  = File.open("out_#{A}_#{B}.txt", 'w')

def detect(i)
  basis = $words.reduce(0) { |acc, word| acc |= (1 << sha(word + i.to_s ).to_i(16)) }
  delta = (1 << MODN) -1 - basis
  delta.to_s(2)
end

case type
when 'one_word'
  puts indexes(detect(A))
else
  for i in A..B do
    sample =  indexes(detect(i)).sample
    out.puts "#{i}:\t#{sample}"
    out.flush if i % 5 == 0
    puts i
  end
end



#for i in A..B do
  #sample =  indexes(delta.to_s(2)).sample
  #out.puts "#{i}:\t#{sample}"
  #out.flush if i % 5 == 0
  #puts i
#end








