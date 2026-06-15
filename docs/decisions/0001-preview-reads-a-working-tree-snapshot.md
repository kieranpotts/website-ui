# 1. Preview reads a working-tree snapshot, not the worktree directly

Date: 2026-06-15

Status: Accepted

## Context

The standalone theme preview (`npm run preview`, i.e. `gulp preview`) builds a
sample site from `preview/content/` so the UI can be developed without the
website repository. We want edits to `preview/content/` to appear in the
preview **without first committing them** — a fast author loop.

Antora's content aggregator reads content from a Git source. It uses
[isomorphic-git](https://isomorphic-git.org/), a pure-JavaScript Git
implementation, to open the repository. isomorphic-git has a relevant
limitation: **it cannot open a Git _worktree_.** A worktree's `.git` is a
pointer _file_ (`gitdir: …/.bare/worktrees/<name>`) rather than a real `.git`
directory, and isomorphic-git only recognises the latter (or a bare repo).

This checkout is a worktree: `website-ui/.bare` is the bare repository and
`website-ui/default` is the worktree, whose `.git` is the pointer file. So
Antora cannot open this directory as a content source at all.

The original workaround pointed the preview playbook at the sibling bare repo
(`url: ../.bare`, `branches: dev`). That works, but the aggregator only ever
sees **committed** objects on that branch — so every content edit had to be
committed before it would show up in the preview. That friction is the problem
this decision resolves.

We considered three options:

1. **Author mode against the worktree.** Antora can read an uncommitted working
   tree when a source `url` points at a normal checkout. This fails here for
   the reason above — the worktree's `.git` pointer is unreadable by
   isomorphic-git — and was confirmed to fail in practice.

2. **Re-checkout as a normal clone.** Replacing the worktree with a standard
   clone would let author mode work, but it changes how this repository is laid
   out on disk and diverges from the worktree workflow used across these
   repositories. Too invasive for a dev-only convenience.

3. **Snapshot the working tree into a throwaway repo.** Copy `preview/content/`
   into a plain `git init` repo (real `.git` directory) and read from there.

## Decision

Adopt option 3. A `previewSrc` Gulp task, run before each preview build:

- ensures a disposable, git-ignored `.preview-src/` directory exists, with a
  plain `git init` repository (a real `.git` directory, which isomorphic-git
  _can_ read);
- copies the current `preview/content/` working tree into it;
- commits a snapshot (`--allow-empty`, so an unchanged copy still yields a
  commit for the aggregator to read).

`preview-site.yml` points its content source at `./.preview-src`
(`branches: HEAD`, `start_path: content`). The `gulp preview` pipeline is
`bundle → previewSrc → preview`.

The net effect: uncommitted edits to `preview/content/` appear in the preview
immediately, with no manual commit.

## Consequences

- **Fast author loop.** Editing `preview/content/` and re-running
  `npm run preview` reflects the change with no commit step.
- **Scope.** This only ever affected _content_. Theme sources under `src/`
  (CSS, templates, helpers) are read straight from the working tree by the
  bundle step, so they never required committing.
- **Disposable artifact.** `.preview-src/` is git-ignored and rebuilt on
  demand; it can be deleted at any time. The `previewSrc` task re-creates it.
- **Production is unaffected.** This concerns only the local standalone
  preview. The website consumes the published `ui-bundle.zip`; it does not use
  `preview-site.yml` or `.preview-src/`.
- **If this checkout ever becomes a normal clone**, the snapshot step becomes
  unnecessary and the preview source could point directly at the working tree
  (author mode). The task can then be retired.
