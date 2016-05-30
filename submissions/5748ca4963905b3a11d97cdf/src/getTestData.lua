local inet=Ole.CreateObject"Microsoft.XmlHttp"

local getData=function(num)
	local url=[[https://hola.org/challenges/word_classifier/testcase/]]..num
	prevUrl=url
	inet.Open("GET",url,false)
	_=inet.Send
	local txt=inet.responseText
	--print(inet.responseText)
	local m={t={},f={}}
	for l,v in txt:gmatch[["([%a']+)"%s*:%s*(%a)]] do
		table.insert(m[v],l)
	end
	if #m.t+#m.f~=100 then
		error(('for num %s counts are %s %s'):format(num,#m.t,#m.f))
	end
	for _,a in pairs(m) do
		table.sort(a,function(a,b) return #a<#b end)
	end
	return m.t,m.f
end

local id=616630634
local t,f=getData(id)
for i,a in ipairs{t,f} do
	print()
	print(i==1,'count=',#a)
	for _,l in ipairs(a) do
		print(l,#l)
	end
end

db.id='145'--..db.randomId()
repeat
	if db.checkId(db.id) then
		local t,f=getData(db.id)
		print(db.id,#t,#f)
		for i,a in ipairs{t,f} do
			local tf=i==1
			for _,l in ipairs(a) do
				db.insertTestData(db.id,l,tf)
			end
		end
	else
		print('skip',db.id)
	end
	db.nextId()
	WinApi.ProcessMessages()
until false