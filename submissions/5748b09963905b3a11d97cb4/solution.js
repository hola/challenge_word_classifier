/*
==============
MODULE: kitten.js

AUTHOR: Sapunov Vladimir

DESCRIPTION: Tests a word on existance in the dictionary.

REMARKS: Exposts two functions init(), test(word)
==============
*/

var pack = "\
[lt]([lt]|[lt])[lt] \
[bcdfghjklmpqrstvwxz][bcdfghjklmpqrstvwxz][bcdfghjklmpqrstvwxz][bcdfghjklmpqrstvwxz](z|z|($)|($)) \
[aeinouy][aeinouy][aeinouy][aeinouy]i [rtw]w([rtw]w)?[bot] [gs]v [aj]+[aj] [mu][adev]([mu]|[mu]) \
[lv'][lv']' [qrwy]k($) [aj]g[aj] ^[aeghjlmnqrtwz][aeghjlmnqrtwz][aeghjlmnqrtwz]($) [arw][arw]w \
(za)+t [fnw](sx)?[iw](($)|[sw]|[sw]) ([ep]d){1,3}?[dln] [hu]v(?!v?($)) [au](sj)?[ho]($) as' \
[gy][imy]' (?![xy](?!v?v))[ixy]i (vy)?q c' ^[ghlmnqrtvwz][bcdfghjklmnpqrstvwxz][ghlmnqrtvwz] \
[enw][enw]v [notw][notw]g [dw]t [ho][ho]c [aei]r[aei] b[otv][ao] x[gqt] (r(?!(w|w)?w)h){1,4}[en] \
[ox][fq](sk)?[fq] u+v [nor][nor][nor]c ^[rw][bcdfghjklmnpqrstvwxz] [rv]w \
(?!x{1,10}?f)[ghlmnqrtvwz]q [bx]d [bex]u(?=m) [nrw]m($) j n[aj]l [bk]m ([or]d){1,3}?[elq] \
[adp]u[gk] ^[euz]o [tw]e[tw] [cdfghjklmnpqrstvwxz]n[cdfghjklmnpqrstvwxz] ^[nsv]l [ch][ch]y [dy]h \
[ckn][ckn]o las(?![hm]*x) [aeinouy]co [lqx][abcdefghijklnopqrstuvwxyz][aku]?[ak](j')?[lqx] \
[or]c[aeu] ^[dyz][bcdfghklmnpqrstvwxz]?[bcdfghklmnpqrstvwxz] [jnv']ey [at]h($) d{1,4}?m [cin][cin]r \
[ack]d[iz][bcdfghjklmnpqrstvwxz] [or]p[or] (?=ate($)) ^[nor]c tis e[hp]e [ajw]h($) \
b[bcdfijknopsuvxy']($) [now]o($) [at][at]y [or][or][or]s j[ak](?!t+v) \
[aeghlmnqrtwxz]t[aeghlmnqrtwxz]t (t[aeiouy])+e (?=ship($)) \
[aeghlmnqrtwxz][aeghlmnqrtwxz][aeghlmnqrtwxz][aeghlmnqrtwxz]v [ghlmnqrtwz][notw]m [ijk]{1,9}?f \
[fkz]s($) [ghlmnpqrtwz]e[dy]e [luv]h f[fy]($) [fqs][aeiouy][mr]o [rx]n($) \
[aeioruy][aeioruy].(?!e*m)[rx] [bvz]([kt]|[kt]|[jk]) [ai][ai]r ^[px]h [aiouy][gn]i ngi \
^[bcdfgijkopsuvxy]s [owz][owz]($) [aeiouy][dmz]v [ghlmnqrtwz][inz]d [ep][aeghjlmnqrtwz]z \
[ciz]k[ciz] [hkv][qs]($) [apx]ed($) [notw][notw]u [glmnqrtvwz]cy ^[xy][ax]?[ax] i[nor]c [hk][hjt]h \
[bey][sz]t d[a-z][or]($) (t[aeiouy]){1,4}?[xz] [eft]d[rs]. ^[erx][erx]([erx]|[erx]) [gty]op ^c[ce] \
[bcdfjkmpsvx]f?[ex][bcdfjkmpsvx]f?[ex] [ch][ch]u ^[rsz]w po(popo)?[uw] [lqx][aku]?[ak](j')?[lqx] \
(?=t?tt[no]) [af]h+($) ibl ([rw]e){1,3}g [fkz][a-z][rx]($) [cp]o[cp]h [ilouy]d[ilouy]m \
[or][or](rc)?[cq][or] [fjt][a-z][bt]([bx](ui)?x)?[bt] [ix]sa(?!v+($)) [cin]o[is][is]?[is] \
[aou][a-z][op][op]?[op] ^[ct]i ^[abjn]y [is][is]c(?![rs]) [des][des][des]?[des][des] in(ni($))?t \
^[denw][denw](''[jk]+[jk])?[qrw] [ghlmnqrstwz]ye ^[dyz]u [akr]t' ^[kq]o [bl]n [nor]a[nor]g \
[s'][s']' [gn][gn]([jw][jw](tu)?[jw])?[gn] [en][aeiouy][en][aeiouy] [ae][ae]t [gjw]o[koq] [jn]b \
[cw][ai]v ^[aei]([qs]ub)?[aei] man($)($) [cex]ut [vxz]u [abcdefghiklmnopqrstuvwxyz]j [os][os]f \
[ry']di [adp]([is]|n|[is])[jtw]r [des][bdz]r [jkm][adeghlmnqrtwz]s [rtw]y[rtw] s[aef]p \
[adeiouy][adeiouy][gjw]h b[oz]([bx]g)?[oz] form [uxy][uxy]($) [ai][ai]b [qsu][aj]n \
[bcdfjkprsvx][bcdfjkprsvx]c [oq][oq]d [et][et]a j[bcdefghjklmnpqrstvwxz] [aef]l[aef] ([gy]h)+[dgt] \
[au][au](?!(w|w)+w)l [lx][lx]' \
[bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz]([bcdfhjklmnpqrstvwxz]|[bcdfhjklmnpqrstvwxz]) \
[anu]lo [adeiouy][adeiouy]i[adeiouy] [oq]p[oq] li[aeiouy] [ekx]e[sw][bcdfghjklmnpqrstvwxz] \
([pt][pt]a){1,3}?[aeghklmnqrtuwz] [afj]{2,5}[afj] [fn]a[fn] [mnz][a-z][sw]a(?!(w|w)+w) [nrsw]a[ev] \
tie [it][it]d ule [ns][ns][ns]?[ns] [hr]d($) able[bcdfghjklmnpqrstvwxz] \
[bcdfghjklmnpqstvwxz][bcdfghjklmnpqstvwxz]v (?=[oz])[ilouy][ilouy]m [ly]([ly]|[ly])l \
[qrwy]{2,5}?[qrwy] n[bjt]h [or]([or]|[or])[tvw]($) [bcdfghjklmnpqrstvxz]it($) [ad]p[ad] \
[aeimouy][aeimouy]i [dm]y($) [hn]il [fy]h ^[nrw]u [gjw]([jw]|v|v) [nor][nor][nor]d \
^[abcefgijklmnopqrstuvwxyz]f \
[bcdfgjkpsvx]a[abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]i \
[ep]h[ep] [aehiouy][aehiouy]([ahrw]|[ahrw])k [bcdefghijklmnopqrstuvwxyz']dn [ep]b \
[aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][bcdfghjklmnpqrstvwxz] \
([sz][sz](lenesses($))?[sz]s($))?[ad]j [at]ib ^[gqw]i [oqu].[di]i [rs][lty]l [aeioquy][rw]i \
[iz]g[aeouxy] orm(?![bq]?[bq])($) [xz]at [ac]im \
[abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]c \
[msz]if [qw](?!me)n($) gis [cdfghjklmnpqrstvwxz]l[cdfghjklmnpqrstvwxz] [agl]y(?=[dm]) [an][an](r|r) \
ong [ru]u[aeghlmnqrtwxz](iac($))?[aeghlmnqrtwxz] [jkp][aeiouy]b [anu][anu]v [pw]d [jkm]i($) \
^[aeghlmnqrstwz][aeghlmnqrstwz]([xz]|[xz]) [jt].[jt]. [qs]h($) [in][in]l \
[hlm][iz][bcdfghjklmnpqrstvwxz]m \
[aeghlmnqrtwxz][aeghlmnqrtwxz][aeghlmnqrtwxz][aeghlmnqrtwxz][aeghlmnqrtwxz]p [prv]i[pw]. [hn]oc \
[aeinouy]([eh]b)?[aeinouy][aeinouy][aeinouy]i [cg']y([cg']|[cg']) ^[dhv][bcdfghjklmnpqrstvwxz] \
s[or](rh)?[cq] [is][is](x|x|x|($)|x|x|x|x|($)) [egt][egt]h ^[hu][hu](?!e{1,4}?f) [st]{2,5}?[st] \
y[bx] [hijw]c[hijw] ^[bmo]p [en][en]v [ar][ar][ar][bcdfghjklmnpqrstvwxz] [hi]o[hi] [x']o [eq]o \
[iz][iz][iz](?![rw]) ^[aeghlmnqrtvwz]p [kt]ec [cdz]h($) ite. o[inq]t \
[imx][abcdefgijklmnopqrstuvwxyz][abcdefgijklmnopqrstuvwxyz][abcdefgijklmnopqrstuvwxyz]f \
[s'][s'][aeiouy] t[aeix]a [aeioquy][rw]h(?!me) [pru]h($) [bry][bry]y ono ola [kqu][dh](pu)?[ipw] \
[eoqx]j ^[is]k [aehiouy][qw]{0,4}[qw]($) [iq]s($) \
[abcdefghijklmopqrstuvwxyz'][abcdefghijklmopqrstuvwxyz']n[abcdefghijklmopqrstuvwxyz'][abcdefghijklmopqrstuvwxyz']n \
[ls]op [qw]n+[aeiouy] [ox]h e[ct]o [abcdefghijklmopqrstuvwxyz'](?![jw]?[dh]x)der($) \
([bx](yx)?[bx]){1,4}?[et] [gox][rw]?[rwx][gox] [ef][dh][ef] (?![jw][jw]z)(?!(?!e)e)ose($) \
[aeu]i[aeu] ^[adeiouy][adeiouy]i ([an]f)+[hjo] [aek][aek]g [fl][eu]y [jp]t [aeiouy][bg][aeiouy][bg] \
[aiouy][aiouy][aiouy][a-z] [muy](?!v+($))u([ct]|[ct]|(?=f{0,10}x)) \
(p[hl]){1,3}[bcdfghjklmnpqrstvxz] [ckv]a[ckv] ^[aq]e [js]y [bi]m($) m.[bm] \
[pr][pr][pr].(?!scopic($)) [it][it]s [aeimouy][jl]b \
[abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]rr?r ^[hor]c \
[ak]ed($) [tw']e[tw'] ^[eqv]r [ejw](?![jvw])[rw]a [qu]q{0,3}?($) [bfl][bfl]e($) [at][ixz]p \
[nu][nu]h [iz].[iz]v [euw][bcdfghjklmnpqrstvwxz][oq](?!i{0,2}w)n [jtv]e(?=[pqw]) [hi']p[hi'] \
[uw]p[lo](?!(w|w)?w) (?=der($)) [cnrw][fl][fl]?[fl] [hn]ec \
[bdfhijkopsuvxy][bdfhijkopsuvxy][bdfhijkopsuvxy][bdfhijkopsuvxy][bdfhijkopsuvxy]p \
[cru](og($)){0,20}[qw][cqw]?[cru] [aeiouy][cs]p rd's [jn]f [rs]o[rs]o [ar]a[ar] [lxy]d($) \
[pru]t[ns][a-z] [arv][arv]o(?![mqw]) [lz](?![jn]b)z [cr](?!z{1,3}?x)f [amrw]yp [doq][doq]r \
[rw](?!me)k($) [aes'][aes']h [hor]q i[brx]u e[lmu]u [aev]c[aev](pt($))?[rx] ones [ervw][ervw]d($) \
[gjw][lqx]a [cqt]([a-z][st])?[cqt][a-z][st] [rw](z|j|z) [xz]'s($) ile (nd's($))+($) [dtw]o[hu] \
[bfn][cn]u [s']u[s'] [hy]([hy]|[hy])($) ([at][at]r){1,3}[adeghlmnqrtwyz] n(?!e[jw])ic($) \
[doq][gjw]($) [bfr]c [norw]c[norw] [anv][gq]u [doq]m[doq] [nor][nor]ca [ns][ce']r?[kq] \
([rw]s){1,3}[aeghlmnqrtwz'] [pr][pr][bcdfghjklmnpqrstvwxz] [et]k [emt][emt]w [oqwz]d($) \
([abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]i)+[bqr] \
[aeghlmnqrtwxz]([en]|[jp]|land's($))[aeghlmnqrtwxz]p [y'](?!(uf)?[jw])b [aej]ly \
[ovw][ovw]?[ovw][aq]. ([acf]|[acf])[hjo]y [hr][hr][bcdfghjklmnpqrstvwxz] \
[ghlmnqrtwxz'][ghlmnqrtwxz'][an](sh)?[bq] ^[dyz][dyz]?[dyz] [rs]([qw]|p|x|f|e)[rs]([qw]|p|x|f|e) \
[inz][a-z][bq][lq]?[lq] ^[bl]([qx]b)?[bl] [np]v [hruw][hruw]c [nu]r[tw] ^[xz](sj)?[ho] [hn][hn]($) \
[dghlmnqrtwz][dghlmnqrtwz]r [cg']te [ai]ly \
[abcdefghijklnopqrstuvwxyz][abcdefghijklnopqrstuvwxyz]h[abcdefghijklnopqrstuvwxyz][abcdefghijklnopqrstuvwxyz]h \
^[nrw][bcdfghjklmnpqrstvwxz] [epv][epv]s [iouy]f[lp]. ([di].){2,5}[ouz] [ejk]d[abk] ^[norw]s \
[oq](?!(w|w)+w)e [afj][afj]?[afj]($) [aehiouy][aehiouy]x e[ervw]k [bcdfghjklmnpqrstvwxz][ft]y \
[ajw][ajw]c [aeghlmnqrtwz][aeghlmnqrtwz]a[aeghlmnqrtwz][aeghlmnqrtwz]a [bcdfghjklnpqrstvwxz]ness($) \
([aehiouy][aehiouy]c)+[crs] [kru]g($) [vw]([bd]|[bd]|[bd]|[bd]) [nw]e[nw] \
([abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]a){2,5}[bqr] [aiouy][aiouy]v [bhn][bhn]y \
[kw]'s($) gh[aeiouy] [abcdefghijklmopqrstuvwxyz']y[abcdefghijklmopqrstuvwxyz']y [nor][nor][nor]l \
n(ni($))?[rw] ^[ce]t ^[aht]t [ace][ace]al [an]c[an] [hx][ajmn]b \
[bcdfghjklmnpqrsvwxz][bcdfghjklmnpqrsvwxz]f [kxz]{1,4}[kxz] \
[euw][a-z][oq][oq][bcdfghjklmnpqrstvwxz] [giz]e[giz] [crs]de d[lq] g[dw] ((?=up)up){1,9}?[hmo] nel \
logist [lmu][iy]r \
[aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz]c [jmx]+t \
[enq][enq]g [aey'][aey'][qw]?[gx] i[adeiouy][adeiouy]c ^[fgo]t ^[io]o [df]h [ah'][tz]u \
[bcdefjkpsvx'][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz]c ^[iz]l \
[bgl]{2,5}[bgl] ^[a-z][ag]y [knu]([hj]s($))?[knu]($) ^[xy](um)?[ax] \
[bdfhijkopsuvxy][bdfhijkopsuvxy]v [rw]es($) [qs'][qs'][bcdfghjklmnpqrstvwxz] [x']p \
[bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz]c u[abcdefghijklmnoprstuvwxyz]y [htu][htu]b [w'].[w'] \
k(?=(ts)?[jw])[rw] ([dr]n)+[bcdfghijklmnopqrstuvwxyz] [tv]m [l']g [ty]s[alnx] \
[bdfhijkopsuvxy][bdfhijkopsuvxy][bdfhijkopsuvxy][bdfhijkopsuvxy]c \
[bcdfijknopsuvxy'][bcdfijknopsuvxy'][bcdfijknopsuvxy']x [bgi][bgi][qsw]{0,3}($) \
[anw'](?!(ud)?[jw])[anw']p [gy]?z($) ([ax](?!me)(sh)?[bq])+[rx'] [aesx]cy \
v[abcdefghijklmnopqrstvwxyz']u ability ^[qux]r \
[abcdefghijklmnopqstuvwxyz]r[abcdefghijklmnopqstuvwxyz]r [fk][aeiouy]p [hjk]m(?=[agx]) \
(?!i{0,2}w)[oq]nn [n']p [oq]s($) [hno][hno][hno]n [s']d \
[bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz]y \
[bcdfghjklmnpqrsvwxz][bcdfghjklmnpqrsvwxz]b y[ft] [des][des]w \
[aeoy][aeoy][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][bcdfghjklmnpqrstvwxz] \
[bmy]u[bmy]?[bmy] [ft][bcdfijknopsuvxy'][bcdfijknopsuvxy']d \
[bcdfghjklmnpqrsvwxz][bcdfghjklmnpqrsvwxz]([jp]|[jp]) [aehioy]a[kn]g \
[aeghlmnqrtwz](?![xz][xz](yj)?[xz])[aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz][aeghlmnqrtwz]g \
^[qs][qs]?[qs] [bcdfghjklmnpqrtvwxz]m[bcdfghjklmnpqrtvwxz] [t']f \
[abcdefghijklmnopqstuvwxyz]n[abcdefghijklmnopqstuvwxyz]n \
[bcdfghjklmnpqrstvxz][bcdfghjklmnpqrstvxz]t [ny]{1,3}q (le's($))?[pt][acz]e \
[bcdfijknopsuvxy']e[bcdfijknopsuvxy']g [bcdfghjklmnpqrsvwxz][bcdfghjklmnpqrsvwxz]m \
^[ftw]([qwx]h($))?[ftw] [cnt][cnt]h($) \
[abcdefghijklmnopqstuvwxyz]u[abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]g [qty][iq]t \
([aeghlmnqrtwz]p)+[crz] [vz][bcdfghjklmnpqrstvwxz] (?!([qw]|[qw]))[y'][aeiouy]($) [eq]h [x']c \
[kx].c (us)?itis($) \
[abcdefghiklmnopqrstuvwxyz][abcdefghiklmnopqrstuvwxyz][abcdefghiklmnopqrstuvwxyz]j [js]v \
^[adeiouy]((?=(tu)?(tu)?[jw])|[qw]|[qw][qw]q|[qw]) \
([abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]y)+[bry] \
[fnr]f[fnr] man($)($)($) (?!f{0}x)[gp][a-z](?!f{0}x)[gp][a-z] [lz]i([lz]|[lz]) [y'][a-z][ceg] \
[eov]u[aeiouy] [blx]h [ghlmnqrtwz][ghlmnqrtwz](tl)?[ghlmnqrtwz]($) [ioquy][de]m \
^[bcdfijknopsuvxy']d \
[aeghilmnqrtwxz][aeghilmnqrtwxz][aeghilmnqrtwxz][aeghilmnqrtwxz][aeghilmnqrtwxz][aeghilmnqrtwxz][aeghilmnqrtwxz]b \
[sz][a-z][sz][a-z] [aiouy][aiouy](oot($))*[qw] m[ace]m [lq].[lq] ^(?!z)[bcfghjklmnpqrstvwxz]m \
([pr]([jw][jw]q(?!e))?[pr]){1,4}[quvw] [s'][aeiouy][s'][aeiouy] [dy]v [byz]z \
([xz][bcdfghjklmnpqrstvwxz])+[rtw] ^[lry]([lry]|[lry]) [bcdfjkpsv]m[bcdfjkpsv] [qu']o \
[ov][ov][bcdfghjklmnpqrstvwxz]($) ^[ly][bcdfghjklmnpqrstvwxz] (?=ville($)) eless [jr']v ^[doq]n \
[lq']m [xz]{1,3}[gxz] ^(?!(w|w)?w)q s[bjt]h \
^[bcdfghjklmnpqrsvwxz][bcdfghjklmnpqrsvwxz][bcdfghjklmnpqrsvwxz]. w[ervw]i \
[bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz]g(?!z) [pt][crw][bcdfghjklmnpqrstvwxz] [uw]u \
^[lquw]([lz]|w|w|($)) nes(?!v+($))($) [x'](ba($))?[x'] u[hqw] [adeghjlmnqrtwz]c($) \
(?!a[aeiouy])[bcdfghjklmnpqstvwxz]j [btx]d ^[abcdfghijklmnopqrstuvwxyz']k [bq](?!e)t \
^[abeghlmnoqrtwz]g [bcdfghjklmnpqrstvwxz][bcdfhjksvx]k [pr][pr]([rw]|[rw]|(?=tu)) ^[ks]k \
[bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz][bcfghjklmnpqrstvwxz][bcdfghjklmnpqrstvwxz] \
^[cin]t [hx']?^x [oq][aeiouy](x|x|x|x|($)|x|x|x|x|($)|(?=ur)) [lqv]n \
([hx](?![jw])[bcdfghjklmnpqrstvwxz])+[anw'] [gmqw]([qw]|[bcdfghklmnpqrstvwxz])l [efj]b [t']b \
[cg']?[cg'][cg']([aj]|[km]|n|[aj]) ^[dry][bcdfghjklmnpqrstvwxz] [hjxz]l [rv]f \
([abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]y){1,3}[efx] \
[cdfghjklmnpqrstvwxz][cdfghjklmnpqrstvwxz][cdfghjklmnpqrstvwxz]l [bmy]([jw]z(?!e))?[kx] \
[bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz]d [p']n [xz'].[xz'] [bcdfghklmnpqrstvxz]r($) [dfz]h \
[bcdfjkmpsvx]([xz]v)?[xz] [bcfjkprsvx]j [kqv]{1,3}[kqv] [bmy][bmy]?[bmy][bmy]?[bmy] \
([abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]i){2,5}[fghlmnqrtwxz] \
^[hz][bcdfghjklmnpqrstvwxz] ^[lq][bcdfghjklmnpqrstvwxz] w[bcdfjkpsv] ^[inq]t b[cjm] \
[bcfgijkopsuvxy'][bcfgijkopsuvxy']x .[kv].[kv] (?![qw](x|x|x|x|($)|x|x|x|x|($)))[hkm]k [dk]v [hi']h \
[vz]{1,3}[cg'] \
[bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz][bcdfhjklmnpqrstvwxz]($) \
[ghlmnqrtwxz'][ghlmnqrtwxz']([ghlmnqrtwxz']|[ghlmnqrtwxz'])($) \
[bcdfghklmnpqrstvxz]r[bcdfghklmnpqrstvxz] [jv']+($) [vz']u ^[hx'][bcdfghjklmnpqrstvwxz] \
[abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]j \
[vy]{1,4}[vy] [bcfjkpsvx]g [bdfhijkopsuvxy][bdfhijkopsuvxy]q (ster's($))?[qw][crw] [ghlmnqrtwz']j \
q[abcdefghijklmnopqstuvwxyz][bcdfghjklmnpqrstvwxz] [hxz](onic($))?[qw] \
[bcfhjklmnpqrstvwxz][bcfhjklmnpqrstvwxz][bcfhjklmnpqrstvwxz]([jw]w?y)?[kl] \
[abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz][abcdefghijklmnopqstuvwxyz]j [iq](mr)?[jw] \
'[bcdfhjklmnpqrstvwxz][aeiouy] 's[bcdfghjklmnpqrstvwxz] \
".trim();

var rules = pack.split (/[ \s]+/);

exports.init = function (data) {
	rules.forEach (
		function (value, index, array) {
			array [index] = new RegExp(value);
		}
	);
};

exports.test = function (str) {
	var i;
	var n =0;
	for (i=0; i<rules.length; i++)
		if (rules[i].exec (str)) n++;

	if (n > 5) return false;

	return true;
};