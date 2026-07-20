import fs from 'fs'
import os from 'os'
import path from 'path'
import pug from 'pug'
import { load } from 'cheerio'
import { fileURLToPath } from 'url'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getAppData } from '../index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VIEWS = path.resolve(__dirname, '../views')

// The suite runs in a temp cwd and writes its own config. It used to rely on
// the package's own config/statistics.yaml sitting at the repo root — a file no
// real consumer has, since the shipped config is documentation only and is
// never merged into a site.
let tmpDir
let originalCwd

beforeAll(() => {
    originalCwd = process.cwd()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-statistics-'))
    fs.mkdirSync(path.join(tmpDir, 'config'), { recursive: true })
    process.chdir(tmpDir)
})

afterAll(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeConfig(yaml) {
    fs.writeFileSync(path.join(tmpDir, 'config/statistics.yaml'), yaml)
}

const DEFAULT_CONFIG = 'count:\n  - category\n  - topic\n  - tags\n'

const render = (template, app) =>
    load(pug.compileFile(path.join(VIEWS, template))({ app }))

describe('Statistics Plugin', () => {
    let mockData

    beforeEach(() => {
        writeConfig(DEFAULT_CONFIG)

        mockData = {
            app: {
                title: 'Test Site',
            },
            pagesData: [
                {
                    content: '<h1>Page A</h1>',
                    meta: {
                        title: 'Page A',
                        category: 'Tech',
                        topic: 'JavaScript',
                        tags: 'frontend',
                    },
                },
                {
                    content: '<h1>Page B</h1>',
                    meta: {
                        title: 'Page B',
                        category: 'Tech',
                        topic: 'Python',
                        tags: 'backend',
                    },
                },
                {
                    content: '<h1>Page C</h1>',
                    meta: {
                        title: 'Page C',
                        category: 'Design',
                        topic: 'JavaScript',
                        tags: 'frontend',
                    },
                },
                {
                    content: '<h1>Page D</h1>',
                    meta: {
                        title: 'Page D',
                        // No category, topic, or tags
                    },
                },
            ],
        }
    })

    it('should generate statistics for configured properties', () => {
        const result = getAppData(mockData)

        expect(result.statistics).toBeDefined()
        expect(result.statistics.category).toBeDefined()
        expect(result.statistics.topic).toBeDefined()
        expect(result.statistics.tags).toBeDefined()
    })

    it('should count category occurrences correctly', () => {
        const result = getAppData(mockData)

        expect(result.statistics.category).toHaveLength(2)
        expect(result.statistics.category).toEqual([
            { name: 'Design', amount: 1 },
            { name: 'Tech', amount: 2 },
        ])
    })

    it('should count topic occurrences correctly', () => {
        const result = getAppData(mockData)

        expect(result.statistics.topic).toHaveLength(2)
        expect(result.statistics.topic).toEqual([
            { name: 'JavaScript', amount: 2 },
            { name: 'Python', amount: 1 },
        ])
    })

    it('should count tags occurrences correctly', () => {
        const result = getAppData(mockData)

        expect(result.statistics.tags).toHaveLength(2)
        expect(result.statistics.tags).toEqual([
            { name: 'backend', amount: 1 },
            { name: 'frontend', amount: 2 },
        ])
    })

    it('should sort results alphabetically by name by default', () => {
        const result = getAppData(mockData)

        const categoryNames = result.statistics.category.map(
            (item) => item.name
        )
        expect(categoryNames).toEqual(['Design', 'Tech'])

        const topicNames = result.statistics.topic.map((item) => item.name)
        expect(topicNames).toEqual(['JavaScript', 'Python'])
    })

    it('should handle empty or missing data gracefully', () => {
        const emptyData = { app: {}, pagesData: [] }
        const result = getAppData(emptyData)

        expect(result.statistics).toBeDefined()
        expect(result.statistics.category).toEqual([])
        expect(result.statistics.topic).toEqual([])
        expect(result.statistics.tags).toEqual([])
    })

    it('should handle missing app data gracefully', () => {
        const result = getAppData(null)
        expect(result).toEqual({})
    })

    it('should preserve existing app properties', () => {
        const result = getAppData(mockData)

        expect(result.title).toBe('Test Site')
        expect(result.statistics).toBeDefined()
    })

    it('should handle pages without configured properties', () => {
        const result = getAppData({
            app: {},
            pagesData: [{ content: '<h1>Page</h1>', meta: { title: 'Page' } }],
        })

        expect(result.statistics.category).toEqual([])
        expect(result.statistics.topic).toEqual([])
        expect(result.statistics.tags).toEqual([])
    })

    it('warns and returns nothing when count is not configured', () => {
        writeConfig('display:\n  sort_by: "name"\n')

        expect(getAppData(mockData).statistics).toEqual({})
    })
})

describe('sorting configuration', () => {
    const pagesData = [
        { meta: { category: 'Tech' } },
        { meta: { category: 'Tech' } },
        { meta: { category: 'Design' } },
    ]

    it('sorts by count ascending when configured', () => {
        writeConfig(
            'count:\n  - category\ndisplay:\n  sort_by: "count"\n  sort_order: "asc"\n'
        )

        expect(getAppData({ app: {}, pagesData }).statistics.category).toEqual([
            { name: 'Design', amount: 1 },
            { name: 'Tech', amount: 2 },
        ])
    })

    it('sorts by count descending when configured', () => {
        writeConfig(
            'count:\n  - category\ndisplay:\n  sort_by: "count"\n  sort_order: "desc"\n'
        )

        expect(getAppData({ app: {}, pagesData }).statistics.category).toEqual([
            { name: 'Tech', amount: 2 },
            { name: 'Design', amount: 1 },
        ])
    })

    it('sorts by name descending when configured', () => {
        writeConfig(
            'count:\n  - category\ndisplay:\n  sort_order: "desc"\n'
        )

        expect(
            getAppData({ app: {}, pagesData }).statistics.category.map(
                (i) => i.name
            )
        ).toEqual(['Tech', 'Design'])
    })

    it('falls back to defaults when display is absent', () => {
        writeConfig('count:\n  - category\n')

        expect(
            getAppData({ app: {}, pagesData }).statistics.category.map(
                (i) => i.name
            )
        ).toEqual(['Design', 'Tech'])
    })

    it('picks up a config change without a restart', () => {
        writeConfig('count:\n  - category\n')
        expect(
            getAppData({ app: {}, pagesData }).statistics.category[0].name
        ).toBe('Design')

        writeConfig(
            'count:\n  - category\ndisplay:\n  sort_by: "count"\n  sort_order: "desc"\n'
        )
        expect(
            getAppData({ app: {}, pagesData }).statistics.category[0].name
        ).toBe('Tech')
    })
})

describe('non-string frontmatter values', () => {
    // Frontmatter is YAML, so these are the types markdown-it-meta really
    // produces. Each case needs >= 2 distinct values: a sort comparator is
    // never invoked for a one-element array, which is why a small test site
    // used to pass while real content crashed the build.

    it('counts numeric values without crashing', () => {
        writeConfig('count:\n  - year\n')

        const result = getAppData({
            app: {},
            pagesData: [
                { meta: { year: 2024 } },
                { meta: { year: 2023 } },
                { meta: { year: 2024 } },
            ],
        })

        expect(result.statistics.year).toEqual([
            { name: '2023', amount: 1 },
            { name: '2024', amount: 2 },
        ])
    })

    it('counts boolean values, including false', () => {
        writeConfig('count:\n  - featured\n')

        const result = getAppData({
            app: {},
            pagesData: [
                { meta: { featured: true } },
                { meta: { featured: false } },
                { meta: { featured: true } },
            ],
        })

        expect(result.statistics.featured).toEqual([
            { name: 'false', amount: 1 },
            { name: 'true', amount: 2 },
        ])
    })

    it('counts zero as a real value', () => {
        writeConfig('count:\n  - revision\n')

        const result = getAppData({
            app: {},
            pagesData: [{ meta: { revision: 0 } }, { meta: { revision: 1 } }],
        })

        expect(result.statistics.revision).toEqual([
            { name: '0', amount: 1 },
            { name: '1', amount: 1 },
        ])
    })

    it('counts each entry of a list value separately', () => {
        // `tags` is in the shipped default config and the README documents
        // per-tag counts, but a YAML list used to throw.
        writeConfig('count:\n  - tags\n')

        const result = getAppData({
            app: {},
            pagesData: [
                { meta: { tags: ['frontend', 'css'] } },
                { meta: { tags: ['frontend'] } },
            ],
        })

        expect(result.statistics.tags).toEqual([
            { name: 'css', amount: 1 },
            { name: 'frontend', amount: 2 },
        ])
    })

    it('ignores null, undefined and empty-string values', () => {
        writeConfig('count:\n  - category\n')

        const result = getAppData({
            app: {},
            pagesData: [
                { meta: { category: null } },
                { meta: { category: '' } },
                { meta: {} },
                { meta: { category: 'Tech' } },
            ],
        })

        expect(result.statistics.category).toEqual([
            { name: 'Tech', amount: 1 },
        ])
    })

    it('tolerates a page with no meta at all', () => {
        writeConfig('count:\n  - category\n')

        expect(() =>
            getAppData({ app: {}, pagesData: [{ content: '<p>x</p>' }] })
        ).not.toThrow()
    })
})

describe('Template Rendering', () => {
    const mockAppWithStatistics = {
        statistics: {
            category: [
                { name: 'Design', amount: 1 },
                { name: 'Tech', amount: 2 },
            ],
            topic: [
                { name: 'JavaScript', amount: 2 },
                { name: 'Python', amount: 1 },
            ],
        },
    }

    it('renders statistics table template correctly', () => {
        const $ = render('statistics.pug', mockAppWithStatistics)

        expect($('.statistics')).toHaveLength(1)

        const categorySection = $('.statistics__category').first()
        expect(categorySection.find('.statistics__title').text()).toBe(
            'Category'
        )

        const categoryRows = categorySection.find('.statistics__row')
        expect(categoryRows).toHaveLength(2)

        const firstRow = categoryRows.first()
        expect(firstRow.find('.statistics__cell').eq(0).text()).toBe('Design')
        expect(firstRow.find('.statistics__cell--count').text()).toBe('1')

        const secondRow = categoryRows.eq(1)
        expect(secondRow.find('.statistics__cell').eq(0).text()).toBe('Tech')
        expect(secondRow.find('.statistics__cell--count').text()).toBe('2')
    })

    it('renders statistics cards template correctly', () => {
        const $ = render('statistics-cards.pug', mockAppWithStatistics)

        expect($('.statistics--cards')).toHaveLength(1)

        const categoryCards = $('.statistics__category')
            .first()
            .find('.statistics__card')
        expect(categoryCards).toHaveLength(2)

        const firstCard = categoryCards.first()
        expect(firstCard.find('.statistics__card-name').text()).toBe('Design')
        expect(firstCard.find('.statistics__card-count').text()).toBe('1')
    })

    it('renders statistics list template correctly', () => {
        const $ = render('statistics-list.pug', mockAppWithStatistics)

        expect($('.statistics--list')).toHaveLength(1)

        const categoryItems = $('.statistics__category')
            .first()
            .find('.statistics__item')
        expect(categoryItems).toHaveLength(2)

        const firstItem = categoryItems.first()
        expect(firstItem.find('.statistics__name').text()).toBe('Design')
        expect(firstItem.find('.statistics__count').text()).toBe('1')
    })

    it('handles empty statistics gracefully in templates', () => {
        const $ = render('statistics.pug', { statistics: {} })

        expect($('.statistics__category')).toHaveLength(0)
    })

    it('renders numeric names produced from numeric frontmatter', () => {
        const $ = render('statistics-list.pug', {
            statistics: { year: [{ name: '2024', amount: 3 }] },
        })

        expect($('.statistics__name').text()).toBe('2024')
        expect($('.statistics__count').text()).toBe('3')
    })
})
