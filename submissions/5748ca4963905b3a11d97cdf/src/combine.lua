---	объединялка слов фиксированной длинны
--		пригодится для сжатия данных

--	несуществующие слова длинны 2
local s=[[bj
bq
cx
ej
ek
fh
fj
fk
fq
gf
gj
gx
gz
hx
ih
jb
jf
jh
jk
jm
jn
jq
jw
jx
jz
kf
kh
kk
kq
kx
kz
lk
lq
mq
mz
nk
nn
nx
oq
pj
pz
qg
qj
qk
qo
qw
qx
qz
rk
rz
sz
tf
tj
tq
tz
ue
uf
uj
uo
uq
uy
uz
vh
vk
vq
vy
vz
wj
wn
wq
wx
wz
xf
xg
xh
xj
xk
xm
xy
xz
yc
yg
yh
yj
yk
yl
yq
yw
yx
yz
zc
ze
zf
zh
zj
zm
zp
zq
zv
zw
zx
zy
]]
--local s='wx vj gx hx qy wq kx zj qg qh qp fq qk xz xk kz gq qf qv qc qb px kq vb vw vx jv fx cx jb jw qn jf cj jg vz qo qw pz zq qd fz sx pq fv wj qm jj yq bx mx zf vf qq ql tx dx qt mq jt jm bq jl qr fj vh jk jp qe jy jh xq xg bz vp vg xr lx wv dq zg xx yj jc xv jd tq xn gv zp hq vm mz yy qs gz cv jn hj vk xd jr rx js zr zv zc lq vc gj mj pj wz fk vd zd hz vt pv zn zt qi cw zw xw lj fg zs zk kj vn zm fw xm bk fp xb xf cg cf fh mk kg zb fd fb cb wg qa gk sz uw dk uq vv xl mg fc gc zh cz fm'
--			 qo qwgjmqdqmzdkjlqqljkgk jpjyjhjcvpvgcwxzjvjbxkxqyqgxgqhxrxxvbqpxn qe jd yy qszn vk jr jsx vcg fk vd vt qi zwqkzqfqvwjwvxdxwzfxmxbzgvzpzr fg zs zk vn zmk fw fpqtqr cfhzt zb fd fb cb qa uw uqcxfzvfvhqbkqn vvmjn fczh fmg jfjgzcjjtxlx
--s='xj qz jq vq jz jx qj qx zx'
local ll={}
for l in s:gmatch'%S+' do
	table.insert(ll,l)
end

local searchStart=function(start)
	start='^'..start
	for i,j in ipairs(ll) do
		if j:match(start) then
			return table.remove(ll,i)
		end
	end
end

local combine0=function(s)
	local result=table.remove(ll,1)
	local len=#result
	while #ll>0 do
		local start=result:sub(-len+1)
		local new=searchStart(start)
		if new then
			result=result..new:sub(-1)
		else
			result=result..' '..table.remove(ll,1)
		end
	end
	return result
end

local combine=function(s)
	local len=#ll[1]
	local badSearch=0
	while true do
		WinApi.ProcessMessages()
		local result=table.remove(ll,1)
		local start=result:sub(-len+1)
		local new=searchStart(start)
		if new then
			badSearch=0
			result=result..new:sub(len)
			table.insert(ll,1,result)
		else
			table.insert(ll,result)
			if badSearch>#ll then
				return table.concat(ll,' ')
			end
			badSearch=badSearch+1
		end
	end
end

local c=combine()
print(#c)
print(c)


