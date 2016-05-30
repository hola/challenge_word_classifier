--PostgreSQL
drop table if exists test0; CREATE TABLE test0(id SERIAL PRIMARY KEY,t1 text);
drop table if exists test1; CREATE TABLE test1(id SERIAL PRIMARY KEY,ids int,lt int, cnt int,t1 text, t_cop text);
copy test0 (t1) from '/home/admin1/habr/words.txt';
update test0 set t1=lower(t1);
insert into test1(lt,t1,t_cop) select distinct length(t1),t1,t1 from test0;
CREATE INDEX idx_t1 ON test1 (t1,lt);
-- 630404

CREATE OR REPLACE FUNCTION str_arr(text) RETURNS setof text
AS $BODY$ DECLARE i1 int; 
BEGIN for i in 1..length($1) loop return next substr($1,i,1); end loop;
  RETURN ; END $BODY$ LANGUAGE plpgSQL;

CREATE OR REPLACE FUNCTION arr_pad(integer[],text,text) RETURNS text
AS $BODY$ DECLARE i1 int; v1 int; vmax int; arr ALIAS FOR $1; re text; 
BEGIN i1:= 1; vmax=(select max(v) from unnest(arr) v); re=rpad('',vmax,$2);
  while arr[i1] is not null loop v1=arr[i1];
    re=left(re,v1-1)|| $3|| substr(re,v1+1); i1:= i1+1; end loop; 
RETURN RE; END $BODY$ LANGUAGE plpgSQL;



drop table if exists t_lev; create table t_lev as 
select q.*,t1 ts,t1 t_p,t1 ib,t1 a1 from test1,(select 99 tp,99 i1,99 lv) q limit 1;
;
delete from t_lev;
DO $$ DECLARE vtp int; vlv int; vi1 int; vmax int; vv int;
BEGIN vmax=3; 
for vv in 0..11  loop vi1=vv*vmax+1;
--foreach vi1 IN ARRAY array[1,4,5,9,13,17,21,25,29,33] LOOP
insert into t_lev select 
distinct q.*,substr(t1||' ',i1,tp) ts,'' t_p,'' ib,'' a1 from test1,(select vmax tp,vi1 i1,0 lv) q;
RAISE NOTICE 'ins %',vi1||':'||vmax; 
end loop; END; $$;
;
--delete from t_lev where tp<>4;
DO $$ DECLARE vtp int; vlv int; vi1 int; vmax int; vv int;
BEGIN vmax=3; vi1=1; 
for vv in 0..11  loop vi1=vv*vmax+1;
--foreach vi1 IN ARRAY array[1,4,5,9,13,17,21,25,29,33] LOOP
for vlv in 1..vmax-1  loop 
for vtp in 1..vmax    loop vtp=vmax-vtp+1; 
delete from t_lev where tp=(vtp-1) and lv=vlv and i1=vi1; insert into t_lev 
select tp-1,i1,ilv,tl,max(ru)
  ,string_agg(tr,'' order by tr COLLATE "C") ib
  ,string_agg(a1,ru order by tr COLLATE "C") ib
from ( select *,left(ts,tp-1) tl,substr(ts,tp,1) tr from t_lev 
  ,(select *,substr(rz,2) ru from (select vi1 ii1,vtp itp,vlv ilv,unnest(array['1','2,','3-','4:']) rz) q where ilv::text =left(rz,1)) q 
  where tp=itp and i1=ii1 and lv =ilv-1
) q group by tl,tp,i1,ilv;
--delete from t_lev where tp=(vtp-1) and lv=vlv and ib=''; --update t_lev set ib='.' delete from t_lev 
update t_lev set a1=ib||t_p||a1 where tp=(vtp-1) and lv=vlv and i1=vi1; 
RAISE NOTICE 'ins %',vtp||':'||vlv||':'||vi1; 
end loop; end loop; end loop; END; $$;
;
--select i1-1,ts,a1 from t_lev where lv in(2) and ts <>'' and ts like '%' order by i1,ts COLLATE "C" --,1,2,3


drop table if exists t_lev; create table t_lev as 
select q.*,t1 ts,t1 t_p,t1 ib,t1 a1, 9988 ids from test1 t,(select 991 i1,994 ic,990 lv,999 lt) q limit 1;
select * from t_lev;

--drop table if exists t_s; create table t_s as 
--select 0 rv,0 r1,0 rc,substr(r,1,1)::int rz,substr(r,2) ru,r from (select unnest(array['0','1,','2-','3:']) r) q ;
--insert into t_s select 1 rv,r,3,0 from (select unnest(array[1,4,7,10,13,16,19,22,25,28,31,34]) r) q order by 1,2;
--delete from t_lev; insert into t_lev 
--select distinct v.r1,v.rc,0,case when lt<=4 then 4 else case when lt>8 then 9 else lt end end lt,substr(t1||' ',r1,rc),'','','' from test1,t_s v where rv=1 --and lt> 6;
--insert into t_s select 1 rv,r,3,0 from (select unnest(array[1,3,4,6,7,9,10,12,13,15,16,18,19,21,22,24,25,27,28,30,31,33,34]) r) q order by 1,2;


drop table if exists t_s; create table t_s as 
select 0 rv,0 r1,0 rc,substr(r,1,1)::int rz,substr(r,2) ru,r from (select unnest(array['0','1,','2-','3:']) r) q ;
insert into t_s select 1 rv,r,4,0 from (select unnest(array[1,5,9,13,17,21,25,29,33]) r) q order by 1,2;

delete from t_lev; insert into t_lev 
select distinct v.r1,v.rc,0,case when lt<=6 then 16 else 26 end lt,substr(t1||' ',r1,rc),'','','' from test1,t_s v where rv=1 --and lt> 6;
;
DO $$ DECLARE v RECORD; vlv int; vic int; vlt int;
BEGIN vlt=16; --delete from t_lev where lv<>0; 
for v in select * from t_s where rv=1 order by rc,r1 loop 
for vlv in         0..v.rc loop 
for vic in reverse v.rc..1 loop 
insert into t_lev 
select i1,ic-1,lv+1,lt,tl,max(ru)
  ,string_agg(tr,'' order by tr COLLATE "C") ib
  ,string_agg(a1,ru order by tr COLLATE "C") ib
from ( select *,left(ts,vic-1) tl,substr(ts,vic,1) tr from t_lev,t_s s --,(select 1 vlv,3 vrc,r1 from t_s where rv=1 and r1=1) v
  where lt=vlt and s.rv=0 and s.rz=vlv and ic=vic and i1=v.r1 and lv=vlv
) q group by i1,ic,lv,lt,tl;
update t_lev set a1=ib||t_p||a1 where ic=vic-1 and lv=vlv+1 and i1=v.r1 and lt=vlt;
RAISE NOTICE 'ins %',v.r1||':'||v.rc||':'||vlv; 
end loop; end loop; end loop; END; $$;
;
select l0,ts,a1 from (select * from (
select lt,i1-1 l0,ts,a1 from t_lev where lv in(3) and ts <>'' and ts like '%'  
union select distinct lt,-ic,'.',lt::text from t_lev where lv=0
) q order by 1,lt,2,ts COLLATE "C" --,1,2,3
) q
;