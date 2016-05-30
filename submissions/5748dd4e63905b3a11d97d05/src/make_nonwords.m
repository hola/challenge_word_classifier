%as an answer to the lack of randi in version R2008a - credit: David Young
%here: https://www.mathworks.com/matlabcentral/newsreader/view_thread/276557
randi = @(maxi, rows, cols) ceil(maxi*rand(rows, cols));

nonwords_cors = words_cors;
rnd_nums = randi(20, length(nonwords_cors), 20); %the index
rnd_letters = randi(27, length(nonwords_cors), 20);
for i=1:length(nonwords_cors)
    for j=1:randi(20, 1, 1) %how many letters will get changed
        if nonwords_cors(i, rnd_nums(i,j))~= 0 %it's not a blank letter
            nonwords_cors(i, rnd_nums(i,j))=rnd_letters(i,j);
        else %we got a blank letter - we'll insert a letter instead of replace one
            len = find(nonwords_cors(i,:)==0,1,'first')-1;
            insert_after_ind = randi(len, 1, 1);
            nonwords_cors(i,:) = [nonwords_cors(i,1:insert_after_ind), rnd_letters(i,j), nonwords_cors(i, insert_after_ind+1:end-1)];
        end
    end
end

nonwords_cors = nonwords_cors(~ismember(nonwords_cors, words_cors,'rows'), :); %keep only those that are NOT in words_cors