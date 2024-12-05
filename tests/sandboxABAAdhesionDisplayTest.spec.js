const { test, expect } = require('@playwright/test');
const { kargoLink, abaAdhesionDisplayAdLink, abaAdhesionDisplayDemoAdLink } = require('../Ads Info/Ads Links');

test.describe('Sandbox ABA Adhesion Display Ad Page', () => {
  test('Check and Click on Kargo Logo', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(abaAdhesionDisplayDemoAdLink);
    await expect(page).toHaveURL(abaAdhesionDisplayDemoAdLink);

    // Verifying Kargo logo section
    await expect(page.locator('a.kargo-hover-link.filled')).toBeVisible(); // check that kargo bolt logo is visible
    await page.locator('a.kargo-hover-link.filled').click();

    // Check the new opened kargo page
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(kargoLink, {timeout: 10000});
  });

  test('Check click on Ad', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(abaAdhesionDisplayDemoAdLink);
    await expect(page).toHaveURL(abaAdhesionDisplayDemoAdLink);

    // Selecting Ad & click on it
    const adFrame = await page.frameLocator('.kargo-creative'); // Defining the ad frame
    await expect(page.locator('.kargo-ad-content')).toBeVisible(); // Check that ad is visible
    await page.locator('.kargo-ad-content').click(); // Click on ad

    // Check the new opened page link of ad
    const newPage = await pagePromise;
    await expect(newPage).toHaveURL(abaAdhesionDisplayAdLink, {timeout: 10000}); // URL contains
  });

  test('Check Ad Trackers', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');

    // Log 'request' and 'response' events. // un-commnet if you want to check them in console
    // page.on('request', request => console.log('>>', request.method(), request.url()));
    // page.on('response', response => console.log('<<', response.status(), response.url()));

    // defining trackers(this needs to be enhanced to find better way to define trackers using a helper)
    const responseRequestPromise = page.waitForResponse(request => request.url().match('imp_track-response'));
    const serveRequestPromise = page.waitForResponse(request => request.url().match('imp_track-serve'));
    const viewCompleteRequestPromise = page.waitForResponse(request => request.url().match('imp_track-completeview'));
    const viewRequestPromise = page.waitForResponse(request => request.url().match('imp_track-view'));
    const cacheBusterRequestPromise = page.waitForResponse(request => request.url().match('%%CACHEBUSTER%%'));
    const krakenBillableRequestPromise = page.waitForRequest(request => request.url().match('event/billable'));
    const clickRequestPromise = page.waitForResponse(request => request.url().match('imp_track-click'));
    const closeRequestPromise = page.waitForResponse(request => request.url().match('imp_track-close'));

    // Go to the starting url
    await page.goto(abaAdhesionDisplayDemoAdLink);
    await expect(page).toHaveURL(abaAdhesionDisplayDemoAdLink);

    // Selecting Ad & click on it
    const adFrame = await page.frameLocator('.kargo-creative'); // Defining the ad frame
    await expect(page.locator('.kargo-ad-content')).toBeVisible(); // Check that ad is visible

    // wait for trackers
    const waitTrackersArray = await Promise.all([
      responseRequestPromise,
      serveRequestPromise,
      viewCompleteRequestPromise,
      viewRequestPromise,
      cacheBusterRequestPromise,
      krakenBillableRequestPromise,
    ]);

    await expect(waitTrackersArray.forEach).toBeTruthy(); // check that each tracker has truthy value (is found in network)

    // Verify that the first 4 trackers include uuid in the request URL
    for (let i = 0; i < 4; i++) {
      await expect(waitTrackersArray[i]._initializer.url).toContain('uuid');
      await expect(waitTrackersArray[i]._initializer.url).toContain('&deal_id=&line_item_id=&');
      console.log('Tracker URL: ', waitTrackersArray[i]._initializer.url);
    }

    // Verify that the first 5 trackers response status is 200
    for (let i = 0; i < 5; i++) {
      await expect(waitTrackersArray[i].status()).toEqual(200);
      console.log('Response URL: ', waitTrackersArray[i]._initializer.url);
    }

    await page.locator('.kargo-ad-content').click(); // Click on ad
    // Check the new opened page
    const newPage = await pagePromise;
    await expect(newPage).toHaveURL(abaAdhesionDisplayAdLink, {timeout: 10000}); // URL contains

    const clickRequest = await clickRequestPromise;
    await expect(clickRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(clickRequest._initializer.url).toContain('uuid');
    await expect(clickRequest._initializer.url).toContain('&deal_id=&line_item_id=&');
    await expect(clickRequest.status()).toEqual(200);
    await newPage.close();

    await page.locator('.filled .kargo-svg-close').click(); // Close the ad
    const closeRequest = await closeRequestPromise;
    await expect(closeRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(closeRequest._initializer.url).toContain('uuid');
    await expect(closeRequest._initializer.url).toContain('&deal_id=&line_item_id=&');
    await expect(closeRequest.status()).toEqual(200);
  });
});
