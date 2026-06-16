# Website UI

## Project overview

A custom [Antora](https://antora.org) UI bundle: the theme for
kieranpotts.com. It is a minimal, single-column reading theme typeset in iA
Writer. It is built into `dist/ui-bundle.zip` and consumed by the separate
`website` repository.

## Tech stack

- Node.js (version pinned in `.nvmrc`).
- gulp build pipeline; PostCSS (`@import` + autoprefixer) for CSS.
- Handlebars layouts/partials/helpers (Antora's UI templating).

## Repository structure

- `src/`: Theme sources — `layouts/`, `partials/`, `helpers/`, `css/`,
  `font/`, `ui.yml`.
- `srv/` + `preview-site.yml`: Standalone preview site.
- `dist/`: Build output (`ui-bundle.zip`); git-ignored.
- `docs/`: Developer/maintainer documentation.

## Tools

- `npm run bundle` to build `dist/ui-bundle.zip`.
- `npm run preview` to build the standalone preview into `www/`.
- `npm run lint` to lint the stylesheets.

## Rules

The capitalized words REQUIRED, MUST, MUST NOT, RECOMMENDED, SHOULD, SHOULD NOT, OPTIONAL, and MAY, in the context of this document and agent skills/instructions/rules, are to be interpreted as described in [IETF RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

- The bundle MUST contain `ui.yml` at its root; Antora rejects a bundle without it.
- `preview-site.yml` reads content from the sibling bare repo (`../.bare`, branch `dev`) because this working tree is a git worktree that isomorphic-git cannot read directly. Preview content changes MUST therefore be committed to appear.
- Releases are cut by pushing a `v*` tag (see `docs/development.md`).

## Skills

Skills that are specific to this project are installed in `./.agents/skills/`.
