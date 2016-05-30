words_norep = words_lower;
words_norep = sort(words_norep);
i=1;
while i<length(words_norep)
    if strcmp(words_norep{i},words_norep{i+1})
        words_norep{i} = '';
        i=i+1;
    end
    i=i+1;
end
words_norep = sort(words_norep);
i=1;
while strcmp(words_norep{i},'')
    i=i+1;
end
words_norep = words_norep(i:end);