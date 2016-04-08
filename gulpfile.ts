import * as gulp from 'gulp';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as seq from 'gulp-sequence';
import * as template from 'gulp-template';
import * as tsLint from 'gulp-tslint';
import * as tsLintStylish from 'gulp-tslint-stylish';
import * as nodemon from 'gulp-nodemon';
import * as karma from 'karma';
import * as sourcemaps from 'gulp-sourcemaps';
import * as inject from 'gulp-inject';
import * as slash from 'slash';
import * as tinylr from 'tiny-lr';
import * as openResource from 'open';
import * as uglify from 'gulp-uglify';
import * as cssnano from 'gulp-cssnano';
import * as gulpIf from 'gulp-if';
import * as childProcess from 'child_process';
import * as through2 from 'through2';
import * as loadCoverage from 'remap-istanbul/lib/loadCoverage';
import * as remap from 'remap-istanbul/lib/remap';
import * as writeReport from 'remap-istanbul/lib/writeReport';

import {PATHS, TSC_APP_OPTS, TSC_TEST_OPTS, PORT, LIVE_RELOAD_PORT, APP_ROOT, IS_PROD} from './tools/config';

const spawn = childProcess.spawn;

const FIRST_PATH_SEGMENT = /^\/?[^\/]*/;

function notifyLiveReload(modifiedFile: string) {
  tinylr.changed(modifiedFile);
}

function compileTs(src: string | string[], tscOpts: Object, cb?: Function) {
  const _meta = compileTs['_meta'];
  mapTsFiles(src, (files) => {
    const tscArgs = mapTscArgs(tscOpts);
    const procKey = `${src}`;
    if (_meta[procKey]) {
      _meta[procKey].kill();
    }
    _meta[procKey] = spawn(`node`, [`node_modules/typescript/lib/tsc.js`, ...tscArgs, ...files]);
    _meta[procKey].stdout.on('data', (data) => console.log(data.toString()));
    _meta[procKey].stderr.on('data', (data) => console.error(data.toString()));
    _meta[procKey].on('exit', (code) => {
      let error;
      if (code) {
        error = new Error(`Error #${code} while compiling ts files.`);
      }
      if (cb) {
        cb(error);
      }
    });
  });
}

compileTs['_meta'] = {};

function compileTsWatch(src: string | string[], tscOpts: Object, cb?: Function) {
  const params = Object.assign({}, tscOpts, { watch: true });
  compileTs(src, params, cb);
  gulp.watch(src, (evt: any) => {
    if (evt.type !== 'changed') {
      console.log(`File ${evt.path} ${evt.type}. Full Compilation...`);
      compileTs(src, params);
    }
  });
}

function mapTsFiles(src: string | string[], cb: Function) {
  const lines = [];
  return gulp.src(src, { read: false })
    .pipe(through2.obj(function(chunk, enc, callback) {
      this.push(slash(path.relative(__dirname, chunk.path)));
      callback();
    }))
    .on('data', (data) => lines.push(data))
    .on('end', () => cb(lines));
}

function mapTscArgs(tscOpts: Object) {
  const resp = [];
  for (let prop in tscOpts) {
    if (tscOpts[prop] === undefined || tscOpts[prop] === false) {
      continue;
    }
    resp.push(`--${prop}`);
    if (tscOpts[prop] !== true) {
      resp.push(tscOpts[prop]);
    }
  }
  return resp;
}

function lintTs(src: string | string[]) {
  return gulp.src(src)
    .pipe(tsLint())
    .pipe(tsLint.report(tsLintStylish, { emitError: false }));
}

function mapDestPathForlib(filePath: string) {
  const relPath = path.dirname(path.relative(__dirname, filePath));
  return slash(relPath).replace(FIRST_PATH_SEGMENT, PATHS.dest.dist.lib);
}

function startKarma(singleRun: boolean, cb: Function) {
  new karma.Server({
    configFile: `${PATHS.cwd}/karma.conf.js`,
    singleRun: singleRun
  }, karmaDone).start();

  function karmaDone(exitCode) {
    console.log('Test Done with exit code: ' + exitCode);
    if (exitCode === 0) {
      remapCoverage();
      cb();
    } else {
      cb(new Error('Unit test failed.'));
    }
  }
}

function remapCoverage() {
  console.log('Remapping coverage to TypeScript format...');
  const coverage = loadCoverage(`${PATHS.dest.coverage}/coverage-final.json`);
  const collector = remap(coverage);
  return writeReport(collector, 'html', `${PATHS.dest.coverage}/remap/coverage-html`);
}

gulp.task('cssLib', () => gulp.src(PATHS.src.vendor.css)
  .pipe(gulpIf(IS_PROD, sourcemaps.init()))
  .pipe(gulpIf(IS_PROD, cssnano()))
  .pipe(gulpIf(IS_PROD, sourcemaps.write()))
  .pipe(gulp.dest((file: any) => mapDestPathForlib(file.path)))
);

gulp.task('font', () => gulp.src(PATHS.src.vendor.font)
  .pipe(gulp.dest((file: any) => mapDestPathForlib(file.path)))
);

gulp.task('copyOnlyLib', () => gulp.src(PATHS.src.vendor.copyOnly)
  .pipe(gulp.dest((file: any) => mapDestPathForlib(file.path)))
);

gulp.task('jsLib', () => gulp.src(PATHS.src.vendor.js)
  .pipe(gulpIf(IS_PROD, sourcemaps.init()))
  .pipe(gulpIf(IS_PROD, uglify({ mangle: false })))
  .pipe(gulpIf(IS_PROD, sourcemaps.write()))
  .pipe(gulp.dest((file: any) => mapDestPathForlib(file.path)))
);

gulp.task('css', () => gulp.src(PATHS.src.custom.css)
  .pipe(gulpIf(IS_PROD, sourcemaps.init()))
  .pipe(gulpIf(IS_PROD, cssnano()))
  .pipe(gulpIf(IS_PROD, sourcemaps.write()))
  .pipe(gulp.dest(PATHS.dest.dist.base))
);

gulp.task('css.w', ['css'], () => gulp.watch(PATHS.src.custom.css, ['css']));

gulp.task('tpl', () => gulp.src(PATHS.src.custom.tpl)
  .pipe(gulp.dest(PATHS.dest.dist.base))
);

gulp.task('tpl.w', ['tpl'], () => gulp.watch(PATHS.src.custom.tpl, ['tpl']));

gulp.task('tsLint', () => lintTs(PATHS.src.custom.tsLint));

gulp.task('tsLint.w', ['tsLint'], () => gulp.watch(PATHS.src.custom.tsLint, (evt: any) => lintTs(evt.path)));

gulp.task('index', () => {

  const libs: string[] = PATHS.src.vendor.css.concat(PATHS.src.vendor.js);
  const libStream = gulp.src(libs, { read: false });

  return gulp.src(PATHS.src.custom.index)
    .pipe(template({ APP_ROOT, IS_PROD }))
    .pipe(inject(libStream, {
      name: 'lib',
      transform: function(filepath) {
        arguments[0] = filepath.replace(FIRST_PATH_SEGMENT, '/lib');
        return inject.transform.apply(inject.transform, arguments);
      }
    }))
    .pipe(gulp.dest(PATHS.dest.dist.base));
});

gulp.task('index.w', ['index'], () => gulp.watch(PATHS.src.custom.index, ['index']));

gulp.task('lint', ['tsLint']);

gulp.task('ts', ['clean.dist'], (cb) => compileTs(PATHS.src.custom.tsApp, TSC_APP_OPTS, cb));

gulp.task('ts.w', ['tsLint.w', 'clean.dist'], () => compileTsWatch(PATHS.src.custom.tsApp, TSC_APP_OPTS));

gulp.task('test.build', ['clean.test'], (cb) => compileTs(PATHS.src.custom.test, TSC_TEST_OPTS, cb));

gulp.task('test.build.w', ['tsLint.w', 'clean.test'], () => compileTsWatch(PATHS.src.custom.test, TSC_TEST_OPTS));

gulp.task('karma', ['clean.coverage'], (cb) => startKarma(true, cb));

gulp.task('test', seq('test.build', 'karma'));

gulp.task('build', ['clean.dist'], seq(
  ['copyOnlyLib', 'cssLib', 'font', 'jsLib', 'css', 'tpl', 'tsLint', 'ts', 'index'])
);

gulp.task('reload.w', () => gulp.watch(`${PATHS.dest.dist.base}/**/*`, (evt: any) => notifyLiveReload(evt.path)));

gulp.task('build.w', ['clean.dist'], seq(
  ['copyOnlyLib', 'cssLib', 'font', 'jsLib', 'css.w', 'tpl.w', 'ts.w', 'index.w'], 'reload.w')
);

gulp.task('server.w', (done) =>
  nodemon({
    script: 'server/boot.ts',
    watch: 'server',
    ext: 'ts',
    env: { 'APP_ENVIRONMENT': process.env.APP_ENVIRONMENT },
    execMap: {
      ts: 'node node_modules/ts-node/dist/bin/ts-node.js'
    }
  }).on('start', () => {
    console.log('Server started');
  }).once('start', () => {
    const tinylrObj = tinylr();
    tinylrObj.listen(LIVE_RELOAD_PORT);
    const intervalId = setInterval(() => {
      const existsDist = fse.existsSync(PATHS.dest.dist.appBundle);
      if (existsDist) {
        clearInterval(intervalId);
        setTimeout(() => {
          openResource(`http://localhost:${PORT}`);
          done();
        }, 3000);
      }
    }, 500);
  })
);

gulp.task('serve', seq('build.w', 'server.w'));

gulp.task('clean', seq('clean.dist', 'clean.test', 'clean.coverage'));
gulp.task('clean.dist', (done) => fse.remove(PATHS.dest.dist.base, done));
gulp.task('clean.test', (done) => fse.remove(PATHS.dest.test, done));
gulp.task('clean.coverage', (done) => fse.remove(PATHS.dest.coverage, done));

gulp.task('default', ['serve']);
