// ------------------------------------------
// Dynamic Quote Generator + Category Filter
// ------------------------------------------

const LOCAL_KEY = "dynamic_quote_generator_quotes_v1";
const LAST_VIEWED_KEY = "dynamic_quote_generator_last_viewed_v1";
const FILTER_KEY = "dynamic_quote_generator_last_filter_v1";

const defaultQuotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Perseverance" },
  { text: "Stay hungry, stay foolish.", category: "Innovation" }
];

let quotes = [];

// ---------- Local Storage Helpers ----------
function saveQuotes() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(LOCAL_KEY);
  if (data) {
    try {
      quotes = JSON.parse(data);
      if (!Array.isArray(quotes)) throw new Error();
    } catch {
      quotes = defaultQuotes.slice();
      saveQuotes();
    }
  } else {
    quotes = defaultQuotes.slice();
    saveQuotes();
  }
}

// ---------- Category Helpers ----------
function getUniqueCategories() {
  const cats = quotes.map(q => q.category || "Uncategorized");
  return Array.from(new Set(cats));
}

function populateCategories() {
  const filterSelect = document.getElementById("categoryFilter");
  const savedFilter = localStorage.getItem(FILTER_KEY) || "all";

  // Clear existing options
  filterSelect.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All Categories";
  filterSelect.appendChild(allOpt);

  const categories = getUniqueCategories();
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === savedFilter) opt.selected = true;
    filterSelect.appendChild(opt);
  });

  // Reapply saved filter
  filterSelect.value = savedFilter;
}

// ---------- Filter + Display ----------
function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category!";
    document.getElementById("categoryDisplay").innerText = "";
    return;
  }

  const index = Math.floor(Math.random() * filteredQuotes.length);
  const q = filteredQuotes[index];
  document.getElementById("quoteDisplay").innerText = `"${q.text}"`;
  document.getElementById("categoryDisplay").innerText = `— Category: ${q.category}`;

  // Save last viewed quote (by index in main array)
  const actualIndex = quotes.findIndex(item => item.text === q.text && item.category === q.category);
  sessionStorage.setItem(LAST_VIEWED_KEY, actualIndex);
  updateLastViewedDisplay();
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem(FILTER_KEY, selected);
  showRandomQuote();
}

// ---------- Add Quote ----------
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const text = textEl.value.trim();
  const category = catEl.value.trim() || "Uncategorized";

  if (!text) {
    alert("Please enter a quote text.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  textEl.value = "";
  catEl.value = "";
  alert("New quote added successfully!");
  showRandomQuote();
}

// ---------- Import/Export ----------
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON");

      let added = 0;
      imported.forEach(q => {
        if (q.text && typeof q.text === "string") {
          const category = q.category || "Uncategorized";
          const exists = quotes.some(item => item.text === q.text && item.category === category);
          if (!exists) {
            quotes.push({ text: q.text, category });
            added++;
          }
        }
      });

      saveQuotes();
      populateCategories();
      alert(`Imported ${added} new quotes successfully!`);
    } catch {
      alert("Invalid JSON file format!");
    }
  };
  reader.readAsText(file);
}

// ---------- Clear ----------
function clearStorage() {
  if (!confirm("Are you sure you want to clear all saved quotes and filters?")) return;
  localStorage.clear();
  sessionStorage.clear();
  loadQuotes();
  populateCategories();
  showRandomQuote();
}

// ---------- Last Viewed ----------
function updateLastViewedDisplay() {
  const idx = sessionStorage.getItem(LAST_VIEWED_KEY);
  const el = document.getElementById("lastViewedDisplay");
  if (idx === null || !quotes[idx]) {
    el.innerText = "";
  } else {
    const q = quotes[idx];
    el.innerText = `Last viewed this session: "${q.text}" — ${q.category}`;
  }
}

// ---------- Initialization ----------
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  updateLastViewedDisplay();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("clearStorageBtn").addEventListener("click", clearStorage);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

  // Load last used filter immediately
  showRandomQuote();
});
