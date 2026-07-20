# @nera-static/plugin-statistics

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

-   **Lists** are counted entry by entry, so `tags: [frontend, css]` adds one to
    `frontend` and one to `css`.
-   **Numbers and booleans** are counted as their text form — `year: 2024`
    appears as `2024`, `featured: false` as `false`. `0` and `false` are real
    values and are counted; only `null` and empty strings are ignored.

### Access in templates

The plugin adds statistics data to `app.statistics`:

```javascript
app.statistics = {
  category: [ { name: 'Tech', amount: 5 } ],
  topic: [ { name: 'JavaScript', amount: 4 } ],
  tags: [ { name: 'frontend', amount: 6 } ]
}
```

### Include default templates

```bash
npx nera-statistics
```

Publishing **skips templates that already exist**, so your edits are safe. To
pull in newer versions and discard your local changes:

```bash
npx nera-statistics --force
```

This copies:

```
views/vendor/plugin-statistics/
├── statistics.pug         # Table layout
├── statistics-cards.pug   # Card layout
└── statistics-list.pug    # List layout
```

### Use in your layouts

```pug
include ../vendor/plugin-statistics/statistics
include ../vendor/plugin-statistics/statistics-cards
include ../vendor/plugin-statistics/statistics-list
```

Include paths are relative to the including file, so the `../` above assumes a
layout in `views/layouts/`. Adjust the number of `../` segments to match.

The templates start their headings at `h3`, so place them under an `h2` in your
layout to keep the heading order intact.

## 🎨 Styling

Templates use BEM CSS methodology:

```css
.statistics { }
.statistics__category { }
.statistics__title { }
.statistics__table { }
.statistics__header { }
.statistics__row { }
.statistics__cell { }
.statistics__cell--count { }

.statistics__cards { }
.statistics__card { }
.statistics__card-name { }
.statistics__card-count { }

.statistics__list { }
.statistics__item { }
.statistics__name { }
.statistics__count { }
```

## 📊 Generated Output

The plugin counts configured metadata across all pages and makes the result available via `app.statistics`.

## 🧪 Development

```bash
npm install
npm test
npm run lint
```

Tests use [Vitest](https://vitest.dev) and validate:

- Property counting logic
- Sort options
- Output structure
- Edge cases and invalid data

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

- [Plugin Repository](https://github.com/seebaermichi/nera-plugin-statistics)
- [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-statistics)
- [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## 🧩 Compatibility

- **Nera**: v4.1.0+
- **Node.js**: >= 18
- **Plugin API**: Uses `getAppData()` to count page metadata

## 📦 License

MIT
