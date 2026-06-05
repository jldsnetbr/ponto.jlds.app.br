import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('redireciona de rota protegida para /login quando não autenticado', async ({ page }) => {
    await page.goto('/punch');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redireciona de /bank para /login quando não autenticado', async ({ page }) => {
    await page.goto('/bank');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redireciona de /history para /login quando não autenticado', async ({ page }) => {
    await page.goto('/history');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redireciona de /settings para /login quando não autenticado', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('raiz redireciona para /login quando não autenticado', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
