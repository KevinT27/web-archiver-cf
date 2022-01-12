const functions = require("firebase-functions");

const scraper = require("./scraper");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const elementsToScrap = [
    {
        url: "https://edition.cnn.com/",
        source: "cnn",
        mainDiv: ".cd--has-banner",
        mainDivHeader: "h2",
        mainDivSubtitle: ".cd__headline-text",
        mainDivImage: ".media__image",
        mainDivCategory: "sectionName",
        mainDivLink: ".link-banner",
        categoryDataSetYN: true,
    },
    {
        url: "https://www.foxnews.com",
        source: "foxnews",
        mainDiv: ".main>.collection>.content>article",
        mainDivHeader: "h2.title",
        mainDivSubtitle: "h2.title",
        mainDivImage: "img",
        mainDivCategory: ".kicker>.kicker-text",
        mainDivLink: ".m>a",
        categoryDataSetYN: false,
    },
];

exports.scheduledFunction = functions.runWith({timeoutSeconds: 360}).pubsub.schedule('every 15 minutes').onRun(async (context) => {
    const addedNews = [];
    const scrappedElements = [];

    // scrap elements
    for (element of elementsToScrap) {
        let scrappedElement = await scraper.scrapNews(element);
        scrappedElement && scrappedElements.push(scrappedElement);
    }

    for (element of scrappedElements) {

        // get current elements from firestore.
        let news = admin.firestore().collectionGroup("news").where("header", "==", element.header);

        // check if item with the same header already exists.
        let existsYN = false;

        existsYN = await news.get().then((querySnapshot) => {
            return !querySnapshot.empty
        })

        // if element already exists -> skip
        if (existsYN) continue;

        // Push the news into Firestore using the Firebase Admin SDK.
        // add timestamp
        const newItem = await admin.firestore().collection('news').add({
            ...element, date: admin.firestore.FieldValue.serverTimestamp(), 
        });

        // add to addedNews array
        addedNews.push({ id: newItem.id, date: new Date() })
    }

    console.log(addedNews);
    return addedNews
});