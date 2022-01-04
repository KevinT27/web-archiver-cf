const puppeteer = require("puppeteer");

const helper = require("./helper.js");

function scrapNews(elementsToScrap) {
    return new Promise(async (resolve, reject) => {
        const scrappedElements = [];
        try {
            const browser = await puppeteer.launch({
                userDataDir: "./data"
            });
            for (const el of elementsToScrap) {
                const page = await browser.newPage();

                await page.setDefaultNavigationTimeout(0);

                await page.goto(el.url, {
                    waitUntil: 'load',
                    // Remove the timeout
                    timeout: 0
                });
                await page.waitForSelector(el.mainDiv);
                let scrappedBanner = await page.evaluate((el) => {
                    let _bannerDiv = document.querySelector(el.mainDiv);
                    let _bannerHeader = _bannerDiv.querySelector(el.mainDivHeader);
                    let _bannerSubtitle = _bannerDiv.querySelector(el.mainDivSubtitle);
                    let _bannerImage = _bannerDiv.querySelector(el.mainDivImage);
                    let _bannerLink = _bannerDiv.querySelector(el.mainDivLink);

                    let bannerSectionName = "";
                    bannerSectionName = el.categoryDataSetYN
                        ? _bannerDiv.dataset[el.mainDivCategory]
                        : _bannerDiv.querySelector(el.mainDivCategory).innerText;

                    let banner = {
                        header: _bannerHeader.innerText,
                        subtitle: _bannerSubtitle.innerText,
                        imgUrl: _bannerImage.src,
                        sectionName: bannerSectionName,
                        link: _bannerLink.href
                    };

                    return banner;
                }, el);

                // mod scrapped content
                // capitalize the first letter of the section name
                scrappedBanner.sectionName = helper.capitalize(
                    scrappedBanner.sectionName
                );

                scrappedElements.push(scrappedBanner);
            }
            browser.close();
            return resolve(scrappedElements);
        } catch (e) {
            return reject(e);
        }

    });
}

exports.scrapNews = scrapNews;