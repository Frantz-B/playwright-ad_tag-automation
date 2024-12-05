const { test, expect } = require('@playwright/test');
const { kargoLink, outstreamVPAIDAdLink, outstreamVPAIDDemoAdLink } = require('../Ads Info/Ads Links');

test.describe('Sandbox Outstream Video VPAID Ad Page', () => {
  test('Check and Click on Kargo Logo', async ({ context }) => {
    const page = await context.newPage();
    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');
    // Go to the starting url
    await page.goto(outstreamVPAIDDemoAdLink);
    await expect(page).toHaveURL(outstreamVPAIDDemoAdLink);

    // Verifying Kargo logo section
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    await expect(page.locator('a.kargo-branding-created .by-kargo-svg-grey')).toBeVisible(); // check that kargo bolt logo is visible
    await page.locator('a.kargo-branding-created').click();

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
    await page.goto(outstreamVPAIDDemoAdLink);
    await expect(page).toHaveURL(outstreamVPAIDDemoAdLink);

    // Selecting Ad & click on it
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').last().locator('.kargo-frame')).toBeVisible(); // Check that ad is visible
    await adFrame.frameLocator('iframe').last().locator('.kargo-frame').click(); // Click on ad

    // Check the new opened page link of ad
    const newPage = await pagePromise;
    // await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(outstreamVPAIDAdLink); // URL contains

    const clickRequest = await clickRequestPromise;
    await expect(clickRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(clickRequest._initializer.url).toContain('uuid');
    await expect(clickRequest._initializer.url).toContain('&deal_id=');
    await expect(clickRequest._initializer.url).toContain('&line_item_id=&');
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
    const impressionRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/impression'));
    const videoStartRequestPromise = page.waitForResponse(request => request.url().match('video-start'));
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
    const muteRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/mute'));
    const unmuteRequestPromise = page.waitForResponse(request => request.url().match('https://tk.kargo.com/t/unmute'));

    // Go to the starting url
    await page.goto(outstreamVPAIDDemoAdLink);
    await expect(page).toHaveURL(outstreamVPAIDDemoAdLink);

    // Selecting Ad & click on it
    await page.locator('#kargo-ad-middle').scrollIntoViewIfNeeded();
    const adFrame = await page.frameLocator('iframe.kargo-creative'); // Defining the ad frame
    await expect(adFrame.frameLocator('iframe').last().locator('.kargo-frame')).toBeVisible(); // Check that ad is visible

    // wait for trackers
    const waitTrackersArray = await Promise.all([
      videoStartRequestPromise,
      q1VideoRequestPromise,
      impressionRequestPromise,
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

    // Verify that the first 11 trackers include uuid in the request URL
    for (let i = 0; i < 11; i++) {
      await expect(waitTrackersArray[i]._initializer.url).toContain('uuid');
      if (waitTrackersArray[i]._initializer.url.match('imp_track')) {
        await expect(waitTrackersArray[i]._initializer.url).toContain('&deal_id=');
        await expect(waitTrackersArray[i]._initializer.url).toContain('&line_item_id=&');
      }
      console.log('Tracker URL: ', waitTrackersArray[i]._initializer.url);
    }

    // Verify that the first 11 trackers response status is 200
    for (let i = 0; i < 11; i++) {
      await expect(waitTrackersArray[i].status()).toEqual(200);
      console.log('Response URL: ', waitTrackersArray[i]._initializer.url);
    }

    await adFrame.frameLocator('iframe[style*="position: relative;"]').last().locator('.kargo-frame .kargo-canvas div:nth-child(1)').first().click(); // Click on replay
    await adFrame.frameLocator('iframe[style*="position: relative;"]').last().locator('.kargo-frame .kargo-canvas div:nth-child(2)').first().click(); // Click on mute
    const muteRequest = await muteRequestPromise;
    await expect(muteRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(muteRequest._initializer.url).toContain('uuid');
    await expect(muteRequest.status()).toEqual(200);
    console.log('Mute Response URL: ',muteRequest._initializer.url);

    await adFrame.frameLocator('iframe[style*="position: relative;"]').last().locator('.kargo-frame .kargo-canvas div:nth-child(3)').first().click(); // Click on Unmute
    const unmuteRequest = await unmuteRequestPromise;
    await expect(unmuteRequest).toBeTruthy();
    // check tracker url includes uuid & response status is 200
    await expect(unmuteRequest._initializer.url).toContain('uuid');
    await expect(unmuteRequest.status()).toEqual(200);
    console.log('Un-Mute Response URL: ',unmuteRequest._initializer.url);
  });
});
