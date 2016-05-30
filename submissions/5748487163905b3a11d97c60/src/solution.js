// Those guys will be available in the global namespace:
// b - bloom filter factory
// p - processors

e = exports;

/**
 * @param d {Buffer}
 */
e.init = d => f = b(d);

/**
 * In case the length of processed word is <= 3 chars return false without asking the bloom filter.
 * @param w {string} Word to check
 * @returns {boolean} Whether the test word is valid or not
 */
e.test = w => !!(r = 0) || p(w,
  m => (r = !m[3]) || f(m),
  m => !r && f(m));
