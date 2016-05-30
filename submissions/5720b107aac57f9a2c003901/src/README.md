## Problem Statement

We define **an English word** as a word from the list included here as [words.txt](words.txt). (If you're interested, it's the [SCOWL](http://wordlist.aspell.net/) “insane” dictionary with flattened diacritics.) Membership in the dictionary is case-insensitive.

## Solution

JS file contains two public functions:

```javascript
init(data)
```
Give the english word dictionary data set of your choice to this function in form of Array.

```javascript
test(word)
```
Call this function by passing a word which you want to search in dictionary given by you. It returns `true` or `false` based on search.

## How to use

* `require` this file into your javascript code:

```javascript
var search_dictionary = required('path to js file');
```

* Call init with providing dictionary of data

```javascript
search_dictionary.init([]);
```

* Call test with searching word

```javascript
search_dictionary.test("my name");
```
