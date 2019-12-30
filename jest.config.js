module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
    transformIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        // '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)',
        '**/tests/**/*.spec.(js)'
    ],
    testURL: 'http://localhost/',
    watchPlugins: [
        // 'jest-watch-typeahead/filename',
        // 'jest-watch-typeahead/testname',
    ],
    globals: {
    },
};
