import { test, expect } from '@playwright/test';

test('El usuario puede navegar al login y ver el formulario de recuperación', async ({ page }) => {
  await page.goto('/login');
  
  // Verify that the email input is visible
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible();

  // Verify the "Olvidaste tu contraseña?" link and click it
  const forgotLink = page.locator('text=¿Olvidaste tu contraseña?');
  await expect(forgotLink).toBeVisible();
  await forgotLink.click();

  // Wait for navigation
  await page.waitForURL('**/olvido-clave');

  // Verify elements on olvido-clave page
  await expect(page.locator('h2:has-text("Recuperar Contraseña")')).toBeVisible();
  await expect(page.locator('button:has-text("Enviar Enlace")')).toBeVisible();
});
