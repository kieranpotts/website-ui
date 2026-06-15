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
const zip = require('gulp-vinyl-zip')

const SRC = 'src'
const DIST = 'dist'
const BUNDLE = `${DIST}/ui-bundle.zip`

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
    .pipe(zip.dest(BUNDLE))
}

const bundle = series(clean, parallel(css, js, vendorJs, statics), pack)

// Standalone preview: build the sample site in preview/ against the unzipped
// src/ tree so the theme can be iterated without rebuilding the zip.
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
exports.preview = series(bundle, preview)
exports.lint = lint
exports.default = bundle
