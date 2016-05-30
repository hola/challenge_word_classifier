require 'json'
require 'pry'

$file_names = Dir.glob('tests_in/*.txt')

def get_test(id)
  JSON.parse(File.read($file_names[id]))
end

def sha(text)
  Digest::SHA1.hexdigest(text)[0...4]
end

#$buffer = File.open("bucket_total.txt", "r").readlines.map { |word| word.strip.to_i }
#$words  = File.open("words.txt", "r").readlines.map { |word| word.strip.downcase }

def is_missed_word(word)
  (1..31500).any? { |i|
    sha(word.downcase + i.to_s ).to_i(16) == $buffer[i-1] - 1
  }
end

P = 0.6
ALPH = "'abcdefghijklmnopqrstuvwxyz"
CORRECTION = %w[0 0 1 1 1 2 2 3 3 3 4 4 4 5 5 6 6 6 7 7 7 8 8 9 9 9 10 10 10 11 11 12 12 12 13 13 14 14 14 15 15 15 16 16 17 17 17 18 18 18 19 19 19 20 20 21 21 21 22 22 23 23 23 24 24 24 25 25 26 26 26 27 27 27 28 28 28 29 29 30 30 30 31 31 32 32 32 33 33 33 34 34 34 35 35 36 36 36 37 37 37 ].map{ |i| i.to_i }
CORRECTION_LENGTH = %w{0 31 9 13 15 11 8 7 6 6 7 7 9 10 13 17 23 34 53 84 156 267 556 1057 1693 3146 16619 9530 13420 6227 16476 5248 8755 7514 3395 }.map { |n| n.to_i / 10.0 }
CORRECTION_LETTER = %w{ 11 9 12 10 10 9 15 11 11 9 51 16 9 11 9 9 11 61 9 8 9 10 17 19 39 12 34 }.map { |i| i.to_i / 10.0 }

def length_probability(word)
  l = word.length
  l > 34 ? 9999 : CORRECTION_LENGTH[l]
end

def letter_probability(w)
  w.chars.map { |c| CORRECTION_LETTER[ALPH.index(c)] }.reduce(:*)
end

def letter_uniq_probability(w)
  w.chars.uniq.map { |c| CORRECTION_LETTER[ALPH.index(c)] }.reduce(:*)
end

def letter_middle(w)
  w.chars.map { |c| CORRECTION_LETTER[ALPH.index(c)] }.reduce(:+) / w.length
end

def bucket_detector_demo(word, hash)
  if hash[word] == true
    true
  else
    rand <= 0.6 ? true : false
  end
end

def median_correction(ranked_words, mediana, multi, n, data)
  total_words = ranked_words.select { |w, r| r >= mediana * multi }.last(n)
  total_words.reduce(0) { |acc, (w, _)| acc += (data[w] ? -1 : 1) }
end


CORRECTION_METHODS = {
  #len: method(:length_probability),
  #let: method(:letter_probability),
  #letu: method(:letter_uniq_probability),
  #letm: method(:letter_middle),
  #len_letter: -> (w) { length_probability(w) * letter_probability(w) },
  len_letu: -> (w) { length_probability(w) * letter_uniq_probability(w) }
  #len_letm: -> (w) { length_probability(w) * letter_middle(w) }
}


#for i in 0...$file_names.length do

midd = {}
for i in 1...10000 do
  puts i
  data = get_test(i)
  words = data.keys
  result = words.map { |w| [w, bucket_detector_demo(w, data)] }.to_h
  true_length = result.values.select { |bool| bool }.length
  corrected_numbers = CORRECTION[true_length]
  true_words = result.select { |w, bool| bool }
  #real_false_words = true_words.select { |w| data[w] == false }
  #puts '==============='
  #puts "TRUE WORDS: #{true_words.length}\tCORRECTION: #{corrected_numbers}\t REAL: #{real_false_words.length}"
  #ranked_words = true_words.map { |w,_| [w, length_probability(w) * letter_probability(w) ]  }.sort_by{ |_,p| p }
  CORRECTION_METHODS.each do |name, meth|
    {prop: 5 }.each do |k_name, k|
      ranked_words = true_words.map { |w,_b| [w, meth.call(w)]  }.sort_by{ |_,p| p }
      #ranked_words_sum = ranked_words.map { |_w, p| p }.reduce(:+)
      #ranked_words.map! { |w, p| [w, p / ranked_words_sum ] }
      mediana = ranked_words[(ranked_words.length/2.0).round - 1][1]
      result = median_correction(ranked_words, mediana, k, corrected_numbers, data) / corrected_numbers.to_f * 100
      midd[[name, k_name]] ||= result
      midd[[name, k_name]] =  ( midd[[name,k_name]] * (i - 1) + result ) / i
    end
  end
  #ranked_words = true_words.map { |w,_| [w, length_probability(w)  ]  }.sort_by{ |_,p| p }
  #ranked_words.reverse.each_with_index do |(w, p), i|
    #puts "#{(i+1).to_s.ljust(2)}\t#{w[0...10].ljust(10)}\t\t#{p.round(3).to_s.rjust(10)}\t\t#{data[w]}"
  #end
  #puts '---------------'
  #mediana = ranked_words[(ranked_words.length/2.0).round - 1][1]
  #puts "MEDIAN: #{ranked_words[(ranked_words.length/2.0).round - 1]}"
  #[1,2,3,4].each { |i|
    #puts "ADDITIONAL N=#{i}  #{median_correction(ranked_words, mediana, i, corrected_numbers, data) / corrected_numbers.to_f}"
  #}
  #puts '==============='
end
midd.sort_by { |_, r| r }.each { |(t, k), r|
  puts "#{t.to_s.ljust(10)}\t#{k}\t#{r.round(2)}"
}



