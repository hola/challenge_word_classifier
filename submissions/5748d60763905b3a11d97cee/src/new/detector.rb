require 'json'
require 'pry'

$file_names = Dir.glob('tests_in/*.txt')
$my_dict    = {}
$counter    = 0

def get_test(id)
  JSON.parse(File.read($file_names[id]))
end

def sha(text)
  Digest::SHA1.hexdigest(text)[0...4]
end

$buffer = File.open("bucket_total.txt", "r").readlines.map { |word| word.strip.to_i }
#$words  = File.open("words.txt", "r").readlines.map { |word| word.strip.downcase }

def is_word_in_ditcionary(word)
  (1..31500).none? { |i|
    sha(word.downcase + i.to_s ).to_i(16) == $buffer[i-1] - 1
  }
end

P = 0.622
PP = P * 0.5 / ( 0.5 + 0.5 * P)

puts PP
ALPH = "'abcdefghijklmnopqrstuvwxyz"
CORRECTION = %w[0 0 1 1 1 2 2 3 3 3 4 4 4 5 5 6 6 6 7 7 7 8 8 9 9 9 10 10 10 11 11 12 12 12 13 13 14 14 14 15 15 15 16 16 17 17 17 18 18 18 19 19 19 20 20 21 21 21 22 22 23 23 23 24 24 24 25 25 26 26 26 27 27 27 28 28 28 29 29 30 30 30 31 31 32 32 32 33 33 33 34 34 34 35 35 36 36 36 37 37 37 ].map{ |i| i.to_i }
CORRECTION_LENGTH = %w{0 31 9 13 15 11 8 7 6 6 7 7 9 10 13 17 23 34 53 84 156 267 556 1057 1693 3146 16619 9530 13420 6227 16476 5248 8755 7514 3395 }.map { |n| n.to_i / 10.0 }
CORRECTION_LETTER = %w{ 11 9 12 10 10 9 15 11 11 9 51 16 9 11 9 9 11 61 9 8 9 10 17 19 39 12 34 }.map { |i| i.to_i / 10.0 }

#CORRECTION_LETTER = %w| 2 7 2 4 3 9 2 3 3 8 1 1 5 3 6 6 3 1 6 8 6 3 2 1 1 2 1 |.map { |i| i.to_i / 100.0 }


def length_probability(word)
  l = word.length
  l > 34 ? 1.0 : CORRECTION_LENGTH[l] / (CORRECTION_LENGTH[l] + 1.0)
end

def letter_probability(w)
  k_sum = w.chars.map { |c|  CORRECTION_LETTER[ALPH.index(c)] }.reduce(:+)
  total = k_sum / ( w.length * 1.07 )
  total / (total + 1)
end

def correction(k,a ,b)
  #(1-k)* a * b + (1-k) * (1-a) * b + k * a *b + k * (1 -a) * b
  (1-k)* a * b + k * b
end


def correction_mega(a,b,c)
  1 - a*b*c
end
def correction2(a,b)
  a*b + (1-a) *b
end


puts "TEST CORRECTION"
puts correction2(0.9, 0.5)
puts correction(0.3, 0.9, 0.5)
puts "TEST CORRECTION"

def detector(word, data)
  $counter += 1
  prob = nil
  #prob = correction(1-PP, length_probability(word), letter_probability(word))
  #prob = correction2(length_probability(word), letter_probability(word))

  bucket_check = is_word_in_ditcionary(word)
  result = if bucket_check
    if word.length > 24
      false
    else
      # 0.625
      #prob >= 0.75 ? false : true
      #prob >= 0.65 ? false : true
      #correction2(length_probability(word), letter_probability(word)) > 0.5 ? false : true #72.5555
      #(2* prob - 1) > 0.75 ? false : true #72.44444 & double correction
      #

      #prob = correction(1-PP, length_probability(word), letter_probability(word))
      #(2* prob - 1) >= 0 ? false : true #72.5555

      #prob = correction(1-PP, length_probability(word), letter_probability(word))
      #
      #prob = correction2(PP, length_probability(word) )
      #(2* prob - 1) >= 0 ? false : true # 70.77777777

      plen = length_probability(word)
      plet = letter_probability(word)

      #last_len = (1 - last_len )  if !b_len
      #last_let = (1 - last_let )  if !b_let
      #prob = correction(PP, length_probability(word), letter_probability(word))
      #(2* prob - 1) >= 0 ? false : true # 70.77777777
      #prob = correction(PP, plen, plet)
      #prob = (last_len * last_let * PP )
      #(2* prob - 1) >= 0 ? false : true # 72.444444

      #prob = correction(PP, plen, plet)
      #(2* prob - 1) >= 0 ? false : true # 72.444444
      #prob = correction_mega(PP, plen, plet)
      #
      # 72.6
      def koeff( p1, p2)
        fab = p1 * p2
        dab = (1 - p1) * (1 - p2)
        (fab ** 2)  / (fab + dab)
      end
      #fab = plen * plet
      #dab = (1 - plen) * (1 - plet)
      #pab = fab * (fab / dab ) / ((fab/ dab ) + 1)


      #arr = [koeff(0.9, 0.5), koeff(0.9, 0.5), koeff(0.1, 0.5), koeff(0.1, 0.5) ]
      #puts arr
      #puts arr.reduce(:+)

      #raise 'qwe'

      #prob = [plen, plet].max
      #(2* prob - 1) >= PP ? false : true # 72.444444

      # 72.77777
      # 73.77
      prob = plen + plet -0.5

      $my_dict[word] ||= 0
      $my_dict[word] += 1

      if $my_dict[word] > 1 && ($my_dict[word] / $counter) > (1 / 1_200_000)
        true
      else
        (2* prob - 1) >= PP ? false : true # 72.444444
      end

      # 72.77777
      #prob = plen + (plet - 0.5 )
      #(2* prob - 1) >= PP ? false : true # 72.444444

      # 72.95
      #prob = plen  + plet -  1
      #(2* prob ) >= PP ? false : true # 72.444444

      #prob = [koeff(plen, plet), koeff(plen, 1 - plet), koeff(1-plen, plet), koeff(1-plen, 1-plet)].reduce(:+)
      #prob / (1 -prob) > 1.05 * ((1 - PP) / PP ) ? false : true

      #prob > (1 -PP) ? false : true #72.55555
      #(2* prob - 1) >= PP ? false : true # 72.444444



      # 72.5555555
      #prob = [koeff(plen, plet), koeff(plen, 1 - plet), koeff(1-plen, plet), koeff(1-plen, 1-plet)].reduce(:+)
      #prob > (1 -PP) ? false : true #72.55555
      #(2* prob - 1) >= PP ? false : true # 72.444444

      # 72.444444
      #prob = [koeff(plen, plet), koeff(plen, 1 - plet), koeff(1-plen, plet), koeff(1-plen, 1-plet)].reduce(:+)
      #(2 *prob - 1) > PP ? false : true #72.55555


      # 72.5555
      # 73.9
      #prob = [koeff(plen, plet), koeff(plen, 1 - plet), koeff(1-plen, plet), koeff(1-plen, 1-plet)].reduce(:+)
      #prob >= (1 -PP) ? false : true #72.55555

      #72.5555555
      #prob = [koeff(plen, plet), koeff(plen, 1 - plet), koeff(1-plen, plet), koeff(1-plen, 1-plet)].reduce(:+)
      #prob / (1 + prob) > ( ( 1 - PP ) / (2 - PP) ) ? false: true

      #prob = [koeff(plen, plet), koeff(plen, 1 - plet), koeff(1-plen, plet), koeff(1-plen, 1-plet)].reduce(:+)
      #prob > 0.75 ? false: true
      #rp   = [koeff(prob, PP),  koeff(prob, 1 - PP), koeff(1- prob, PP), koeff(1-prob, 1- PP)].reduce(:+)
      #rp > 0.5 ? false: true

      #(2 * prob - 2) > ( ( 1 - PP ) / (2 - PP) ) ? false: true







    end
  else
    false
  end
  puts "#{word[0...10].ljust(11)}\tREAL:#{data[word]}\tEQUAL:#{result == data[word]}\tBUCKET:#{bucket_check}\t PLEN:#{plen}\tPLET#{plet}\tPROB:#{prob}\trp:"
  #binding.pry if result != data[word]
  result
end

write_answers = 0
counter = 0
for i in 50...100 do
  puts i

  data = get_test(i)
  words = data.keys

  words.each { |word|
    counter += 1
    equal = detector(word, data) == data[word]
    write_answers +=1 if equal
  }
end

puts "TOTAL: #{ write_answers / counter.to_f } "


