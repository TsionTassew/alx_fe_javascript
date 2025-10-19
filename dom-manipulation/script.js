// ====== Quotes Array ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "If you are working on something exciting, it will keep you motivated.", category: "Work" },
];

// ====== Display a Random Quote ======
function displayRandomQuote() {
  const filteredCategory = localStorage.getItem("selectedCategory") || "all";
  let filteredQuotes = quotes;
  if (filteredCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === filteredCategory);
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  const quoteText = document.getElementById("quoteText");
  const quoteCategory = document.getElementById("quoteCategory");

  if (quote) {
    quoteText.textContent = quote.text;
    quoteCategory.textContent = `— ${quote.category}`;
  } else {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
  }
}

// ====== Populate Categories Dynamically ======
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastSelected = localStorage.getItem("selectedCategory");
  if (lastSelected) {
    categoryFilter.value = lastSelected;
  }
}

// ====== Filter Quotes by Category ======
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  displayRandomQuote();
}

// ====== Add a New Quote ======
function addQuote(text, category) {
  const newQuote = { text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  displayRandomQuote();
}

// ====== Handle Add Quote Form ======
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

// ====== Initialize App ======
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  displayRandomQuote();
  createAddQuoteForm();

  document.getElementById("newQuoteBtn").addEventListener("click", displayRandomQuote);
});
