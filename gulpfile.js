const { src, dest, watch, parallel, series } = require('gulp');
const fileInclude = require('gulp-file-include');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
const prettier = require('gulp-prettier');
// const imagemin = require('gulp-imagemin');
const del = require('del');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();

sass.compiler = require('node-sass');


function distHTML() {
  return src('src/**/*.html')
    .pipe(
      fileInclude({
        basepath: 'src/components/',
        context: {
          prefix: '@@',
          URL: '',
        },
      })
    )
    .pipe(dest('dist'));
}
function distCSS() {
  const plugins = [autoprefixer()];
  return src('assets/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest('dist/assets/css'));
}

function clean() {
  return del('build', 'dist');
}

function bulidHTML() {
  return src('src/**/*.html')
    .pipe(
      fileInclude({
        basepath: 'src/components/',
        context: {
          prefix: '@@',
          URL: '',
        },
      })
    )
    .pipe(dest('build'));
}
function validate() {
  return src('build/**/*.html').pipe(prettier()).pipe(dest('build'));
}
function copy() {
  return src('assets/!(sass)**/**').pipe(dest('build/assets'));
}

function bulidCSS() {
  const plugins = [autoprefixer()];
  return src('assets/sass/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest('build/assets/css'));
}

// function optimizeImg() {
//   return src('assets/img/*').pipe(imagemin()).pipe(dest('build/assets/img'));
// }

function watches() {
  watch('src/**/*.html', series(distHTML, browserReload));
  watch('assets/sass/**/*.scss', series(distCSS, browserReload));
  watch('assets/js/*.js', browserReload);
}

function browserReload(cb) {
  browserSync.reload();
  cb();
}

function server() {
  browserSync.init({
    server: {
      baseDir: '/',
      routes: {
        '/': 'dist',
        '/assets/fonts': 'assets/fonts',
        '/assets/js': 'assets/js',
        '/assets/img': 'assets/img',
      },
    },
  });
}

exports.default = series(distHTML, distCSS, parallel(watches, server));
exports.build = series(clean, bulidHTML, bulidCSS, validate, copy);
