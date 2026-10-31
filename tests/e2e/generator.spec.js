const { test, expect } = require('@playwright/test');
const { startPlayground } = require('./playground');

const key = 'wpbr-artes-state-v1';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/ZV8AAAAASUVORK5CYII=', 'base64');
let site;

test.beforeAll(async () => { site = await startPlayground(); });
test.afterAll(async () => { await site?.close(); });
test.beforeEach(async ({ page }) => { await page.goto(`${site.serverUrl}/?wpbr_lang=en_US`); await expect(page.locator('#wpbr-size')).not.toBeEmpty(); });

async function saved(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
}

test('saves text and restores it after reload', async ({ page }) => {
  await page.getByLabel('Meetup title (theme)').fill('A WordPress meetup');
  await expect.poll(async () => (await saved(page))?.title).toBe('A WordPress meetup');
  await page.reload();
  await expect(page.getByLabel('Meetup title (theme)')).toHaveValue('A WordPress meetup');
});

test('manual headers survive reload', async ({ page }) => {
  test.fail(true, 'Known regression: issue #2');
  await page.getByLabel('Next to the logo, first line').fill('Custom community');
  await page.getByLabel('Next to the logo, second line').fill('Special edition');
  await expect.poll(async () => (await saved(page))?.auto?.subheader).toBe(false);
  await page.reload();
  await expect(page.getByLabel('Next to the logo, first line')).toHaveValue('Custom community', { timeout: 2000 });
  await expect(page.getByLabel('Next to the logo, second line')).toHaveValue('Special edition');
});

test('migrates the old automatically generated title', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ title: 'old automatic title', auto: { title: true } })), key);
  await page.reload();
  await expect(page.getByLabel('Meetup title (theme)')).toHaveValue('');
});

test('recovers from invalid JSON', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{invalid'), key);
  await page.reload();
  await expect(page.locator('#wpbr-size')).not.toBeEmpty();
  await expect(page.getByLabel('Meetup title (theme)')).toHaveValue('');
});

test('recovers valid data from malformed saved state', async ({ page }) => {
  test.fail(true, 'Known regression: issue #4');
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ title: 'Keep this', talks: null })), key);
  await page.reload();
  await expect(page.locator('#wpbr-size')).not.toBeEmpty({ timeout: 3000 });
  await expect(page.getByLabel('Meetup title (theme)')).toHaveValue('Keep this');
});

test('when storage quota is exceeded the text-only fallback is saved', async ({ page }) => {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'wpbr-artes-state-v1' && JSON.parse(value).talks.some((talk) => talk.photo)) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });
  await page.locator('#wpbr-talks input[type=file]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#wpbr-talks img')).toBeVisible();
  await page.getByLabel('Meetup title (theme)').fill('Text kept');
  await expect.poll(async () => (await saved(page))?.title).toBe('Text kept');
  expect((await saved(page)).talks[0].photo).toBe('');
});

test('format radio group supports keyboard navigation', async ({ page }) => {
  const formats = page.getByRole('radiogroup', { name: 'Artwork format' });
  const first = formats.getByRole('radio').first();
  const second = formats.getByRole('radio').nth(1);
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(first).toBeFocused();
});

for (const [kind, selector] of [['photo', '#wpbr-talks'], ['logo', '#wpbr-sponsors']]) {
  test(`${kind} button keeps an accessible name after upload and removal`, async ({ page }) => {
    test.fail(true, 'Known regression: issue #7');
    if (kind === 'logo') await page.getByRole('button', { name: 'Add logo' }).click();
    const item = page.locator(selector);
    const button = item.locator('[data-action=photo]');
    await expect(button).toHaveAccessibleName(/.+/);
    await item.locator('input[type=file]').setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: png });
    await expect(item.locator('img')).toBeVisible();
    await expect(button).toHaveAccessibleName(/.+/, { timeout: 2000 });
    await item.locator('[data-action=clear-photo]').click();
    await expect(button).toHaveAccessibleName(/.+/);
  });
}

test('image buttons open the file chooser by keyboard', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Photo', exact: true });
  await button.focus();
  const chooser = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await chooser;
});

test('form enforces the title and description character limits', async ({ page }) => {
  const title = page.getByLabel('Meetup title (theme)');
  const description = page.getByLabel('Description (optional)');
  await title.fill('T'.repeat(100));
  await description.fill('D'.repeat(220));
  await expect(title).toHaveValue('T'.repeat(90));
  await expect(description).toHaveValue('D'.repeat(200));
});

test('renders valid PNGs at the specified size for every format and theme', async ({ page }) => {
  const results = await page.evaluate(async () => {
    await window.WPBRArtesRenderer.ready();
    const data = { header: 'WordPress Community', subheader: '#18 In person', dateText: '09.NOV', timeText: '19:00 BRT', title: 'Community meetup', titleWeight: '400', description: 'A friendly event', venue: '', highlight: 'Free event', talks: [{ title: 'A talk', speaker: 'Ana', photo: null }], sponsors: [], landmark: null };
    const rows = [];
    for (const format of window.wpbrArtes.formats) for (const theme of ['light', 'dark']) {
      const canvas = document.createElement('canvas');
      const result = window.WPBRArtesRenderer.render(canvas, { ...data, theme }, format);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()).slice(0, 8));
      const decoded = await createImageBitmap(blob);
      rows.push({ id: format.id, theme, width: decoded.width, height: decoded.height, expectedWidth: format.width, expectedHeight: format.height, bytes, overflow: result.overflow });
      decoded.close();
    }
    return rows;
  });
  expect(results).toHaveLength(14);
  for (const row of results) {
    expect(row.bytes).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect([row.width, row.height]).toEqual([row.expectedWidth, row.expectedHeight]);
    expect(row.overflow).toBe(false);
  }
});

test('renders maximum-length fields and multiple speakers in every format', async ({ page }) => {
  const results = await page.evaluate(async () => {
    await window.WPBRArtesRenderer.ready();
    const data = { header: 'H'.repeat(50), subheader: 'S'.repeat(40), dateText: '09.NOV', timeText: '19:00 UTC', title: 'Title '.repeat(15), titleWeight: '700', description: 'Description '.repeat(16).slice(0, 200), venue: 'Venue '.repeat(20), highlight: 'Highlight '.repeat(6), talks: Array.from({ length: 4 }, (_, i) => ({ title: `Talk ${i} `.repeat(10), speaker: `Speaker ${i} `.repeat(6), photo: null })), sponsors: [], landmark: null };
    return window.wpbrArtes.formats.flatMap(format => ['light', 'dark'].map(theme => {
      const canvas = document.createElement('canvas');
      const result = window.WPBRArtesRenderer.render(canvas, { ...data, theme }, format);
      return { width: canvas.width, height: canvas.height, expectedWidth: format.width, expectedHeight: format.height, overflow: result.overflow, png: canvas.toDataURL('image/png').startsWith('data:image/png;base64,') };
    }));
  });
  expect(results).toHaveLength(14);
  for (const row of results) {
    expect([row.width, row.height]).toEqual([row.expectedWidth, row.expectedHeight]);
    expect(typeof row.overflow).toBe('boolean');
    expect(row.png).toBe(true);
  }
});

test('exports a PNG through the download control', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download this artwork' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const bytes = Buffer.concat(chunks);
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(bytes.readUInt32BE(16)).toBe(1920);
  expect(bytes.readUInt32BE(20)).toBe(1080);
});

test('warns when long content exceeds the layout', async ({ page }) => {
  const overflow = await page.evaluate(async () => {
    await window.WPBRArtesRenderer.ready();
    return window.WPBRArtesRenderer.render(document.createElement('canvas'), { theme: 'light', header: 'Community', subheader: '', dateText: '', timeText: '', title: 'Title', titleWeight: '400', description: 'long words '.repeat(1000), venue: '', highlight: '', talks: [], sponsors: [], landmark: null }, window.wpbrArtes.formats[0]).overflow;
  });
  expect(overflow).toBe(true);
});

test('does not throw with many speakers', async ({ page }) => {
  test.fail(true, 'Known regression: issue #5');
  await page.evaluate(async () => {
    await window.WPBRArtesRenderer.ready();
    for (const format of window.wpbrArtes.formats) for (const count of [0, 1, 23, 24, 30]) {
      window.WPBRArtesRenderer.render(document.createElement('canvas'), { theme: 'light', header: 'Community', subheader: '', dateText: '', timeText: '', title: 'Title', titleWeight: '400', description: '', venue: '', highlight: '', talks: Array.from({ length: count }, (_, i) => ({ title: `Talk ${i}`, speaker: `Speaker ${i}`, photo: null })), sponsors: [], landmark: null }, format);
    }
  });
});

test('signals horizontal overflow for a long unbroken word', async ({ page }) => {
  test.fail(true, 'Known regression: issue #6');
  const overflow = await page.evaluate(async () => {
    await window.WPBRArtesRenderer.ready();
    return window.WPBRArtesRenderer.render(document.createElement('canvas'), { theme: 'light', header: 'Community', subheader: '', dateText: '', timeText: '', title: 'Title', titleWeight: '400', description: 'W'.repeat(200), venue: '', highlight: '', talks: [], sponsors: [], landmark: null }, window.wpbrArtes.formats[0]).overflow;
  });
  expect(overflow).toBe(true);
});
