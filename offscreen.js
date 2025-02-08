console.log("Offscreen document is running in the background!");
setInterval(() => {
    console.log("Keeping the extension alive...");
}, 60000); // Logs every minute to prevent shutdown
