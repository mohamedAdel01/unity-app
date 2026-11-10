import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    viewportWidth: 390,
    viewportHeight: 844,
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
  },
});
