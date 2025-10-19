// ====== Initialize Quotes Array ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "If you are working on something exciting, it will keep you motivated.", category: "Work" },
];

// ====== Function: Display a Random Quote ======
function displayRandomQuote() {
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  const quoteText = document.getElementById("quoteText");
  const quoteCategory = document.getElementById("quoteCategory");

  if (randomQuote) {
    quoteText.textContent = randomQuote.text;
    quoteCategory.textContent = `— ${randomQuote.category}`;
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
  } else {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
  }
}

// ====== Function: Populate Category Filter ======
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastSelected = localStorage.getItem("selectedCategory");
  if (lastSelected) categoryFilter.value = lastSelected;
}

// ====== Function: Filter Quotes by Category ======
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
}

// ====== Function: Add a New Quote ======
function addQuote(text, category) {
  const newQuote = { text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  displayRandomQuote();
}

// ====== Function: Create Add Quote Form Listener ======
function createAddQuoteForm() {
  const form = document.getElementById("addQuoteForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document.getElementById("newQuoteCategory").value.trim();

    if (newText && newCategory) {
      addQuote(newText, newCategory);
      form.reset();
    }
  });
}

// ====== Function: Export Quotes to JSON File ======
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ====== Function: Import Quotes from JSON File ======
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        displayRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====== Initialize App ======
document.addEventListener("DOMContentLoaded", function () {
  populateCategories();
  displayRandomQuote();
  createAddQuoteForm();
  document.getElementById("newQuoteBtn").addEventListener("click", displayRandomQuote);
});
