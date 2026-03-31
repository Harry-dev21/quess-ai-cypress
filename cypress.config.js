const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'wg4x7w',
  e2e: {
    baseUrl: 'https://qts-dev.quesscorp.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 15000,
    viewportWidth: 1440,
    viewportHeight: 900,
    env: {
      apiUrl: 'https://qts-dev.quesscorp.com/api',
      useMocks: true
    },
    setupNodeEvents(on, config) {
      return config
    }
  }
})