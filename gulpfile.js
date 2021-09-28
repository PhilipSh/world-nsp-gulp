const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const fileinclude = require('gulp-file-include');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'dist',
    },
  });
}

function cleanDist() {
  return del('dist');
}

function processImages() {
  return src('app/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(dest('dist/img'));
}

function processFonts() {
  return src('app/fonts/**/*').pipe(dest('dist/fonts'));
}

function processScripts() {
  return src([
    // 'node_modules/jquery/dist/jquery.js',
    'app/js/main.js',
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}

function processStyles() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true,
      }),
    )
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function processHtml() {
  return src(['app/*.html'], { base: 'app' })
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file',
      }),
    )
    .pipe(dest('dist'));
}

function watching() {
  watch(['app/fonts/*'], processFonts);
  watch(['app/img/*'], processImages);
  watch(['app/js/*.js'], processScripts);
  watch(['app/scss/*.scss'], processStyles);
  watch(['app/*.html', 'app/components/*.html'], processHtml).on('change', browserSync.reload);
}

exports.build = series(cleanDist, processImages, processFonts, processHtml, processStyles, processScripts);
exports.watch = parallel(
  processImages,
  processFonts,
  processHtml,
  processStyles,
  processScripts,
  browsersync,
  watching,
);
