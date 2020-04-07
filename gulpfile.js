const { src, dest, watch, parallel, series, done } = require('gulp'),
        gulpif       = require('gulp-if'),
        del          = require('del'),
        autoprefixer = require('gulp-autoprefixer'),
        nunjucks     = require('gulp-nunjucks'),
        sass         = require('gulp-sass'),
        purgecss     = require('gulp-purgecss'),
        rename       = require('gulp-rename'),
        sourcemaps   = require('gulp-sourcemaps'),
        cleancss     = require('gulp-clean-css'),
        uglify       = require('gulp-uglify'),
        concat       = require('gulp-concat'),
        browserSync  = require('browser-sync').create()

const Paths = {
  DIST        : 'dist',

  SRC_HTML     : 'src/html/*.html',
  WATCH_HTML   : 'src/html/**/*.{html,njk}',

  SRC_CSS     : 'src/css/*.css',
  DIST_CSS    : 'dist/css',

  SRC_SASS    : 'src/scss/styles.sass',
  WATCH_SASS  : 'src/scss/**/*',

  SRC_JS      : 'src/js/**/*',
  DIST_JS     : 'dist/js',
  WATCH_JS    : 'src/js/**/*',

  SRC_IMG     : 'src/img/**/*',
  DIST_IMG    : 'dist/img',

  SRC_FONTS   : 'src/fonts/*',
  DIST_FONTS  : 'dist/fonts'
}


function scss() {
  return src( Paths.SRC_SASS )
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}))
      .on("error", sass.logError)
    .pipe(sourcemaps.write('.'))
    .pipe(dest(Paths.DIST_CSS))
    .pipe(browserSync.stream())
}

function purgestyles() {
  return src( Paths.SRC_SASS )
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(rename({
      suffix: '-purged'
    }))
    .pipe(purgecss({
      content: [
        Paths.DIST + '/*.html',
        Paths.DIST_JS + '/*js'
      ]
    }))
    .pipe(dest(Paths.DIST_CSS))
}

function js() {
  return src(Paths.SRC_JS)
    // .pipe(concat({path: "bundle.js"}))
    // .pipe(uglify())
    .pipe(dest(Paths.DIST_JS))
    .pipe(browserSync.stream())
}

// nunucks version
function html() {
  return src(Paths.SRC_HTML)
    .pipe(nunjucks.compile({}))
    .pipe(dest(Paths.DIST))
    .pipe(browserSync.stream())
}

function images() {
  return src(Paths.SRC_IMG)
    .pipe(dest(Paths.DIST_IMG))
    .pipe(browserSync.stream())
}

function fonts() {
  return src(Paths.SRC_FONTS)
    .pipe(dest(Paths.DIST_FONTS))
    .pipe(browserSync.stream())
}

function clean() {
  return del([
    Paths.DIST + '/**/*'
  ])
}

function cleanBuild(done) {
  return series(
    clean,
    parallel(html, js, scss, images, fonts)
  )(done)
}

function watchers() {
  browserSync.init({
    server: {
      baseDir: Paths.DIST,
    },
    ui: {
      port: 8080
    },
    notify: false
  })

  watch(Paths.WATCH_HTML, html)
  watch(Paths.WATCH_SASS, scss)
  // watch(Paths.WATCH_JS, js)
  watch('dist/**/*.*').on('change', browserSync.reload)
}

exports.html        = html
// exports.js          = js
exports.scss        = scss
// exports.purgestyles = purgestyles
// exports.images      = images
// exports.fonts       = fonts
exports.watchers    = watchers
exports.clean       = clean
exports.cleanBuild  = cleanBuild

exports.default = series(parallel(scss, html), watchers)
