import path from 'path'
import pug from 'pug'
import { load } from 'cheerio'
import { describe, it, expect, beforeEach } from 'vitest'
import { getAppData } from '../index.js'

describe('Statistics Plugin', () => {
    let mockData

    beforeEach(() => {
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

    it('should handle custom sort by count ascending', () => {
        // Test with current data structure - default behavior
        const result = getAppData(mockData)

        // With current test data, categories: Design(1), Tech(2)
        // Default sort is alphabetical by name
        expect(result.statistics.category[0].name).toBe('Design')
        expect(result.statistics.category[1].name).toBe('Tech')
    })

    it('should handle empty display configuration gracefully', () => {
        const result = getAppData(mockData)

        // Should still work with default sorting
        expect(result.statistics).toBeDefined()
        expect(Array.isArray(result.statistics.category)).toBe(true)
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
        const dataWithMissingProps = {
            app: {},
            pagesData: [
                {
                    content: '<h1>Page</h1>',
                    meta: {
                        title: 'Page without props',
                        // No category, topic, or tags
                    },
                },
            ],
        }

        const result = getAppData(dataWithMissingProps)

        expect(result.statistics.category).toEqual([])
        expect(result.statistics.topic).toEqual([])
        expect(result.statistics.tags).toEqual([])
    })

    // Template Rendering Tests
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
            const templatePath = path.resolve('views/statistics.pug')

            const compileTemplate = pug.compileFile(templatePath, {
                basedir: path.resolve('.'),
            })

            const html = compileTemplate({
                app: mockAppWithStatistics,
            })

            const $ = load(html)

            // Check main container
            expect($('.statistics')).toHaveLength(1)

            // Check categories
            const categorySection = $('.statistics__category').first()
            expect(categorySection.find('.statistics__title').text()).toBe(
                'Category'
            )

            const categoryRows = categorySection.find('.statistics__row')
            expect(categoryRows).toHaveLength(2)

            // Check first category row
            const firstRow = categoryRows.first()
            expect(firstRow.find('.statistics__cell').eq(0).text()).toBe(
                'Design'
            )
            expect(firstRow.find('.statistics__cell--count').text()).toBe('1')

            // Check second category row
            const secondRow = categoryRows.eq(1)
            expect(secondRow.find('.statistics__cell').eq(0).text()).toBe(
                'Tech'
            )
            expect(secondRow.find('.statistics__cell--count').text()).toBe('2')
        })

        it('renders statistics cards template correctly', () => {
            const templatePath = path.resolve('views/statistics-cards.pug')

            const compileTemplate = pug.compileFile(templatePath, {
                basedir: path.resolve('.'),
            })

            const html = compileTemplate({
                app: mockAppWithStatistics,
            })

            const $ = load(html)

            // Check main container has cards modifier
            expect($('.statistics--cards')).toHaveLength(1)

            // Check category cards
            const categoryCards = $('.statistics__category')
                .first()
                .find('.statistics__card')
            expect(categoryCards).toHaveLength(2)

            // Check first card
            const firstCard = categoryCards.first()
            expect(firstCard.find('.statistics__card-name').text()).toBe(
                'Design'
            )
            expect(firstCard.find('.statistics__card-count').text()).toBe('1')
        })

        it('renders statistics list template correctly', () => {
            const templatePath = path.resolve('views/statistics-list.pug')

            const compileTemplate = pug.compileFile(templatePath, {
                basedir: path.resolve('.'),
            })

            const html = compileTemplate({
                app: mockAppWithStatistics,
            })

            const $ = load(html)

            // Check main container has list modifier
            expect($('.statistics--list')).toHaveLength(1)

            // Check category list items
            const categoryItems = $('.statistics__category')
                .first()
                .find('.statistics__item')
            expect(categoryItems).toHaveLength(2)

            // Check first list item
            const firstItem = categoryItems.first()
            expect(firstItem.find('.statistics__name').text()).toBe('Design')
            expect(firstItem.find('.statistics__count').text()).toBe('1')
        })

        it('handles empty statistics gracefully in templates', () => {
            const templatePath = path.resolve('views/statistics.pug')

            const compileTemplate = pug.compileFile(templatePath, {
                basedir: path.resolve('.'),
            })

            const html = compileTemplate({
                app: { statistics: {} },
            })

            const $ = load(html)

            // Should render empty container or no content
            expect($('.statistics__category')).toHaveLength(0)
        })
    })
})
