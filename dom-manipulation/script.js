// -------------------- Configuration --------------------
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API
const SYNC_INTERVAL = 60000; // 60 seconds

// -------------------- Helper Functions --------------------
function loadLocalQuotes() {
  return JSON.parse(localStorage.getItem('quotes')) || [];
}

function saveLocalQuotes(quotes) {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

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

function showNotification(message) {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.style.display = 'block';
  setTimeout(() => (notif.style.display = 'none'), 3000);
}

// -------------------- Quote Management --------------------
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) return alert('Please enter text and category.');

  const quotes = loadLocalQuotes();
  const newQuote = {
    id: Date.now(),
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
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch from server');
    const data = await response.json();
    // Map JSONPlaceholder posts to quote format
    return data.map(post => ({
      id: post.id,
      text: post.title,
      category: 'server', // default category
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Server fetch error:', error);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: quote.text, body: quote.category }),
    });
  } catch (error) {
    console.error('Server POST error:', error);
    showNotification('Error syncing to server!');
  }
}

// -------------------- Conflict Resolution --------------------
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

  localQuotes.forEach(localQuote => {
    if (!merged.some(q => q.id === localQuote.id)) merged.push(localQuote);
  });

  return merged;
}

// -------------------- Sync Function --------------------
async function syncQuotes() {
  const localQuotes = loadLocalQuotes();
  const serverQuotes = await fetchQuotesFromServer();

  const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);
  saveLocalQuotes(mergedQuotes);
  displayQuotes(mergedQuotes);

  // Push local-only quotes to server
  const localOnly = localQuotes.filter(
    q => !serverQuotes.some(sq => sq.id === q.id)
  );
  for (const quote of localOnly) {
    await postQuoteToServer(quote);
  }

  if (localOnly.length > 0 || serverQuotes.length > 0) {
    showNotification('Quotes synced successfully!');
  }
}

// -------------------- Initialization --------------------
document.getElementById('newQuoteButton').addEventListener('click', addQuote);
document.getElementById('syncButton').addEventListener('click', syncQuotes);

// Initial load
displayQuotes(loadLocalQuotes());
syncQuotes();
setInterval(syncQuotes, SYNC_INTERVAL);
