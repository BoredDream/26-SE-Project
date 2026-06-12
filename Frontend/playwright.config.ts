import { defineConfig, devices } from '@playwright/test'

/**
 * 狮山花园 · 前端 E2E 自动化测试配置（Playwright）
 *
 * 被测对象：Vue 3 + Vite 前端（默认端口 5173）。
 * 前端带 mock 数据降级，因此无需启动 Flask 后端即可运行全部用例。
 * webServer 会在测试开始时自动拉起 `npm run dev`，结束后自动关闭；
 * 若本地已手动启动 dev server，则复用之（reuseExistingServer）。
 */
export default defineConfig({
  testDir: './tests/e2e',
  // 失败重试一次，便于在 trace 中复盘
  retries: 0,
  // 用例间互不依赖，可并行；此处保持单 worker 以便输出顺序稳定、截图清晰
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'zh-CN',
    // 每个动作后/失败时保留证据
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 390, height: 844 }, // 移动端 H5 视口
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
})
