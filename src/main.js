import { getFriendsList, getServersList, copyToClipboard, showNotification } from './utils/discord.js';
import { DMManager } from './components/DMManager.js';
import { ServerManager } from './components/ServerManager.js';

const tokenInput = document.getElementById('tokenInput');
const connectBtn = document.getElementById('connectBtn');
const status = document.getElementById('status');
const actions = document.getElementById('actions');
const contentArea = document.getElementById('contentArea');

// Initialize managers
window.dmManager = new DMManager(contentArea);
window.serverManager = new ServerManager(contentArea);

// Window controls
document.getElementById('minimizeBtn').addEventListener('click', () => window.electronAPI.minimize());
document.getElementById('maximizeBtn').addEventListener('click', () => window.electronAPI.maximize());
document.getElementById('closeBtn').addEventListener('click', () => window.electronAPI.close());

connectBtn.addEventListener('click', async () => {
  const token = tokenInput.value;
  if (!token) {
    status.textContent = 'Please enter a token';
    status.className = 'error';
    return;
  }

  // Show loading state
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
    // Reset loading state
    btnText.style.display = 'inline-block';
    loader.style.display = 'none';
    connectBtn.disabled = false;
  }
});

// Friends Manager
document.getElementById('friendsBtn').addEventListener('click', async () => {
  try {
    const friends = await getFriendsList();
    
    contentArea.innerHTML = `
      <h2>Friends List</h2>
      <div class="actions-bar">
        <button id="selectAllBtn" onclick="window.toggleSelectAll()">Select All</button>
        <button id="removeSelectedBtn" onclick="window.removeSelectedFriends()" disabled>Remove Selected</button>
      </div>
      <div id="friendsList">
        ${friends.map(friend => `
          <div class="list-item" data-id="${friend.id}">
            <div class="list-item-left">
              <input type="checkbox" class="friend-checkbox" onchange="window.updateSelectedCount()">
              <img src="${friend.avatar}" alt="${friend.username}">
              <span>${friend.username}</span>
            </div>
            <div class="button-group">
              <button onclick="window.copyToClipboard('${friend.id}')" class="secondary-btn">Copy ID</button>
              <button onclick="window.removeFriend('${friend.id}')" class="danger-btn">Remove</button>
            </div>
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
document.getElementById('serversBtn').addEventListener('click', () => {
  window.serverManager.refreshServersList();
});

// Global functions
window.copyToClipboard = copyToClipboard;

window.toggleSelectAll = () => {
  const checkboxes = document.querySelectorAll('.friend-checkbox');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const isSelectAll = selectAllBtn.textContent === 'Select All';
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = isSelectAll;
  });
  
  selectAllBtn.textContent = isSelectAll ? 'Deselect All' : 'Select All';
  window.updateSelectedCount();
};

window.updateSelectedCount = () => {
  const selectedCount = document.querySelectorAll('.friend-checkbox:checked').length;
  const removeSelectedBtn = document.getElementById('removeSelectedBtn');
  removeSelectedBtn.disabled = selectedCount === 0;
  removeSelectedBtn.textContent = `Remove Selected (${selectedCount})`;
};

window.removeSelectedFriends = async () => {
  const selectedFriends = document.querySelectorAll('.friend-checkbox:checked');
  const total = selectedFriends.length;
  let completed = 0;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Removing Friends</h2>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
        <div class="progress-text">0/${total}</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  for (const checkbox of selectedFriends) {
    const friendItem = checkbox.closest('.list-item');
    const friendId = friendItem.dataset.id;
    
    try {
      await window.electronAPI.deleteFriend(friendId);
      completed++;
      
      const progress = (completed / total) * 100;
      modal.querySelector('.progress').style.width = `${progress}%`;
      modal.querySelector('.progress-text').textContent = `${completed}/${total}`;
      
      friendItem.remove();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  }

  setTimeout(() => {
    modal.remove();
    document.getElementById('friendsBtn').click();
  }, 1000);
};

window.removeFriend = async (friendId) => {
  try {
    await window.electronAPI.deleteFriend(friendId);
    document.getElementById('friendsBtn').click();
  } catch (error) {
    console.error('Failed to remove friend:', error);
  }
};