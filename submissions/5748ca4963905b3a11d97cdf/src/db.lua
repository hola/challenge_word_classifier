local configs={
	evgeny={
		pathDB=[[C:\Users\Evgeny\Documents\Programming\Hola\Классификатор слов\Database1.accdb]]
	},
	nuts={
		pathDB=[[C:\Job\Hola\Классификатор слов\Database1.accdb]]
	},
}

local dbVer={
	accdb={
		provider='Provider=Microsoft.ACE.OLEDB.12.0',
	},
	mdb={
		provider='Provider=Microsoft.Jet.OLEDB.4.0'
	},
}

local config=configs[os.getenv'computername':lower()]
local dbSettings=dbVer[config.pathDB:match'%.(%w+)%s*$']

math.randomseed(os.time())
local con=Ole.CreateObject('ADODB.Connection')
con.open(dbSettings.provider..';Data Source='..config.pathDB..';')
con.CursorLocation = 3
con.IsolationLevel = 1048576

local checkId=function(id)
	local rs=con.execute([[
		select 1
		from testData
		WHERE id=']]..id.."'"
	)
	return rs.recordcount==0
end

local randomId=function()
	return tostring(math.random()):sub(3)
end

local getMaxId=function()
	local id1=con.execute[[
		select max(cdbl(id1))
		from testData
		WHERE Not id1 Is Null
	]].fields(0).value or ''
	local rs=con.execute([[
		select cstr(max(cdbl(id2)))
		from testData
		where id1=']]..id1.."'"
	)
	local id2=rs.recordcount==1 and	rs.fields(0).value or randomId()
	return id1..id2
end

local incId=function(id)
	local add=true
	local result=''
	for dig in id:reverse():gmatch'.' do
		if add then
			add=dig=='9'
			if add then
				result='0'..result
			else
				result=string.char(dig:byte()+1)..result
			end
		else
			result=dig..result
		end
	end
	if add then
		result='1'..result
	end
	return result
end

local insertTestData=function(id,word,tf)	--11112345611111111616630634
	local rs=con.execute(([[
		insert into testData
		(id, word, result)
		values ('%s','%s',%s)
	]]):format(id,word:gsub("'","''"),tf and 1 or 0))
end

--https://hola.org/challenges/word_classifier/testcase/11342345611111111616630634
--print(#('11112345611111111616630634'))
--print(('9'):rep(26))

db={
	id=incId(getMaxId()),
	nextId=function()
		db.id=incId(db.id)
		return db.id
	end,
	checkId=checkId,
	randomId=randomId,
	insertTestData=insertTestData,
}
