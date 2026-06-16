# Usage

This repository is a custom [Antora](https://antora.org) UI bundle that becomes the theme for [kieranpotts.com](https://kieranpotts.com).

## Build the bundle

```bash
npm run bundle
```

This processes `src/` and writes `dist/ui-bundle.zip`. CSS is run through PostCSS (`@import` inlining + autoprefixer). Layouts, partials, helpers, and fonts are copied verbatim. The result is zipped into the bundle Antora consumes.

## Preview the theme

```bash
npm run preview
```

Builds the bundle, then renders a small sample site (`srv/`) into
`preview-output/` using [`preview-site.yml`](../preview-site.yml). Open
`preview-output/index.html`, or serve the directory, to review the theme in
isolation.

## How the website consumes it

The bundle is published as a release asset (see
[development](./development.md)). The website's `site-ci.yml` playbook pins a
specific release URL; the website's local dev playbook (`site-dev.yml`) points
at the locally built `dist/ui-bundle.zip` for fast iteration.
