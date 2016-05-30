

h = Hash.new
for i in 1...90
  h[i] = 0
end
puts  File.open("false_word_length_stream_#{1001}_#{10000}", 'r').readlines.
  map { |i| i.to_i }.
  reduce(h) { |acc, i|
    acc[i] ||= 0
    acc[i] += 1
    acc
  }.sort_by{ |(length, count)| length }.map { |(length, count)| "#{length}\t#{count}" }
