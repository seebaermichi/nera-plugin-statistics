# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
