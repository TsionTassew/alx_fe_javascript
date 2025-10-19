// -------------------- Quotes Array --------------------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

// -------------------- DOM Elements --------------------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteButton');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// -------------------- Show Random Quote --------------------
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

// -------------------- Add New Quote --------------------
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });

  // Update DOM (show the newly added quote)
  quoteDisplay.textContent = `"${text}" — ${category}`;

  // Clear input fields
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// -------------------- Event Listeners --------------------
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

// -------------------- Initial Display --------------------
showRandomQuote();
