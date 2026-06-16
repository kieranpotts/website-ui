'use strict'

/**
 * Build pipeline for the Antora UI bundle.
 *
 *   gulp bundle   -> processes src/ and writes dist/ui-bundle.zip
 *   gulp preview  -> builds a sample site (srv/) into www/
 *   gulp lint     -> lints the stylesheets
 *
 * The bundle layout mirrors what Antora expects at the root of a UI bundle:
 * css/, font/, helpers/, img/, js/, layouts/, partials/, ui.yml.
 */

const { src, dest, series, parallel } = require('gulp')
const autoprefixer = require('autoprefixer')
const concat = require('gulp-concat')
const fs = require('fs-extra')
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const terser = require('gulp-terser')
const zip = require('gulp-zip').default // CJS export path.

const SRC = 'src'
const DIST = 'dist'
const BUNDLE_NAME = 'ui-bundle.zip'
const BUNDLE = `${DIST}/${BUNDLE_NAME}`

/* Files copied into the bundle verbatim (no transformation). */
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

/* Inline @import, then autoprefix. Output a single site.css at css/. */
function css () {
  return src(`${SRC}/css/site.css`)
    .pipe(postcss([postcssImport(), autoprefixer()]))
    .pipe(dest(`${DIST}/css`))
}

/* Concatenate and minify any theme scripts into js/site.js. Vendor scripts (if
any) are copied through untouched. */
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

/* Zip the assembled DIST tree (minus the zip itself) into ui-bundle.zip. */
function pack () {
  return src([`${DIST}/**/*`, `!${BUNDLE}`], { base: DIST, encoding: false })
    .pipe(zip(BUNDLE_NAME))
    .pipe(dest(DIST))
}

const bundle = series(clean, parallel(css, js, vendorJs, statics), pack)

/*
Antora's content aggregator reads content from a Git source. It uses
isomorphic-git (https://isomorphic-git.org/), a pure-JavaScript Git
implementation, to open the repository. Unfortunately, isomorphic-git has a
limitation. It cannot open a Git worktree, because a worktree's `.git` path
is a pointer file rather than a real `.git` directory – and isomorphic-git
only recognizes the latter.

Therefore, if this repository is checked out into a Git worktree, the Antora
build fails.

One workaround is to point the preview playbook at the sibling bare repo.
That works, but the aggregator only sees objects *committed* there. Changes
to the `srv/` files that are still in the working tree or index do NOT show
up in the preview site – which is a source of confusion.

A more robust solution is to snapshot the contents of the `srv/` working tree
into a throwaway repository. That's what we do below. Before we run the
Antora build, we copy the contents of `srv/` into `tmp/`, and then we
initialize a Git repository (`git init`) in `tmp/`. This is configured as
the content source in `preview-site.yml` – the Antora playbook for building
the preview site.

In summary: we snapshot the preview content into a throwaway Git repository,
and that's the content source for the Antora playbook.

It's a bit messy, but it works reliably.
*/

async function previewSrc () {
  const { execFileSync } = require('child_process')
  const dir = 'tmp'
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: 'ignore' })

  await fs.ensureDir(dir)
  if (!(await fs.pathExists(`${dir}/.git`))) {
    git('init', '-q')
    git('config', 'user.email', 'preview@localhost')
    git('config', 'user.name', 'preview')
    git('config', 'commit.gpgsign', 'false')
  }
  for (const entry of await fs.readdir(dir)) {
    if (entry !== '.git') await fs.remove(`${dir}/${entry}`)
  }
  await fs.copy('srv', dir)

  /* Use `--allow-empty` so an unchanged snapshot still produces a commit. */
  git('add', '-A')
  git('commit', '-q', '--allow-empty', '-m', 'snapshot')
}

/*
Standalone preview: build the sample site against the unzipped src/ tree (via
the freshly built bundle) so the theme can be iterated without the website
repo. Reads content from the tmp/ snapshot (see previewSrc).
*/
async function preview () {
  const generateSite = require('@antora/site-generator')
  await generateSite(['--playbook', 'preview-site.yml', '--stacktrace'], process.env)
}

function lint () {
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
