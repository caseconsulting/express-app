'use strict';

// Install: you must install gulp both globally *and* locally.
// Make sure you `plugins npm install -g gulp`

/**
 * Dependencies
 */

var plugins       = require('gulp-load-plugins')({ lazy: true });
var del           = require('del');
var gulp          = require('gulp');
var pngquant      = require('imagemin-pngquant');
var terminus      = require('terminus');
var runSequence   = require('run-sequence');
var taskListing   = require('gulp-task-listing');

require('gulp-task-list')(gulp);

/**
 * Banner
 */

var pkg = require('./package.json');
var banner = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' */',
  ''
].join('\n');

/**
 * Paths
 */

var paths = {
  clean: [
    'public/js/**/*.js',
    'public/js/**/*.map',
    'public/js/**/*.min.js',
    '!public/js/main.js',            // ! not
  ],
  js: [
    // ============= Bootstrap  ================
    // Enable/disable as needed but only turn on
    // .js that is needed on *every* page. No bloat!
    // =========================================
    'public/lib/jquery/dist/jquery.js',
    'public/lib/bootstrap/js/transition.js',
    'public/lib/bootstrap/js/alert.js',
    // 'public/lib/bootstrap/js/button.js',
    // 'public/lib/bootstrap/js/carousel.js',
    'public/lib/bootstrap/js/collapse.js',
    'public/lib/bootstrap/js/dropdown.js',
    // 'public/lib/bootstrap/js/modal.js',
    // 'public/lib/bootstrap/js/tooltip.js',
    // 'public/lib/bootstrap/js/popover.js',
    // 'public/lib/bootstrap/js/scrollspy.js',
    // 'public/lib/bootstrap/js/tab.js',
    // 'public/lib/bootstrap/js/affix.js'
    //'public/js/main.js'
  ],
  lint: [
    'config/**/*.js',
    'routes/*.js',
    'models/*.js',
    'app.js',
    'gulpfile.js'
  ],
  less: [
    'less/bootstrap.less',
    'less/style.less',
    'less/main.less',
    'less/colors.less',
    'less/page-analysis.less',
    'less/page-dashboard.less'
  ]

};

/**
 * Clean
 */

gulp.task('clean', function () {
  return del(paths.clean);
});

/**
 * Process CSS
 */

gulp.task('styles', function () {
  return gulp.src(paths.less)               // Read in Less files
    .pipe(plugins.less({ strictMath: true }))     // Compile Less files
    .pipe(plugins.autoprefixer({                  // Autoprefix for target browsers
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(plugins.csscomb())                      // Coding style formatter for CSS
    .pipe(plugins.csslint('.csslintrc'))          // Lint CSS
    .pipe(plugins.csslint.formatter())             // Report issues
    .pipe(plugins.rename({ suffix: '.min' }))     // Add .min suffix
    .pipe(plugins.csso())                         // Minify CSS
    .pipe(plugins.header(banner, { pkg : pkg }))  // Add banner
    .pipe(plugins.size({ title: 'CSS:' }))        // What size are we at?
    .pipe(gulp.dest('./public/css'))        // Save minified CSS
    .pipe(plugins.livereload());                  // Initiate a reload
});



/**
 * Process Scripts
 */

gulp.task('scripts', function () {
  return gulp.src(paths.js)                 // Read .js files
    .pipe(plugins.concat(pkg.name + '.js'))       // Concatenate .js files
    .pipe(gulp.dest('./public/js'))         // Save main.js here
    .pipe(plugins.rename({ suffix: '.min' }))     // Add .min suffix
    .pipe(plugins.uglify({ outSourceMap: true })) // Minify the .js
    .pipe(plugins.header(banner, { pkg : pkg }))  // Add banner
    .pipe(plugins.size({ title: 'JS:' }))         // What size are we at?
    .pipe(gulp.dest('./public/js'))         // Save minified .js
    .pipe(plugins.refresh());                  // Initiate a reload
});
/**
 * Process Images
 */

gulp.task('images', function () {
  return gulp.src('images/**/*')            // Read images
    .pipe(plugins.changed('./public/images'))        // Only process new/changed
    .pipe(plugins.imagemin({                      // Compress images
      progressive: true,
      optimizationLevel: 3,
      interlaced: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./public/images'));       // Write processed images
});


/**
 * JSHint Files
 */

gulp.task('lint', function () {
  return gulp.src(paths.lint)               // Read .js files
    .pipe(plugins.jshint())                       // lint .js files
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

/**
 * JSCS Files
 */

gulp.task('jscs', function () {
  return gulp.src(paths.lint)               // Read .js files
    .pipe(plugins.jscs())                         // jscs .js files
    .on('error', function (e) {
      plugins.util.log(e.message);
      plugins.jscs().end();
    })
    .pipe(terminus.devnull({ objectMode: true }));
});


/**
 * Build Task
 *   - Build all the things...
 */

gulp.task('build', function (cb) {
  runSequence(
    'clean',             // first clean
    ['lint', 'jscs'],    // then lint and jscs in parallel
    ['styles','scripts','images' ],        // etc.
    cb);
});

/**
 * Nodemon Task
 */

gulp.task('nodemon', ['build'], function (cb) {
  plugins.refresh.listen();
  var called = false;
  plugins.nodemon({
    script: 'bin/www',
    verbose: false,
    env: { 'NODE_ENV': 'development', 'DEBUG' : 'http' },
    // nodeArgs: ['--debug']
    ext: 'js',
    ignore: [
      'gulpfile.js',
      'public/',
      'views/',
      'less/',
      'node_modules/'
    ]
  })
  .on('start', function () {
    setTimeout(function () {
      if (!called) {
        called = true;
        cb();
      }
    }, 3000);  // wait for start
  })
  .on('restart', function () {
    setTimeout(function () {
      plugins.refresh.reload();
    }, 3000);  // wait for restart
  });
});

/**
 * Default Task
 */

gulp.task('default',['nodemon'], function () {
  gulp.watch(paths.less, ['styles']);
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.lint, ['lint', 'jscs']);
  gulp.watch('views/**/*.jade').on('change', plugins.refresh.changed);
});

gulp.task('list', taskListing);
