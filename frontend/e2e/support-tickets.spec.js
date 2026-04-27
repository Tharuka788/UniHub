import { test, expect } from '@playwright/test';

test.describe('Support Ticket System - 8 Essential Test Cases', () => {
  // Real credentials provided by the user
  const STUDENT_EMAIL = 'tharuka@gmail.com';
  const STUDENT_PASSWORD = 'tharuka123';
  const ADMIN_EMAIL = 'admin@unihub.com';
  const ADMIN_PASSWORD = 'demo123';
  
  const MOCK_TICKET_ID = 'ticket_123';

  test.beforeEach(async ({ page }) => {
    // 1. Mock Authentication (Handles both Admin and Student)
    await page.route('**/api/users/login', async (route, request) => {
      const postData = JSON.parse(request.postData());
      const isAdmin = postData.email === ADMIN_EMAIL;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: isAdmin ? 'admin_123' : 'user_123',
          name: isAdmin ? 'UniHub Admin' : 'Tharuka Student',
          email: postData.email,
          token: 'mock-jwt-token',
          isAdmin: isAdmin
        })
      });
    });

    // 2. Mock Data Fetching
    await page.route('**/admin-support/my-tickets', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 1,
          tickets: [{ _id: MOCK_TICKET_ID, subject: 'Network Help', message: 'WiFi is slow.', status: 'Resolved', response: 'Fixed by IT.', createdAt: new Date().toISOString() }]
        })
      });
    });

    await page.route('**/admin-support/tickets**', async (route, request) => {
      const url = request.url();
      let tickets = [{ _id: MOCK_TICKET_ID, name: 'Tharuka Student', email: STUDENT_EMAIL, subject: 'Network Help', status: 'Resolved', createdAt: new Date().toISOString() }];
      if (url.includes('status=Pending')) tickets = [];
      
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tickets }) });
    });

    // Mock Action responses
    await page.route('**/admin-support/create', async route => route.fulfill({ status: 201, body: JSON.stringify({ message: 'Success' }) }));
    await page.route('**/admin-support/update/**', async route => route.fulfill({ status: 200, body: JSON.stringify({ message: 'Updated' }) }));
    await page.route('**/admin-support/reports/pdf**', async route => route.fulfill({ status: 200, contentType: 'application/pdf', body: 'pdf' }));
  });

  async function performLogin(page, email, password, expectedUrl = 'http://localhost:5173/') {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(expectedUrl);
  }

  test('1. Student: Successfully submit a support ticket', async ({ page }) => {
    await performLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/admin-support/create');
    await page.fill('input[name="subject"]', 'Login Issue');
    await page.fill('textarea[name="message"]', 'Help with my account.');
    await page.fill('input[name="name"]', 'Tharuka');
    await page.fill('input[name="email"]', STUDENT_EMAIL);
    await page.click('button:has-text("Submit Ticket")');
    await expect(page.locator('text=Ticket submitted successfully!')).toBeVisible();
  });

  test('2. Student: Form validation prevents empty submission', async ({ page }) => {
    await performLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/admin-support/create');
    await page.click('button:has-text("Submit Ticket")');
    await expect(page).toHaveURL(/.*create/);
  });

  test('3. Student: View my submitted tickets list', async ({ page }) => {
    await performLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/admin-support/tickets');
    await page.click('button:has-text("My Requests")');
    await expect(page.locator('text=Network Help')).toBeVisible();
  });

  test('4. Student: Display empty state if no tickets', async ({ page }) => {
    await page.route('**/admin-support/my-tickets', async route => route.fulfill({ status: 200, body: JSON.stringify({ total: 0, tickets: [] }) }));
    await performLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/admin-support/tickets');
    await page.click('button:has-text("My Requests")');
    await expect(page.locator('text=You haven\'t submitted any support requests yet.')).toBeVisible();
  });

  test('5. Student: Check official support response', async ({ page }) => {
    await performLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.goto('/admin-support/tickets');
    await page.click('button:has-text("My Requests")');
    await expect(page.locator('.ticket-response-box')).toContainText('Fixed by IT.');
  });

  test('6. Admin: Search and filter student tickets', async ({ page }) => {
    await performLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD, '**/admin-dashboard');
    await page.goto('/admin-support/manage');
    await page.fill('input[placeholder*="Search by student email"]', STUDENT_EMAIL);
    await page.click('button:has-text("Find Ticket")');
    await expect(page.locator('text=' + STUDENT_EMAIL)).toBeVisible();
    
    // Filter test
    await page.selectOption('select', 'Pending');
    await expect(page.locator('text=No tickets found.')).toBeVisible();
  });

  test('7. Admin: Update ticket status and response modal', async ({ page }) => {
    await performLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD, '**/admin-dashboard');
    await page.goto('/admin-support/manage');
    await page.click('.btn-icon-action.edit');
    await page.selectOption('select >> nth=1', 'Resolved');
    await page.fill('textarea[placeholder*="detailed response"]', 'Issue fixed.');
    await page.click('button:has-text("Commit Update")');
    page.on('dialog', dialog => dialog.accept());
  });

  test('8. Admin: Export and download PDF report', async ({ page }) => {
    await performLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD, '**/admin-dashboard');
    await page.goto('/admin-support/manage');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Support_Ticket_Report.pdf');
  });
});
