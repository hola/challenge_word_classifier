import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

import { minify } from 'uglify-js-harmony';

export default {
  entry: 'index.js',
  dest: 'bundle.js',
  format: 'cjs',
  plugins: [
    commonjs(),
    uglify({}, minify),
    filesize()
  ]
};
