const nextJest = require('next/jest.js')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^streamdown$': '<rootDir>/src/__mocks__/streamdown.tsx',
    '^framer-motion$': '<rootDir>/src/__mocks__/framer-motion.tsx',
  },
}

module.exports = createJestConfig(config)
