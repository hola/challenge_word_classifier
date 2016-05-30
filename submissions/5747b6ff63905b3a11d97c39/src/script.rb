require 'bindata'
require 'json'


class BitWriter
    def initialize(file_name)
        @file = File.new(file_name, 'wb')
        @buf = 0
        @bit_count = 0
    end

    def close
        return unless @file
        write_buf()
        @file.close
        @file = nil
    end

    def write_bit(bit)
        @buf = (@buf << 1) + (bit ? 1 : 0)
        @bit_count += 1
        if @bit_count == 32
            write_buf()
        end
    end

    private
    def write_buf
        return if @bit_count == 0
        BinData::Uint32be.new(@buf).write(@file)
        @bit_count = 0
        @buf = 0
    end
end

#######################################
#       tree                          #
#######################################
tree = {}

$node_count = 1

BITS_TO_WRITE = 25
def word_to_bits(word)
    len = [[0,word.length - 6].max,7].min.to_s(2)
    len = "0"*(3 - len.length) + len

    res = len + word.
        split("").
        map { |i| /[qxwkyghmulrnae]/ =~ i ? "1" : "0" }.
        join("")

    res[0,BITS_TO_WRITE]
end

def add_to_tree(tree, bits)
    return if bits == ""

    b = bits[0] == "1"
    unless tree[:r]
        tree[:r] = 1
    else
        tree[:r] +=1
    end

    unless tree[b]
        tree[b] = {}
        $node_count += 1
    end

    add_to_tree(tree[b], bits[1..-1])
end

def write_tree_to_file(tree, writer)
    return if tree.nil?
    writer.write_bit(!tree[true].nil?)
    writer.write_bit(!tree[false].nil?)
    write_tree_to_file(tree[true], writer)
    write_tree_to_file(tree[false], writer)
end

def tree_contains(bits, tree)
    return true if bits == ""

    b = bits[0] == "1"

    return !!(tree[b] && tree_contains(bits[1..-1], tree[b]))
end

File.open("words.txt", "r") do |f|
    while word = f.gets
        word.strip!
        bits = word_to_bits(word)
        add_to_tree(tree, bits)
    end
end

puts "node count = #{$node_count}"
puts "file size = #{$node_count / 4}"

writer = BitWriter.new('tree.bin')
write_tree_to_file(tree, writer)
writer.close

#####################################################
#       Bloom filter                                #
#####################################################

MAX_HASH = 585000
CHARS2 = "abcdefghijklmnopqrstuvwxyz'".split("")
CHAR_COUNT = 5

def my_hash(word)
    hash = word.split("").reduce(0) do |s, i| 
        x = s * CHARS2.length + CHARS2.index(i) + 1
    end

    hash -= 1
    while hash > MAX_HASH
        hash = hash % MAX_HASH + ((hash / MAX_HASH) )
    end
    hash
end

def write_table_to_file(table, file_name)
    w = BitWriter.new(file_name)
    0.upto(MAX_HASH - 1) do |i|
        w.write_bit(table[i])
    end
    w.close
end

def word_transform(word)
    return word[0,CHAR_COUNT]
end

$h1 = Hash.new(false)
words = []
File.open('words.txt', 'r') do |f|
    while w = f.gets
        words << word_transform(w.strip.downcase)
    end
end
words.uniq!
words.each do |w|
    crc1 = my_hash(w)
    $h1[crc1] = true
end

puts "#{$h1.count} hashes from #{words.count} words " 
puts "(#{100 - $h1.count.to_f / words.count * 100}% hash-collision)"

write_table_to_file($h1, 'hashes.bin')

#######################################
#        checking                     #
#######################################
#  def check_file(file_name, tree)
#
#      data = JSON.parse(IO.read file_name)
#
#      result = 0
#      rh = 0
#      rt = 0
#      data.each do |k, v|
#          t = tree_contains(word_to_bits(k.downcase), tree)
#          c = my_hash(word_transform(k.downcase))
#          h = $h1[c]
#          f = k[0] != "'" && k.index("''").nil? && !(/[^aoeyui]{5,}/ =~ k) && !(/[qjv][bcdfghjklmnpqrstvwxyz]{2}/ =~ k) && !(/qq/ =~ k)
#          result += 1 if  (t && h && f) == v
#          rt += 1 if  t == v
#          rh += 1 if  h == v
#      end
#      [rt, rh, result]
#  end
#
#  # checking
#  res = []
#  Dir["./samples/*"].each do |f|
#      res << check_file(f, tree)
#  end
#
#  p res
#  puts res.reduce(0) {|s,i| s + i[0]} / res.count.to_f
#  puts res.reduce(0) {|s,i| s + i[1]} / res.count.to_f
#  puts res.reduce(0) {|s,i| s + i[2]} / res.count.to_f
