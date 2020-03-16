/**
 * Functional test cases for question set
 * @author rahul shukla <rahul.shukla@ilimi.in>
 * @todo To use image diff we need to ignore options container in MCQ cause it always shuffle 
 * @link https://github.com/americanexpress/jest-image-snapshot#ignoring-parts-of-the-image-snapshot-if-using-puppeteer
 */

const timeout = 50000

const typingSpeed = 50

let jestscreenshot = require('@jeeyah/jestscreenshot');
const devices = require('puppeteer/DeviceDescriptors');

const { toMatchImageSnapshot } = require('jest-image-snapshot'); 
expect.extend({ toMatchImageSnapshot });

describe(
    'Sunbird Player functional testing - Question Set content',
    () => {
        let page
        beforeAll(async () => {
            jest.setTimeout(timeout)
            page = await global.__BROWSER__.newPage()
            await page.goto('http://127.0.0.1:3000')
            
            await page.setViewport({width: 1280,height: 800})
            // const metrics = await page.metrics();
            // console.info(metrics);
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

        it('Player shell loaded with fixture stories', async () => {
            await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
        })

        it('Should open question set', async() => {
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
        })

        it('Zoom button should open the image in zoomed view', async () => {
            const zoomImg = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-ZoomImg')
            await zoomImg.click()
        })

        it('check pop exists or not', async()=>{
            const popup = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div')
            await popup.click()
        })

        it('Test for title', async () => {
            const title = await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
        })

        it('Question title font size should be same in Mobile and Web and height and width should be different', async() => {
            const btnStylesInWeb = await page.$eval('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p', btnStylesInWeb => JSON.parse(JSON.stringify(getComputedStyle(btnStylesInWeb))));
            await page.emulate(devices['iPhone 4'])
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
            await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
            const btnStylesInMobile = await page.$eval('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p', btnStylesInMobile => JSON.parse(JSON.stringify(getComputedStyle(btnStylesInMobile))));
            // console.info("font size is" + btnStylesInWeb.fontsize)
            expect(btnStylesInWeb.fontsize).toEqual(btnStylesInMobile.fontsize) 
            expect(btnStylesInWeb.height).not.toEqual(btnStylesInMobile.height) 
            expect(btnStylesInWeb.width).not.toEqual(btnStylesInMobile.width) 
        })

        it('Test for Question Set', async () => {
            await page.setViewport({width: 1280,height: 800})
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
            await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
            const wrongAnswer = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div:nth-child(2)')
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            const previousButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-previous-navigation > div > a > img')
            const correctAnswer =  await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div.option-block.org-ekstep-questionunit-mcq-option-element.mcq-correct-answer')
            await wrongAnswer.click()
            await nextButton.click()
            const tryAgain = await page.waitForSelector('#popup-buttons-container > div.right.primary.button')
            await tryAgain.click()
            await correctAnswer.click()
            await nextButton.click()
            const nextPopupButton = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton.click()
            await nextButton.click()
            const popupNextButton = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton.click()
            await page.waitForSelector('#ans-field1');
            await page.evaluate(() => {
                document.querySelector('#ans-field1').value = 'jupiter';
            });
            await page.waitForSelector('#ans-field2');
            await page.evaluate(() => {
                document.querySelector('#ans-field2').value = 'mercury';
            });
            await nextButton.click();
            const nextPopupButton2 = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton2.click();
            await nextButton.click()
            const popupNextButton2 = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton2.click()

            const select1 = await page.waitForSelector('#w0')
            await select1.click()

            const select2 = await page.waitForSelector('#w1')
            await select2.click()

            const select3 = await page.waitForSelector('#w3')
            await select3.click()

            const select4 = await page.waitForSelector('#w4')
            await select4.click()

            const select5 = await page.waitForSelector('#w5')
            await select5.click()

            await nextButton.click()
            const nextPopupButton3 = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton3.click();

            const ratingFour = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(4) > img')
            ratingFour.click()

            await page.waitForSelector('#commentText');
            await page.evaluate(() => {
            document.querySelector('#commentText').value = 'test comment';
            });

            const submitButton = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div')
            await submitButton.click()
   
            
       })

    },
    timeout
)