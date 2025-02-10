// Function to show the warning overlay
console.log("Checking if content script is injected!");
console.log("🚨 Checking if this site is malicious:", window.location.hostname);

if (window.location.hostname.includes("malicious-site.com")) {
    console.log("⚠️ WARNING! Malicious site detected:", window.location.hostname);
    showWarningOverlay();
} else {
    console.log("✅ This site seems safe:", window.location.hostname);
}

function showWarningOverlay() {
  // Create the iframe element
  let iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.src = chrome.runtime.getURL("warning.html");

  // Block user interaction with the page
  document.body.style.pointerEvents = "none";

  // Append the iframe to the body
  document.body.appendChild(iframe);

  // Listen for messages from warning.html
  window.addEventListener("message", function(event) {
      if (event.data === "trust-site") {
          // User trusted the site, remove overlay and unblock page
          document.body.style.pointerEvents = "auto";
          iframe.remove();
      } else if (event.data === "block-site") {
          // Redirect to a safe page or close the tab
          window.location.href = "https://www.google.com";
      }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showWarning") {
    showWarningOverlay(); // Call the function when unsafe site is detected
  }
});

