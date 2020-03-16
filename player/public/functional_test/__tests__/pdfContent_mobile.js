const timeout = 50000

const typingSpeed = 50

let jestscreenshot = require('@jeeyah/jestscreenshot');
const devices = require('puppeteer/DeviceDescriptors');

const { toMatchImageSnapshot } = require('jest-image-snapshot'); 
expect.extend({ toMatchImageSnapshot });

describe(
    'Sunbird Player functional testing - PDF content',
    () => {
        let page
        beforeAll(async () => {
            jest.setTimeout(timeout)
            page = await global.__BROWSER__.newPage()
            await page.goto('http://127.0.0.1:3000')
            await page.emulate(devices['iPad','LG Optimus L70','iPhone 4'])
            let path = require('path');
            let scriptName = path.basename(__filename).replace('.js', '');
            let options = {
                page: page, 
                dirName: __dirname,
                scriptName: scriptName,
                onlyFailures: true
              };
              await jestscreenshot.init(options);  
        }, timeout)

        afterEach(async () => {
            await page.waitFor(5000)
        })

        afterAll(async () => {
            jestscreenshot.cleanup(function () {
                if (browser) {
                  browser.close();
                }
                done();
              });
            await page.close()
        })

        // Player instance on browser

        it('Player shell loaded with fixture stories', async () => {
            await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div')
        })

        // Custom eval test cases

        it('Player should be having PDF content', async () => {
            const playContent = await page.$('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(7)');
            await playContent.click()
        })

        it('PDF page count is proper', async() => {
            const element = await page.$("#pdf-total-pages");
            const numberOfPagesInNavigation = await page.evaluate(element => element.textContent, element);
            
            let numberOfPagesInDOM = await page.evaluate(() => {
                let elements = document.getElementsByClassName('page');
                return elements.length;
            });
            expect(parseInt(numberOfPagesInNavigation)).toBe(numberOfPagesInDOM);
            // expect(parseInt(numberOfPagesInNavigation)).toBe(100);
        })

        it('Player should load next page on pdf', async () => {
            const playContent = await page.$('#overlay > next-navigation > div > a');
            await playContent.click()
        })
    },
    timeout
)