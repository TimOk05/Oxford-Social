import { expect, test } from '@playwright/test';

const monitorPage = (page) => {
  const errors = [];
  const failedRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || 'failed'}`);
  });

  return { errors, failedRequests };
};

test('desktop experience loads cleanly and stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const monitor = monitorPage(page);

  await page.goto('/');
  await expect(page).toHaveTitle(/Oxford Social Manchester/);
  await expect(page.getByRole('heading', { level: 1, name: /Oxford Social/i })).toBeVisible();
  await expect(page.getByText('100% halal kitchen', { exact: true }).first()).toBeVisible();

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 1);

  const brokenImages = await page.locator('img').evaluateAll((images) => images
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => image.getAttribute('src')));

  expect(brokenImages).toEqual([]);
  expect(monitor.errors).toEqual([]);
  expect(monitor.failedRequests).toEqual([]);
});

test('day and night switch changes the hero content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const daylight = page.getByRole('button', { name: 'Daylight' });
  await daylight.click();

  await expect(daylight).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveAttribute('data-moment', 'day');
  await expect(page.locator('[data-hero-image]')).toHaveAttribute('src', /brunch-table\.jpg/);
  await expect(page.locator('[data-moment-copy]')).toContainText('Halal brunch');

  await page.getByRole('button', { name: 'After dark' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-moment', 'night');
});

test('mobile menu and FAQ work without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.locator('[data-menu-toggle]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await page.locator('#faq-title').scrollIntoViewIfNeeded();
  const question = page.getByText('Is the kitchen halal?', { exact: true });
  await question.click();
  await expect(page.getByText('Yes. Oxford Social is listed as having a 100% halal kitchen')).toBeVisible();

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 1);
});

test('tablet layout has no clipped page content', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await page.locator('footer').scrollIntoViewIfNeeded();

  const measurements = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight
  }));

  expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.clientWidth + 1);
  expect(measurements.scrollHeight).toBeGreaterThan(3000);
});
