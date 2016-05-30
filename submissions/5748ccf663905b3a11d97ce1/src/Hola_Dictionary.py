
# coding: utf-8

# In[1]:

import random
import json

from Hola_Test_System import Hola_Test_System

class Hola_Dictionary(object):
    _words = None
    
    def read(self, words):
        self._words = self.prepare_result(words)
    
    def prepare_word(self, word):
        return word.strip().lower()#.replace("'s", '')
    
    def prepare_result(self, words):
        return list(set([self.prepare_word(w) for w in words]))
    
    def get_words(self, start=None, limit=None):
        if start is None or limit is None:
            return self._words
        else:
            return self._words[start:limit]
        
    def save_to_file(self, file_name):
        f = open(file_name, 'w+')
        for word in self.get_words():
            f.write(word + '\n')
        f.close()
        
    
    
class Hola_Dictionary_English(Hola_Dictionary):
    def read(self, file_name):
        f = open(file_name)
        words = f.readlines()
        super(Hola_Dictionary_English, self).read(words)
        
        
#dict = Hola_Dictionary_English()
#dict.read('words.txt')
#print dict.get_words(0, 20)

class Hola_Dictionary_Stop(Hola_Dictionary):
    _test_system = None
    
    def __init__(self, test_system):
        self._test_system = test_system
    
    def read(self, seed, count, log_progress = False):
        random.seed(seed)
        combined_dict = []
        test_cases_start = random.randint(1000000000, 9000000000)
        test_cases_count = count
        test_case_numbers = range(test_cases_start, test_cases_start + test_cases_count)
        i = 1
        for test_case_number in test_case_numbers:
            test_case = self._test_system.load_test_case(test_case_number)
            if log_progress:
                f = open('cases/' + str(test_case_number) + '.json', 'w+')
                f.write(json.dumps(test_case))
                f.close()
                if i % 100 == 0:
                    print i
                i += 1
            for word in test_case:
                if not test_case[word]:
                    combined_dict.append(word)
        super(Hola_Dictionary_Stop, self).read(combined_dict)
        
            

#test_system = Hola_Test_System()
#dict = Hola_Dictionary_Stop(test_system)
#dict.read(15, 1)
#print dict.get_words()

