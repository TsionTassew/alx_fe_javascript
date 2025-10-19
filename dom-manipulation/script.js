// -------------------- Configuration --------------------
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 60000;

// -------------------- UI Notifications --------------------
function showNotification(message, type = 'success') {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.style.display = 'block';
  notif.style.backgroundColor = type === 'error' ? '#f44336' : '#4caf50';
  setTimeout(() => (notif.style.display = 'none'), 4000);
}

// -------------------- Local Storage --------------------
function loadLocalQuotes() {
  return JSON.parse(localStorage.getItem('quotes')) || [];
}

function saveLocalQuotes(quotes) {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// -------------------- Display --------------------
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
  showNotification('Quote added locally!');
}

// -------------------- Server Interaction --------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch from server');
    const data = await response.json();
    return data.map(post => ({
      id: post.id,
      text: post.title,
      category: 'server',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Server fetch error:', error);
    showNotification('Failed to fetch quotes from server', 'error');
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
    showNotification('Failed to sync local quotes', 'error');
  }
}

// -------------------- Conflict Resolution --------------------
function resolveConflicts(localQuotes, serverQuotes) {
  let conflictsResolved = false;

  const merged = serverQuotes.map(serverQuote => {
    const localQuote = localQuotes.find(q => q.id === serverQuote.id);
    if (localQuote) {
      conflictsResolved = true;
      return new Date(localQuote.timestamp) > new Date(serverQuote.timestamp)
        ? localQuote
        : serverQuote;
    }
    return serverQuote;
  });

  localQuotes.forEach(localQuote => {
    if (!merged.some(q => q.id === localQuote.id)) merged.push(localQuote);
  });

  if (conflictsResolved) showNotification('Conflicts resolved during sync');
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

  showNotification('Quotes synced with server!');
}

// -------------------- Initialization --------------------
document.getElementById('newQuoteButton').addEventListener('click', addQuote);
document.getElementById('syncButton').addEventListener('click', syncQuotes);

displayQuotes(loadLocalQuotes());
syncQuotes();
setInterval(syncQuotes, SYNC_INTERVAL);
