import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './tests/a11y',
    use: {
        baseURL: 'http://127.0.0.1:4178',
        browserName: 'chromium',
        channel: process.env.MDC_CHROME_PATH ? undefined : 'chromium',
        launchOptions: { executablePath: process.env.MDC_CHROME_PATH },
    },
    webServer: {
        command: 'pnpm --filter @sandlada/dev-app exec vite --host 127.0.0.1 --port 4178 --strictPort',
        url: 'http://127.0.0.1:4178',
        reuseExistingServer: !process.env.CI,
    },
})
