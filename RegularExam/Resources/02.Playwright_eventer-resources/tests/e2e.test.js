const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

let browser;
let context;
let page;

let user = {
    email: "",
    password: "123456",
    confirmPass: "123456",
};

let eventName = "";

describe("e2e tests", () => {
    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });


    describe("authentication", () => {
        test('Registration with Valid Data', async () => {
            await page.goto(host);
            await page.click('text=Register');
            await page.waitForSelector('form');

            const randomNum = Math.floor(Math.random() * 10000);
            user.email = `newUser_${randomNum}@gmail.com`;

            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.fill('input[name="re-password"]', user.confirmPass);
            await page.click('button[type="submit"]');

            await expect(page.locator('#logoutBtn')).toBeVisible();
        });

        test('Login with Valid Data', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');

            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            await expect(page.locator('#logoutBtn')).toBeVisible();
        });

        test('Logout from the Application', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            await page.click('#logoutBtn');

            await page.waitForSelector('text=Login');
            await expect(page.locator('text=Login')).toBeVisible();
        });

    });

    describe("navbar", () => {
        test('Navigation for Logged-In User', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            await expect(page.locator('nav a[href="/dashboard"]')).toBeVisible();
            await expect(page.locator('nav a[href="/add-event"]')).toBeVisible();
            await expect(page.locator('#logoutBtn')).toBeVisible();
            await expect(page.locator('.guest a[href="/login"]')).toBeHidden();
            await expect(page.locator('.guest a[href="/register"]')).toBeHidden();
        });

        test('Navigation for Guest User', async () => {
            await page.goto(host);

            await expect(page.locator('.guest a[href="/login"]')).toBeVisible();
            await expect(page.locator('.guest a[href="/register"]')).toBeVisible();
            await expect(page.locator('.user a[href="/add-event"]')).toBeHidden();
            await expect(page.locator('#logoutBtn')).toBeHidden();
        });

    });

    describe("CRUD", () => {
        test('Add an Event', async () => {
            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            await page.waitForURL(host + '/');
            await page.click('.user a[href="/add-event"]');
            await page.waitForSelector('form');

            const randomNum = Math.floor(Math.random() * 10000);
            eventName = `Event_${randomNum}`;

            await page.fill('input[name="name"]', eventName);
            await page.fill('input[name="imageUrl"]', 'https://example.com/image.jpg');
            await page.fill('input[name="category"]', 'Music');
            await page.fill('textarea[name="description"]', 'This is a test event description');
            await page.fill('input[name="date"]', '2025-12-31');
            await page.click('button[type="submit"]');

            await expect(page).toHaveURL(host + '/dashboard');
            await expect(page.locator(`.event:has-text("${eventName}")`)).toBeVisible();
        });

        test('Edit an Event', async () => {
            if (!eventName) {
                throw new Error('Add an Event test must run first');
            }

            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            await page.click('nav a[href="/dashboard"]');
            await page.waitForSelector('.event');

            const eventCard = page.locator(`.event`).filter({ hasText: eventName }).first();
            await eventCard.locator('a.details-btn').click();

            await page.click('a#edit-btn');
            await page.waitForSelector('form');

            const updatedEventName = eventName + ' Updated';
            await page.fill('input[name="name"]', updatedEventName);
            await page.click('button[type="submit"]');

            await expect(page.locator('#details-title')).toHaveText(updatedEventName);
            eventName = updatedEventName;
        });

        test('Delete an Event', async () => {
            if (!eventName) {
                throw new Error('Add an Event and Edit an Event tests must run first');
            }

            await page.goto(host);
            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            await page.click('nav a[href="/dashboard"]');
            await page.waitForSelector('.event');

            const eventCard = page.locator(`.event`).filter({ hasText: eventName }).first();
            await eventCard.locator('a.details-btn').click();

            page.on('dialog', dialog => dialog.accept());
            await page.click('a#delete-btn');

            await expect(page).toHaveURL(host + '/dashboard');
            await expect(page.locator(`.event`).filter({ hasText: eventName })).not.toBeVisible();
        });

    });
});