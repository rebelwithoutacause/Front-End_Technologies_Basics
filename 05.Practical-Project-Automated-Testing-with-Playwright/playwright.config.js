const {defineConfig, devices} = require ('@playwright/test')

module.exports = defineConfig({

    testDir: './tests', 
    fullyParallel: false,
    workers: 1,
    timeout: 60000,
    reporter: 'html',

    //Settings for all tests

    use: {
        baseURL: 'http://localhost:3000',

        //Visualization
        headless:true,
        slowMo: 500, 
        viewport: { width: 1200, height: 840},

        //Debugging

        screenshot: 'only-on-failure',
        video: 'retain-on-failure'


    },

    projects: [
        {
            name: 'chromium',
            use:{
                ...devices['Desktop Chrome'],
                launchOptions:{
                    slowMo: 500,
                    args:[
                        '--start-maximized'
                    ]
                }
            }
        }
    ],

    webServer: [
        {
            command: 'npm run start', //Frontend Server
            port: 3000,
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,  
        },

        {
            command: 'node server/server.js', //Backend server
            port: 3030,
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
            cwd: '.'
        }
    ]

})