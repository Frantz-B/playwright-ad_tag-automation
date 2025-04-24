const { test, expect, request } = require('@playwright/test');

test.describe('KAPT Sidekick Ad Page', () => {
test('Check Ad Trackers', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    // const pagePromise = context.waitForEvent('page');

    // Subscribe to 'request' and 'response' events.
    page.on('request', request => console.log('>>', request.method(), request.url()));
    page.on('response', response => console.log('<<', response.status(), response.url()));
   
    // Defining trackers
      const responseRequestPromise = page.waitForRequest(request => request.url().match('imp_track-response'));
      const serveRequestPromise = page.waitForRequest(request => request.url().match('imp_track-serve'));
      const viewCompleteRequestPromise = page.waitForRequest(request => request.url().match('imp_track-completeview'));
      const viewRequestPromise = page.waitForRequest(request => request.url().match('imp_track-view'));
      const krakenBillableRequestPromise = page.waitForRequest(request => request.url().match('event/billable'));
      // const clickRequestPromise = page.waitForRequest(request => request.url().match('imp_track-click'));
      // const closeRequestPromise = page.waitForRequest(request => request.url().match('imp_track-close'));
      // trying to check moat request tracker
      // const moatRequestPromise = page.waitForResponse(request => request.url().match('event=measurable') && request.status() === 400);
      
     // Go to the starting url
     await page.goto('https://demo.kargo.com/kargonaut/7066');
     await expect(page).toHaveURL('https://demo.kargo.com/kargonaut/7066');
    // Selecting Ad & click on it
     const adFrame = await page.frameLocator('iframe[allowfullscreen]'); // Defining the ad frame
     // await expect(adFrame.locator('.celtra-screen-holder')).toBeVisible(); // Check that ad is visible

     const waitArray = await Promise.all([
      responseRequestPromise,
      serveRequestPromise,
       viewCompleteRequestPromise,
       viewRequestPromise, 
       krakenBillableRequestPromise,
       // moatRequestPromise
     ]);

     await expect(waitArray.forEach).toBeTruthy();

     console.log(waitArray[4]._initializer.url);
  });
});