// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // go to Hacker News
    await page.goto("https://news.ycombinator.com/newest");
    
    let timestamps = [];
    let pageCount = 0;
    while (timestamps.length < 100) {
      pageCount++;
      // Wait for the articles to load
      await page.waitForSelector('.athing');
      // Get article timestamps from this page
      const newTimestamps = await page.evaluate(() => {
        const articles = Array.from(document.querySelectorAll('.athing'));
        return articles.map(article => {
          const timeElement = article.nextElementSibling?.querySelector('.age');
          return timeElement ? timeElement.getAttribute('title') : null;
        }).filter(Boolean);
      });
      timestamps = timestamps.concat(newTimestamps);
      // If we have enough, break
      if (timestamps.length >= 100) break;
      // Click the 'More' link to go to the next page
      const moreLink = await page.$('a.morelink');
      if (!moreLink) break;
      await Promise.all([
        page.waitForNavigation(),
        moreLink.click()
      ]);
    }
    // Only keep the first 100
    timestamps = timestamps.slice(0, 100);

    // Validate we have exactly 100 articles
    if (timestamps.length !== 100) {
      throw new Error(`Expected 100 articles, but found ${timestamps.length}`);
    }

    // Convert timestamps to Date objects for comparison
    const dates = timestamps.map(timestamp => new Date(timestamp));

    // Check if dates are in descending order (newest to oldest)
    let isSorted = true;
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] < dates[i + 1]) {
        isSorted = false;
        console.error(`Articles are not properly sorted. Found newer article at position ${i + 2}`);
        console.error(`Article ${i + 1}: ${dates[i]}`);
        console.error(`Article ${i + 2}: ${dates[i + 1]}`);
        break;
      }
    }

    if (isSorted) {
      console.log('✅ Success: First 100 articles are properly sorted from newest to oldest');
    } else {
      console.error('❌ Error: Articles are not properly sorted');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
