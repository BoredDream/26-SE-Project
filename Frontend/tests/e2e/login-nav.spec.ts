import { test, expect, type Page } from '@playwright/test'

/**
 * 狮山花园 · 登录与底部导航 E2E 测试套件
 *
 * 覆盖核心可达路径：打开应用 → 演示模式登录 → 进入首页 → 通过底部导航在各页面间跳转，
 * 并验证路由守卫（未登录访问受保护页面会被重定向回登录页）。
 *
 * 选择器均来自实际源码：
 *   - login.vue        演示登录按钮 button.demo-login-btn
 *   - BottomNav.vue    底部导航 .nav-item / button.add-btn / 激活态 .nav-item.active
 *   - router.ts        路由守卫读取 localStorage.token；演示登录写入 demo_token_<时间戳>
 */

const SHOT_DIR = 'tests/e2e/screenshots'

/** 公共步骤：完成演示模式登录并停在首页 */
async function demoLogin(page: Page) {
  await page.goto('/')
  await page.locator('button.demo-login-btn').click()
  await page.waitForURL('**/home')
}

test.describe('狮山花园 · 登录与底部导航', () => {
  test('TC01 登录页正确渲染', async ({ page }) => {
    await page.goto('/')
    // 根路径应重定向到 /login
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: '狮山花园' })).toBeVisible()
    await expect(page.getByText('探索花卉之美，发现自然魅力')).toBeVisible()
    await expect(page.locator('button.demo-login-btn')).toHaveText('演示模式')
    await page.screenshot({ path: `${SHOT_DIR}/TC01-login.png`, fullPage: true })
  })

  test('TC02 演示模式登录成功并进入首页', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.demo-login-btn').click()
    // 登录后跳转到首页
    await expect(page).toHaveURL(/\/home$/)
    // token 已写入 localStorage（路由守卫依据）
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toMatch(/^demo_token_/)
    // 首页关键内容可见
    await expect(page.getByText('花卉打卡与分享平台')).toBeVisible()
    await expect(page.getByText('花卉推荐')).toBeVisible()
    await expect(page.getByText('花园帖子')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/TC02-home.png`, fullPage: true })
  })

  test('TC03 底部导航在各页面间正确跳转', async ({ page }) => {
    await demoLogin(page)
    const nav = page.locator('.bottom-nav')

    // 地图
    await nav.locator('.nav-item', { hasText: '地图' }).click()
    await expect(page).toHaveURL(/\/map$/)
    await expect(page.locator('#map-panel')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/TC03-map.png`, fullPage: true })

    // 花园
    await nav.locator('.nav-item', { hasText: '花园' }).click()
    await expect(page).toHaveURL(/\/garden$/)
    await expect(page.locator('.hero-title')).toHaveText('我的花园')
    await page.screenshot({ path: `${SHOT_DIR}/TC03-garden.png`, fullPage: true })

    // 我的
    await nav.locator('.nav-item', { hasText: '我的' }).click()
    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.locator('.profile-page')).toBeVisible()

    // 中间发布按钮 → 打卡页
    await nav.locator('button.add-btn').click()
    await expect(page).toHaveURL(/\/checkin$/)
    await expect(page.locator('.checkin-page')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/TC03-checkin.png`, fullPage: true })

    // 返回主页
    await page.goBack()
    await nav.locator('.nav-item', { hasText: '主页' }).click()
    await expect(page).toHaveURL(/\/home$/)
  })

  test('TC04 当前页签呈激活态', async ({ page }) => {
    await demoLogin(page)
    const nav = page.locator('.bottom-nav')

    // 首页：主页页签激活
    await expect(nav.locator('.nav-item.active')).toHaveText(/主页/)

    // 切到花园后：花园页签激活
    await nav.locator('.nav-item', { hasText: '花园' }).click()
    await expect(page).toHaveURL(/\/garden$/)
    await expect(nav.locator('.nav-item.active')).toHaveText(/花园/)
  })

  test('TC05 路由守卫：未登录访问受保护页面被重定向到登录页', async ({ page }) => {
    // 先确保无 token
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    // 直接访问受保护的 /garden
    await page.goto('/garden')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('button.demo-login-btn')).toBeVisible()
    await page.screenshot({ path: `${SHOT_DIR}/TC05-guard-redirect.png`, fullPage: true })
  })
})
