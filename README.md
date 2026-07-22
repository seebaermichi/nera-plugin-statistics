# @nera-static/plugin-statistics

[![Test](https://github.com/seebaermichi/nera-plugin-statistics/actions/workflows/test.yml/badge.svg)](https://github.com/seebaermichi/nera-plugin-statistics/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-statistics)](https://www.npmjs.com/package/@nera-static/plugin-statistics)

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator that creates statistics by counting metadata properties like categories, topics, tags, or any other field across your content.

## ✨ Features

- Count any page meta property (e.g., `tags`, `category`, `topic`)
- Sorts counts alphabetically or by frequency
- Configurable via `config/statistics.yaml`
- Includes table, card, and list-based Pug templates
- Access statistics globally via `app.statistics`
- Uses BEM CSS methodology
- Full compatibility with Nera v4.1.0+

## 🚀 Installation

Install the plugin in your Nera project:

```bash
npm install @nera-static/plugin-statistics
```

Nera will automatically detect and execute the plugin during the build.

## ⚙️ Configuration

Create a configuration file at `config/statistics.yaml`:

```yaml
count:
  - category
  - topic
  - tags

display:
  sort_by: name      # "name" or "count"
  sort_order: asc    # "asc" or "desc"
```

**This file is required.** Unlike most Nera plugins, this one has nothing
sensible to do by default: without a `count` list there is no property to count.
If the file is missing, or `count` is absent, the plugin logs

```
⚠️ No count properties configured in statistics.yaml
```

and sets `app.statistics` to `{}`. The build still succeeds and the templates
still render — as nothing, because there is nothing to list.

**`count` must be a YAML list, even for a single property.** `count: category`
is a scalar, not a list, and is rejected by the same check: one warning line, and
empty statistics. Write it as:

```yaml
count:
  - category
```

### Sort order

`sort_by` and `sort_order` are independent, and the pairing that most people want
is not the default. To list the most-used values first — the usual reason to
count anything — you need **both** keys:

```yaml
display:
  sort_by: count
  sort_order: desc   # without this you get the least-used values first
```

`sort_by: count` on its own inherits `sort_order: asc` and sorts from the
smallest count upward. Sorting by `name` is case-insensitive.

Configuration is read fresh on every build, so edits are picked up during
`npm run dev` without a restart.

## 🧩 Usage

### Page frontmatter

Add relevant metadata to your content pages:

```yaml
---
title: My Blog Post
category: Tech
topic: JavaScript
tags: frontend
---
```

Any frontmatter field can be counted, and the value does not have to be a
string:

- **Lists** are counted entry by entry, so `tags: [frontend, css]` adds one to
  `frontend` and one to `css`.
- **Numbers and booleans** are counted as their text form — `year: 2024`
  appears as `2024`, `featured: false` as `false`. `0` and `false` are real
  values and are counted; `null` and empty strings are ignored.
- **Mappings are ignored.** `author: {name: Ada, url: …}` contributes nothing,
  because there is no single name a mapping could be counted under. Count a
  scalar field instead (`author_name: Ada`). The same applies to a list nested
  inside a list.
- **Dates are counted as text.** An unquoted `date: 2024-05-01` is parsed as a
  date, not a string, and is counted under its full textual form — verbose, and
  dependent on the build machine's timezone. Quote the value (`date:
  "2024-05-01"`) to count it as a plain string.

Counting is **case-sensitive**: `category: Tech` and `category: tech` are two
separate entries. Because the sort is case-insensitive they end up next to each
other, which makes the split easy to miss in a rendered table. Keep your casing
consistent.

Counts cover **every Markdown file under `pages/`**, including pages that are
never rendered because their frontmatter has no `layout`. A draft still counts.

### Access in templates

The plugin adds statistics data to `app.statistics`:

```javascript
app.statistics = {
  category: [ { name: 'Tech', amount: 5 } ],
  topic: [ { name: 'JavaScript', amount: 4 } ],
  tags: [ { name: 'frontend', amount: 6 } ]
}
```

`name` is always a string and `amount` always a number. A configured property
that matched nothing is present as an **empty array**, not absent, and
`app.statistics` itself is always defined — so `if app.statistics` is not a
useful guard on its own. The shipped templates check `items.length` per property.

### Use in your layouts

Pick **one** of the three templates — they are alternative presentations of the
same data, so including all three renders your statistics three times over:

```pug
include ../vendor/plugin-statistics/statistics
```

Include paths are relative to the including file, so the `../` above assumes a
layout in `views/layouts/`. Adjust the number of `../` segments to match. On
Nera v4.3.0+ you can use the location-independent form instead:

```pug
include /vendor/plugin-statistics/statistics
```

The templates start their headings at `h3`, so place them under an `h2` in your
layout to keep the heading order intact.

## 🛠️ Template Publishing

Copy the plugin's templates into your project so you can customise them:

```bash
npx nera-statistics
```

This copies:

```
views/vendor/plugin-statistics/
├── statistics.pug         # Table layout
├── statistics-cards.pug   # Card layout
└── statistics-list.pug    # List layout
```

> **Publishing skips the whole directory, not individual files.** If
> `views/vendor/plugin-statistics/` already exists, the command copies
> **nothing** and still exits successfully — even if you deleted one of the
> files. This also means **upgrading the plugin never updates your published
> templates.** To pull in a newer version, re-run with `--force`:
>
> ```bash
> npx nera-statistics --force
> ```
>
> `--force` overwrites every file in that directory and discards local edits, so
> diff your copies first if you have customised them.

## 🎨 Styling

Templates use BEM CSS methodology:

```css
.statistics { }
.statistics__category { }
.statistics__title { }

/* statistics.pug — table layout */
.statistics__table { }
.statistics__header { }
.statistics__row { }
.statistics__cell { }
.statistics__cell--count { }

/* statistics-cards.pug — card layout */
.statistics--cards { }
.statistics__cards { }
.statistics__card { }
.statistics__card-name { }
.statistics__card-count { }

/* statistics-list.pug — list layout */
.statistics--list { }
.statistics__list { }
.statistics__item { }
.statistics__name { }
.statistics__count { }
```

`.statistics--cards` and `.statistics--list` are the block-level modifiers that
let you style the card and list variants differently from the table variant.

**These class names are a public contract.** You style them from your own CSS,
so renaming one here is a breaking change and ships as a **major** version.

## 📊 Generated Output

Each template renders one block per configured property, in the order the
properties appear in `count`. Properties that matched nothing are skipped
entirely. With `app.statistics.category = [{ name: 'Tech', amount: 5 }]`:

```html
<!-- statistics.pug -->
<div class="statistics">
  <div class="statistics__category">
    <h3 class="statistics__title">Category</h3>
    <table class="statistics__table">
      <thead>
        <tr>
          <th class="statistics__header">Name</th>
          <th class="statistics__header">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr class="statistics__row">
          <td class="statistics__cell">Tech</td>
          <td class="statistics__cell statistics__cell--count">5</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

```html
<!-- statistics-cards.pug -->
<div class="statistics statistics--cards">
  <div class="statistics__category">
    <h3 class="statistics__title">Category</h3>
    <div class="statistics__cards">
      <div class="statistics__card">
        <div class="statistics__card-name">Tech</div>
        <div class="statistics__card-count">5</div>
      </div>
    </div>
  </div>
</div>
```

```html
<!-- statistics-list.pug -->
<div class="statistics statistics--list">
  <div class="statistics__category">
    <h3 class="statistics__title">Category</h3>
    <ul class="statistics__list">
      <li class="statistics__item"><span class="statistics__name">Tech</span><span class="statistics__count">5</span></li>
    </ul>
  </div>
</div>
```

The `h3` text is the config key with its first character upper-cased, so
`count: [category]` renders as `Category`.

### Which pages are counted

Counts cover pages you authored. Pages **generated by another plugin** — such as
the tag overview pages from `@nera-static/plugin-tags` — are not counted, because
plugins run in alphabetical order and `plugin-statistics` runs before
`plugin-tags` creates them. This is usually what you want: a generated overview
page inherits its frontmatter from the plugin that made it, and counting it would
double-count your real content.

If you deliberately want generated pages included, list `plugin-statistics` under
`end:` in `config/plugin-order.yaml` (requires Nera v4.2.0+, when that file began
to be honoured). Be aware this changes every number.

## 🧪 Development

```bash
npm install
npx vitest run
npm run lint
```

`npm test` starts Vitest in **watch** mode and does not exit; use `npx vitest run`
for a single pass.

Tests use [Vitest](https://vitest.dev) and validate:

- Property counting logic
- Sort options
- Output structure
- Edge cases and invalid data

## 🤝 Contributing

Issues and pull requests are welcome. See the
[Nera contributing guide](https://github.com/seebaermichi/nera/blob/main/CONTRIBUTING.md)
for plugin development, the hook contract, and local setup.

For this repo specifically:

- `npx vitest run` and `npm run lint` must pass (`npm test` is watch mode).
- Bump the version and update `CHANGELOG.md` **in the same commit** as the change.
- Template markup and BEM class names are a **public contract** — users style
  them from their own CSS, so changing one is a **major** bump.
- Releases publish from CI on a pushed `v*` tag. Never run `npm publish`.

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

- [Plugin Repository](https://github.com/seebaermichi/nera-plugin-statistics)
- [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-statistics)
- [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## 🧩 Compatibility

- **Nera**: v4.1.0+ — a baseline rather than a requirement; the plugin reads only
  page frontmatter and uses no generator feature above the 4.x line. The optional
  `config/plugin-order.yaml` technique above needs v4.2.0+, and the
  root-absolute `include /vendor/…` form needs v4.3.0+.
- **Node.js**: >= 20.0.0
- **Plugin Utils**: `^1.2.0` — where `--force` and the project-shape validation
  landed, both of which `npx nera-statistics` relies on.
- **Plugin API**: Uses `getAppData()` to count page metadata

## 📦 License

MIT
