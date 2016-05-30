# -*- coding: utf-8 -*-
"""
Created on Sat Apr 30 09:55:18 2016

@author: Vladislav
"""

VOWELS = "aeiou"
CONSONANTS = "bcdfghjklmnpqrstvwxyz"
ALLOWED_CHARACTERS = "'abcdefghijklmnopqrstuvwxyz"
ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES = "abcdefghijklmnopqrstuvwxyz"

#LETTERS_SORTED_BY_OCCURENCE_DESC = ['e', 's', 'i', 'a', 'n', 'o', 'r', 't', 'l', 'c', 'u', 'p', 'm', 'd', 'h', 'g', "'", 'b', 'y', 'f', 'v', 'k', 'w', 'z', 'x', 'j', 'q']
LETTERS_SORTED_BY_OCCURENCE_DESC = ALLOWED_CHARACTERS

PAIRS = [first + second for first in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES
 for second in ALLOWED_CHARACTERS]

# Excluding 's
LAST_PAIRS = [first + second for first in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES
 for second in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES]
     
PAIRS_WITHOUT_APOSTROPHES = LAST_PAIRS
     
VOWELS_PAIRS = [first + second for first in VOWELS for second in VOWELS]

CONSONANTS_PAIRS = [first + second for first in CONSONANTS
 for second in CONSONANTS]
     
TRIPLETS = [first + second + third for first in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES
 for second in ALLOWED_CHARACTERS
 for third in ALLOWED_CHARACTERS]
     
QUADS = [first + second + third + forth for first in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES
 for second in ALLOWED_CHARACTERS_WITHOUT_APOSTROPHES
 for third in ALLOWED_CHARACTERS
 for forth in ALLOWED_CHARACTERS]