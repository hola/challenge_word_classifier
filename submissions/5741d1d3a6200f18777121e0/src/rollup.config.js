import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'

export default {
  entry: 'main.js',
  dest: 'solution.js',
  format: 'cjs',
  plugins: [ commonjs(), buble(), uglify() ]
}
