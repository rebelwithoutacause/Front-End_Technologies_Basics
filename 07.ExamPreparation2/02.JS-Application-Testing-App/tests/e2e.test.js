const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

const routes = {
    home: host + '/',
    catalog: host + '/catalog'
}

let browser;
let context;
let page;

let user = {
    email: "",
    password: "123456",
    confirmPass: "123456",
};

let petName = "";

async function loginUser(page, email, password) {
    await page.goto(routes.home)
    await page.click('text=Login')
    await page.waitForSelector('form')
    await page.locator('#email').fill(email)
    await page.locator('#password').fill(password)
    await page.click('[type="submit"]')
}

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
        test('Register with valid data', async () => {
            await page.goto(routes.home)
            await page.click('text=Register')
            await page.waitForSelector('form')

            const random = Math.floor(Math.random() * 1123123)
            user.email = `studentNumber_${random}@softuni.bg`

            await page.locator('#email').fill(user.email)
            await page.locator('#password').fill(user.password)
            await page.locator('#repeatPassword').fill(user.confirmPass)
            await page.click('[type="submit"]')

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(routes.home)//host + '/'
        })

        test('Login user with valid data', async () => {
            await loginUser(page, user.email, user.password)

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(routes.home)//host + '/'
        })

        test('Logout user from the app', async () => {
            await loginUser(page, user.email, user.password)
            await page.locator('nav >> text=Logout').click()

            await expect(page.locator('nav >> text=Login')).toBeVisible()
            expect(page.url()).toBe(routes.home)//host + '/'
        })

    })

    describe("navbar", () => {
        test('Navigation for loged in user', async () => {

            await loginUser(page, user.email, user.password)

            await expect(page.locator('nav >> text=Home')).toBeVisible()
            await expect(page.locator('nav >> text=Dashboard')).toBeVisible()
            await expect(page.locator('nav >> text=Create Postcard')).toBeVisible()
            await expect(page.locator('nav >> text=Logout')).toBeVisible()

            await expect(page.locator('nav >> text=Login')).toBeHidden()
            await expect(page.locator('nav >> text=Register')).toBeHidden()

        })
        test('Navigation for guest user', async () => {

            await page.goto(routes.home)

            await expect(page.locator('nav >> text=Home')).toBeVisible()
            await expect(page.locator('nav >> text=Dashboard')).toBeVisible()
            await expect(page.locator('nav >> text=Login')).toBeVisible()
            await expect(page.locator('nav >> text=Register')).toBeVisible()

            await expect(page.locator('nav >> text=Create Postcard')).toBeHidden()
            await expect(page.locator('nav >> text=Logout')).toBeHidden()
        })
    });

    describe("CRUD", () => {
        beforeEach(async () => {
            await loginUser(page, user.email, user.password)
        })

        test('Create postcard', async () => {
            await page.click('text=Create Postcard')
            await page.waitForSelector('form')

            const random = Math.floor(Math.random() * 1123123)
            petName = `Pet name: ${random}`

            await page.fill('#name', petName)
            await page.fill('#breed', 'Random breed')
            await page.fill('#age', '3 years')
            await page.fill('#weight', '5kg')
            await page.fill('#image', '../image/dog2.jpeg')

            await page.click('[type="submit"]')

            await expect(page.locator('div.animals-board h2.name', { hasText: petName })).toHaveCount(1)
            expect(page.url()).toBe(routes.catalog)//host + '/catalog'

        })
        test('Edit postcard', async () => {
            await page.goto(routes.catalog)//host + '/catalog'
            const divLocator = page.locator(`div.animals-board:has(h2.name:text("${petName}"))`)

            await divLocator.locator('a:text("Details")').click()

            await page.click('text=Edit')
            await page.waitForSelector('form')

            petName = petName + '_edited'
            await page.locator('#name').fill(petName)
            await page.click('[type="submit"]')

            await expect(page.locator('div.animalInfo h1'), { hasText: 'Name: ' + petName }).toHaveCount(1)

        })
        test('Delete postcard', async () => {
            await page.goto(routes.catalog)//host + '/catalog'
            const divLocator = page.locator(`div.animals-board:has(h2.name:text("${petName}"))`)

            await divLocator.locator('a:text("Details")').click()

            await page.click('text=Delete')

            await expect(page.locator('div.animals-board h2.name'), { hasText: petName }).toHaveCount(0)
            expect(page.url()).toBe(routes.catalog)//host + '/catalog'

        })
    });
})