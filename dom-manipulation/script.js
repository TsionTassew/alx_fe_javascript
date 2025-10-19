// -------------------- Configuration --------------------
const API_URL = 'https://your-api-url.com/api/quotes'; // Replace with your server URL
const SYNC_INTERVAL = 60000; // 60 seconds

// -------------------- Helper Functions --------------------

// Load quotes from local storage
function loadLocalQuotes() {
  return JSON.parse(localStorage.getItem('quotes')) || [];
}

// Save quotes to local storage
function saveLocalQuotes(quotes) {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display quotes in the DOM
function displayQuotes(quotes) {
  const container = document.getElementById('quoteDisplay');
  container.innerHTML = '';
  quotes.forEach(quote => {
    const div = document.createElement('div');
    div.className = 'quote-item';
    div.textContent = `"${quote.text}" — ${quote.category}`;
    container.appendChild(div);
  });
}

// -------------------- Quote Management --------------------

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) return alert('Please enter text and category.');

  const quotes = loadLocalQuotes();
  const newQuote = {
    id: Date.now(), // Unique ID based on timestamp
    text,
    category,
    timestamp: new Date().toISOString(),
  };

  quotes.push(newQuote);
  saveLocalQuotes(quotes);
  displayQuotes(quotes);

  textInput.value = '';
  categoryInput.value = '';
}

// -------------------- Server Interaction --------------------

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch from server');
    return await response.json();
  } catch (error) {
    console.error('Server fetch error:', error);
    return [];
  }
}

// Post a quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });
  } catch (error) {
    console.error('Server POST error:', error);
  }
}

// Resolve conflicts (keep most recent quote)
function resolveConflicts(localQuotes, serverQuotes) {
  const merged = serverQuotes.map(serverQuote => {
    const localQuote = localQuotes.find(q => q.id === serverQuote.id);
    if (localQuote) {
      return new Date(localQuote.timestamp) > new Date(serverQuote.timestamp)
        ? localQuote
        : serverQuote;
    }
    return serverQuote;
  });

  // Include local quotes not on server
  localQuotes.forEach(localQuote => {
    if (!merged.some(q => q.id === localQuote.id)) merged.push(localQuote);
  });

  return merged;
}

// -------------------- Sync Logic --------------------

async function syncWithServer() {
  const localQuotes = loadLocalQuotes();
  const serverQuotes = await fetchQuotesFromServer();

  const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);
  saveLocalQuotes(mergedQuotes);
  displayQuotes(mergedQuotes);

  // Push any local-only quotes to server
  const localOnly = localQuotes.filter(
    q => !serverQuotes.some(sq => sq.id === q.id)
  );
  for (const quote of localOnly) {
    await postQuoteToServer(quote);
  }

  console.log('Sync complete:', new Date().toLocaleTimeString());
}

// -------------------- Initialization --------------------

document.getElementById('newQuoteButton').addEventListener('click', addQuote);
document.getElementById('syncButton').addEventListener('click', syncWithServer);

// Initial load
displayQuotes(loadLocalQuotes());
syncWithServer(); // Initial sync
setInterval(syncWithServer, SYNC_INTERVAL);
