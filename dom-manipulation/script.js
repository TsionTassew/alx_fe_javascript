// ====== Initialize Quotes Array ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "If you are working on something exciting, it will keep you motivated.", category: "Work" },
];

// ====== Function: Display a Random Quote ======
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p id="quoteText">${randomQuote.text}</p>
    <p id="quoteCategory">— ${randomQuote.category}</p>
  `;

  // Save last viewed quote in session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// ====== Function: Populate Category Filter ======
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Reset dropdown
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add unique categories
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes(); // show filtered quotes on reload
  }
}

// ====== Function: Filter Quotes by Category ======
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteDisplay = document.getElementById("quoteDisplay");

  // Save selected category to localStorage
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }

  // Display filtered quotes
  if (filteredQuotes.length > 0) {
    let output = "";
    filteredQuotes.forEach(q => {
      output += `<p>"${q.text}" — <em>${q.category}</em></p>`;
    });
    quoteDisplay.innerHTML = output;
  } else {
    quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
  }
}

// ====== Function: Add New Quote ======
function addQuote(text, category) {
  const newQuote = { text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  filterQuotes();
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

// ====== Initialize App ======
document.addEventListener("DOMContentLoaded", function () {
  populateCategories();
  displayRandomQuote();
  createAddQuoteForm();

  // Attach event listener for “Show New Quote”
  document.getElementById("newQuoteBtn").addEventListener("click", displayRandomQuote);
});
