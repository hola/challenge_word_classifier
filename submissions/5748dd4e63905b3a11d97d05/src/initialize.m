%load the dictionary's words into a variable
words = importdata('C:\Development\hola\hola challenge spring 2016\words.txt');

words_lower = lower(words);
words_1half = words_lower(1:154690);
words_2half = words_lower(154691:end);

remove_redundancy();

words_lengths = cellfun(@(x) length(x), words_norep);


%conditional assignment, as anwered in stackoverflow by Jonas here:
%http://stackoverflow.com/questions/14612196/is-there-a-matlab-conditional-
%ifoperator-that-can-be-placed-inline-like-vbas-i
iff = @(varargin) varargin{2*find([varargin{1:2:end}], 1, 'first')}();

%build the coordinates representation
%'''' = the char '
%make a=1, b=2,... and '=1. ' '=0
words_cors_cell = cellfun(@(str) str-'a'+2+(('a'-''''-1)*(str=='''')), words_norep, 'UniformOutput', 0);
words_cors_cell = cellfun(@(vec) iff(length(vec)<=20, [vec, zeros(1, 20-length(vec))], true, zeros(1, 20)), words_cors_cell, 'UniformOutput', 0);
words_cors = cell2mat(words_cors_cell);
words_cors = words_cors(words_cors(:, 1)~=0, :); %take out the blank lines - those with 0 at the first coordinate

%create the random non-words for the training set
make_nonwords();


