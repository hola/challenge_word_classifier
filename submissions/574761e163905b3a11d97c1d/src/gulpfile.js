var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('js', function(){
  return gulp.src('hola/task.js')
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(gulp.dest('hola/'));
});

gulp.task('watch', function() {
  gulp.watch('hola/task.js', ['js']);
});

gulp.task('default', ['js', 'watch']);