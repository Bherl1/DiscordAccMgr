import { checkForUpdates } from './utils/updates.js';
import { loadSavedTokens, saveToken } from './utils/tokenManager.js';
import { DMManager } from './components/DMManager.js';
import { ServerManager } from './components/ServerManager.js';
import { FriendsManager } from './components/FriendsManager.js';
import { GroupManager } from './components/GroupManager.js';
import { showInfoModal } from './utils/ui.js';
import { copyToClipboard } from './utils/clipboard.js';
import { getFriendsList } from './utils/discord.js';

// Initialize DOM elements
const tokenInput = document.getElementById('tokenInput');
const connectBtn = document.getElementById('connectBtn');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const status = document.getElementById('status');
const actions = document.getElementById('actions');
const contentArea = document.getElementById('contentArea');

// Initialize managers
window.dmManager = new DMManager(contentArea);
window.serverManager = new ServerManager(contentArea);
window.friendsManager = new FriendsManager(contentArea);
window.groupManager = new GroupManager(contentArea);

// Make utilities globally available
window.copyToClipboard = copyToClipboard;
window.getFriendsList = getFriendsList;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await checkForUpdates();
    await loadSavedTokens();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Window controls
document.getElementById('minimizeBtn').addEventListener('click', () => window.electronAPI.minimize());
document.getElementById('maximizeBtn').addEventListener('click', () => window.electronAPI.maximize());
document.getElementById('closeBtn').addEventListener('click', () => window.electronAPI.close());
document.getElementById('infoBtn').addEventListener('click', showInfoModal);
saveTokenBtn.addEventListener('click', () => saveToken(tokenInput.value, status));

// Connect button handler
connectBtn.addEventListener('click', async () => {
  const token = tokenInput.value;
  if (!token) {
    status.textContent = 'Please enter a token';
    status.className = 'error';
    return;
  }

  const btnText = connectBtn.querySelector('.btn-text');
  const loader = connectBtn.querySelector('.loader');
  btnText.style.display = 'none';
  loader.style.display = 'inline-block';
  connectBtn.disabled = true;

  try {
    const result = await window.electronAPI.connectDiscord(token);
    if (result.success) {
      status.textContent = `Connected as ${result.username}`;
      status.className = 'success';
      actions.style.display = 'grid';
    } else {
      status.textContent = result.error;
      status.className = 'error';
    }
  } catch (error) {
    status.textContent = 'Connection failed';
    status.className = 'error';
  } finally {
    btnText.style.display = 'inline-block';
    loader.style.display = 'none';
    connectBtn.disabled = false;
  }
});

// Groups Manager
document.getElementById('groupsBtn').addEventListener('click', () => {
  window.groupManager.refreshGroupsList();
});

// Friends Manager
document.getElementById('friendsBtn').addEventListener('click', () => {
  window.friendsManager.refreshFriendsList();
});

// DMs Manager
document.getElementById('dmsBtn').addEventListener('click', () => {
  window.dmManager.refreshDMsList();
});

// Servers Manager
document.getElementById('serversBtn').addEventListener('click', () => {
  window.serverManager.refreshServersList();
});