
dict = File.open("../words.txt", 'r').readlines.map { |w| w.strip.downcase }.reduce({}) { |acc, w| acc[w] = true }
alphabit = "'abcdefghijklmnopqrstuvwxyz"


for length in 1..12 do



end
