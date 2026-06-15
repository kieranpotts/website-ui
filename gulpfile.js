'use strict'

//
// Build pipeline for the Antora UI bundle.
//
//   gulp bundle   -> processes src/ and writes dist/ui-bundle.zip
//   gulp preview  -> builds a sample site (preview/) into preview-output/
//   gulp lint     -> lints the stylesheets
//
// The bundle layout mirrors what Antora expects at the root of a UI bundle:
// css/, font/, helpers/, img/, js/, layouts/, partials/, ui.yml.
//

const { src, dest, series, parallel } = require('gulp')
const autoprefixer = require('autoprefixer')
const concat = require('gulp-concat')
const fs = require('fs-extra')
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const terser = require('gulp-terser')
// gulp-zip v6 is ESM-only; under CommonJS require() the function is the default export.
const zip = require('gulp-zip').default

const SRC = 'src'
const DIST = 'dist'
const BUNDLE_NAME = 'ui-bundle.zip'
const BUNDLE = `${DIST}/${BUNDLE_NAME}`

// Files copied into the bundle verbatim (no transformation).
const STATIC_GLOBS = [
  `${SRC}/{layouts,partials,helpers}/**/*.hbs`,
  `${SRC}/helpers/**/*.js`,
  `${SRC}/font/**/*`,
  `${SRC}/img/**/*`,
  `${SRC}/ui.yml`,
]

function clean () {
  return fs.remove(DIST)
}

// Inline @import, then autoprefix. Output a single site.css at css/.
function css () {
  return src(`${SRC}/css/site.css`)
    .pipe(postcss([postcssImport(), autoprefixer()]))
    .pipe(dest(`${DIST}/css`))
}

// Concatenate and minify any theme scripts into js/site.js. Vendor scripts (if
// any) are copied through untouched.
function js () {
  return src([`${SRC}/js/+([0-9])-*.js`, `${SRC}/js/*.js`], { allowEmpty: true })
    .pipe(terser())
    .pipe(concat('site.js'))
    .pipe(dest(`${DIST}/js`))
}

function vendorJs () {
  return src(`${SRC}/js/vendor/**/*.js`, { allowEmpty: true })
    .pipe(dest(`${DIST}/js/vendor`))
}

function statics () {
  return src(STATIC_GLOBS, { base: SRC, encoding: false, allowEmpty: true })
    .pipe(dest(DIST))
}

// Zip the assembled DIST tree (minus the zip itself) into ui-bundle.zip.
function pack () {
  return src([`${DIST}/**/*`, `!${BUNDLE}`], { base: DIST, encoding: false })
    .pipe(zip(BUNDLE_NAME))
    .pipe(dest(DIST))
}

const bundle = series(clean, parallel(css, js, vendorJs, statics), pack)

// Snapshot the live preview content into a throwaway git repo so Antora can
// read the *current working tree* without a manual commit.
//
// Antora's content aggregator (isomorphic-git) reads committed git objects, and
// it cannot open this checkout directly because it is a git WORKTREE — its
// `.git` is a pointer file, not a real directory. So each preview run copies
// preview/content into `.preview-src/` (a plain `git init` repo with a real
// `.git`) and commits a snapshot; preview-site.yml then points Antora there.
// The net effect: uncommitted edits to preview/content appear in the preview
// immediately. `.preview-src/` is gitignored and disposable.
async function previewSrc () {
  const { execFileSync } = require('child_process')
  const dir = '.preview-src'
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: 'ignore' })

  await fs.remove(`${dir}/content`)
  await fs.ensureDir(dir)
  if (!(await fs.pathExists(`${dir}/.git`))) {
    git('init', '-q')
    git('config', 'user.email', 'preview@localhost')
    git('config', 'user.name', 'preview')
    git('config', 'commit.gpgsign', 'false')
  }
  await fs.copy('preview/content', `${dir}/content`)
  git('add', '-A')
  // `--allow-empty` so an unchanged snapshot still produces a commit to read.
  git('commit', '-q', '--allow-empty', '-m', 'snapshot')
}

// Standalone preview: build the sample site against the unzipped src/ tree (via
// the freshly built bundle) so the theme can be iterated without the website
// repo. Reads content from the .preview-src snapshot (see previewSrc).
async function preview () {
  const generateSite = require('@antora/site-generator')
  await generateSite(['--playbook', 'preview-site.yml', '--stacktrace'], process.env)
}

function lint () {
  // Stylelint via the gulp wrapper; configured by .stylelintrc.json.
  const gulpStylelint = require('gulp-stylelint-esm').default
  return src(`${SRC}/css/**/*.css`).pipe(
    gulpStylelint({ reporters: [{ formatter: 'string', console: true }] })
  )
}

exports.clean = clean
exports.css = css
exports.js = series(js, vendorJs)
exports.bundle = bundle
exports.preview = series(bundle, previewSrc, preview)
exports.lint = lint
exports.default = bundle
