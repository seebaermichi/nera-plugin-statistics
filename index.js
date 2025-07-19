import path from 'path'
import { getConfig } from '@nera-static/plugin-utils'

const HOST_CONFIG_PATH = path.resolve(process.cwd(), 'config/statistics.yaml')

const config = getConfig(HOST_CONFIG_PATH)

/**
 * Build statistics for configured properties across all pages
 * @param {Array} pagesData - Array of page data objects
 * @returns {Object} Statistics object with counts for each configured property
 */
function getStatistics(pagesData) {
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
            if (meta[element]) {
                const existingItem = statistics[element].find(
                    (item) => item.name === meta[element]
                )

                if (existingItem) {
                    existingItem.amount++
                } else {
                    statistics[element].push({
                        name: meta[element],
                        amount: 1,
                    })
                }
            }
        })

        // Apply sorting based on configuration
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
        statistics: getStatistics(data.pagesData)
    }
}
