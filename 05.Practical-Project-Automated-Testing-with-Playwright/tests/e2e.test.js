const {test, describe, beforeEach, afterEach, beforeAll, afterAll, expect} =  require("@playwright/test")

const {chromium} = require('playwright')

const host = 'http://localhost:3000'

let browser;
let context;
let page;

let user = {

    email:'',
    password: 'tedd123',
    confirmPassword: 'tedd123'

}

let game = {

    title: '',
    category: '',
    id: '',
    maxLevel:'13',
    imageUrl: 'https://jpeg.org/images/jpeg-home.jpeg',
    summary: "This is an amazing game"
}

describe('e2e tests', ()=>{
    beforeAll(async()=>{
        browser = await chromium.launch()
    })

    afterAll(async()=>{
        await browser.close()
    })

    beforeEach(async()=>{
       context = await browser.newContext()
       page = await context.newPage()

    })

    afterEach(async()=>{
       await context.close()
       await page.close()
    })


    describe('Authentication tests', ()=>{
        test('Register with valid data', async ()=>{

            await page.goto(host)

            await page.click('text=Register')

            await page.waitForSelector('#register')

            let random = Math.floor(Math.random() * 10000)

            user.email = `softuni_${random}@abv.bg`

            await page.locator('#email').fill(user.email)

            await page.locator('#register-password').fill(user.password)

            await page.locator('#confirm-password').fill(user.confirmPassword)

            await Promise.all([
                page.waitForURL(host),
                page.click('[type="submit"]')
            ])

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(host + '/')
        })

        test('Register with empty fields', async ()=>{

            await page.goto(host)

            await page.click('text=Register')

            await page.waitForSelector('#register')

            await page.click('[type="submit"]')

            expect(page.url()).toBe(host + '/register')
        })

        test('Login with valid credentials', async ()=>{

            await page.goto(host)

            await page.click('text=Login')

            await page.waitForSelector('#login')

            await page.locator('#email').fill(user.email)

            await page.locator('#login-password').fill(user.password)

            await Promise.all([
                page.waitForURL(host),
                page.click('[type="submit"]')
            ])

            await expect(page.locator('nav >> text=Logout')).toBeVisible()
            expect(page.url()).toBe(host + '/')
        })

        test('Login with empty fields', async ()=>{

            await page.goto(host)

            await page.click('text=Login')

            await page.waitForSelector('#login')

            await page.click('[type="submit"]')

            expect(page.url()).toBe(host + '/login')
        })

        test('Logout from application', async ()=>{

            await page.goto(host)

            await page.click('text=Login')

            await page.waitForSelector('#login')

            await page.locator('#email').fill(user.email)

            await page.locator('#login-password').fill(user.password)

            await Promise.all([
                page.waitForURL(host),
                page.click('[type="submit"]')
            ])

            await page.click('nav >> text=Logout')

            await expect(page.locator('nav >> text=Login')).toBeVisible()
            expect(page.url()).toBe(host + '/')
        })
    })

    describe('Navigation Bar for Logged-In User', ()=>{

        test('Navigation bar for logged in user', async ()=>{

            await page.goto(host)

            await page.click('text=Login')

            await page.waitForSelector('#login')

            await page.locator('#email').fill(user.email)

            await page.locator('#login-password').fill(user.password)

            await Promise.all([
                page.waitForURL(host),
                page.click('[type="submit"]')
            ])

            await expect(page.locator('nav >> text=All games')).toBeVisible()
            await expect(page.locator('nav >> text=Create Game')).toBeVisible()
            await expect(page.locator('nav >> text=Logout')).toBeVisible()

            await expect(page.locator('nav >> text=Login')).toBeHidden()
            await expect(page.locator('nav >> text=Register')).toBeHidden()
        })

        test('Navigation bar for guest user', async ()=>{

            await page.goto(host)

            await expect(page.locator('nav >> text=All games')).toBeVisible()
            await expect(page.locator('nav >> text=Login')).toBeVisible()
            await expect(page.locator('nav >> text=Register')).toBeVisible()

            await expect(page.locator('nav >> text=Create Game')).toBeHidden()
            await expect(page.locator('nav >> text=Logout')).toBeHidden()
        })
    })

    describe('CRUD operations tests', ()=>{

        beforeEach(async()=>{

            await page.goto(host)

            await page.click('text=Login')

            await page.waitForSelector('#login')

            await page.locator('#email').fill(user.email)

            await page.locator('#login-password').fill(user.password)

            await Promise.all([
                page.waitForURL(host),
                page.click('[type="submit"]')
            ])
        })

        test('Create game with empty fields', async ()=>{

            await page.click('text=Create Game')

            await page.waitForSelector('#create')

            await page.click('[type="submit"]')

            expect(page.url()).toBe(host + '/create')
        })

        test('Create game with valid input values', async ()=>{

            await page.click('text=Create Game')

            await page.waitForSelector('#create')

            let random = Math.floor(Math.random() * 10000)

            game.title = `Random game ${random}`
            game.category = `Category ${random}`

            await page.locator('#title').fill(game.title)
            await page.locator('#category').fill(game.category)
            await page.locator('#maxLevel').fill(game.maxLevel)
            await page.locator('#imageUrl').fill(game.imageUrl)
            await page.locator('#summary').fill(game.summary)

            await Promise.all([
                page.waitForURL(host),
                page.click('[type="submit"]')
            ])

            expect(page.url()).toBe(host + '/')
            await expect(page.locator(`text=${game.title}`)).toBeVisible()
        })

        test('Edit/Delete buttons for owner', async ()=>{

            await page.goto(host + '/catalog')

            await page.waitForSelector('.allGames')

            await page.click(`.allGames:has-text("${game.title}") .details-button`)

            await page.waitForURL(/\/details\/[a-z0-9]+/)

            game.id = page.url().split('/').pop()

            await expect(page.locator('a.button:has-text("Delete")')).toBeVisible()
            await expect(page.locator('a.button:has-text("Edit")')).toBeVisible()
        })

        test('Edit/Delete buttons for non-owner', async ()=>{

            await page.goto(host + '/catalog')

            await page.waitForSelector('.allGames', {timeout: 10000})

            const games = await page.locator('.allGames').all()

            // Find a game that doesn't match our created game title
            let foundNonOwnedGame = false
            for (let gameElement of games) {
                const text = await gameElement.textContent()
                if (!text.includes(game.title)) {
                    await gameElement.locator('.details-button').click()
                    foundNonOwnedGame = true
                    break
                }
            }

            if (foundNonOwnedGame) {
                await page.waitForURL(/\/details\/[a-z0-9]+/)

                await expect(page.locator('a.button:has-text("Delete")')).toBeHidden()
                await expect(page.locator('a.button:has-text("Edit")')).toBeHidden()
            }
        })

        test('Edit button for game owner', async ()=>{

            // Create a new game for editing
            await page.click('text=Create Game')

            await page.waitForSelector('#create')

            let random = Math.floor(Math.random() * 10000)

            game.title = `Edit Test Game ${random}`
            game.category = `Category ${random}`

            await page.locator('#title').fill(game.title)
            await page.locator('#category').fill(game.category)
            await page.locator('#maxLevel').fill(game.maxLevel)
            await page.locator('#imageUrl').fill(game.imageUrl)
            await page.locator('#summary').fill(game.summary)

            await Promise.all([
                page.waitForURL(host + '/'),
                page.click('[type="submit"]')
            ])

            // Now test editing
            await page.goto(host + '/catalog')

            await page.waitForSelector('.allGames')

            await page.click(`.allGames:has-text("${game.title}") .details-button`)

            await page.waitForURL(/\/details\/[a-z0-9]+/)

            game.id = page.url().split('/').pop()

            await page.click('a.button:has-text("Edit")')

            await page.waitForSelector('#edit')

            game.title = game.title + ' EDITED'

            await page.locator('#title').fill(game.title)

            await page.click('[type="submit"]')

            await page.waitForURL(host + '/details/' + game.id)

            await expect(page.locator(`text=${game.title}`)).toBeVisible()
            expect(page.url()).toBe(host + '/details/' + game.id)
        })

        test('Delete button for game owner', async ()=>{

            await page.goto(host + '/catalog')

            await page.waitForSelector('.allGames')

            await page.click(`.allGames:has-text("${game.title}") .details-button`)

            await page.waitForURL(/\/details\/[a-z0-9]+/)

            await page.click('a.button:has-text("Delete")')

            await page.waitForURL(host + '/')

            expect(page.url()).toBe(host + '/')
        })
    })

    describe('Home page tests', ()=>{

        test('Home page for guest user', async ()=>{

            await page.goto(host)

            await expect(page.locator('text=ALL new games are')).toBeVisible()
            await expect(page.locator('text=Only in GamesPlay')).toBeVisible()

            const games = await page.locator('.game').count()
            expect(games).toBeGreaterThanOrEqual(3)
        })
    })
})

