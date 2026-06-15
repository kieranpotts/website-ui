# Development

## Pre-commit hooks

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

## Layout

```
src/
  layouts/    Page layouts (default.hbs, 404.hbs).
  partials/   Handlebars partials composed by the layouts.
  helpers/    Handlebars helpers (and, eq, or).
  css/        Stylesheets; site.css is the entry point.
  font/       iA Writer typeface (woff2).
  ui.yml      Bundle manifest (static_files).
gulpfile.js   Build tasks (bundle, preview, lint).
preview-site.yml + preview/content/   Standalone theme preview.
```

## Linting

```bash
npm run lint
```

Lints the stylesheets with stylelint (configured by `.stylelintrc.json`).

## Releasing

The bundle is published as a GitHub release asset, which the website pins by
version. To cut a release, push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The [Release workflow](../.github/workflows/release.yaml) builds
`dist/ui-bundle.zip` and attaches it to a release for that tag. Then update the
website's `site-ci.yml` `ui.bundle.url` to the new release URL.
