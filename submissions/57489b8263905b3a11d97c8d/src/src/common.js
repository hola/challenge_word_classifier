/**
 * Created by kriz on 24/05/16.
 */

export const Nbits = 500 * 1024;

const FNV_32_PRIME = 0x01000193;
const FNV_HVAL = 0x811c9dc5;

export function get_hash( str )
{
    var FNV1_32A_INIT = 0x811c9dc5;
    var hval = FNV1_32A_INIT;
    for ( var i = 0; i < str.length; ++i )
    {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
}

export function calc_bitpos(word, mod) {
    return get_hash(word) % mod;
}

//------------------------------------------------------------
// Функции нормализации

// отрезаем все "s" и "'" на конце - таких в словаре дофига (146617), при чём часто слово с "s" и "'s" дублируется и без него
export function cut_apos_s(w) {
    let n = 0;
    while (w.endsWith("s") || w.endsWith("'")) {
        w = w.substr(0, w.length - 1);
        n++;
        if (n > 2)
            break;
    }

    return w
}
// отрезает прочие английские окончания
// - регулярка сгенерена скриптом gen.py
const tails_re = /(nesse|ation|ingly|ville|ising|ally|able|like|ment|ling|iest|ship|ting|itie|ised|ical|snes|ing|sse|ism|nes|ist|ine|sly|sne|ity|man|ise|ier|ian|ite|ted|ate|ish|les|led|ful|ion|est|rie|ter|age|men|ler|ton|ily|ly|ed|ne|se|er|al|ic|le|ie|te|an|ia|st|ry|on|ou|in|en|ta|ae|ng|na|re|et|nt|la|el|ra|or|id|ty|ee|um|de|d|e|r|y|a|s|n|t|l|i|o|u|c|h|m|g|p|k|b|f)$/;
//const heads_re = /^(trans|count|hyper|micro|super|inter|comp|mono|unco|nonc|hype|coun|tran|poly|micr|para|semi|unde|supe|anti|inte|over)/;
export function cut_some_tails(w) {
    while (w.length > 7) {       // подобрано вручную, не менять
        const o = w;
//        w = w.replace(heads_re, '');
        w = w.replace(tails_re, '');
        if (w == o || !w.endsWith('s') && !w.endsWith("'"))
            break
    }

    return w
}

// нормализовать слово
export function norm_word(w) {
    w = cut_apos_s(w);
    w = cut_some_tails(w);
    return w;
}

// Простая эвристика, которая позволяет отсечь мусор.
// Слов с апострофами в середине очень мало (401 ~ 0.06%), поэтому проще их выкинуть без риска,
// зато получить больше гарантий хороших срабатываний на тесте.
export function is_apos_ok(w) {
    const c = w.split("'").length - 1;
    if (c == 0)
        return true;

    if (c > 1)
        return false;

    if (w.endsWith("'") || w.endsWith("'s"))
        return true;

    return false
}

