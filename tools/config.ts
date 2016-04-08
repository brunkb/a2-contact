import * as yargs from 'yargs';
import * as slash from 'slash';
import * as fse from 'fs-extra';

const argv = yargs.argv;
const CWD = slash(process.cwd());

process.env.APP_ENVIRONMENT = argv['env'] || process.env.APP_ENVIRONMENT || 'dev';

export const IS_PROD = process.env.APP_ENVIRONMENT === 'prod';

export const PORT = 5555;
export const LIVE_RELOAD_PORT = 4002;
export const APP_ROOT = '/';

const TMP = 'tmp';
const CLIENT_SRC = 'client';
const CLIENT_DEST = 'dist';
const NM = 'node_modules';
const INDEX_HTML = `${CLIENT_SRC}/index.html`;
const TS_LIB_DEF = [
  'typings/main/ambient/es6-shim/*.d.ts',
  'tools/manual_typings/module.d.ts'
];

export const PATHS = {
  cwd: CWD,
  src: {
    vendor: {
      js: [
        `${NM}/es6-shim/es6-shim.js`,
        `${NM}/systemjs/dist/system-register-only.src.js`,
        `${NM}/rxjs/bundles/Rx.js`,
        `${NM}/angular2/bundles/angular2-polyfills.js`,
        `${NM}/angular2/bundles/angular2.dev.js`,
        `${NM}/angular2/bundles/router.dev.js`,
        `${NM}/angular2/bundles/http.dev.js`,
      ],
      copyOnly: [
        `${NM}/systemjs/dist/system-polyfills.src.js`,
        `${NM}/bootstrap/dist/css/bootstrap.css.map`
      ],
      font: [
        `${NM}/bootstrap/dist/fonts/*`
      ],
      css: [
        `${NM}/bootstrap/dist/css/bootstrap.css`
      ]
    },
    custom: {
      index: INDEX_HTML,
      tpl: [
        `${CLIENT_SRC}/**/*.html`,
        `!${INDEX_HTML}`
      ],
      css: `${CLIENT_SRC}/**/*.css`,
      tsApp: TS_LIB_DEF.concat([
        `${CLIENT_SRC}/**/*.ts`,
        `!${CLIENT_SRC}/**/spec.ts`
      ]),
      tsLint: [
        `gulpfile.ts`,
        `tools/**/*.ts`,
        `${CLIENT_SRC}/**/*.ts`,
        `server/**/*.ts`,
        '!tools/manual_typings/**'
      ],
      test: TS_LIB_DEF.concat([
        'typings/main/ambient/jasmine/*.d.ts',
        `${CLIENT_SRC}/**/spec.ts`
      ])
    }
  },
  dest: {
    tmp: TMP,
    test: `${TMP}/test`,
    coverage: `${TMP}/coverage`,
    dist: {
      base: CLIENT_DEST,
      appBundle: `${CLIENT_DEST}/app.bundle.js`,
      lib: `${CLIENT_DEST}/lib`,
      font: `${CLIENT_DEST}/fonts`
    }
  }
};


const TSC_OPTS = fse.readJsonSync(`${CWD}/tsconfig.json`).compilerOptions;

// Setting the following options here since them cause issues on the VSC IDE.
// TODO: move to tsconfig.json once IDE adds support for them.
TSC_OPTS.forceConsistentCasingInFileNames = true;
TSC_OPTS.pretty = true;
TSC_OPTS.module = 'system';

export const TSC_APP_OPTS = Object.assign({}, TSC_OPTS, {
  outFile: PATHS.dest.dist.appBundle
});

export const TSC_TEST_OPTS = Object.assign({}, TSC_OPTS, {
  outDir: PATHS.dest.test
});

console.log('process.env.APP_ENVIRONMENT: ', process.env.APP_ENVIRONMENT);
