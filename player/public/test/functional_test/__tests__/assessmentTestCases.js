/**
 * Functional test cases for all types of question set
 * @author rahul shukla <rahul.shukla@ilimi.in>
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
            jest.setTimeout(timeout);
            page = await global.__BROWSER__.newPage()
            await page.goto('http://127.0.0.1:3000').catch(function(e) {
                console.error(e);
              });

            await page.setViewport({ width: 1280, height: 800 })
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
            await page.waitFor(5000);
        })

        afterAll(async () => {
            jestscreenshot.cleanup(function () {
                if (browser) {
                    browser.close();
                }
                done();
            });
            await page.close();
        })

        it('Player shell loaded with fixture stories', async () => {
            await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(40)');
            await page.screenshot({ path: '__tests__/screenshots/questionset_fixture_stories.png' });
        })


        it('Should open plugin test case content', async () => {
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(40)');
            await playQuestion.click();
            await page.waitFor(4000);
            await page.screenshot({ path: '__tests__/screenshots/pluginTestCase_onclick_pluginTestCase.png' });
        })

        // it ('audio icon',async()=> {
        //     const firstQuestionAudio = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-AudioImg')
        //     await firstQuestionAudio.click()
        //     await firstQuestionAudio.click()
        // })


        it('First Question - Multiple Choice Question', async () => {
            const questionImageZoom = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-ZoomImg');
            await questionImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_questionImageZoom.png' });
            const questionImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await questionImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_questionImageZoomClose.png' });
            const questionAudio = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-AudioImg');
            await questionAudio.click();
            const wrongImageZoom = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div:nth-child(2) > div.option-image-container > div > img.option-image-zoom-icon');
            await wrongImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_wrongImageZoom.png' });
            const wrongImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await wrongImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_wrongImageZoomClose.png' });
            const wrongOption = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div:nth-child(2) > div.option-text-container.with-image');
            await wrongOption.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_wrongOption.png' });
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img');
            await nextButton.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_firstTimeNextButton.png' });
            const tryAgainButton = await page.waitForSelector('.popup-buttons-container > div.right.primary.button');
            await tryAgainButton.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_tryAgainButton.png' });
            const correctImageZoom = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div.option-block.org-ekstep-questionunit-mcq-option-element.mcq-correct-answer > div.option-image-container > div > img.option-image-zoom-icon');
            await correctImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_correctImageZoom.png' });
            const correctImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await correctImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_correctImageZoomClose.png' });
            const correctOption = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div.option-block.org-ekstep-questionunit-mcq-option-element.mcq-correct-answer');
            await correctOption.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_correctOption.png' });
            await nextButton.click()
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_secondTimeNextButton.png' });
            const correctAnswerPopupNext = await page.waitForSelector('.popup-buttons-container > div');
            await correctAnswerPopupNext.click();
            await page.screenshot({ path: '__tests__/screenshots/firstQuestin_onclick_correctAnswerPopNext.png' });
        })

        it('Second Question - Match The Following Question', async () => {
            const questionAudio = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-AudioImg');
            await questionAudio.click();
            const appleAudio = await page.waitForSelector('#questionset > div > div.mtf-container.plugin-content-container > div > div.mtf-options-container > div > div.lhs-rhs-container.lhs-container > div:nth-child(1) > img.audio-image');
            await appleAudio.click();
            const appleImageZoom = await page.waitForSelector('#questionset > div > div.mtf-container.plugin-content-container > div > div.mtf-options-container > div > div.lhs-rhs-container.lhs-container > div:nth-child(1) > img.option-image');
            await appleImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_appleImageZoom.png' });
            const appleImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await appleImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_appleImageZoomClose.png' });
            const bananaAudio = await page.waitForSelector('#questionset > div > div.mtf-container.plugin-content-container > div > div.mtf-options-container > div > div.lhs-rhs-container.lhs-container > div:nth-child(2) > img.audio-image');
            await bananaAudio.click();
            const bananaImageZoom = await page.waitForSelector('#questionset > div > div.mtf-container.plugin-content-container > div > div.mtf-options-container > div > div.lhs-rhs-container.lhs-container > div:nth-child(2) > img.option-image');
            await bananaImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_bananaImageZoom.png' });
            const bananaImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await bananaImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_bananaImageZoomClose.png' });
            const grapesAudio = await page.waitForSelector('#questionset > div > div.mtf-container.plugin-content-container > div > div.mtf-options-container > div > div.lhs-rhs-container.lhs-container > div:nth-child(3) > img.audio-image')
            await grapesAudio.click()
            const grapesImageZoom = await page.waitForSelector('#questionset > div > div.mtf-container.plugin-content-container > div > div.mtf-options-container > div > div.lhs-rhs-container.lhs-container > div:nth-child(3) > img.option-image');
            await grapesImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_grapesImageZoom.png' });
            const grapesImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await grapesImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_grapesImageZoomClose.png' });
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img');
            await nextButton.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_nextButton.png' });
            const popupLeftNext = await page.waitForSelector('.popup-buttons-container > div.left.button');
            await popupLeftNext.click();
            await page.screenshot({ path: '__tests__/screenshots/secondQuestin_onclick_popupLeftNext.png' });
        })

        it('Third Question - Reordering words', async () => {
            const w0 = await page.waitForSelector('#w0');
            await w0.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_what.png' });
            const w1 = await page.waitForSelector('#w1');
            await w1.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_are.png' })
            const w2 = await page.waitForSelector('#w2');
            await w2.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_you.png' });
            const w3 = await page.waitForSelector('#w3');
            await w3.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_going.png' });
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img');
            await nextButton.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_nextButton1.png' });
            const tryAgainButton = await page.waitForSelector('.popup-buttons-container > div.right.primary.button');
            await tryAgainButton.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_tryAgainButton.png' });
            const w4 = await page.waitForSelector('#w4');
            await w4.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_question_mark.png' });
            await nextButton.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_nextButton2.png' });
            const correctAnswerPopNext = await page.waitForSelector('.popup-buttons-container > div')
            await correctAnswerPopNext.click();
            await page.screenshot({ path: '__tests__/screenshots/thirdQuestin_onclick_correctAnswerPopNext.png' });
        })

        it('Fourth Question - Fill in the Blanks', async () => {
            const questionImageZoom = await page.waitForSelector('#qs-ftb-question > div.ftb-question-image > img');
            await questionImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_onclick_questionImageZoom.png' });
            const questionImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await questionImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_onclick_questionImageZoomClose.png' });
            const fourthQuestionAudio = await page.waitForSelector('#qs-ftb-question > div.ftb-question-audio > img')
            await fourthQuestionAudio.click();
            await page.waitForSelector('#ans-field1');
            await page.evaluate(() => {
                document.querySelector('#ans-field1').value = 'Delhi';
            });
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_input_fields_setting_wrong_value.png' });
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img');
            await nextButton.click();
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_onclick_nextButton1.png' });
            const tryAgainButton = await page.waitForSelector('.popup-buttons-container > div.right.primary.button')
            await tryAgainButton.click();
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_onclick_tryAgainButton.png' });
            await page.evaluate(() => {
                document.querySelector('#ans-field1').value = 'New Delhi';
            });
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_input_fields_setting_correct_value.png' });
            await nextButton.click();
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_onclick_nextButton2.png' });
            const correctAnswerPopNext = await page.waitForSelector('.popup-buttons-container > div');
            await correctAnswerPopNext.click();
            await page.screenshot({ path: '__tests__/screenshots/fourthQuestin_onclick_correctAnswerPopNext.png' });
        })

        it('Fifth Question - Arrange in Sequence', async () => {
            const questionImageZoom = await page.waitForSelector('#org-ekstep-questionunit-questionComponent-qimage');
            await questionImageZoom.click();
            await page.screenshot({ path: '__tests__/screenshots/fifthQuestin_onclick_questionImageZoom.png' });
            const questionImageZoomClose = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div');
            await questionImageZoomClose.click();
            await page.screenshot({ path: '__tests__/screenshots/fifthQuestin_onclick_questionImageZoomClose.png' });
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img');
            await nextButton.click();
            const popupClass = await page.evaluate('document.querySelector("#qs-feedback-model-popup > div > div.popup-full-body > div").getAttribute("class")');

            if (popupClass == 'font-lato assess-popup assess-tryagain-popup') {
                const popupLeftNext = await page.waitForSelector('.popup-buttons-container > div.left.button');
                await popupLeftNext.click();
                await page.screenshot({ path: '__tests__/screenshots/fifthQuestin_onclick_wromgAnswerPopNext.png' });
            }

            if (popupClass == 'font-lato assess-popup assess-goodjob-popup') {
                const correctAnswerPopNext = await page.waitForSelector('.popup-buttons-container > div');
                await correctAnswerPopNext.click();
                await page.screenshot({ path: '__tests__/screenshots/fifthQuestin_onclick_correctAnswerPopNext.png' });
            }
        })

        it('Rating and Comment', async () => {
            const fourRating = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(4) > img');
            await fourRating.click();
            page.screenshot({ path: '__tests__/screenshots/rating_onclick_four_rating.png' });
            await page.waitForSelector('#commentText');
            await page.evaluate(() => {
                document.querySelector('#commentText').value = 'test comment';
            });
            await page.screenshot({ path: '__tests__/screenshots/rating_setting_comment.png' });
            const submitButton = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div.gc-fd-footer > input')
            await submitButton.click()
            await page.screenshot({ path: '__tests__/screenshots/rating_onclick_submit.png' });
        })
    },
    timeout
)