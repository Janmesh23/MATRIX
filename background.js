const API_KEY = "AIzaSyCZx34avqXbxcZMWFz9xSeY6f93ktYEzgg";
const API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

import CONFIG from './config.js';
// Keep service worker alive using alarms
chrome.alarms.create("keepAlive", { periodInMinutes: 4 }); // Runs every 4 minutes

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "keepAlive") {
        console.log("Service worker is still alive!");
    }
});

// Restart service worker when a new page loads
chrome.webNavigation.onCommitted.addListener((details) => {
    console.log("New page loaded, ensuring service worker is active:", details.url);
});

chrome.runtime.onStartup.addListener(() => {
    console.log("Extension restarted, service worker active!");
});

async function ensureOffscreenDocument() {
    const contexts = await chrome.runtime.getContexts({});
    const exists = contexts.some(c => c.contextType === "OFFSCREEN_DOCUMENT");

    if (!exists) {
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["BLOBS"],
            justification: "Keeping service worker alive"
        });
    }
}

ensureOffscreenDocument();

async function checkURL(url) {
    console.log("Checking Safe Browsing API for:", url);
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

        const data = await response.json();

        if (data.matches) {
            console.warn(`🚨 Unsafe site detected: ${url}`);
            return true; // Site is unsafe
        }
    } catch (error) {
        console.error("Safe Browsing API error:", error);
    }

    return false; // Site is safe
}

// Listen for tab updates and redirect if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        console.log("Visited URLs:", changeInfo.url);
        const isUnsafe = await checkURL(changeInfo.url);

        if (isUnsafe) {
            chrome.tabs.update(tabId, { url: chrome.runtime.getURL("warning.html") });
        }
    }
});

// Listen for full page loads and block the URL dynamically
chrome.webNavigation.onCompleted.addListener(async (details) => {
    const url = details.url;
    console.log("Checking Safe Browsing API for:", url);
    
    const isUnsafe = await checkURL(url);
    
    if (isUnsafe) {
        console.log("🚨 Blocking unsafe site:", url);
        blockURL(url);
    }
});

function blockURL(url) {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id: Date.now(), // Unique ID
                priority: 1,
                action: { type: "block" },
                condition: { urlFilter: url, resourceTypes: ["main_frame"] }
            }
        ],
        removeRuleIds: [] // Clear previous rules if needed
    });
}
