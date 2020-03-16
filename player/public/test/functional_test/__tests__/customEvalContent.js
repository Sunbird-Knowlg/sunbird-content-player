const timeout = 50000
const typingSpeed = 50

/**
 * @author rahul shukla <rahul.shukla@ilimi.in>
 * @todo To use image diff we need to ignore options container in MCQ cause it always shuffle 
 * @link https://github.com/americanexpress/jest-image-snapshot#ignoring-parts-of-the-image-snapshot-if-using-puppeteer
 */

const { configureToMatchImageSnapshot } = require('jest-image-snapshot'); 
const customConfig = { 
    threshold: 0.1,
    failureThresholdType: 'percent',
    updatePassedSnapshot: true,
}
const toMatchImageSnapshot = configureToMatchImageSnapshot({
    customDiffConfig: customConfig,
    noColors: true
})
expect.extend({ toMatchImageSnapshot });

describe(
    'Sunbird Player functional testing - Custom EVAL content',
    () => {
        let page
        beforeAll(async () => {
            jest.setTimeout(timeout)
            page = await global.__BROWSER__.newPage()
            await page.goto('http://127.0.0.1:3000')
            await page.setViewport({
                width: 1280,
                height: 800
            })
        }, timeout)

        afterEach(async () => {
            await page.waitFor(5000)
        })

        afterAll(async () => {
            await page.close()
        })

        // Player instance on browser

        it('Player shell loaded with fixture stories', async () => {
            await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div', {
                visible: true
            })
        })

        // Custom eval test cases

        it('Player should load custom eval content', async () => {
            const playContent = await page.$('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(3)');
            console.clear = console.log = console.warn = console.error = () => {};
            await playContent.click()
            
        })

        it('custom eval content test with snapshot', async () => {
            const image = await page.screenshot();
            // expect(image).toMatchImageSnapshot();
        })

        it('Custom eval without clicking on options opens popup', async () => {
            page.on("console", msg => console.log("PAGE LOG:", msg));
            await page.waitForSelector('#gameCanvas')
            const nextNavigation = await page.waitForSelector('#overlay > next-navigation > div > div > a > img')
            await nextNavigation.click()
            const image = await page.screenshot();
            // expect(image).toMatchImageSnapshot();
        })

        it('On click of try again it should stay in same page', async () => {
            const tryAgain = await page.waitForSelector('#popup-buttons-container > div.right.primary.button.ng-binding')
            const image = await page.screenshot();
            // expect(image).toMatchImageSnapshot();
            await tryAgain.click();
        })

        it('Custom eval without clicking on options opens popup', async () => {
            await page.waitForSelector('#gameCanvas')
            const nextNavigation = await page.waitForSelector('#overlay > next-navigation > div > div > a > img')
            const image = await page.screenshot();
            // expect(image).toMatchImageSnapshot();
            await nextNavigation.click()
        })

        it('On click of next it should got to feedback popup and submit', async () => {
            // const tryAgain = await page.waitForSelector('#commentText')
            await page.focus('#commentText')
            await page.keyboard.type('Sunbird player')
            await page.$eval('#commentText', el => el.value = 'Sunbird player');
            // await page.keyboard.sendCharacter('');
            await page.click('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div.gc-fd-footer > input');
        })

        it('Should load content again on replay', async() => {
            await page.click('#endpage > div.gc-ep-content-holder > div.gc-ep-assessment-cont > div.gc-ep-footer > div.gc-ep-footer-icons.gc-ep-replay');
            await page.waitForSelector('#overlay > menu > div > div.gc-menu')
        })

    },
    timeout
)