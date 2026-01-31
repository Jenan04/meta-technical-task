import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': 'uuid',
  },

  transformIgnorePatterns: [
    '/node_modules/(?!(uuid|@base2|@prisma/client)/)',
  ],

}

export default createJestConfig(config)