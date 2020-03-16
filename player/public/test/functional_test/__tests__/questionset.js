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
            await page.screenshot({path: '__tests__/screenshots/fixture_stories.png'});
        })

        it('Should open question set', async() => {
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
            await page.screenshot({path: '__tests__/screenshots/onclick_questionset.png'});
        })

        it('Zoom button should open the image in zoomed view', async () => {
            const zoomImg = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-ZoomImg')
            await zoomImg.click()
            await page.screenshot({path: '__tests__/screenshots/onzoom_image.png'});
        })

        it('check pop exists or not', async()=>{
            const popup = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div')
            await popup.click()
            await page.screenshot({path: '__tests__/screenshots/afterpop_close.png'});
        })

        it('Test for title', async () => {
            const title = await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
            await page.screenshot({path: '__tests__/screenshots/test_title.png'});
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
            expect(parseFloat(btnStylesInWeb.fontsize)).toEqual(parseFloat(btnStylesInMobile.fontsize)) 
            expect(parseFloat(btnStylesInWeb.height)).not.toEqual(parseFloat(btnStylesInMobile.height)) 
            expect(parseFloat(btnStylesInWeb.width)).not.toEqual(parseFloat(btnStylesInMobile.width)) 
        })

        it('Test for Question Set', async () => {
            await page.setViewport({width: 1280,height: 800})
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
        })

        it('Test for mcq', async() => {
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
        })

        it('Skipping match test',async() => {
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            await nextButton.click()
            const popupNextButton = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton.click()
        })

        it('Input type test', async() => {
            await page.waitForSelector('#ans-field1');
            await page.evaluate(() => {
                document.querySelector('#ans-field1').value = 'jupiter';
            });
            await page.waitForSelector('#ans-field2');
            await page.evaluate(() => {
                document.querySelector('#ans-field2').value = 'mercury';
            });
            await page.screenshot({path: '__tests__/screenshots/setting_fields.png'});
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            await nextButton.click();
            const nextPopupButton = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton.click();
        })

        it('Skipping arranging test', async() => {
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            await nextButton.click()
            const popupNextButton = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton.click()
        })
        it('Sentence creation test', async() => {
            const select0 = await page.waitForSelector('#w0')
            await select0.click()
            await page.screenshot({path: '__tests__/screenshots/setting_what.png'});

            const select1 = await page.waitForSelector('#w1')
            await select1.click()
            await page.screenshot({path: '__tests__/screenshots/setting_are.png'});

            const select2 = await page.waitForSelector('#w2')
            await select2.click()
            await page.screenshot({path: '__tests__/screenshots/setting_you.png'});

            const select3 = await page.waitForSelector('#w3')
            await select3.click()
            await page.screenshot({path: '__tests__/screenshots/setting_looking.png'});

            const select4 = await page.waitForSelector('#w4')
            await select4.click()
            await page.screenshot({path: '__tests__/screenshots/setting_for.png'});

            const select5 = await page.waitForSelector('#w5')
            await select5.click()
            await page.screenshot({path: '__tests__/screenshots/setting_questionmark.png'});

            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            await nextButton.click()
            const nextPopupButton = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton.click();
        })
           
        it('Rating and comment test', async() => {
            const ratingFour = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(4) > img')
            await ratingFour.click()
            await page.screenshot({path: '__tests__/screenshots/four_rating.png'});

            await page.waitForSelector('#commentText');
            await page.evaluate(() => {
            document.querySelector('#commentText').value = 'test comment';
            });
            await page.screenshot({path: '__tests__/screenshots/comment_rating.png'});

            const submitButton = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div')
            await submitButton.click()
            await page.screenshot({path: '__tests__/screenshots/submit_rating.png'});
        })


    },
    timeout
)