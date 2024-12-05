const { test, expect } = require('@playwright/test');
const { kargoLink, videoAnchorAdLink, videoAnchorDemoAdLink } = require('../Ads Info/Ads Links');

test.describe('Sandbox Video Anchor Ad Page', () => {
  test('Check and Click on Kargo Logo', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(videoAnchorDemoAdLink);
    await expect(page).toHaveURL(videoAnchorDemoAdLink);

    // Verifying Kargo logo section
    const mainAdFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the main ad frame
    const adFrame = await mainAdFrame.frameLocator('iframe[style*="position: relative"]'); // Defining the ad frame
    await expect(adFrame.locator('.kargo-svg-bolt')).toBeVisible(); // check that kargo bolt logo is visible
    await adFrame.locator('.kargo-svg-bolt').click();

    // Check the new opened kargo page
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
    await page.goto(videoAnchorDemoAdLink);
    await expect(page).toHaveURL(videoAnchorDemoAdLink);

    // Selecting Ad & click on it
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').last().locator('.kargo-frame')).toBeVisible(); // Check that ad is visible
    await adFrame.frameLocator('iframe').last().locator('.kargo-frame').click(); // Click on ad
    await adFrame.frameLocator('iframe').last().locator('.kargo-frame').click(); // Click on ad

    // Check the new opened page link of ad
    const newPage = await pagePromise;
    // await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(videoAnchorAdLink); // URL contains

    const clickRequest = await clickRequestPromise;
    await expect(clickRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(clickRequest._initializer.url).toContain('uuid');
    await expect(clickRequest._initializer.url).toContain('&deal_id=&line_item_id=');
    await expect(clickRequest.status()).toEqual(200);
    await newPage.close();
  });

  test('Check Ad Trackers', async ({ context }) => {
    const page = await context.newPage();
    // Log 'request' and 'response' events. // un-commnet if you want to check them in console
    // page.on('request', request => console.log('>>', request.method(), request.url()));
    // page.on('response', response => console.log('<<', response.status(), response.url()));

    // defining trackers(this needs to be enhanced to find better way to define trackers using a helper)
    const responseRequestPromise = page.waitForResponse(request => request.url().match('imp_track-response'));
    const serveRequestPromise = page.waitForResponse(request => request.url().match('imp_track-serve'));
    const q1VideoRequestPromise = page.waitForResponse(request => request.url().match('video-q1'));
    const viewCompleteRequestPromise = page.waitForResponse(request => request.url().match('imp_track-completeview'));
    const viewRequestPromise = page.waitForResponse(request => request.url().match('imp_track-view'));
    const viewPredictRequestPromise = page.waitForResponse(request => request.url().match('imp_track-view-predict-in-confirmed'));
    const q2VideoRequestPromise = page.waitForResponse(request => request.url().match('video-q2'));
    const q3VideoRequestPromise = page.waitForResponse(request => request.url().match('video-q3'));
    const videoCompleteRequestPromise = page.waitForResponse(request => request.url().match('video-complete'));
    const krakenBillableRequestPromise = page.waitForRequest(request => request.url().match('event/billable'));
    const cacheBusterRequestPromise = page.waitForResponse(request => request.url().match('%%CACHEBUSTER%%'));
    const muteRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/test.cs-dev.mute'));
    const unmuteRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/test.cs-dev.unmute'));
    const expandRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/test.cs-dev.expand'));
    const replayRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/test.cs-dev.replay'));

    // Go to the starting url
    await page.goto(videoAnchorDemoAdLink);
    await expect(page).toHaveURL(videoAnchorDemoAdLink);

    // Selecting Ad & click on it
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').last().locator('.kargo-frame')).toBeVisible(); // Check that ad is visible
    await adFrame.frameLocator('iframe').last().locator('.kargo-frame').click(); // Click on ad to expand

    // wait for trackers
    const waitTrackersArray = await Promise.all([
      q1VideoRequestPromise,
      viewCompleteRequestPromise,
      viewRequestPromise,
      viewPredictRequestPromise,
      q2VideoRequestPromise,
      q3VideoRequestPromise,
      videoCompleteRequestPromise,
      responseRequestPromise,
      serveRequestPromise,
      expandRequestPromise,
      unmuteRequestPromise,
      krakenBillableRequestPromise,
      cacheBusterRequestPromise,
    ]);

    await expect(waitTrackersArray.forEach).toBeTruthy(); // check that each tracker has truthy value (is found in network)

    // Verify that the first 11 trackers include uuid in the request URL
    for (let i = 0; i < 11; i++) {
      await expect(waitTrackersArray[i]._initializer.url).toContain('uuid');
      if (waitTrackersArray[i]._initializer.url.match('imp_track')) {
      await expect(waitTrackersArray[i]._initializer.url).toContain('&deal_id=&line_item_id=');
      }
      console.log('Tracker URL: ', waitTrackersArray[i]._initializer.url);
    }

    // Verify that the first 11 trackers response status is 200
    for (let i = 0; i < 11; i++) {
      await expect(waitTrackersArray[i].status()).toEqual(200);
      console.log('Response URL: ', waitTrackersArray[i]._initializer.url);
    }

    await adFrame.frameLocator('iframe').last().locator('.kargo-frame').click(); // Click on ad to replay
    const replayRequest = await replayRequestPromise;
    await expect(replayRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(replayRequest._initializer.url).toContain('uuid');
    await expect(replayRequest.status()).toEqual(200);
    console.log('Replay Response URL: ',replayRequest._initializer.url);

    await adFrame.frameLocator('iframe').last().locator('.kargo-frame .kargo-canvas div:nth-child(5)').last().click(); // Click on mute
    const muteRequest = await muteRequestPromise;
    await expect(muteRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(muteRequest._initializer.url).toContain('uuid');
    await expect(muteRequest.status()).toEqual(200);
    console.log('Mute Response URL: ', muteRequest._initializer.url);
  });
});
