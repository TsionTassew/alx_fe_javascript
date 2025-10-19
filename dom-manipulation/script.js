// ===============================
// Dynamic Quote Generator Project
// ===============================

// Initial Quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Wisdom" }
];

// ===============================
// DOM Elements
// ===============================
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// ===============================
// Utility Functions
// ===============================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  return JSON.parse(localStorage.getItem("quotes")) || [];
}

function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => (note.textContent = ""), 4000);
}

// ===============================
// Quote Display
// ===============================
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }
  const random = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// ===============================
// Adding New Quotes
// ===============================
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim() || "General";

  if (!text) {
    alert("Please enter a quote.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showNotification("New quote added!");
  textInput.value = "";
  categoryInput.value = "";
}

// ===============================
// Category Filtering
// ===============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) categoryFilter.value = lastFilter;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);
  showRandomQuote();
}

function getFilteredQuotes() {
  const selected = categoryFilter.value;
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

// ===============================
// JSON Import / Export
// ===============================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
  showNotification("Quotes exported successfully!");
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showNotification("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===============================
// Server Sync Simulation
// ===============================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_URL);
  const data = await res.json();
  const serverQuotes = data.slice(0, 5).map(item => ({
    text: item.title,
    category: "Server"
  }));
  return serverQuotes;
}

async function sendQuotesToServer(quotes) {
  await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotes)
  });
}

// Merge server and local data
function mergeQuotes(local, server) {
  const localTexts = local.map(q => q.text);
  const merged = [...local];

  server.forEach(serverQuote => {
    const existing = local.find(q => q.text === serverQuote.text);
    if (existing && existing.text !== serverQuote.text) {
      showNotification(`Conflict detected. Server version kept: "${serverQuote.text}"`);
    }
    if (!localTexts.includes(serverQuote.text)) merged.push(serverQuote);
  });

  return merged;
}

async function syncData() {
  try {
    showNotification("🔄 Syncing data with server...");
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = loadQuotes();
    const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);
    saveQuotes(mergedQuotes);
    quotes = mergedQuotes;
    populateCategories();
    showNotification("✅ Quotes synced with server!");
  } catch (error) {
    console.error("Sync failed:", error);
    showNotification("⚠️ Failed to sync with server.");
  }
}

// Auto-sync every 60 seconds
setInterval(syncData, 60000);

// ===============================
// Initialize App
// ===============================
window.onload = function() {
  populateCategories();
  const lastViewed = sessionStorage.getItem("lastQuote");
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
  } else {
    showRandomQuote();
  }
  syncData();
};
