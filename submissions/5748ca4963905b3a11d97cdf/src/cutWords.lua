--	программа отделения от слов пристанов и окончаний из фиксированного набора
--	отказываюсь от использования

local beginsTxt=[[
un
co
re
no
in
non
pre

pro	2
dis
sub
per
par
cha
car
tri
mis
for

over
anti
poly

semi	2
para
mono
peri
prot
disc
fore
post
auto
meta
hypo
arch

inter
super
under
micro
hyper
trans
hydro
multi

photo	2

pseudo
counter
electro
]]

local endsTxt=[[
abilities
ability
able
ableness
ation
ed
er
es
ing
ly
ness
nesses
tion
]]

local txtToList=function(txt)
	local counts={}
	local list={counts=counts}
	for t in txt:gmatch'%a+' do
		table.insert(list,t)
		counts[t]={[0]=0}
	end
	table.sort(list,function(a,b) return #a>#b end)
	return list
end

local begins=txtToList(beginsTxt)
local ends=txtToList(endsTxt)

print(#begins,#ends)

local findBegin=function(b,n)
	local lb=#b
	for i,j in ipairs(begins) do
		local lj=#j
		if lb>lj then
			if b:sub(1,lj)==j then
				local cnts=begins.counts[j]
				cnts[0]=cnts[0]+1
				cnts[n]=(cnts[n] or 0)+1
				return j,b:sub(lj+1)
			end
		end
	end
end

local findEnd=function(b,n)
	local lb=#b
	for i,j in ipairs(ends) do
		local lj=#j
		if lb>lj then
			if b:sub(-lj)==j then
				local cnts=ends.counts[j]
				cnts[0]=cnts[0]+1
				cnts[n]=(cnts[n] or 0)+1
				return j,b:sub(1,-lj-1)
			end
		end
	end
end

--[[
for i,j in ipairs(ends) do
	print(i,#j,j)
end
]]

local f=io.open('wordsCut.txt','w+')

for l in io.lines('words.txt') do
	local b=l:lower()
	local lb=#b
	local a,c,t='','',''
	if b:sub(-2)=="'s" then
		t="'s"
		b=b:sub(1,-3)
		lb=lb-2
	end
	local begin,nb
	local n=0
	repeat
		n=n+1
		begin,nb=findBegin(b,n)
		if begin then
			if a~='' then
				a=a..'|'
			end
			a=a..begin
			b=nb
		end
	until not begin
	lb=#b
	local e,nb=findEnd(b,1)
	if e then
		c=e
		b=nb
	end
	f:write(l..'\t'..a..'\t'..b..'\t'..c..'\t'..t..'\n')
end
f:close()

local outCounts=function(list,caption)
	print('===============',caption)
	for i,j in ipairs(list) do
		local cnts=list.counts[j]
		print(i,j,cnts[0],'('..#cnts..')','=',table.concat(cnts,'\t+'))
	end
end

outCounts(begins,"begins")
outCounts(ends,"ends")

