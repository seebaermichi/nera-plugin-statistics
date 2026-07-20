export default [
    {
        ignores: ['node_modules', 'public', 'dist', 'test/fixtures', 'test-temp'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            indent: ['error', 4],
            semi: ['error', 'never'],
            quotes: ['error', 'single'],
            'no-unused-vars': ['warn'],
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
]
