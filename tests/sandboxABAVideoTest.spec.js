const { test, expect } = require('@playwright/test');
const { kargoLink, abaVideoAdLink, abaVideoDemoAdLink } = require('../Ads Info/Ads Links');

test.describe('Sandbox ABA Video Ad Page', () => {
  test('Check and Click on Kargo Logo', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(abaVideoDemoAdLink);
    await expect(page).toHaveURL(abaVideoDemoAdLink);

    // Verifying Kargo logo section
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    await expect(page.locator('a.kargo-branding-advertisement')).toBeVisible(); // check that kargo bolt logo is visible
    await page.locator('a.kargo-branding-advertisement').click();

    // Chech the new open kargo page
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(kargoLink);
  });

  test('Check click on Ad & Click tracker', async ({ context }) => {
    const page = await context.newPage();
    // Defining click tracker 
    const clickRequestPromise = page.waitForResponse(request => request.url().match('imp_track-click'));
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(abaVideoDemoAdLink);
    await expect(page).toHaveURL(abaVideoDemoAdLink);

    // Selecting Ad & click on it
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').last().locator('.kargo-view')).toBeVisible(); // Check that ad is visible
    await adFrame.frameLocator('iframe').last().locator('.kargo-view').click(); // Click on ad

    // chech the new page open link of ad
    const newPage = await pagePromise;
    // await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(abaVideoAdLink); // URL contains

    const clickRequest = await clickRequestPromise;
    await expect(clickRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(clickRequest._initializer.url).toContain('uuid');
    await expect(clickRequest.status()).toEqual(200);
    await newPage.close();
  });

  test('Check Ad Trackers', async ({ context }) => {
    const page = await context.newPage();
    // Log 'request' and 'response' events. // un-commnet if you want it check them in console
    // page.on('request', request => console.log('>>', request.method(), request.url()));
    // page.on('response', response => console.log('<<', response.status(), response.url()));

    // defining trackers(this needs to be enhanced to find better way to define trackers using a helper)
    const responseRequestPromise = page.waitForResponse(request => request.url().match('imp_track-response'));
    const videoStartRequestPromise = page.waitForResponse(request => request.url().match('video-start'));
    const serveRequestPromise = page.waitForResponse(request => request.url().match('imp_track-serve'));
    const q1VideoRequestPromise = page.waitForResponse(request => request.url().match('video-q1'));
    const viewCompleteRequestPromise = page.waitForResponse(request => request.url().match('imp_track-completeview'));
    const viewRequestPromise = page.waitForResponse(request => request.url().match('imp_track-view'));
    const viewPredictRequestPromise = page.waitForResponse(request => request.url().match('imp_track-view-predict-in-confirmed'));
    const q2VideoRequestPromise = page.waitForResponse(request => request.url().match('video-q2'));
    const q3VideoRequestPromise = page.waitForResponse(request => request.url().match('video-q3'));
    const videoCompleteRequestPromise = page.waitForResponse(request => request.url().match('video-complete'));
    const krakenBillableRequestPromise = page.waitForResponse(request => request.url().match('event/billable'));
    const cacheBusterRequestPromise = page.waitForResponse(request => request.url().match('%%CACHEBUSTER%%'));
    const replayRequestPromise = page.waitForResponse(request => request.url().match('replay'));
    const muteRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/video-mute?'));
    const unmuteRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/video-mute?'));

    // Go to the starting url
    await page.goto(abaVideoDemoAdLink);
    await expect(page).toHaveURL(abaVideoDemoAdLink);

    // Selecting Ad & click on it
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').last().locator('.kargo-view')).toBeVisible(); // Check that ad is visible

    // wait for trackers
    const waitTrackersArray = await Promise.all([
      videoStartRequestPromise,
      q1VideoRequestPromise,
      viewCompleteRequestPromise,
      viewRequestPromise,
      viewPredictRequestPromise,
      q2VideoRequestPromise,
      q3VideoRequestPromise,
      videoCompleteRequestPromise,
      responseRequestPromise,
      serveRequestPromise,
      krakenBillableRequestPromise,
      cacheBusterRequestPromise,
    ]);

    await expect(waitTrackersArray.forEach).toBeTruthy(); // check that each tracker has truthy value (is found in network)

    // Verify that the first 10 trackers include uuid in the request URL
    for (let i = 0; i < 10; i++) {
      await expect(waitTrackersArray[i]._initializer.url).toContain('uuid');
      console.log('Tracker URL: ', waitTrackersArray[i]._initializer.url);
    }

    // Verify that the first 10 trackers response status is 200
    for (let i = 0; i < 10; i++) {
      await expect(waitTrackersArray[i].status()).toEqual(200);
      console.log('Response URL: ', waitTrackersArray[i]._initializer.url);
    }

    await adFrame.frameLocator('iframe').last().locator('.kargo-view').click(); // Click on ad
    const replayRequest = await replayRequestPromise;
    await expect(replayRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(replayRequest._initializer.url).toContain('uuid');
    await expect(replayRequest.status()).toEqual(200);
    console.log('Mute Response URL: ',replayRequest._initializer.url);

    await adFrame.frameLocator('iframe').last().locator('.kargo-view .kargo-page .kargo-element-view div:nth-child(1)').last().click(); // Click on mute
    const muteRequest = await muteRequestPromise;
    await expect(muteRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(muteRequest._initializer.url).toContain('uuid');
    await expect(muteRequest.status()).toEqual(200);
    console.log('Mute Response URL: ',muteRequest._initializer.url);

    await adFrame.frameLocator('iframe').last().locator('.kargo-view .kargo-page .kargo-element-view div:nth-child(2)').last().click(); // Click on unmute
    const unmuteRequest = await unmuteRequestPromise;
    await expect(unmuteRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(unmuteRequest._initializer.url).toContain('uuid');
    await expect(unmuteRequest.status()).toEqual(200);
    console.log('Un-Mute Response URL: ',unmuteRequest._initializer.url);
  });
});
