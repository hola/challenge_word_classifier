

require 'net/http'
require 'json'

def get_test(id)
  uri = URI("https://hola.org/challenges/word_classifier/testcase/#{id}")
  response = Net::HTTP.get uri
  JSON.parse(response)
end


rows = []
mid = 0

for i in 1..100 do
  hash = get_test(i)
  number = hash.values.find_all { |r| r == true }.length
  rows << number
  mid = number.to_f if i == 1
  mid = (number + (i - 1) * mid) / i.to_f
  puts number
  puts mid

end
puts "MID"
puts mid
puts "ROWS"
puts rows


