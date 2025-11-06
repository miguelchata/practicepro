const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'lucide-react': '<rootDir>/__mocks__/lucide-react.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(firebase|@firebase|@lit|lit-html|testing-library__jest-dom))'
  ],
}

module.exports = createJestConfig(customJestConfig)
