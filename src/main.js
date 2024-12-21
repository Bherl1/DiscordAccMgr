import { getFriendsList, getServersList } from './utils/discord.js';
import { DMManager } from './components/DMManager.js';

const tokenInput = document.getElementById('tokenInput');
const connectBtn = document.getElementById('connectBtn');
const status = document.getElementById('status');
const actions = document.getElementById('actions');
const contentArea = document.getElementById('contentArea');

// Initialize DM Manager
window.dmManager = new DMManager(contentArea);

// Window controls
document.getElementById('minimizeBtn').addEventListener('click', () => window.electronAPI.minimize());
document.getElementById('maximizeBtn').addEventListener('click', () => window.electronAPI.maximize());
document.getElementById('closeBtn').addEventListener('click', () => window.electronAPI.close());

// Connection
connectBtn.addEventListener('click', async () => {
  const token = tokenInput.value;
  if (!token) {
    status.textContent = 'Please enter a token';
    status.className = 'error';
    return;
  }

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
  }
});

// Friends Manager
document.getElementById('friendsBtn').addEventListener('click', async () => {
  try {
    const friends = await getFriendsList();
    
    contentArea.innerHTML = `
      <h2>Friends List</h2>
      <div id="friendsList">
        ${friends.map(friend => `
          <div class="list-item">
            <div style="display: flex; align-items: center;">
              <img src="${friend.avatar}" alt="${friend.username}">
              <span>${friend.username}</span>
            </div>
            <button onclick="removeFriend('${friend.id}')">Remove</button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    contentArea.innerHTML = `<p class="error">${error.message}</p>`;
  }
});

// DMs Manager
document.getElementById('dmsBtn').addEventListener('click', () => {
  window.dmManager.refreshDMsList();
});

// Servers Manager
document.getElementById('serversBtn').addEventListener('click', async () => {
  try {
    const servers = await getServersList();
    
    contentArea.innerHTML = `
      <h2>Servers List</h2>
      <div id="serversList">
        ${servers.map(server => `
          <div class="list-item">
            <div style="display: flex; align-items: center;">
              <img src="${server.icon}" alt="${server.name}">
              <span>${server.name}</span>
            </div>
            <button onclick="leaveServer('${server.id}')">Leave</button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    contentArea.innerHTML = `<p class="error">${error.message}</p>`;
  }
});

// Global functions for the buttons
window.removeFriend = async (friendId) => {
  try {
    await window.electronAPI.deleteFriend(friendId);
    document.getElementById('friendsBtn').click();
  } catch (error) {
    console.error('Failed to remove friend:', error);
  }
};

window.leaveServer = async (serverId) => {
  try {
    await window.electronAPI.leaveServer(serverId);
    document.getElementById('serversBtn').click();
  } catch (error) {
    console.error('Failed to leave server:', error);
  }
};