
# coding: utf-8

# In[3]:

import os.path
import urllib
import json

class Hola_Test_System:
    _base_url = 'https://hola.org/challenges/word_classifier/testcase/'
    _local_path = 'cases/'
    
    _cases = {}
    
    def __init__(self, local_path = 'cases/'):
        self._local_path = local_path
    
    def _get_test_case_url(self, case_number):
        return self._base_url + str(case_number)
    
    def _get_test_case_local_path(self, case_number):
        return self._local_path + str(case_number) + '.json'
    
    def load_test_case(self, case_number):
        if self._cases.get(case_number, None) is None:
            if os.path.isfile(self._get_test_case_local_path(case_number)):
                f = open(self._get_test_case_local_path(case_number))
                json_data = ''.join(f.readlines())
            else:
                handler = urllib.urlopen(self._get_test_case_url(case_number))
                json_data = ''.join(handler.readlines())
                f = open(self._get_test_case_local_path(case_number), 'w+')
                f.write(json_data)
                f.close()
            data = json.loads(json_data)
            self._cases[case_number] = data
        return self._cases[case_number]
    

#test_system = Hola_Test_System()
#print 'First load'
#print test_system.load_test_case(200)
#print 'Second load'
#print test_system.load_test_case(200)

