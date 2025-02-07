document.addEventListener("DOMContentLoaded", () => {
    const listElement = document.getElementById("trusted-list");
    const clearButton = document.getElementById("clear-all");

    // Load trusted sites from storage
    chrome.storage.local.get({ trustedSites: [] }, (data) => {
        const trustedSites = data.trustedSites;

        if (trustedSites.length === 0) {
            listElement.innerHTML = "<p class='text-gray-400'>No trusted sites yet.</p>";
            return;
        }

        trustedSites.forEach((site, index) => {
            const listItem = document.createElement("li");
            listItem.className = "flex justify-between items-center bg-gray-700 p-2 rounded my-2";
            listItem.innerHTML = `<span>${site}</span>
                <button class="remove-btn bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600 transition" data-index="${index}">Remove</button>`;
            listElement.appendChild(listItem);
        });

        // Attach event listeners to "Remove" buttons
        document.querySelectorAll(".remove-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                trustedSites.splice(index, 1);
                chrome.storage.local.set({ trustedSites }, () => {
                    location.reload(); // Refresh the page
                });
            });
        });
    });

    // Clear all trusted sites
    clearButton.addEventListener("click", () => {
        chrome.storage.local.set({ trustedSites: [] }, () => {
            location.reload(); // Refresh the page
        });
    });
});
