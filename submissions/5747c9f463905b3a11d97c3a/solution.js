/*! UnknowingDetector v 1.0 by M.Drepin (2016) Specially for Hola

Осталось еще куча места, созавать readme.md лень, этож целая команда к терминале
Поэтому буду фигачить комментарий тут. Всем чмоки в этом чатике <3

Алгоритм двухуровневый:
    Первая ступень -- эвристика. Выдает 71.3 - 71.5%. Если забить data.gz данным для него до упора то выдаст 76%.
        Скучно и неинтересно.

    Вторая ступень -- обучается на основе входных данных
        Определение вхождения на основе отличающегося мат ожидания равновероятных выборок из наборов разной мощности.
        Детям в детском саду я бы объяснил так. Есть два мешка: вкусный, в нем 10 конфет, и горький, в нем 40 конфет.
        Из мешков достают конфеты, показывают вам и ложат обратно. Вы не видите из какого мешка вытаскивают, но должны это определить.
        Нам пообещали что в итоге покажут одинаковое кол-во конфет обоих типов. Т.е. 50 вкусных и 50 нет из 100.
        Сообразили? Правильно. Шанс увидеть вкусную конфету 5к1, а невкусную 5к4. Мир прекрасен!

    Наш размер выборки (общее кол-во слов) равен 630404. Обозначим его как х1.
    Сначала оба алгоритма работают последовательно, т.к. базе необходимо обучиться.
    При x5.68 она уже способна выдавать больше 71% правильных ответов и первая ступень отваливается (отлично видно на графике)
    База продолжает обучатся на протяжении всего периода работы.

    По моим расчетом, асимптотическая точность суммы алгоритмов при lim(cnt->∞) составляет 99,97%.
    Про кол-во запусков на хабре писали "Такое, какое потребуется, чтобы увидеть уверенную разницу между лидерами"
    Остановлюсь на этот моменте подробнее. В идеале x100, точность будет >95%.
    Но можно и х30, точность 90%. Менее x6 все плохо, точность 72%.

        множитель           Произведено проверок        Точность      Обученность базы
        < х1                до 630404                   ~71.5 %       0 %
        х6                  3 782 424                   ~78.4 %       82 %
        x10                 6 304 040                   ~84.3 %       93 %
        x1000               630 404 000                 ~98.6 %       99.998 % (прогноз из мат модели)

    Все вышеописанное в одном графике: http://i.imgur.com/IK3LCZ6.png
    Тут видна аппроксимация к 91%, она из-за того что я прогонял один и тот же массив из 6M слов много раз подрят.
    На генерирующихся данных все будет лучше.

    Основные ТТХ:
        Алгоритмическая сложность первой ступени: O(1);
        Алгоритмическая сложность второй ступени: O(n log n);
        Скорость работы алгоритма (core i7, 8Gb, SSD, Debian) 1M слов в минуту;
        Потребление памяти: < 2Gb на протяжении всего времени работы (после x20 начинается очистка от лишних слов);

    Любое решение, основывающееся на подобной идее, так же асимптотится к 100% и разница после будут доли процента.
    Поэтому если кто-то еще пришлет подобное решение то я, ничтоже сумняшеся,
    посоветую организаторам конкурса тестировать подобные моему алгоритмы не с привязкой к кол-ву слов,
    а с привязкой к длительности тестирования. Умение не просто обучатся, а делать это быстро.
    Кто больше слов съест и лучше обучится, того и тапки. Моему алгоритму оптимально час работы на адекватном железе.

    Спасибо за заковыристую задачку, это было интересно!)

               ____
              (.   \
                \  |
                 \ |___(\--/)
               __/    (  . . )
              "'._.    '-.O.'
                   '-.  \ "|\
                      '.,,/'.,,mrf
*/

let b2 = {}, g4 = {}, banned2 = {}, allowed3 = {};
let top = {}, viewed = {}, counter = 0, capacity = 630404;
exports.init = function(data){
    let active = undefined;
    data.toString().split('\n').forEach(function(line){
        if (line.startsWith('bnd2:')) { line.split(':')[1].split(';').forEach(function(el){ banned2[el] = 1 }); return }
        if (line.startsWith('alw3:')) { line.split(':')[1].split(';').forEach(function(el){ allowed3[el] = 1 }); return }
        if (line == 'b2='){ active = b2; return }
        if (line == 'g4='){ active = g4; return }
        if (!line.length) return;

        var [key, value] = line.split(':');
        value.split(';').forEach(function(token){
            key.split('').forEach(function(pos){
                if (!active[pos]) active[pos] = {};
                active[pos][token] = 1;
            });
        });
    });
};

exports.test = function(word){
    word = word.toLowerCase();
    if (word.length == 1) { if (word != "'") { stage2(word); return true } return false }
    if (word.length == 2) { if (!banned2[word]) { stage2(word); return true } return false }
    if (word.length == 3) { if (allowed3[word]) { stage2(word); return true } return false }
    if (!stage2(word)){ return stage1(word) }
    return true;
};

let stage1 = function(word){
    if (counter > capacity * 6){ return false; }
    for (let part of mute(word, 2)){ let [pos, token] = part; if (b2[pos] && b2[pos][token]) return false; }
    for (let part of mute(word, 4)){ let [pos, token] = part; if (g4[pos] && !g4[pos][token]) return false; }
    return true;
};

let stage2 = function(word){
    if (!viewed[word]) viewed[word] = 0;
    counter += 1;
    viewed[word] += 1;

    if (counter % Math.floor(capacity / 10) == 0) {
        top = {};
        let tmp = [];
        let percent = Math.min(counter / capacity, 1);
        let partition = Math.floor(Math.min(counter * percent / 4, capacity));

        if (counter >= capacity * 9 && counter / Math.floor(capacity / 10) % 25 == 0){  // rarely cleanup
            Object.keys(viewed).forEach(function(key){ if (viewed[key] <= 1) { delete viewed[key] } });
        }

        Object.keys(viewed).forEach(function(key){ tmp.push([viewed[key], key]) });
        tmp = tmp.sort(function(l, r){ return r[0] - l[0] }).slice(0, partition).forEach(function(el){ top[el[1]] = 1 });
        //console.log('Top>', counter, percent, partition, Object.keys(top).length, Object.keys(viewed).length);
    }
    return !!top[word];
};

let mute = function(word, window){
    let parts = [], cnt = ~~(word.length  / window) + (word.length % window ? 1 : 0);
    for (var i = 0; i < cnt; i++){
        var part = word.slice(i*window, (i+1)*window);
        if (part.length > 1) parts.push( [i, part] );
    }
    return parts;
};