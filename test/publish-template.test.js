import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { publishTemplates } from '@nera-static/plugin-utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sourceDir = path.resolve(__dirname, '../views/')
const TEMPLATE_FILES = [
    'statistics.pug',
    'statistics-cards.pug',
    'statistics-list.pug',
]

// The previous version of this file asserted on a literal object it had just
// constructed and never called publishTemplates at all — zero coverage of the
// thing it was named after.
describe('Publish Template Script', () => {
    let tmpDir
    let originalCwd
    let templatesDir

    const publish = (options = {}) =>
        publishTemplates({
            pluginName: 'plugin-statistics',
            sourceDir,
            templateFiles: TEMPLATE_FILES,
            ...options,
        })

    beforeEach(() => {
        originalCwd = process.cwd()
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-statistics-pub-'))
        templatesDir = path.join(tmpDir, 'views/vendor/plugin-statistics')

        // Looks like a Nera project, which is what validateNeraProject checks
        // for as of plugin-utils 1.2.0 (D4).
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ name: 'my-site' })
        )
        fs.mkdirSync(path.join(tmpDir, 'config'), { recursive: true })
        fs.writeFileSync(path.join(tmpDir, 'config/app.yaml'), 'lang: en\n')
        fs.mkdirSync(path.join(tmpDir, 'pages'), { recursive: true })

        process.chdir(tmpDir)
    })

    afterEach(() => {
        process.chdir(originalCwd)
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('publishes every template the bin script declares', () => {
        expect(publish()).toBe(true)

        for (const file of TEMPLATE_FILES) {
            expect(fs.existsSync(path.join(templatesDir, file))).toBe(true)
        }
    })

    it('ships every declared template file', () => {
        // Guards against the bin script naming a template that does not exist.
        for (const file of TEMPLATE_FILES) {
            expect(fs.existsSync(path.join(sourceDir, file))).toBe(true)
        }
    })

    it('skips publishing when templates already exist', () => {
        fs.mkdirSync(templatesDir, { recursive: true })
        fs.writeFileSync(path.join(templatesDir, 'statistics.pug'), 'mine')

        expect(publish()).toBe(true)
        expect(
            fs.readFileSync(path.join(templatesDir, 'statistics.pug'), 'utf8')
        ).toBe('mine')
    })

    it('overwrites existing templates when force is set', () => {
        fs.mkdirSync(templatesDir, { recursive: true })
        fs.writeFileSync(path.join(templatesDir, 'statistics.pug'), 'mine')

        expect(publish({ force: true })).toBe(true)
        expect(
            fs.readFileSync(path.join(templatesDir, 'statistics.pug'), 'utf8')
        ).toBe(fs.readFileSync(path.join(sourceDir, 'statistics.pug'), 'utf8'))
    })

    it('refuses to publish outside a Nera project', () => {
        fs.rmSync(path.join(tmpDir, 'config/app.yaml'))
        fs.rmSync(path.join(tmpDir, 'pages'), { recursive: true })

        expect(publish()).toBe(false)
    })
})
