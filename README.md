# @nera-static/plugin-statistics

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator that creates statistics by counting page properties like categories, topics, tags, or any other metadata field.

## ✨ Features

-   Count any page metadata property across your site
-   Automatically sorts results alphabetically
-   Configurable properties via YAML configuration
-   Multiple display templates (table, cards, list)
-   Ready-to-use Pug templates with BEM CSS classes
-   Full ES Module support

## 🚀 Installation

Install the plugin in your Nera project:

```bash
npm install @nera-static/plugin-statistics
```

Nera will automatically detect the plugin and generate statistics during the build.

## 🛠️ Usage

### Configuration

Configure which properties to count in your project:

```yaml
# config/statistics.yaml
count:
    - category
    - topic
    - tags

# Optional: Display settings
display:
    show_counts: true
    sort_by: 'name' # "name" or "count"
    sort_order: 'asc' # "asc" or "desc"
```

### Page Metadata

Add the configured properties to your markdown pages:

```yaml
---
title: My Blog Post
category: Tech
topic: JavaScript
tags: frontend
---
```

### Publish Templates

Copy the default templates to your project:

```bash
npx @nera-static/plugin-statistics run publish-template
```

This copies the templates to:

```
views/vendor/plugin-statistics/statistics.pug
views/vendor/plugin-statistics/statistics-cards.pug
views/vendor/plugin-statistics/statistics-list.pug
```

### Using the templates

Include the statistics in your Pug templates:

```pug
include views/vendor/plugin-statistics/statistics
// or
include views/vendor/plugin-statistics/statistics-cards
// or
include views/vendor/plugin-statistics/statistics-list
```

The plugin provides three different template files:

-   `statistics.pug` - Table format with headers (default)
-   `statistics-cards.pug` - Card-based layout
-   `statistics-list.pug` - Simple list format

### Available Data

The plugin adds statistics to the `app` object:

```javascript
app.statistics = {
    category: [
        { name: 'Tech', amount: 5 },
        { name: 'Design', amount: 3 },
    ],
    topic: [
        { name: 'JavaScript', amount: 4 },
        { name: 'CSS', amount: 2 },
    ],
    tags: [
        { name: 'frontend', amount: 6 },
        { name: 'backend', amount: 2 },
    ],
}
```

## 🎨 CSS Classes

The plugin uses BEM (Block Element Modifier) methodology:

-   `.statistics` - Main statistics container
-   `.statistics__category` - Category section
-   `.statistics__title` - Category title
-   `.statistics__table` - Table layout
-   `.statistics__header` - Table headers
-   `.statistics__row` - Table rows
-   `.statistics__cell` - Table cells
-   `.statistics__cell--count` - Count cell modifier
-   `.statistics__cards` - Cards container
-   `.statistics__card` - Individual card
-   `.statistics__card-name` - Card name
-   `.statistics__card-count` - Card count
-   `.statistics__list` - List container
-   `.statistics__item` - List item
-   `.statistics__name` - Item name
-   `.statistics__count` - Item count

## 🧪 Development

```bash
npm install
npm test
npm run lint
```

Tests use [Vitest](https://vitest.dev) and cover:

-   Property counting functionality
-   Alphabetical sorting
-   Data structure validation
-   Edge cases and error handling

### 🔄 Compatibility

-   **Nera v4.1.0+**: Full compatibility with latest static site generator
-   **Node.js 18+**: Modern JavaScript features and ES modules
-   **Plugin Utils v1.1.0+**: Enhanced plugin utilities integration

### 🏗️ Architecture

This plugin uses the `getAppData()` function to process page metadata and generate statistics. It counts occurrences of configured properties across all pages and provides the data globally via the `app.statistics` object.

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

-   [Plugin Repository](https://github.com/seebaermichi/nera-plugin-statistics)
-   [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-statistics)
-   [Nera Static Site Generator](https://github.com/seebaermichi/nera)
-   [Plugin Documentation](https://github.com/seebaermichi/nera#plugins)

## 📦 License

MIT
