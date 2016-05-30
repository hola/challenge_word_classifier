import json

import requests

from wrds.solver import solver

case = requests.get('https://hola.org/challenges/word_classifier/testcase')
test = json.loads(case.text)
# print(test)
# test = {'unhitches': True, 'plania': False, 'popedom': True, 'shuffleboard': True, "millier's": True, 'beltiotacal': False, 'corwes': False, 'bergonisms': True, 'shlumpinesses': False, "orestag's": False, 'diphexakihi': False, "cumarin's": True, 'kallous': False, "eboe's": True, 'nontreatable': True, 'equiparating': True, 'bediaper': True, "subtest's": True, "aginnervicidentence's": False, "cralg's": True, 'sperbatioched': False, 'overburs': False, "glivare's": True, 'notostraca': True, 'medicean': True, "conkint's": False, 'bloomington': True, 'hoolwood': False, 'infratrochlear': True, 'tulching': False, "gadjee's": False, 'becharticuliform': False, "gannotation's": False, "hosepipe's": True, 'conphaseolin': True, 'muawerecus': False, 'samblenguddess': False, 'pyromuliidae': False, 'sandshoes': True, "populariser's": True, 'yttrocolumbite': True, 'hoscidesticystabroome': False, 'nitetais': False, "wednesday's": True, 'otioseness': True, "hysist's": False, 'iuvarisperking': False, 'shitherers': False, 'quinatory': False, 'exocarps': True, 'unemphra': False, 'superparadoxic': False, "hahira's": True, 'trisulfone': True, 'ligurite': True, 'acant': False, 'interpolatory': True, 'preindlegs': False, 'chadors': True, 'pseudoerotism': False, 'astaticism': True, 'unerrably': True, "pinbush's": False, 'thylosis': True, "hayeria's": False, 'inethically': False, 'shehita': True, 'woolroad': False, 'merative': False, "gwjk'ntimz": False, 'precifier': False, 'accommo': False, 'rocca': True, 'rerecordings': False, 'radicatoles': False, 'stylopharyngitises': False, "bunn's": True, 'hypernomian': True, 'ridgeville': True, 'kable': False, 'windier': True, 'prankingly': True, 'inanimousness': False, 'exomologesis': True, 'bnpolpy': False, "narmada's": True, "'ymedwulvrgbdtqvtsobfckcpsb": False, "zoografting's": True, "purvis's": True, "tamburlaine's": True, 'uvlsiirvrnq': False, 'larses': False, "bandsman's": True, "netibidae's": False, 'pentent': False, 'eutaxites': True, "falfoaguman'selingiverweec": False, "churdan's": True, "zztgsp'v": False, "'pzaighgnk": False}
total = 0
true = 0
print('{:>30} {:>5} {:>5}'.format('word', 'gt', 'sol.'))
for k, v in test.items():
    s = solver(k, debug = False)
    if s == v:
        true += 1
    else:
        try:
            print('{:>30} {:>5} {:>5}'.format(k[:30], v, s))
        except:
            print('WWWWJAAA')
    total += 1
print('Acc {:.2%}'.format(true / total))
