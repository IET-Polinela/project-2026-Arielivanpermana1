const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './smartcity_citizen_spa_24782038/tests',
  timeout: 30000,
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
});
