import path from 'path'
import { getConfig } from '@nera-static/plugin-utils'

/**
 * Resolved per call rather than at module scope, so edits to
 * config/statistics.yaml are picked up without restarting `npm run dev`.
 */
function getHostConfigPath() {
    return path.resolve(process.cwd(), 'config/statistics.yaml')
}

/**
 * Normalises one frontmatter value into the list of names it contributes.
 *
 * Frontmatter is YAML, so a value is not necessarily a string: `year: 2024`
 * parses to a Number, `featured: true` to a Boolean, and `tags: [a, b]` to an
 * Array. Everything is coerced to a string so that grouping and sorting have a
 * single type to work with, and arrays are flattened so each entry is counted
 * on its own — which is what the documented `tags` output has always implied.
 *
 * `null`, `undefined` and `''` contribute nothing. Note that `0` and `false`
 * DO count: they are real values, and the previous truthiness check silently
 * dropped them.
 *
 * Mappings and nested arrays are dropped. `author: {name: …, url: …}` is an
 * ordinary frontmatter shape, and stringifying it produced a literal
 * `[object Object]` row in the rendered table — user-visible garbage rather
 * than a build error, so it shipped. There is no sensible single name for a
 * mapping.
 *
 * `Date` is deliberately NOT dropped, even though `typeof` calls it an object:
 * an unquoted `date: 2024-05-01` in frontmatter is parsed into a Date by
 * js-yaml, so excluding it would silently stop counting a field that counts
 * today. Its `String()` form is verbose and timezone-dependent, but it is a
 * real value, not garbage. Quote the value in frontmatter to count it as a
 * plain string.
 */
function isCountable(entry) {
    if (entry instanceof Date) {
        return true
    }

    return typeof entry !== 'object' && typeof entry !== 'function'
}

function getStatisticValues(value) {
    return (Array.isArray(value) ? value : [value])
        .filter((entry) => entry != null && entry !== '')
        .filter(isCountable)
        .map((entry) => String(entry))
}

/**
 * Build statistics for configured properties across all pages
 * @param {Array} pagesData - Array of page data objects
 * @param {Object} config - Resolved plugin configuration
 * @returns {Object} Statistics object with counts for each configured property
 */
function getStatistics(pagesData, config) {
    const statistics = {}

    if (!config.count || !Array.isArray(config.count)) {
        console.warn('⚠️ No count properties configured in statistics.yaml')
        return statistics
    }

    // Get display settings with defaults
    const displaySettings = config.display || {}
    const sortBy = displaySettings.sort_by || 'name'
    const sortOrder = displaySettings.sort_order || 'asc'

    config.count.forEach((element) => {
        statistics[element] = []

        pagesData.forEach(({ meta }) => {
            getStatisticValues(meta?.[element]).forEach((name) => {
                const existingItem = statistics[element].find(
                    (item) => item.name === name
                )

                if (existingItem) {
                    existingItem.amount++
                } else {
                    statistics[element].push({
                        name,
                        amount: 1,
                    })
                }
            })
        })

        // Apply sorting based on configuration. `name` is guaranteed to be a
        // string by getStatisticValues above.
        statistics[element].sort((a, b) => {
            let comparison = 0

            if (sortBy === 'count') {
                comparison = a.amount - b.amount
            } else {
                // Default: sort by name
                const nameA = a.name.toUpperCase()
                const nameB = b.name.toUpperCase()
                comparison = nameA < nameB ? -1 : nameA > nameB ? 1 : 0
            }

            // Apply sort order
            return sortOrder === 'desc' ? -comparison : comparison
        })
    })

    return statistics
}

/**
 * Add statistics data to the app object
 * @param {Object} data - The data object containing app and pagesData
 * @returns {Object} App data with statistics added
 */
export function getAppData(data) {
    if (!data || !data.app || !Array.isArray(data.pagesData)) {
        return data?.app || {}
    }

    return {
        ...data.app,
        statistics: getStatistics(
            data.pagesData,
            getConfig(getHostConfigPath())
        ),
    }
}
