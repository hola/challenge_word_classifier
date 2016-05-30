
MAP = { 'f' => 0, 't' => 1 }
data = File.open("true_false_stream_#{1001}_#{10000}.txt", 'r').readlines.map { |w| w.strip }

true_freq = data.select { |w| w == 't' }.length.to_f / data.length
puts true_freq

d_true = data.map { |w| MAP[w] }.map { |x| (0.5 - x) ** 2 }.reduce(:+) / data.length.to_f
d_true2 = data.map { |w| MAP[w] }.map { |x|  x ** 2 }.reduce(:+)/data.length.to_f - 0.25
puts d_true
puts d_true2
