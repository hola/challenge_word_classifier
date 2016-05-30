alphabit = "'abcdefghijklmnopqrstuvwxyz"

def number_inclusions(str, char)
  str.enum_for(:scan,/#{char}/).
    map { Regexp.last_match.begin(0) }.length
end


hash = {}
for char in alphabit.chars do
  hash[char] = 0
end

dict = File.open("false_words.txt", 'r').readlines.map { |w| w.strip.downcase }.join('')


dict.chars.reduce(hash) { |acc,char| acc[char] += 1; acc }.each do |char, num|
  puts "#{char}\t#{num}"
end

puts dict.length

