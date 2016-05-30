# Vocabulary compression algorithm

There were few steps of algorithm:

  - Get frequency of each symbol and create object with coefficients
  - Get frequency of count of words with different length
  - Different approaches to compress words with different length (based on frequencies of this length in vocabulary)
  - Convert word to number using coefficients and formula
  - Create arrays based on words length and word sum
  - Convert this arrays in bit-arrays, where we have only 1 and 0 as arrays values
  - Optimize arrays and compress it with RLE algorithm
  - Final data
  - Read data and test() function

### Get frequency of each symbol
We need just to clear vocabulary of repeats. Then calculate count of each symbol in vocabulary and count of all symbols in vocabulary. After this we get coefficients by formula: total_count/symbol_count.
But after many test all coefficients decreased and first coefficiente increased. It allowed to get more compact words array, with a small loss of effectivity.

```sh
var lettersArr = {
        "e": 12,
        "s": 5.26,
        "a": 6.75,
        "i": 6.96,
        "n": 9.67,
        "o": 9.87,
        "r": 9.91,
        "t": 11.43,
        "l": 14.06,
        "c": 20.14,
        "u": 24.84,
        "d": 28.34,
        "m": 28.88,
        "p": 29.28,
        "h": 32.52,
        "'": 42.47,
        "g": 44.13,
        "b": 55.19,
        "y": 56.72,
        "f": 75.25,
        "k": 89.64,
        "v": 89.93,
        "w": 111.44,
        "z": 148.39,
        "x": 189.27,
        "j": 150.56,
        "q": 180.88
      };
```

### Get frequency of different length
```sh
1 - 26
2 - 574
3 - 4520
4 - 11430
5 - 25904
6 - 48467
7 - 69727
8 - 85063
9 - 87964
10 - 80946
11 - 66562
12 - 50989
13 - 36323
14 - 24850
15 - 15921
16 - 9761
17 - 5504
18 - 2954
19 - 1559
20 - 709
21 - 348
22 - 151
23 - 67
24 - 38
25 - 18
26 - 3
27 - 5
28 - 3
29 - 6
30 - 2
31 - 2
32 - 1
33 - 1
34 - 2
```

### Different approaches to compress words with different length

I decided to divide all length on groups: 1 letter, 2 letters, 3-25 letters and more than 25.

Approaches:
- 1 letter: if it's not " ' " - it's a word;
- 2 letter: we create all possible variations with 2 symbols (aa,ab,ac,...zx,zy,zz). Then in cycle we check if word in this array is in vocabulary,and if it is, we delete word from our array. So in this array left only nonexist 2-symbols words. After all we will just compare 2-symbols word with nonexist array, and if it's not in array it's real word. Also 2-symbols words can't contain symbol " ' ".
- 3-25 letters: we calculate word sum, using coefficients and formula. Then we create array and fill it next way:
```sh
Array[current_word_length][current_word_sum];
```
- longer than 25 symbols: there is not many words, we just write all them in one array.

### Convert word to number using coefficients and formula
Letter formula:
```sh
lettersArr[word[i]] * 0.29 * (51 - word.length - i) * word.length;
```
And then we just get sum of letters and use Math.round() to get integer number of word.

### Create arrays based on words length and word sum
For example we get word "code".It's sum (calculated by formula and coefficients) is 3717 and length - 4, so that's how we fill our array:

```sh
if(!Array[4][3717]){
  Array[4][3717] = 1;
}
else{
  Array[4][3717]++;
}
```

### Convert  arrays in bit-arrays, where we have only 1 and 0 as arrays values
Just cycle for to check if current index have number value it sets  "1", else "0".


### Optimize arrays and compress it with RLE algorithm
##### Optomization

Cycle to check the index of first "1" in array. Delete all nill before first 1 and write counts of deleted nils to beginTndex array. Length array we convert to string.

```sh
//Before
[0,0,0,1,1,0,0,0,1,0,0,1]
//After
'110001001' // and number 3 to beginTndex array
```

##### RLE algorithm
After optimization we use RLE method, but else we change 0 to "a"  and 1 to "b" then we convert count of repetition to binary numbers. All this manipulation we need for better gzip-compression in future. Example:

```sh
//Before
10001001111001

//Intermediate
b3ab2a4b2ab

//End
b11ab10a100b10ab
```
### Final data
##### Final array
- Arr[0] - begin indexes;
- Arr[1] - nonexist 2-symbols words;
 - Arr[2] - words longer 25;
 - Arr[3-25] - strings RLE;

##### Final string data
We join all arrays in one string with separator "%".

### Read data and test() function
When we read this data file we just need to convert it to arr, then indexes 3-25 we convert to arrays of 0 and 1.

##### test() function
Test function calculate word sum, then this sum minus begin index of length array, for example we take word "code" again:

```sh
if(Arr[word_length][word_sum-(word_length_begin_index)]) - it`s word

if(Arr[4][3717-2678]) - "code" is word
```
