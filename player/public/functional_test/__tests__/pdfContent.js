const timeout = 50000

const typingSpeed = 50

let jestscreenshot = require('@jeeyah/jestscreenshot');

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
            await page.setViewport({
                width: 1280,
                height: 800
            })
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
            const playContent = await page.waitForSelector('#overlay > next-navigation > div > a');
            await playContent.click()
        })
        it('Player should load previous page on pdf', async() => {
            const previousContent = await page.waitForSelector('#overlay > previous-navigation > div > a')
            await previousContent.click()
        })
        
        it('Go to next page by setting a page value', async () => {
            await page.waitForSelector('#pdf-find-text')
            await page.evaluate(() => {
                document.querySelector('#pdf-find-text').value = 5;
            });
            await page.waitForSelector('#page-count-container > div.search-page-pdf-arrow-container')
            await page.evaluate(() => {
                document.querySelector('#page-count-container > div.search-page-pdf-arrow-container').style = 'display : block';
            })
            const goToPage = await page.waitForSelector('#page-count-container > div.search-page-pdf-arrow-container')
            await goToPage.click()
        })
        
        it('Player should open new tab to download pdf', async () => {
            const downloadContent = await page.waitForSelector('#download-btn')
            await downloadContent.click()
        })
        
    },
    timeout
)
