const Apify = require('apify');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: 'https://filehippo.com/' });
    const pseudoUrls = [new Apify.PseudoUrl('https://filehippo.com/[.*]')];

    const crawler = new Apify.PuppeteerCrawler({
        launchPuppeteerOptions: {
            headless: true,
            userAgent: '2019RLCrawlAThon'
        },
        puppeteerPoolOptions: {
            useLiveView: true,
        },
        requestQueue,
        handlePageFunction: async ({ request, page }) => {
            console.log(request.url)
            // const title = await page.title();
            // console.log(`Title of ${request.url}: ${title}`);
            await Apify.utils.enqueueLinks({
                page,
                selector: 'a',
                pseudoUrls,
                requestQueue,
            });
        },
        maxRequestsPerCrawl: 5000,
        maxConcurrency: 10,
    });

    await crawler.run();
});
