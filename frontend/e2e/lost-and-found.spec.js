import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Lost and Found System - Real Authentication Flow', () => {
  // Real credentials provided by the user
  const TEST_EMAIL = 'tharuka@gmail.com';
  const TEST_PASSWORD = 'tharuka123';
  const MOCK_ITEM_ID = 'mock_item_123';

  test.beforeEach(async ({ page }) => {
    // --- NO LOGIN MOCKING - Using Real Backend ---

    // 1. Mock ONLY Data APIs to ensure UI test consistency
    await page.route('**/api/items?**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: MOCK_ITEM_ID,
            title: 'Blue Puma Backpack',
            category: 'Bags',
            location: 'Library',
            description: 'Left it near the study area.',
            itemType: 'Lost',
            image: 'https://via.placeholder.com/150',
            createdAt: new Date().toISOString(),
            owner: { _id: 'user_123', name: 'Tharuka Student' }
          }
        ])
      });
    });

    await page.route(`**/api/items/${MOCK_ITEM_ID}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: MOCK_ITEM_ID,
          title: 'Blue Puma Backpack',
          category: 'Bags',
          location: 'Library',
          description: 'Left it near the study area.',
          itemType: 'Lost',
          image: 'https://via.placeholder.com/150',
          createdAt: new Date().toISOString(),
          owner: { _id: 'other_user', name: 'Other Student', email: 'other@uni.edu', phoneNumber: '0771234567' },
          isContactShared: false,
          status: 'Available'
        })
      });
    });

    // 2. Perform REAL Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for the system to process real login and redirect
    await page.waitForURL('http://localhost:5173/');
  });

  test('1. Verify Real Authentication & Dashboard access', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    // Verify that the user name or profile is visible if applicable
  });

  test('2. Report Lost Item (UI Flow)', async ({ page }) => {
    await page.goto('/report-lost');
    await page.fill('input[name="title"]', 'Lost My Wallet');
    await page.selectOption('select[name="category"]', 'Other');
    await page.selectOption('select[name="location"]', 'Canteen');
    await page.fill('textarea[name="description"]', 'Black leather wallet.');
    
    const filePath = path.join(__dirname, 'dummy-document.png');
    await page.setInputFiles('input[type="file"]', filePath);
    
    // We mock the POST response to avoid cluttering the real DB during every test run
    await page.route('**/api/items', async route => route.fulfill({ status: 201, body: JSON.stringify({ item: { _id: 'new' }, matches: [] }) }));
    
    await page.click('button[type="submit"]');
    await page.waitForURL('**/lost-and-found');
  });

  test('3. Search and View Item Details', async ({ page }) => {
    await page.goto('/lost-and-found');
    await page.fill('input[placeholder*="Search"]', 'Puma');
    await page.click('button:has-text("View Details")');
    await expect(page.locator('.lf-details-header h1')).toHaveText('Blue Puma Backpack');
  });
});
