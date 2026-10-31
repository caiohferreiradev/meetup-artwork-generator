const { test, expect } = require('@playwright/test');
const { startPlayground } = require('./playground');

let site;
test.beforeAll(async () => { site = await startPlayground(); });
test.afterAll(async () => { await site?.close(); });

test('activation replaces the front page and deactivation restores it', async ({ page }) => {
  await page.goto(`${site.serverUrl}/?wpbr_lang=en_US`);
  await expect(page.getByRole('heading', { name: 'Meetup Artwork Generator', level: 1 })).toBeVisible();
  await page.goto(`${site.serverUrl}/wp-login.php`);
  await page.getByLabel('Username or Email Address').fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.goto(`${site.serverUrl}/wp-admin/plugins.php`);
  const plugin = page.locator('tr[data-slug="meetup-artwork-generator"]');
  await plugin.getByRole('link', { name: 'Deactivate' }).click();
  await page.goto(site.serverUrl);
  await expect(page.getByRole('heading', { name: 'Original front page' })).toBeVisible();
  await page.goto(`${site.serverUrl}/wp-admin/plugins.php`);
  await plugin.getByRole('link', { name: /^Activate/ }).click();
  await page.goto(`${site.serverUrl}/?wpbr_lang=en_US`);
  await expect(page.getByRole('heading', { name: 'Meetup Artwork Generator', level: 1 })).toBeVisible();
});
