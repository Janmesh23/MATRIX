const API_KEY = "AIzaSyCZx34avqXbxcZMWFz9xSeY6f93ktYEzgg";
const trustedSites = new Set(); // Stores user-approved sites

// Block certain file extensions (e.g., .exe, .zip)
const blockedExtensions = ['.exe', '.zip', '.bat', '.msi'];

async function checkSafeBrowsing(url) {
  if (trustedSites.has(url)) {
    return false; // Allow access to trusted sites
  }

  const requestBody = {
    client: {
      clientId: "safe-browsing-extension",
      clientVersion: "1.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["WINDOWS", "LINUX", "ANDROID"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };

  const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json();
  return data.matches !== undefined;
}

// Intercept requests before they happen
chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    const isUnsafe = await checkSafeBrowsing(details.url);

    if (isUnsafe) {
      const userDecision = confirm(
        `🚨 Warning! This site (${details.url}) is flagged as unsafe. Do you want to continue at your own risk?`
      );
      if (userDecision) {
        trustedSites.add(details.url); // Allow access if user confirms
        return { cancel: false };
      }
      return { cancel: true }; // Block if user declines
    }

    // Block file downloads with certain extensions (e.g., .exe)
    const url = details.url.toLowerCase();
    const extension = url.substring(url.lastIndexOf('.'));
    if (blockedExtensions.includes(extension)) {
      const userDecision = confirm(
        `⚠️ This site is attempting to download a file with a dangerous extension (${extension}). Do you want to allow the download?`
      );
      if (userDecision) {
        return { cancel: false }; // Allow download if user confirms
      }
      return { cancel: true }; // Block if user declines
    }

    return { cancel: false }; // Allow other requests
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
