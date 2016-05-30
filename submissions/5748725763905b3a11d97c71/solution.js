const ALPHABET = "abcdefghijklmnopqrstuvwxyz'=",
  ASIZE = ALPHABET.length,
  TSIZE = Math.pow(ASIZE, 4);

exports.init = function(data) {
  [table0, table1, table1excPe, table1excNe] =
  data.toString().trim().split(' ').map(dataString => {
    let table = [];
    for (let s of dataString.split('|'))
      for (let c of ALPHABET)
        table.push(s.indexOf(c) != -1);
    return table;
  });
}

exports.test = function(word) {
  const w = `=${word}=`;
  if (w.length == 4)
    return table0[w];
  for (let cs of zip(...[0, 1, 2, 3].map(i => w.slice(i))))
    if (!table0[index(cs)])
      return false;
  const table1ExcE = w.indexOf('e') != -1 ? table1excPe : table1excNe;
  for (let cs of zip(...[0, 4, 6, 9].map(i => w.slice(i)))) {
    let ics = index(cs);
    if (!table1[ics] || table1ExcE[ics])
      return false;
  }
  return true;
}

function index(cs) {
  return Array.prototype.reduce.call(cs, (a, c) => a * ASIZE + ALPHABET.indexOf(c), 0);
}

function* zip(...args) {
  let its = args.map(xs => xs[Symbol.iterator]());
  while (true) {
    let xs = [];
    for (let it of its) {
      let {value, done} = it.next();
      if (done)
        return;
      xs.push(value);
    }
    yield xs;
  }
}