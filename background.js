import CONFIG from './config.js';

const API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${CONFIG.GOOGLE_SAFE_BROWSING_API_KEY}`;
const urlCache = new Map();

async function checkURL(url) {
    // Check cache first
    if (urlCache.has(url)) {
        return urlCache.get(url);
    }

    const requestBody = {
        client: {
            clientId: "your-extension",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: url }]
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (response.status !== 200) {
            console.error(`Safe Browsing API error. Status: ${response.status}`);
            urlCache.set(url, false); // Assume safe if API fails
            return false;
        }

        const data = await response.json();

        const isUnsafe = !!data.matches;
        urlCache.set(url, isUnsafe); // Cache the result
        return isUnsafe;
    } catch (error) {
        console.error("Error checking URL:", error);
        urlCache.set(url, false); // Assume safe on error
        return false;
    }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        const isUnsafe = await checkURL(changeInfo.url);

        if (isUnsafe) {
            chrome.tabs.update(tabId, { url: chrome.runtime.getURL("warning.html") });
            chrome.runtime.sendMessage({
                type: "UNSAFE_SITE",
                data: { url: changeInfo.url }
            });
        }
    }
});
