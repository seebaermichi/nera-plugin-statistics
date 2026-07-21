# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-21

### Changed

-   raised minimum Node from 18 to 20; Node 18 reached end-of-life on
    2025-04-30 and the dev toolchain requires Node 20+


## [2.1.0] - 2026-07-20

### Fixed

-   **non-string frontmatter no longer crashes the build.** Sorting called
    `.toUpperCase()` on the raw value, so `year: 2024` — a Number once YAML is
    parsed — threw `TypeError: a.name.toUpperCase is not a function`. Values are
    now coerced to strings before grouping and sorting. This only ever fired
    with two or more distinct values, because a comparator is never invoked for
    a one-element array, so it passed on small sites and broke on real content
-   **list values are counted entry by entry.** `tags: [frontend, css]` now adds
    one to each tag. Previously a YAML list crashed the build by the same route,
    and even a single-page site produced one opaque entry per page rather than a
    per-tag count — despite `tags` being in the shipped default config and the
    documented output showing per-tag counts
-   **`0` and `false` are counted.** A truthiness check silently dropped them,
    so `revision: 0` or `featured: false` vanished from the statistics with no
    warning
-   a page with no `meta` at all no longer throws
-   the README's template includes were root-relative
    (`include views/vendor/...`), which resolves relative to the including file
    and becomes `views/layouts/views/vendor/...`. Corrected to `../vendor/...`
-   the README's template publishing command was not a valid `npx` invocation

### Added

-   `--force` flag on `nera-statistics`, to re-publish templates over an
    existing `views/vendor/plugin-statistics/` and discard local edits. Without
    it, publishing still skips existing files
-   `CHANGELOG.md` is now included in the published package

### Removed

-   `display.show_counts` from the shipped config and the README. It has never
    been read by the plugin — the only display settings that do anything are
    `sort_by` and `sort_order`

### Changed

-   config is read per invocation instead of at import time, so edits during
    `npm run dev` take effect without a restart
-   `@nera-static/plugin-utils` raised to `^1.2.0`, which is where `--force` and
    the project-shape validation landed
-   `eslint.config.js` no longer imports `globals` and `@eslint/js`, neither of
    which was declared — lint could fail under a strict `npm ci` install
-   CI runs Node 20 and 22 with `fail-fast: false`. The Node 18 leg failed on
    `main` regardless of any source change, because the dev-only `cheerio`
    dependency needs a global `File`. `engines` stays `>=18`: consumers never
    install devDependencies

### Migration Guide

Backward-compatible with v2.0.0 for string-valued frontmatter, which is the only
case that worked before. Two things worth checking:

-   **`name` is always a string now.** If a site had a single page with
    `year: 2024`, `app.statistics.year[0].name` was the Number `2024` and is now
    the string `'2024'`. Templates render both identically; only code doing a
    strict `===` against a number is affected.
-   **List values change shape.** `app.statistics.tags` now holds one entry per
    tag instead of one per page. Any site with two or more tagged pages could
    not build at all before this release, so nothing working can regress.

## [2.0.0] - 2025-07-19

### Added

-   Full ES Module support
-   Modern plugin architecture using @nera-static/plugin-utils
-   Multiple template styles (table, cards, list)
-   Comprehensive test suite with Vitest
-   ESLint configuration
-   Template publishing via bin script
-   BEM CSS class structure
-   Enhanced configuration options

### Changed

-   **BREAKING**: Migrated from CommonJS to ES Modules
-   **BREAKING**: Updated plugin API to use getAppData() function
-   **BREAKING**: Changed package name to @nera-static/plugin-statistics
-   Improved error handling and logging
-   Modernized code structure and documentation
-   Enhanced template system with mixins

### Fixed

-   Better handling of missing metadata properties
-   Improved sorting algorithm
-   More robust configuration loading

### Removed

-   **BREAKING**: Removed dependency on legacy plugin-helper
-   **BREAKING**: Removed support for Node.js < 18

## [1.0.0] - Initial Release

### Added

-   Basic statistics counting functionality
-   Simple YAML configuration
-   Basic Pug template
