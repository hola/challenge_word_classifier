--local file='Len9.txt'
local file='wordsU.txt'

local maxWords=5	--	количество, после которого не запоминаем какие слова участвуют в комбинации букв

local letters={}
do
	local ch='a'
	repeat
		table.insert(letters,ch)
		ch=string.char(ch:byte()+1)
	until ch>'z'
end

local function allLetters(len)
	if len==1 then
		return letters
	end

	local r={}
	for _,v in ipairs(allLetters(len-1)) do
		for _,l in ipairs(letters) do
			table.insert(r,v..l)
		end
	end
	return r
end

local get=function(t,name)
	if not t then
		print(debug.traceback())
	end
	local v=t[name]
	if not v then
		v={}
		t[name]=v
	end
	return v
end

local anprint=function(...)
	--print(...)
end

--	варианты дополнительных операций для подсчёта частоты calcFreq
--[[	аргументы:
				l	--	слово
				cc	--	найденная комбинация
				c	--	позиция комбинации в слове
				последний аргумент для внутреннего использования
]]
local addCalcs={
	--	у слова какой длины найдено совпадение
	lens={
		calc=function(l,cc,c,lens)
			local len=get(lens,cc)	--	получаем таблицу для этой комбтнации символов
			local poss=get(len,#l)	--	для этой длинны
			poss[c]=(poss[c] or 0)+1	--	увеличиваем для этой позиции
		end,
		out=function(cc,lens)	--	встречаемость в словах длинны от 1 до 24
			local s=''	--длины
			local s2=''	--позиции
			local len=lens[cc]
			--local t={}
			local cnt1=0
			if len then
				for l=#cc,24 do
					local poss=len[l]
					local v=poss and 1 or 0
					cnt1=cnt1+v
					s=s..v
					if poss and l>#cc then
						for pos=1,l+1-#cc do
							s2=s2..(poss[pos] and 1 or 0)
						end
					end
					s2=s2..' '
				end
			else
				s=('0'):rep(24+1-#cc)
			end
			--print('',cnt1,s,s2)
			print('',s,s2)
		end,
		analysis=function(cc,lens)	--	анализируем, в каких словах где cc не может находиться
			local len=lens[cc]
			if not len then
				anprint('impossible',cc)
				return false	--	такая комбинация не может быть нигде
			end

			local missing={}
			for l=#cc,24 do
				local poss=len[l]
				if not poss then	--	не бывает слов длинны l
					anprint('impossible',cc,'with length',l)
					missing[l]=true
				else
					local missingPos={}
					missing[l]=missingPos
					for pos=1,l+1-#cc do
						if not poss[pos] then
							anprint('impossible',cc,'with length',l,'at',pos)
							missingPos[pos]=true
						else
							missingPos[pos]=poss[pos]
							if poss[pos]<20 then
								anprint(('Мало (%s) слов длинной %s с комбинацией "%s" на месте %s'):format(poss[pos],l,cc,pos))
							end
						end
					end
				end
			end
			return missing
		end,
	},

	--	в какой позиции, у слова какой длины найдено совпадение
	poss={
		calc=function(l,cc,c,poss)
			local pos=poss[cc]
			if not pos then
				pos={}
				poss[cc]=pos
			end
			pos[c..'/'..#l]=(pos[c..'/'..#l] or 0)+1
		end,
		out=function(cc,poss)
			local s=''
			local pos=poss[cc]
			if pos then
				for where,cnt in pairs(pos) do
					s=s..'\t'..where..'='..cnt
				end
			end
			print(s)
		end,
	},

	--	в каких словах совпадения (берём не более maxWords слов)
	words={
		calc=function(l,cc,c,llWords)
			local ws=llWords[cc]
			if ws~=false then
				if not ws then
					ws={}
					llWords[cc]=ws
				end

				if #ws<maxWords then
					table.insert(ws,l)
				else
					llWords[cc]=false
				end
			end
		end,
		out=function(cc,llWords)
			local ws=llWords[cc]
			print('',ws and table.concat(ws,'\t') or '')
		end,
	},
}

--	подсчитываем, как часто в словах встречается комбинация букв длинной subLen
--		обрабатывает слова удовлетворяющие wordCheck
local calcFreq=function(subLen,wordCheck,calcNames)
	local calcs
	if calcNames then
		calcs={}
		for i,name in ipairs(calcNames) do
			local calc={
				name=name,
				result={},
			}
			calcs[i]=calc
			for n,func in pairs(addCalcs[name]) do
				calc[n]=func
			end
		end
	end

	local ll={}
	for l in io.lines(file) do
		l=l:lower()
		if wordCheck(l) then
			for c=1,#l+1-subLen do
				local cc=l:sub(c,c+subLen-1)
				ll[cc]=(ll[cc] or 0)+1

				if calcs then
					for _,calc in ipairs(calcs) do
						calc.calc(l,cc,c,calc.result)
					end
				end
			end
		end
	end

	return ll,calcs
end

------------------------------------------------------
local wrongCombinations={
	[2]='xj qz jq vq jz jx qj qx zx',	-- wx vj gx hx qy wq kx zj qg qh qp fq qk xz xk kz gq qf qv qc qb px kq vb vw vx jv fx cx jb jw qn jf cj jg vz qo qw pz zq qd fz sx pq fv wj qm jj yq bx mx zf vf qq ql tx dx qt mq jt jm bq jl qr fj vh jk jp qe jy jh xq xg bz vp vg xr lx wv dq zg xx yj jc xv jd tq xn gv zp hq vm mz yy qs gz cv jn hj vk xd jr rx js zr zv zc lq vc gj mj pj wz fk vd zd hz vt pv zn zt qi cw zw xw lj fg zs zk kj vn zm fw xm bk fp xb xf cg cf fh mk kg zb fd fb cb wg qa gk sz uw dk uq vv xl mg fc gc zh cz fm',
			--jxjqzx vqjz qx
			--qxjxjqzx vqjz
}

local wordChecks={
	--	запрещена тильда
	notTilda=[[not l:match"'"]],
	--	только 's в конце строки (не проверяются другие тильды)
	endWithTildaS=[[l:match".'s$"]],	--	счетаем, что слов начинающихся с ' нет
	--	без ' но с s в конце строки (не проверяются другие тильды)
	endWithoutTildaWithS=[[l:match"[^']s$"]],
	--	без s в конце или один символ
	endWithoutS='(#l==1 or l:match"[^s]$")',
	--	разрешены слова без тильды и с тильдой только в 's в конце строки
	notTildaAndOnlyTildaS=[[
		(	not l:match"'"
			or (l:sub(-2)=="'s" and not l:sub(1,-3):match"'")
		)
	]],
	match=function(seq)
		return 'l:match[['..seq..']]'
	end,
	len=function(a,b)
		if not b then
			return '#l=='..a
		else
			return '#l>='..a..' and #l<='..b
		end
	end,
}

local function chekToFunction(wordCheck)
	local s='local l=...; return '..wordCheck
	return loadstring(s)
end

local rules={
	{	caption='bad Tilda',
		bad=function(l)
			return l:gsub("'s$",''):find"'"
		end,
		except=[[
a'asia
a'body
ain't
akwa'ala
all'antica
all'italiana
all'ottava
amn't
an'a
an't
anybody'd
aren't
ar'n't
a'thing
baha'i
baha'i's
baha'ullah
baha'ullah's
bahc'ae
baws'nt
betra'ying
b'hoy
bo's'n
bos'n
bo's'ns
bo's'n's
bos'ns
bos'n's
bo'sun
bo'suns
bo'sun's
br'er
ca'canny
can't
cap'n
cha'ah
ch'an
ch'in
ch'ing
ch'in's
couldn't
could've
cowslip'd
d'accord
d'aeth
d'albert
d'alembert
d'amboise
d'amour
d'andre
d'annunzio
d'arblay
d'arcy
d'arcy's
daren't
d'arezzo
d'arezzo's
d'arrest
d'art
d'artagnan
dasn't
dassn't
d'attoma
d'avenant
der'a
d'estaing
d'estaing's
d'etat
d'ewart
d'holbach
d'iberville
didn't
d'ignazio
d'indy
d'inzeo
doctors'commons
doesn't
d'oeuvre
dog'sbane
don't
don'ts
d'oria
d'urfey
e'en
e'er
entr'acte
entr'actes
entr'acte's
fa'ard
fatwa'd
fo'c'sle
fo'c's'le
fo'c'sles
fo'c's'les
fo'c's'le's
fo'c'sle's
freez'd
g'day
ge'ez
gi'd
gi'ing
guv'nor
guv'nors
guv'nor's
hadn't
hain't
ha'it
hallowe'en
halo'd
ha'nt
han't
ha'pennies
ha'penny
ha'penny's
ha'pennyworth
ha'p'orth
ha'p'orths
ha'p'orth's
hasn't
haven't
he'd
he'll
her'n
his'n
h'm
how'd
howe'er
how're
i'd
idea'd
i'faith
i'll
i'm
in't
isn't
it'd
it'll
i've
j'accuse
j'adoube
jews'harp
j'ouvert
jusqu'auboutisme
jusqu'auboutist
jusqu'auboutiste
kinko's's
ko'd
ko'ing
k'ri
l'addition
l'allegro
l'amour
l'amour's
landsm'al
l'aquila
l'avare
l'chaim
l'enfant
l'envoy
l'etranger
levi's's
l'hospital
l'immoraliste
l'oeil
l'oreal
l'oreal's
los'te
l'otage
l'ouverture
l'ouverture's
l'tre
l'vov
ma'am
mayn't
m'ba
mcdonald's's
mightn't
might've
m'sieur
m'taggart
mu'adhdhin
mu'min
mustn't
must've
nasta'liq
n'djamena
needn't
ne'er
ne'erday
n'gana
n'importe
nobody'd
nor'east
nor'easter
north'ard
nor'west
nor'wester
n't
nuku'alofa
o'boyle
o'brien
o'brien's
o'callaghan
o'callaghan's
o'carroll
o'carroll's
o'casey
o'casey's
o'clock
o'connell
o'connell's
o'conner
o'conner's
o'connor
o'connor's
o'dell
o'dell's
o'doneven
o'doneven's
o'donnell
o'donnell's
o'donoghue
o'donoghue's
o'donovan
o'donovan's
o'driscoll
o'driscoll's
o'dwyer
o'er
o'ertop
o'fallon
o'faolain
o'faolcin
o'fiaich
o'flaherty
ogee'd
o'gowan
o'gowan's
o'grady
o'grady's
o'hara
o'hara's
o'hare
o'higgins
o'higgins's
ok'd
o'keeffe
o'keeffe's
o'kelley
o'kelly
o'kelly's
ok'ing
o'leary
o'mahony
o'mahony's
o'malley
o'malley's
o'meara
o'meara's
o'neil
o'neill
o'neill's
o'neil's
o'reilly
o'reilly's
o'rourke
o'rourke's
o'shea
o'shee
o'shee's
o'sullivan
o'toole
o'toole's
oughtn't
our'n
pa'anga
penn'orth
penn'orths
penn'orth's
po'chaise
po'd
prud'hon
pyjama'd
qur'an
qur'anic
rec'd
samh'in
san'a
schoolma'am
sec'y
s'elp
se'nnight
sha'ban
shan't
shari'a
shari'a's
she'd
she'll
s'help
she'ol
shi'ite
shi'ite's
shouldn't
should've
silo'd
snipe'sbill
somebody'll
someone'll
sou'easter
south'ard
sou'west
sou'wester
stuns'l
stuns'ls
stuns'l's
ta'en
ta'izz
tallyho'd
t'ang
t'ang's
tell'd
that'd
that'll
there'd
there'll
they'd
they'll
they're
they've
this'll
tiara'd
to'd
today'll
t'other
trans'mute
unidea'd
usedn't
usen't
wasn't
we'd
we'll
wendy's's
we're
weren't
we've
what'd
whate'er
what'll
what're
whatsoe'er
what've
when'd
whene'er
when'll
when're
whensoe'er
where'd
where'er
where'll
where're
wheresoe'er
where've
who'd
who'll
who're
who've
why'd
why'll
why're
win't
wolf'smilk
won't
wouldn't
would've
wrong'un
wrong'uns
wrong'un's
xi'an
xi'an's
x'ing
y'all
ye'se
you'd
you'll
you're
your'n
you've
zu'lkadah
		]]
	},
	{	caption='popular length',
		bad=function(l)
			return #l>24
		end,
		except=[[
aldiborontiphoscophornia
aldiborontiphoscophornia's
antidisestablishmentarian
antidisestablishmentarianism
antidisestablishmentarianisms
antiestablishmentarianism
antiestablishmentarianisms
carboxymethylcellulose's
cyclotrimethylenetrinitramine
deinstitutionalization's
demethylchlortetracycline
diaminopropyltetramethylenediamine
dichlorodifluoromethanes
dichlorodifluoromethane's
dichlorodiphenyltrichloroethane
dichlorodiphenyltrichloroethanes
dichlorodiphenyltrichloroethane's
diphenylaminechlorarsine
disestablishmentarianism
disestablishmentarianisms
electrocardiographically
electroencephalographers
electroencephalographer's
electroencephalographical
electroencephalographically
electroencephalographies
electroencephalography's
ethylenediaminetetraacetate
ethylenediaminetetraacetates
ethylenediaminetetraacetate's
floccinaucinihilipilification
floccinaucinihilipilifications
formaldehydesulphoxylate
hexamethylenetetramine's
hippopotomonstrosesquipedalian
honorificabilitudinitatibus
honorificabilitudinities
hydrochlorofluorocarbons
hydroxydehydrocorticosterone
hydroxydesoxycorticosterone
hypobetalipoproteinemia's
immunoelectrophoretically
intercomprehensibilities
intercomprehensibility's
llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch
llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch's
magnetothermoelectricity
methylenedioxymethamphetamine
methylenedioxymethamphetamine's
microelectrophoretically
microspectrophotometer's
microspectrophotometrical
microspectrophotometrically
microspectrophotometries
microspectrophotometry's
nonrepresentationalism's
overintellectualizations
overintellectualization's
pathologicopsychological
pentamethylenetetrazol's
philosophicopsychological
phosphatidylethanolamine
phosphatidylethanolamines
phosphatidylethanolamine's
pneumonoultramicroscopicsilicovolcanoconioses
pneumonoultramicroscopicsilicovolcanoconiosis
polytetrafluoroethylenes
polytetrafluoroethylene's
preobtrudingpreobtrusion
prorhipidoglossomorpha's
pseudointernationalistic
pseudolamellibranchiata's
psychoneuroimmunological
psychoneuroimmunologists
psychoneuroimmunologist's
regeneratoryregeneratress
reinstitutionalization's
schizosaccharomycetaceae
scientificophilosophical
supercalifragilisticexpialidocious
superincomprehensibleness
tetraiodophenolphthalein
thyroparathyroidectomize
transubstantiationalists
trinitrophenylmethylnitramine
		]],
	},
}

local allGood=' '	--	хорошие слова (исключения к плохим правилам) разделитель пробел
for _,rule in ipairs(rules) do
	allGood=allGood..rule.except:gsub('%s+',' ')..' '
end

local wordsTypes={
	{name='endWithTildaS'},
	{name='endWithoutTildaWithS'},
	{name='endWithoutS'},
}

for i,wt in ipairs(wordsTypes) do
	wt.func=chekToFunction(wordChecks[wt.name])
	wt.folder='type'..i
end

--[[
--	проверяем, что каждое слово соответствует одному типу
for l in io.lines(file) do
	l=l:lower()
	local t={}
	for i,wt in ipairs(wordsTypes) do
		--print(wt.func(l))
		if wt.func(l) then
			table.insert(t,i)
		end
	end
	if #t~=1 then
		print('#t~=1,\t#t=',#t)
		for _,i in ipairs(t) do
			print('type=',i)
		end
		error(l)
	end
end
if 1 then return end
--]]

---------------	Настройки
local subLen=1
local checkRules=true	--	нужно ли в wordCheck проверять и правила rules
local wordCheck={
	--wordChecks.notTilda,
	--wordChecks.notTildaOther,
	--wordChecks.match'q',
}
local whatToDo={
--	'poss',
--	'words',
	'lens',
}
---------------- конец настройкам

do	-- делаем функцию wordCheck из таблицы
	wordCheck[1]=wordCheck[1] or 'true'
	local sFunc=chekToFunction(table.concat(wordCheck,' and '))
	if not checkRules then
		wordCheck=sFunc
	else
		wordCheck=function(l)
			if sFunc(l) then
				--[[
				if allGood:match(' '..l..' ') then
					return true
				end
				]]
				for _,rule in ipairs(rules) do
					if rule.bad(l) then
						return false
					end
				end
				return true
			end
		end
	end
end

local ll,calcs=calcFreq(subLen,wordCheck,whatToDo)
local llWords,poss
local all=allLetters(subLen)
--table.sort(all,function(a,b) return (ll[a] or 0)<(ll[b] or 0) end)
for _,al in ipairs(all) do
	if wordCheck(al) then
		--print(al,ll[al] or 0)
		for _,calc in ipairs(calcs) do
			calc.out(al,calc.result)
			--[[
			local an=calc.analysis(al,calc.result)
			if not an then
				print(an)
			else
				local s=''
				for len,t in pairs(an) do

				end
			end
			--]]
		end
	end
end
