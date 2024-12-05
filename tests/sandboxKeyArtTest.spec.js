const { test, expect } = require('@playwright/test');
const { kargoLink, keyArtAdLink, keyArtDemoAdLink } = require('../Ads Info/Ads Links');

test.describe('Sandbox Key Art Ad Page', () => {
  test('Check and Click on Kargo Logo', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(keyArtDemoAdLink);
    await expect(page).toHaveURL(keyArtDemoAdLink);

    // Verifying Kargo logo section
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    await expect(page.locator('a.kargo-branding-kargo .kargo-svg-bolt')).toBeVisible(); // check that kargo bolt logo is visible
    await page.locator('a.kargo-branding-kargo').click();

    // Check the new opened kargo page
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
  });

  test('Check Ad Trackers', async ({ context }) => {
    const page = await context.newPage();

    // Log 'request' and 'response' events. // un-commnet if you want to check them in console
    // page.on('request', request => console.log('>>', request.method(), request.url()));
    // page.on('response', response => console.log('<<', response.status(), response.url()));

    // defining trackers(this needs to be enhanced to find better way to define trackers using a helper)
    const responseRequestPromise = page.waitForResponse(request => request.url().match('imp_track-response'));
    const serveRequestPromise = page.waitForResponse(request => request.url().match('imp_track-serve'));
    const impressionRequestPromise = page.waitForResponse(request => request.url().match('impression'));
    const viewRequestPromise = page.waitForResponse(request => request.url().match('imp_track-view'));
    const cacheBusterRequestPromise = page.waitForResponse(request => request.url().match('%%CACHEBUSTER%%'));
    const krakenBillableRequestPromise = page.waitForRequest(request => request.url().match('event/billable'));

    // Go to the starting url
    await page.goto(keyArtDemoAdLink);
    await expect(page).toHaveURL(keyArtDemoAdLink);

    // Selecting Ad & click on it
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').locator('[id="KBRContainer"]')).toBeVisible(); // Check that survey is visible
    await expect(adFrame.frameLocator('iframe').locator('[id="kbrHeader"] p')).toHaveText('Daily Poll Brought to You By The'); // Check that survey header is visible

    // wait for trackers
    const waitTrackersArray = await Promise.all([
      responseRequestPromise,
      serveRequestPromise,
      impressionRequestPromise,
      viewRequestPromise,
      cacheBusterRequestPromise,
      krakenBillableRequestPromise,
    ]);

    await expect(waitTrackersArray.forEach).toBeTruthy(); // check that each tracker has truthy value (is found in network)

    // Verify that the first 5 trackers include uuid in the request URL
    for (let i = 0; i < 6; i++) {
      if (waitTrackersArray[i]._initializer.url.match('imp_track')) {
        await expect(waitTrackersArray[i]._initializer.url).toContain('uuid');
        await expect(waitTrackersArray[i]._initializer.url).toContain('&deal_id=&line_item_id=');
        console.log('Tracker URL: ', waitTrackersArray[i]._initializer.url);
      }
    }

    // Verify that the first 5 trackers response status is 200
    for (let i = 0; i < 5; i++) {
      await expect(waitTrackersArray[i].status()).toEqual(200);
      console.log('Response URL: ', waitTrackersArray[i]._initializer.url);
    }
  });
});
