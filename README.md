# Website UI

Custom Antora UI theme for my website.

## 📖 User Manual

The theme is distributed as a prebuilt Antora UI bundle (`ui-bundle.zip`), published as an asset on each [GitHub release](https://github.com/kieranpotts/website-ui/releases) of this repository.

To use the theme, you point an Antora playbook at a released `ui-bundle.zip` and Antora downloads it as part of the site build.

In your site's playbook, set `ui.bundle.url` to the release asset for the version you want to pin. Releases are versioned with `v*` tags, and the asset URL follows GitHub's standard pattern:

```yaml
ui:
  bundle:
    url: https://github.com/kieranpotts/website-ui/releases/download/v0.1.0/ui-bundle.zip
    snapshot: true
```

Pin a specific version (rather than `latest`) so site builds are reproducible – the UI only changes when you deliberately bump the URL to a newer tag.

The `snapshot: true` flag tells Antora to treat the bundle's supplemental files as part of the UI.

If you prefer to vendor the bundle, download `ui-bundle.zip` from the [releases page](https://github.com/kieranpotts/website-ui/releases) and point `ui.bundle.url` at the local file instead:

```yaml
ui:
  bundle:
    url: ./ui-bundle.zip
    snapshot: true
```

This theme bakes all of its UI partials into the bundle, so a consuming site needs to supply only its own static control files (`_redirects`, `_headers`, `robots.txt`, `favicon.ico`, feeds, etc.) via the playbook's `supplemental_files`.

See the [`website`](https://github.com/kieranpotts/website) repository's `site-ci.yml` for a complete, working playbook.

## 📓 Developer Docs

Docs for development and maintenance of this project [are here](./docs/).

-----

Copyright © 2020-present Kieran Potts, [MIT license](./LICENSE.txt)
