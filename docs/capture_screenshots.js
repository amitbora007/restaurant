const puppeteer = require('/tmp/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();

  // Helper to wait and screenshot
  const takeShot = async (url, filename, waitSelector = 'body', delay = 1500) => {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: 10000 }).catch(() => {});
    }
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot: ${filename}`);
  };

  try {
    // 1. Home Hero
    await takeShot('http://localhost:3000/', '01_home_hero.png', 'h1', 1500);

    // 2. Menu Catalog with pagination & category filters
    await takeShot('http://localhost:3000/menu', '02_menu_catalog.png', 'div', 2000);

    // 3. Checkout Page
    // First, let's navigate to home, set up cart in localStorage, then navigate to /checkout
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const sampleCart = [
        {
          id: 'item_1_full',
          menu_item_id: 'item_1',
          name: 'Veg Steamed Momos',
          size: 'Full (8 pcs)',
          portion: 'full',
          price: 70,
          quantity: 2,
          image_url: 'https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?w=400&q=80'
        },
        {
          id: 'item_3_half',
          menu_item_id: 'item_3',
          name: 'Paneer Fried Momos',
          size: 'Half (4 pcs)',
          portion: 'half',
          price: 60,
          quantity: 1,
          image_url: 'https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?w=400&q=80'
        }
      ];
      localStorage.setItem('cart', JSON.stringify(sampleCart));
      localStorage.setItem('restaurant_cart', JSON.stringify(sampleCart));
    });
    await takeShot('http://localhost:3000/checkout', '03_cart_checkout.png', 'form, input', 1500);

    // 4. Admin Login Portal
    await takeShot('http://localhost:3000/admin/login', '04_admin_login.png', 'input[name="email"]', 1500);

    // Login to Admin
    console.log('Logging in as admin (amitbora007@gmail.com)...');
    await page.type('input[name="email"]', 'xxxxxxxxx@gmail.com');
    await page.type('input[name="password"]', 'xxxxxxxxxxxx');
    await page.click('button[type="submit"]');

    // Wait for navigation or token storage
    await new Promise(r => setTimeout(r, 3000));

    // 5. Admin Dashboard
    await takeShot('http://localhost:3000/admin', '05_admin_dashboard.png', 'h1, h2, div', 2000);

    // 6. Admin Orders
    await takeShot('http://localhost:3000/admin/orders', '06_admin_orders.png', 'div', 2000);

    // 7. Admin Menu Items
    await takeShot('http://localhost:3000/admin/menu-items', '07_admin_menu_items.png', 'div', 2000);

    // 8. Admin Categories
    await takeShot('http://localhost:3000/admin/categories', '08_admin_categories.png', 'div', 2000);

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
