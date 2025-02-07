const API_KEY = "AIzaSyCZx34avqXbxcZMWFz9xSeY6f93ktYEzgg";
const API_URL= `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;


async function checkURL(url) {
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

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
      const isUnsafe = await checkURL(changeInfo.url);

      if (isUnsafe) {
          chrome.tabs.update(tabId, { url: chrome.runtime.getURL("warning.html") });
      }
  }
});
