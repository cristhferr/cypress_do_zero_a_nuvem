const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'vw46rx',
  
  viewportHeight: 880,
  viewportWidth: 1280,
  retries: {
    runMode: 1,
  },
  e2e: {},

  //video: true, 
})
  