
// #define BLOOM_FILTER_SIZE ( 64512 ) magic weak value
// #define BLOOM_FILTER_SIZE ( 65024 ) magic weak value
// #define BLOOM_FILTER_SIZE ( 69888 ) magic weak value

using namespace std;

#define BLOOM_FILTER_SIZE ( 66097 )

double N_bloom = 227262; // 249912
double N_dict = 624631;
double N_sample = 508897;
//double N_sample = 20000;

double N_sample_dict_bloom = 226000;
double N_sample_nondict_bloom = 208471;
double N_sample_nondict_bloom_positive = 24235;

typedef vector < string > string_array;

void explode( const std::string delimiter, const std::string & str, string_array & arr );

class CTransformation {
public:
  std::string from;
  std::string to;
  std::string exceptions;
  std::string from_rev;
  bool bFromStart = false;
  bool bTemporary = false;
  bool bNew = false;
  long long int counter = 0;
  long long int fail_counter = 0;
  double fail_delta = 0;
};

typedef std::vector < CTransformation * > t_transformations;
t_transformations transformations;
int transformations_length = 0;
//int transformations_counter_limit = 0;
//int transformations_counter_limit = 50;
//int transformations_counter_limit = 100;
//int transformations_counter_limit = 250;
//int transformations_counter_limit = 400;
//int transformations_counter_limit = 450;
//int transformations_counter_limit = 500;
int transformations_counter_limit = 550;
//int transformations_counter_limit = 600;
//int transformations_counter_limit = 750;
//int transformations_counter_limit = 1000;
//int transformations_counter_limit = 1250;
//int transformations_counter_limit = 1500;
//int transformations_counter_limit = 2000;
//int transformations_counter_limit = 2700;
//int transformations_counter_limit = 4000;

int transformations_fail_limit = 1000000;
//int transformations_fail_limit = 600;

double transformations_failrate_limit = 10000;
//double transformations_failrate_limit = 0.375;
//double transformations_failrate_limit = 0.35;

void add_transformations_from_string( string s, bool bFromStart );

void init_transformations() {
  if ( transformations.size() > 0 ) {
    return;
  }

// es,,AEFHMNOQSWX,24102,8199)\

add_transformations_from_string( 
"'s,,,397875,1284)\
es,,S,24102,8199)\
s,,isu,282566,53886)\
ly,,bfioy,39629,4080)\
ing,,bcdgiklmstuvz,26796,7017)\
ness,,i,32970,888)\
st,r,E,9323,1545)\
al,,C,16503,4363)\
ship,,,5399,178)\
d,,CHW,87757,57202)\
ful,,s,6347,756)\
ville,,s,4611,498)\
less,,kl,10178,248)\
en,an,M,5414,585)\
ment,,gi,9873,1704)\
man,,aios,10780,1146)\
like,,kd,4518,246)\
ing,e,CSVZ,12047,2577)\
ation,e,SXZ,5515,1349)\
ility,le,B,4844,237)\
dom,,,2125,92)\
ly,er,I,3177,1257)\
head,,,2123,114)\
proof,,,1288,30)\
some,,,1952,452)\
hood,,,1539,111)\
y,e,L,6363,1902)\
able,,E,1994,543)\
ous,ae,E,3491,2189)\
ist,y,G,3347,372)\
y,,HKWZ,7580,3933)\
wood,,r,2300,78)\
fish,,,1823,169)\
sville,,l,2526,450)\
let,y,BHNR,603,297)\
house,,,1113,18)\
wort,,,1382,39)\
wise,,,1260,27)\
ting,ted,ACNRS,11145,1245)\
tail,,,846,39)\
iness,y,,8515,194)\
ier,y,,17820,2728)\
ality,al,INU,1018,51)\
ging,ged,G,910,51)\
ming,med,R,483,72)\
table,ted,AN,1080,210)\
ative,ation,CILNRT,4016,1143)\
tory,tion,A,2379,507)\
ncy,nt,AE,3215,572)\
ator,ations,C,723,57)\
land,,,2868,246)\
tional,tion,ACI,1965,372)\
maker,,,1337,6)\
work,,,2004,33)\
list,l,A,2392,279)\
ence,ent,CDIL,2596,359)\
tor,tion,ACU,6865,1074)\
making,,,1001,3)\
tting,t,AEIOU,1878,267)\
pping,p,AIO,357,20)\
erer,er,DT,1076,63)\
stone,,,1532,51)\
able,ed,S,1753,375)\
logic,logical,O,2319,84)\
sman,,DT,621,27)\
board,,,1376,12)\
ser,ses,IO,3003,308)\
king,k,CNRS,2501,321)\
berry,,,1083,57)\
bird,,,985,12)\
tionist,tions,AC,711,9)\
king,ker,A,734,255)\
ing,ed,BU,1503,156)\
back,,,1317,60)\
rer,rs,E,1337,186)\
flower,,,719,21)\
aker,aking,MT,317,36)\
town,,,1734,270)\
root,,,710,6)\
rapher,raphy,G,970,60)\
istic,ist,CEHLN,1838,408)\
ding,ds,N,1567,377)\
fing,fed,F,134,11)\
monger,,,672,6)\
tivity,tive,C,254,9)\
dable,ding,ADELNORU,1145,282)\
ley,,,2557,488)\
bush,,,560,27)\
worm,,T,99,0)\
dale,,,1209,201)\
mata,ma,GMOSY,738,177)\
field,,,1059,78)\
city,c,I,1079,186)\
idal,id,O,696,108)\
onary,on,DI,689,78)\
way,,E,416,9)\
lae,la,aiy,843,102)\
ware,,,854,30)\
master,,EKT,276,3)\
ting,t,EF,1004,143)\
dity,d,IN,609,39)\
ling,le,BDFGZ,2309,433)\
woman,men,S,396,12)\
hting,ht,CGS,441,3)\
ging,ge,ADR,996,113)\
sburg,,ELNRT,782,96)\
craft,,DEGHKLNRT,488,6)\
hole,,ET,243,12)\
well,,,900,102)\
ress,r,E,489,12)\
time,,,689,21)\
ionism,ions,T,399,3)\
ming,,M,500,24)\
box,,DERT,282,0)\
onism,onist,I,257,36)\
sive,sively,NSU,2013,515)\
rding,rds,AO,624,93)\
alism,al,IR,694,11)\
pot,,KS,284,6)\
yard,,DEKLNPRT,459,0)\
room,,,785,27)\
bill,,,477,3)\
ication,y,F,1726,234)\
able,ing,H,884,204)\
foot,,,422,3)\
ish,,NY,1341,352)\
boy,,E,66,0)\
tional,tions,A,78,18)\
piece,,lsnwy,381,3)\
ding,,D,624,45)\
port,,,1152,138)\
book,,,572,3)\
tree,,,467,6)\
down,,E,96,0)\
by,,B,795,21)\
smith,,E,105,0)\
icality,ical,RST,162,0)\
sher,sh,AEIU,1274,114)\
mping,mp,U,53,4)\
kin,,S,632,72)\
dlike,d,,303,15)\
cer,ce,AIN,1013,127)\
kless,k,C,239,3)\
cality,cally,I,174,3)\
arianism,arian,GNT,176,3)\
grass,,,492,15)\
worker,,,456,9)\
stick,,,472,9)\
boat,,,540,9)\
water,,,596,21)\
most,,,291,24)\
ford,,DN,179,0)\
sey,,,720,63)\
leaf,,,300,0)\
shire,,KNR,165,0)\
bler,ble,BM,489,15)\
let,,E,591,69)\
fold,,EN,192,3)\
larity,lar,U,285,6)\
stock,,,417,0)\
light,,f,815,33)\
ery,er,GHKLNTV,3291,972)\
anism,an,I,1173,36)\
lation,late,LUY,3287,729)\
ner,n,O,1527,293)\
ration,rate,BE,2357,543)\
icism,ic,LNRT,1079,144)\
ling,,LT,3628,1190)\
itic,ite,N,255,66)\
metry,meter,AIOUY,1011,207)\
son,,NT,763,150)\
etric,eter,M,1392,474)\
aceae,a,I,1542,464)\
ie,,K,1096,318)\
sity,us,O,927,147)\
rish,r,aioru,539,81)\
tter,t,eou,1671,326)\
ette,,NR,1323,410)\
tive,tion,CR,2350,734)\
enetic,enesis,G,591,105)\
idea,id,O,744,156)\
iting,it,cln,854,279)\
tty,t,eou,521,24)\
ger,,G,1339,204)\
esque,,N,240,30)\
ker,k,CN,2798,603)\
kish,k,wo,558,63)\
ac,a,I,1435,527)\
cise,c,I,810,72)\
pper,p,A,435,48)\
sser,ss,A,180,30)\
nie,,AINRW,1386,406)\
opic,ope,C,468,102)\
ie,y,DNT,7742,943)\
mer,,M,1184,240)\
ggy,g,e,761,30)\
cidal,cide,IO,258,45)\
nry,n,AEIO,368,37)\
ball,,,849,27)\
dder,t,IO,336,27)\
py,,P,986,87)\
etry,etric,M,102,24)\
opism,opic,R,414,27)\
tome,tomy,O,291,48)\
pling,ple,i,422,68)\
bber,b,i,666,138)\
away,,,483,15)\
dous,d,an,405,108)\
atous,a,M,492,180)\
id,idae,I,264,21)\
pism,pic,O,42,18)\
ction,ct,E,3252,933)\
lytic,lysis,AO,513,126)\
iling,il,AO,570,78)\
my,,M,597,18)\
phism,phic,R,361,33)\
netic,nic,E,120,66)\
mark,,,606,15)\
tie,,RT,195,26)\
lting,lt,ao,277,24)\
ory,ion,S,444,141)\
holder,,E,147,6)\
ffy,ff,IU,371,3)\
ler,le,D,759,171)\
morph,morphic,IO,446,39)\
tish,t,AELNR,357,24)\
dean,d,AI,369,105)\
ddle,t,IU,885,179)\
graphist,graphic,O,231,12)\
kis,ki,IU,72,0)\
lless,l,AE,135,0)\
tural,ture,L,198,57)\
pting,pt,eilouy,111,15)\
keeper,,,381,6)\
rality,ral,it,302,27)\
gation,gate,EIO,1006,204)\
ytic,yte,H,213,24)\
ter,t,R,967,150)\
iidae,ia,R,369,111)\
tress,te,A,213,18)\
gerous,ferous,I,240,63)\
ristic,rism,AE,168,54)\
poda,pod,O,303,33)\
kable,ker,C,117,36)\
rae,ra,U,54,15)\
pish,p,M,207,3)\
fiable,fy,I,360,123)\
iner,in,A,419,12)\
etta,e,LNR,516,164)\
tee,t,CIN,381,84)\
tation,tate,I,1490,551)\
bber,t,,129,24)\
li,lus,U,513,183)\
obe,obia,H,365,54)\
ette,e,HS,435,128)\
try,t,N,396,93)\
oda,od,P,117,33)\
hobic,hobia,P,216,24)\
ddy,ck,i,876,162)\
net,,igoe,959,180)\
aling,al,EIO,318,59)\
tate,tation,I,2360,387)\
able,e,V,927,356)\
erage,er,DEKPT,198,3)\
mpy,mp,IU,399,6)\
eler,el,E,161,9)\
band,,ENRT,185,0)\
bble,t,AI,869,195)\
cock,,R,51,3)\
alis,al,IT,323,63)\
tic,sis,O,1982,1134)\
ten,t,R,213,60)\
lyn,,AEIK,306,45)\
matism,matic,GO,185,9)\
enesis,enic,G,1346,444)\
ionable,ion,ST,213,60)\
ider,id,L,96,30)\
lum,la,U,564,162)\
tism,t,N,341,83)\
teran,terous,P,189,9)\
ctory,ction,A,116,30)\
mouth,,E,75,6)\
hous,hic,P,261,84)\
ddy,m,,227,44)\
ation,ate,U,717,158)\
trix,te,AU,380,87)\
tician,tic,E,84,0)\
mble,n,aeou,182,36)\
omist,omy,nr,215,36)\
osity,ous,I,63,9)\
ener,,T,258,42)\
ypic,ype,T,315,42)\
nate,nation,IO,3494,1348)\
ssy,ss,O,195,15)\
cloth,,,354,3)\
tive,tion,P,668,180)\
nic,n,I,905,447)\
hism,hic,PT,288,120)\
ger,ge,A,912,306)\
lant,lation,U,305,48)\
kage,ker,alnos,225,50)\
itish,ite,M,42,0)\
emic,emia,A,138,18)\
cake,,,303,0)\
ualism,ual,,233,9)\
ney,,N,135,30)\
logy,logical,O,6353,2141)\
nid,nidae,AEIY,435,153)\
sity,se,O,288,105)\
aler,al,EOR,252,39)\
iform,a,EL,603,231)\
nny,n,euy,688,123)\
lty,l,A,374,66)\
torial,tion,A,332,108)\
smic,sm,AEIY,333,92)\
hound,,R,42,0)\
ctable,ctive,E,281,93)\
ish,er,K,135,63)\
mper,mp,AU,375,69)\
pie,,EP,336,36)\
eran,erous,FMT,75,32)\
wable,w,AEO,294,66)\
ica,ic,T,236,78)\
entary,ental,M,279,63)\
able,er,M,705,378)\
ding,der,L,777,285)\
lastic,last,B,207,66)\
mble,t,,1392,476)\
hand,,D,39,0)\
mont,,,477,63)\
penny,,,162,6)\
ffy,t,,153,0)\
onite,on,S,132,27)\
uer,ue,cn,833,407)\
dial,dium,I,123,18)\
later,latry,O,221,33)\
ry,,L,162,18)\
vation,vate,AIO,560,93)\
oan,oa,Z,212,15)"
, false );

add_transformations_from_string( 
"un,,di,49070,10229)\
non,,,20577,1615)\
sub,,j,10180,1925)\
out,,ar,6342,914)\
anti,,,6509,1081)\
over,,nuv,12756,1672)\
mis,,hkot,6346,1268)\
dis,,AEF,2126,402)\
semi,,n,4046,415)\
post,,ei,2161,341)\
super,,fnv,4936,534)\
inter,,inr,5544,1061)\
pre,,afhlmstv,9827,1888)\
up,,,3205,507)\
under,,av,4380,428)\
re,,BIO,2917,713)\
in,,E,1285,251)\
counter,,,2000,192)\
ultra,,,954,66)\
pseudo,,,1760,285)\
poly,,A,272,92)\
arch,,BCDMPS,352,27)\
be,,FJMPSW,2888,746)\
pro,,AIR,461,61)\
ex,,AFS,1248,407)\
peri,,BCHO,637,226)\
back,,,1432,174)\
ir,,R,1371,433)\
circum,,A,74,0)\
trans,,M,326,81)\
fore,,,2888,336)\
photo,,,1795,241)\
rea,a,CP,922,141)\
rec,c,O,2279,451)\
multi,,,2026,363)\
res,s,EH,1008,155)\
bio,,EMS,507,36)\
uni,i,N,1363,312)\
electro,,,950,141)\
ree,e,MNSVX,960,138)\
wood,,,1002,96)\
head,,LS,235,9)\
radio,,T,125,12)\
iso,,C,412,148)\
water,,BCFLSW,474,38)\
tele,,CP,451,97)\
fire,,B,128,3)\
sea,,,1917,366)\
sun,,,1173,179)\
black,,,692,97)\
hand,,aetkji,886,95)\
down,,,747,56)\
psycho,,,845,168)\
after,,,640,6)\
foot,,BLPRS,429,39)\
thermo,,,655,105)\
green,,,647,105)\
proto,,P,198,54)\
cross,,,682,54)\
house,,,491,45)\
sand,,,796,123)\
mini,,CM,350,59)\
incon,con,CS,258,36)\
extra,,CST,333,94)\
blue,,,438,54)\
pres,s,CHPU,827,117)\
ref,f,IO,804,148)\
eye,,,452,37)\
cow,,,751,117)\
pref,f,AIOR,578,80)\
land,,FLMS,402,78)\
horse,,,369,38)\
outr,r,AO,286,44)\
white,,,425,57)\
demi,,efjknosu,511,54)\
free,,BW,158,6)\
wind,,,849,99)\
play,,,434,12)\
bed,,RS,311,44)\
incom,com,P,208,20)\
macro,,,998,342)\
snow,,BS,207,12)\
moon,,,411,21)\
para,,T,285,111)\
geo,,T,114,15)\
deco,co,N,186,18)\
diss,s,O,248,25)\
high,,,375,66)\
cyto,,,606,125)\
book,,,427,21)\
work,,BFS,146,8)\
stone,,,301,33)\
sky,,,375,27)\
supra,,,481,42)\
hair,,BDSW,233,21)\
may,,,590,120)\
side,,,670,172)\
milli,,ACEGLMPRS,333,30)\
night,,,219,18)\
stereo,,,490,116)\
rew,w,AEIOR,444,62)\
immuno,,,183,9)\
day,,,347,51)\
news,,,445,39)\
long,,,655,213)\
disp,p,R,239,66)\
hemi,,CS,222,24)\
school,,,319,21)\
hard,,BHSW,171,42)\
dog,,BFHLNST,260,32)\
corn,,BC,114,3)\
stock,,B,51,0)\
blood,,LS,126,6)\
intra,,,860,211)\
myo,,CFGP,351,48)\
ship,,,343,32)\
rock,,,451,96)\
chemo,,,255,42)\
indi,di,S,240,21)\
fish,,,421,48)\
broad,,,296,31)\
tail,,,424,66)\
en,,FS,892,189)\
silver,,S,69,0)\
wool,,,364,36)\
flat,,BCFHLMW,147,6)\
redi,di,S,319,51)\
bush,,BCFGLMTW,168,6)\
unde,de,C,316,36)\
unim,im,P,291,71)\
ash,,,642,144)\
gold,,,576,189)\
earth,,,228,9)\
step,,,528,92)\
reh,h,AE,350,87)\
door,,aeiou,262,50)\
spring,,,223,12)\
jack,,S,143,39)\
sero,,,379,45)\
turn,,,477,57)\
bird,,,329,36)\
finger,,,196,18)\
honey,,,230,9)\
sulf,sulph,,618,102)\
astro,,,536,136)\
pay,,,375,47)\
osteo,,,590,209)\
bic,c,AOY,284,44)\
disr,r,EO,219,21)\
ice,,,204,45)\
lock,,S,68,18)\
mari,,GS,135,21)\
star,,,887,181)\
butter,,,207,48)\
heart,,,374,29)\
rain,,,225,21)\
oil,,,218,21)\
rose,,B,51,9)\
road,,,220,9)\
slip,,,329,57)\
love,,,282,0)\
wire,,,173,24)\
bow,,FGKLSW,294,30)\
shop,,,240,36)\
king,,,264,41)\
whip,,CS,120,15)\
disco,co,N,299,69)\
time,,,276,27)\
key,,PS,120,24)\
mail,,BS,60,3)\
disl,l,I,84,15)\
mary,,,279,46)\
short,,CGHS,135,18)\
fibro,,,355,45)\
reas,as,S,255,33)\
draw,,,315,9)\
meso,,,1080,357)\
saw,,,291,51)\
half,,LP,69,0)\
boat,,,203,6)\
brain,,W,42,9)\
tea,,S,168,9)\
retr,tr,A,382,90)\
rough,,,202,18)\
river,,,152,9)\
hog,,,329,60)\
boot,,,316,28)\
blow,,,273,48)\
thunder,,BS,84,3)\
ink,,S,36,0)\
enr,r,A,159,27)\
gum,,,251,45)\
bec,c,L,117,27)\
motor,,a,239,21)\
und,d,OR,318,71)\
horn,,BFLPTW,128,21)\
ram,,P,244,86)\
way,,BGL,102,0)\
tom,,BF,186,21)\
sweet,,,205,22)\
rag,,,525,125)\
def,f,O,332,103)\
check,,,245,39)\
dor,,,1336,497)\
undis,,COP,287,134)\
copy,,,204,12)\
pret,t,AR,267,30)\
chromo,,,331,69)\
imp,p,O,851,337)\
snake,,,99,12)\
kel,,PST,144,3)\
don,,EG,170,18)\
imm,m,O,351,87)\
reu,u,NPS,201,18)\
shoe,,,134,6)\
yellow,,,115,5)\
bs,,,336,51)\
wan,,T,169,26)\
dust,,,233,6)\
coi,i,N,432,117)\
double,,,156,12)\
quadri,,,603,146)\
inb,b,OR,119,6)\
wash,,B,29,0)\
south,,,339,86)\
bread,,,176,15)\
wild,,,306,27)\
quarter,,,132,9)\
wine,,,171,6)\
feather,,B,33,3)\
bear,,B,29,0)\
beh,h,O,119,9)\
law,,BFLM,51,3)\
overn,n,EI,105,17)\
cod,d,EOR,437,42)\
wing,,,168,6)\
lipo,,C,44,6)\
hep,pen,T,380,96)\
with,,,504,89)\
bob,,S,59,9)\
phono,,T,57,3)\
shell,,,196,36)\
pig,,FS,78,14)\
goose,,B,21,0)\
bug,,,254,48)\
brick,,,140,6)\
ms,,A,24,0)\
middle,,,150,21)\
micro,,,3131,688)\
auto,,,2446,822)\
prea,a,D,297,36)\
hydro,,CFMS,797,165)\
undi,di,FGLV,289,50)\
neuro,,,1048,243)\
red,d,AEOR,1377,383)\
aero,,,1022,239)\
pyro,,,980,289)\
rem,m,A,452,110)\
air,,BS,209,9)\
equi,,,1161,247)\
hypo,,S,257,92)\
infra,,bcdlnrv,195,12)\
ante,,CM,183,27)\
omni,,P,102,6)\
disc,c,A,152,18)\
reca,ca,P,117,9)\
ortho,,CS,207,57)\
rest,st,o,919,330)\
phyto,,,605,146)\
bip,p,A,96,15)\
beg,g,,932,311)\
crypto,,,586,207)\
ecto,,,448,113)\
sulpho,,,559,179)\
impa,pa,LR,308,39)\
home,,S,119,15)\
bull,,BDFW,220,29)\
interr,r,AEH,225,9)\
mid,,S,131,6)\
glen,,E,33,0)\
prel,l,I,153,12)\
chloro,,,423,140)\
diso,o,R,132,27)\
fly,,BSW,152,6)\
cardio,,,314,76)\
vaso,,,195,36)\
sheep,,,257,18)\
ring,,,338,24)\
prev,v,e,419,96)\
adeno,,CHMS,132,18)\
reso,so,ALU,381,36)\
superf,f,O,51,3)\
holo,,bcdhpt,309,76)\
ind,d,EW,919,281)\
read,ad,ADJMV,252,48)\
philo,,,701,238)\
leuk,leuc,a,290,75)\
kilo,,,264,23)\
beb,b,A,33,6)\
coad,ad,AJM,156,51)\
cryo,,SP,146,42)\
hemo,,,454,142)\
quinque,,,198,60)\
tetra,,CS,322,102)\
organo,,PTG,113,21)\
somato,,T,69,12)\
chondro,,,246,80)\
fors,s,LPW,123,18)\
entero,,,392,177)\
uni,,C,198,18)\
pseud,,ei,108,12)\
hay,,BRW,102,3)\
broncho,,,146,51)\
perig,g,elr,105,18)"
, true );

  typedef multimap < long long int, CTransformation * > t_transformation_by_usage;
  t_transformation_by_usage transformation_by_usage;
  typedef multimap < double, CTransformation * > t_transformation_by_fails;
  t_transformation_by_fails transformation_by_fails;
  //t_transformation_by_fails transformation_by_useful_weight;
  for ( t_transformations::iterator i = transformations.begin(); i != transformations.end(); i++ ) {
    transformation_by_usage.emplace( ( *i )->counter, *i );
    transformation_by_fails.emplace( ( *i )->fail_delta, *i );
    //transformation_by_useful_weight.emplace( double( ( *i )->from.length() + ( *i )->to.length() + ( *i )->exceptions.length() ) / double( ( *i )->counter ), *i );
  }

}
