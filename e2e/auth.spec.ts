import { test, expect } from '@playwright/test';

test.describe('Auth Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renderiza título e formulário de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Controle de Ponto' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('mostra erro ao enviar formulário vazio', async ({ page }) => {
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Preencha todos os campos')).toBeVisible();
  });

  test('alterna para modo registro e volta', async ({ page }) => {
    await page.getByText('Cadastre-se').click();
    await expect(page.getByLabel('Confirmar senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();

    await page.getByText('Faça login').click();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('valida senha mínima no registro', async ({ page }) => {
    await page.getByText('Cadastre-se').click();
    await page.getByLabel('Email').fill('test@email.com');
    await page.getByLabel('Senha', { exact: true }).fill('123');
    await page.getByLabel('Confirmar senha').fill('123');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('Senha deve ter no mínimo 6 caracteres')).toBeVisible();
  });

  test('valida que senhas coincidem no registro', async ({ page }) => {
    await page.getByText('Cadastre-se').click();
    await page.getByLabel('Email').fill('test@email.com');
    await page.getByLabel('Senha', { exact: true }).fill('123456');
    await page.getByLabel('Confirmar senha').fill('654321');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByText('As senhas não coincidem')).toBeVisible();
  });
});
