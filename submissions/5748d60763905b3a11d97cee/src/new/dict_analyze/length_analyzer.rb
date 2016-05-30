h = Hash.new
for i in 1...90
  h[i] = 0
end
puts  File.open("../words.txt", 'r').readlines.map { |w| w.strip.downcase.length }.
  map { |i| i.to_i }.
  reduce(h) { |acc, i|
    acc[i] ||= 0
    acc[i] += 1
    acc
  }.sort_by{ |(length, count)| length }.map { |(length, count)| "#{length}\t#{count}" }
