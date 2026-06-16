# Website UI

## Project overview

A custom [Antora](https://antora.org) UI bundle: the theme for kieranpotts.com. It is a minimal, single-column reading theme typeset in a monospace font throughout. It is built into `dist/ui-bundle.zip` and consumed by the separate `website` repository.

## Tech stack

- Node.js (version pinned in `.nvmrc`).
- Gulp build pipeline.
- PostCSS (`@import` + autoprefixer) for CSS.
- Stylelint for linting CSS.
- Handlebars layouts/partials/helpers (Antora's UI templating system).

## Repository structure

- `src/`: Theme sources.
- `srv/` + `preview-site.yml`: Standalone preview site.
- `dist/`: Build output (`ui-bundle.zip`); git-ignored.
- `docs/`: Developer/maintainer documentation.
- `README.md`: User manual.

## Tools

- `npm run bundle` to build `dist/ui-bundle.zip`.
- `npm run preview` to build the standalone preview into `www/`.
- `npm run lint` to lint the stylesheets.

To release a new version, simply push a new version tag – `git tag v* && git push origin v*`. The `release.yaml` workflow builds and publishes the bundle on GitHub.

## Rules

- The bundle MUST contain `ui.yml` at its root. Antora rejects a bundle without it.

- Preview content lives in `srv/`. In case this repository is checked out in a Git worktree – which Antora's build process does not support – `npm run preview` snapshots `srv/` into a throwaway repo (at `tmp/`, which is Git-ignored) and `preview-site.yml` reads from there.

## Skills

There are no project-specific agent skills at this time.
