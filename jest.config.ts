/* eslint-disable */
export default {
  displayName: 'message',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json', useESM: true }],
  },
  moduleFileExtensions: ['ts', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^(.*)\\.[mctj]s$': ['$1', '$1.ts', '$1.js', '$1.mjs', '$1.cjs'],
  },
  testTimeout: 10_000,
};
