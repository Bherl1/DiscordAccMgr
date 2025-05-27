import { checkForUpdates } from './utils/updates.js';
import { loadSavedTokens, saveToken } from './utils/tokenManager.js';
import { DMManager } from './components/DMManager.js';
import { ServerManager } from './components/ServerManager.js';
import { FriendsManager } from './components/FriendsManager.js';
import { GroupManager } from './components/GroupManager.js';
import { showInfoModal } from './utils/ui.js';
import { copyToClipboard } from './utils/clipboard.js';
import { getFriendsList } from './utils/discord.js';

window.dmManager = new DMManager(document.getElementById('dms-page'));
window.serverManager = new ServerManager(document.getElementById('servers-page'));
window.friendsManager = new FriendsManager(document.getElementById('friends-page'));
window.groupManager = new GroupManager(document.getElementById('groups-page'));

window.copyToClipboard = copyToClipboard;
window.getFriendsList = getFriendsList;

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page-container');
const userProfile = document.getElementById('userProfile');
const loginNavItem = document.getElementById('loginNavItem');

function showUserProfile(username) {
  const userInitial = document.getElementById('userInitial');
  const userName = document.getElementById('userName');
  
  userInitial.textContent = username.charAt(0).toUpperCase();
  userName.textContent = username;
  userProfile.classList.add('visible');
}

function hideUserProfile() {
  userProfile.classList.remove('visible');
}

function toggleNavItems(show) {
  document.querySelectorAll('.nav-item:not(#loginNavItem)').forEach(item => {
    item.classList.toggle('hidden', !show);
  });
  loginNavItem.classList.toggle('hidden', show);
}

function switchPage(pageId) {
  pages.forEach(page => {
    page.classList.remove('active');
    if (page.id === `${pageId}-page`) {
      setTimeout(() => page.classList.add('active'), 50);
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageId) {
      item.classList.add('active');
    }
  });

  // Load content based on page
  switch (pageId) {
    case 'friends':
      window.friendsManager.refreshFriendsList();
      break;
    case 'servers':
      window.serverManager.refreshServersList();
      break;
    case 'dms':
      window.dmManager.refreshDMsList();
      break;
    case 'groups':
      window.groupManager.refreshGroupsList();
      break;
  }
}

// Initialize visibility
toggleNavItems(false);
switchPage('login');

navItems.forEach(item => {
  item.addEventListener('click', () => switchPage(item.dataset.page));
});

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
document.getElementById('saveTokenBtn').addEventListener('click', () => saveToken(tokenInput.value, status));

// Disconnect handler
document.getElementById('disconnectBtn').addEventListener('click', () => {
  hideUserProfile();
  toggleNavItems(false);
  switchPage('login');
  tokenInput.value = '';
  status.textContent = '';
});

// Connect button handler
const connectBtn = document.getElementById('connectBtn');
const tokenInput = document.getElementById('tokenInput');
const status = document.getElementById('status');

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
      showUserProfile(result.username);
      toggleNavItems(true);
      switchPage('friends');
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