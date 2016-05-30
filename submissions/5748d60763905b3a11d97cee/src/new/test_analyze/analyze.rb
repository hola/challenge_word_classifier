require 'json'
require 'pry'

$file_names = Dir.glob('../tests_in/*.txt')

def get_test(id)
  JSON.parse(File.read($file_names[id]))
end

MAP = { true => 't', false => 'f' }
FIRST =  ARGV[0].to_i
LAST =   ARGV[1].to_i




def length_true
  freq_h = Hash.new
  numbers = 0
  for i in 0...90 do
    freq_h[i] = 0
  end
  for i in (0...$file_names.length) do
    hash = get_test(i)
    true_words = hash.find_all { |w, cond| cond == true }.map { |w, _cond| w }
    true_words.map { |w| w.length }.reduce(freq_h) { |acc, l|
      acc[l] += 1
      acc
    }
    numbers += true_words.length
  end

  freq_h.each { |l, count| puts "#{l}\t#{count}" }
  puts numbers
end

case ARGV[0]
when 'length_true'
  length_true

end





#f_block_true_numbers        = File.open("#{FIRST}_#{LAST}_block_true_numbers.txt", 'w')
#f_true_false_stream         = File.open("#{FIRST}_#{LAST}_true_false_stream.txt", 'w')
#f_false_word_length_stream  = File.open("#{FIRST}_#{LAST}_false_word_length_stream.txt", 'w')
#f_true_word_length_stream   = File.open("#{FIRST}_#{LAST}_true_word_length_stream.txt", 'w')
#f_false_words               = File.open("#{FIRST}_#{LAST}_false_words.txt", 'w')



#for i in FIRST..LAST do
  #hash = get_test(i)

  #true_numbers = hash.values.find_all { |r| r == true }.length

  ## BLOCK TRUE NUMBERS
  #f_block_true_numbers.puts true_numbers

  ## TRUE FALSE STREAM
  #hash.values.map { |x| MAP[x] }.each { |x| f_true_false_stream.puts x }

  ## FALSE WORD LENGTH
  #false_words = hash.find_all { |w, cond| cond == false }.map { |w, _cond| w }
  #false_words_length = false_words.map { |w| w.length }
  #false_words_length.each { |l| f_false_word_length_stream.puts l }

  ## TRUE WORD LENGTH
  #true_words = hash.find_all { |w, cond| cond == true }.map { |w, _cond| w }
  #true_words_length = true_words.map { |w| w.length }
  #true_words_length.each { |l| f_true_word_length_stream.puts l }

  ## FALSE WORDS
  #false_words.each { |w| f_false_words.puts w }




  #puts i
#end
