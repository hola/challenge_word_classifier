N = 100
P = ARGV[0].to_f || 0.6


class Integer
  def fact
    (1..self).reduce(1) {|r,i| r*i }
  end
end

def bern p, k, n
  c = n.fact.to_f / ( k.fact * (n-k).fact )
  c * (p ** k) * ((1 - p) ** (n - k))
end

#for k in 0..N do


#end


#k = 90
#for k in 0..N do

for k in 0..N do
  weights = (0..k).map { |i|    bern(0.5, i, N) *  bern(P,  k - i, N - i ) }
  sum     = weights.reduce(:+)
  weights.map! { |i| i / sum }
  corrected =  (0..k).map { |i| i * weights[i] }.reduce(:+)
  #puts "#{k}:#{k - corrected.round}::#{corrected}"
  puts "#{k - corrected.round}"

end

#ver = (0..k).map { |i|  bern(0.5, i, N) * bern(P, k - i, N - i) }
#ver_sum = ver.reduce(:+)
#ver.map! { |i|  i / ver_sum }

#puts k
#puts (0..k).map { |i| i * ver[i] }.reduce(:+)
#end


#puts 90 * bern(0.5, 90, N) * bern(0.6, 0, 10)

