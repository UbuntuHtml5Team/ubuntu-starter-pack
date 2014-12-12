/* global require:false */
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserify = require('browserify');
var watchify = require('watchify');
var transform = require('vinyl-transform');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var karma = require('karma').server;
var packager = require('ubuntu-webapp-packager');

// Define if building for dist or for development.
var dist = false;

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var filter = $.filter(['**/*.css']);
  var assets = $.useref.assets();
  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml()))
    .pipe(filter)
    // .pipe($.csso())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(filter.restore())
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Browserify in Debug mode, including source maps.
gulp.task('watchify', function () {
  var bundler = watchify(browserify('./app/scripts/main.js'), {
    debug: !dist
  }).transform('jstify', { engine: 'lodash' });

  var bundle = function () {
    return bundler
      .bundle()
      .on('error', $.notify.onError({
        message: 'Watchify Error: <%= error.message %>'
      }))
      .pipe(source('main.js'))
      .pipe($.if(dist, $.streamify($.uglify())))
      .pipe(gulp.dest( dist ? 'dist/scripts' : '.tmp/scripts' ))
      .pipe(reload({stream: true, once: true}));
  };

  bundler.on('update', bundle);
  return bundle();
});

// Lint javascript files
gulp.task('jshint', function () {
  return gulp.src([
    'app/scripts/**/*.js',
    '!app/scripts/libs/*.js'
    ])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimise images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy static assets in dist
gulp.task('copy', function () {
  return gulp.src([
      'app/*',
      '!app/*.html'
    ], {
      dost: true
    })
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy third party libraries (globals)
gulp.task('copy:libs', function () {
  return gulp.src([
      'app/scripts/libs/*.js'
    ])
    .pipe($.uglify())
    .pipe(gulp.dest('dist/scripts/libs'))
    .pipe($.size({title: 'copy:libs'}));
});

// Copy application fonts
gulp.task('fonts', function () {
  return gulp.src([
      'app/styles/fonts/*'
    ])
    .pipe(gulp.dest('dist/styles/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Copy translations
gulp.task('translations', function () {
  return gulp.src([
      'app/translations/**/*'
    ])
    .pipe(gulp.dest('dist/translations'))
    .pipe($.size({title: 'translations'}));
});

// Process sass and output css
gulp.task('styles', function () {
  return gulp.src([
    'app/styles/**/*.scss'
    ])
    .pipe($.plumber())
    .pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.sass({
      precision: 10
    }))
    .on('error', $.notify.onError({
      message: 'SASS Error: <%= error.message %>'
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('.tmp/styles'));
});

// Run the unit tests using Karma
gulp.task('test', ['styles'], function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

// Watch Files for Changes & Reload
gulp.task('serve', ['styles', 'watchify'], function () {
  browserSync({
    notify: false,
    open: false,
    logPrefix: 'Podcast',
    // https: true,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.{js,html}'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'Podcast',
    // https: true,
    server: ['dist']
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  dist = true;
  runSequence('styles', ['html', 'jshint', 'watchify', 'images', 'fonts', 'copy'], cb);
});

gulp.task('ubuntu', ['default'], function () {
  packager('ubuntu-packager.json');
});

// Clean output directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));
