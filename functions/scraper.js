const puppeteer = require("puppeteer");

const helper = require("./helper.js");

function scrapNews(element) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

            const page = await browser.newPage();

            await page.setDefaultNavigationTimeout(0);

            await page.goto(element.url, {
                waitUntil: 'load',
                // Remove the timeout
                timeout: 0
            });
            await page.waitFor(5000);
            let scrappedBanner = await page.evaluate((element) => {
                let _bannerDiv = document.querySelector(element.mainDiv);
                let _bannerHeader = _bannerDiv.querySelector(element.mainDivHeader);
                let _bannerSubtitle = _bannerDiv.querySelector(element.mainDivSubtitle);
                let _bannerImage = _bannerDiv.querySelector(element.mainDivImage);
                let _bannerLink = _bannerDiv.querySelector(element.mainDivLink);

                let bannerSectionName = "";
                bannerSectionName = element.categoryDataSetYN
                    ? _bannerDiv.dataset[element.mainDivCategory]
                    : _bannerDiv.querySelector(element.mainDivCategory).innerText;

                let banner = {
                    header: _bannerHeader.innerText,
                    subtitle: _bannerSubtitle.innerText,
                    imgUrl: _bannerImage.src,
                    sectionName: bannerSectionName,
                    link: _bannerLink.href,
                    source: element.source
                };

                return banner;
            }, element);

            // mod scrapped content
            // capitalize the first letter of the section name
            scrappedBanner.sectionName = helper.capitalize(
                scrappedBanner.sectionName
            );

            console.log(scrappedBanner);

            browser.close();
            return resolve(scrappedBanner);
        } catch (e) {
            return reject(e);
        }

    });
}

exports.scrapNews = scrapNews;