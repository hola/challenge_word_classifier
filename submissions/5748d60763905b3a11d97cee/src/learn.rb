


result = {}

alphabit = "'abcdefghijklmnopqrstuvwxyz"

uniq_chars = []

IO.foreach('words.txt') do |line|
  strip_line = line.strip.downcase
  result[strip_line.length] ||= 0
  result[strip_line.length] += 1
  uniq_chars = uniq_chars | strip_line.chars
end


puts uniq_chars.sort.join('')
puts uniq_chars.length
puts result.keys.sort.map { |k| "#{k}\t#{result[k].to_s.rjust(5)}" }
