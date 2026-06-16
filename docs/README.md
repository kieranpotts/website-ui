# 📓 Developer Docs

## ✅ Requirements

- [Node.js](https://nodejs.org/) at the version pinned in [`.nvmrc`](../.nvmrc).
- `npm` – which is bundled with Node.js.

No global tooling is required – everything runs from local dev dependencies managed by `npm`.

## 📦 Installing dev dependencies

```bash
nvm use       # Or specify the version pinned in .nvmrc.
npm install
```

## 🗂️ Repository structure

```
.
├── dist/              Build target – Git-ignored.
├── node_modules/      Node.js dependencies – Git-ignored.
├── src/               Theme source files.
│   ├── layouts/       Page layouts (default.hbs, 404.hbs).
│   ├── partials/      Handlebars partials composed by the layouts.
│   ├── helpers/       Handlebars helpers (and, eq, or).
│   ├── css/           Stylesheets – site.css is the entry point.
│   ├── font/          Web fonts.
│   └── ui.yml         Bundle manifest (static_files).
├── srv/               Source files for the preview website.
├── tmp/               Supports build automation – Git-ignored.
├── vendor/            Fonts and other master files from third-parties.
├── www/               Static preview site is built here – Git-ignored.
├── .stylelintrc.json  CSS linting rules.
├── gulpfile.js        Build tasks (bundle, preview, lint).
├── package.json       Dev dependency definitions for `npm`.
└── preview-site.yml   Antora playbook to build the preview site.
```

## 🔨 Building

The build steps output a custom [Antora](https://antora.org) UI bundle, which becomes the theme for [kieranpotts.com](https://kieranpotts.com).

To build the production bundle:

```bash
npm run bundle
```

This processes `src/` and writes `dist/ui-bundle.zip`, which is what Antora consumes.

CSS is run through PostCSS (`@import` inlining + autoprefixer). Layouts, partials, helpers, and fonts are copied verbatim.

The following command builds the bundle, then renders a small sample site. The preview site is built into `www/`, a Git-ignored directory. Simply open the `www/index.html` file in a web browser to view the preview website.

```bash
npm run preview
```

The [`preview-site.yml`](../preview-site.yml) file is the Antora "playbook" that configures the preview build. The source content for the preview website is in `srv/`.

## 🚀 Releasing

Update the CHANGELOG.md file, and commit it.

```sh
git commit -am "release: v0.1.0"
```

Tag the version point, and push it:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The [release workflow](../.github/workflows/release.yaml) runs automatically when a new tag is pushed. It builds `dist/ui-bundle.zip` and attaches it to a GitHub release for the tag.

## 🧹 Linting

```bash
npm run lint
```

Lints the stylesheets with stylelint (configured by `.stylelintrc.json`).

## 🪝 Pre-commit hooks

It is RECOMMENDED to install the [pre-commit](https://pre-commit.com) framework to enable local validation hooks before committing. You need only to run the following command once to install pre-commit system-wide:

```bash
pipx install pre-commit
```

Then install the pre-commit hooks in every local repository where you want pre-commit checks to be run:

```bash
pre-commit install
```

This installs all hook types declared in `.pre-commit-config.yaml` (`pre-commit`, `commit-msg`).

Edit `./.pre-commit-config.yaml` to configure the pre-commit validation checks you want for your project. See the [pre-commit documentation](https://pre-commit.com) for details.
