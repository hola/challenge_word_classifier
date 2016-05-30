@dictionary_url = "words.txt" #input file.
@output_url = "output_3.json" #output file.
@dictionary=File.open(@dictionary_url).read
@output = File.open(@output_url, 'w')
@dictionary.gsub!(/\r\n?/, " ")
@pairs = []
@alphabets = ('a'..'z').to_a
@master_list = {}
@local_list = []
@ignore = ['','\'','/']
@english = ('a'..'z').to_a
@details = {} #Content Format : frequency_MinLength_MaxLength_TotalLength_AverageLength

for letter in @alphabets #looping through a to z.
	for i in (1..20) #for each alphabet checking the frequency, minimum and max length of letters at the i-th position of the word starting with alphabet 'letter'
		@local_list = []
		@dictionary.each_line do |line|						
			test = 0			
			line = line.strip
			if line.index(letter) != nil				
				test = line.index(letter) + i
				if test == line.length
					test = test - 1
				end	
				after_letter = line[test,1]				
				if after_letter != nil && @ignore.index(after_letter) == nil
					if @local_list.index(after_letter) == nil
						@local_list << after_letter
					else
					end			
					currentVal = @details [letter+i.to_s+"_"+after_letter]
					if currentVal == nil						
						@details [letter+i.to_s+"_"+after_letter] = "1_" + line.length.to_s + "_" + line.length.to_s + "_" + line.length.to_s
					else
						valCat = currentVal.split("_")
						freq = valCat[0].to_i + 1
						min_length = valCat[1]
						max_length = valCat[2]
						total_length = valCat[3].to_i + line.length
						if line.length < min_length.to_i
							min_length = line.length
						elsif line.length > max_length.to_i
							max_length = line.length
						end		
						new_value = freq.to_s + "_" + min_length.to_s + "_" + max_length.to_s + "_" + total_length.to_s
						@details [letter+i.to_s+"_"+after_letter] = new_value
					end	
				end				
				if @local_list.length == 26
					break
				end	
			end							
		end
		@arrayEntry = @local_list
		@master_list [letter+i.to_s] = 	@arrayEntry		
	end	
end	


@details.each do |key, val|
	splitKey = key.split("_")  
	splitVal = val.split("_")
	freq = splitVal[0]
	total_length = splitVal[3]
	average = (total_length.to_i/freq.to_i).round #getting the average length from the totalLength and frequency calculated above.
	splitVal[3] = average
	@details[key] = splitVal.join('_')
	index = splitKey[0]
	find_me = splitKey[1]
	master_item = @master_list[index]
	if master_item != nil
		index_of_letter = master_item.index(find_me)
		if index_of_letter != nil
			master_item[index_of_letter] = find_me+"_"+splitVal.join("_")  	
		end
	end
end

@master_list.each do |key, val|
	@master_list[key] = val.join(".")
end
@output.write(@master_list)
@output.close
