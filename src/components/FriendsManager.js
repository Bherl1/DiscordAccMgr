import { showProgressModal } from '../utils/ui.js';
import { copyToClipboard } from '../utils/clipboard.js';

export class FriendsManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
  }

  async refreshFriendsList() {
    try {
      const result = await window.electronAPI.getFriends();
      if (!result.success) {
        this.contentArea.innerHTML = `<p class="error">${result.error}</p>`;
        return;
      }

      this.contentArea.innerHTML = `
        <h2>Friends List</h2>
        <div class="actions-bar">
          <button id="selectAllFriendsBtn" onclick="window.friendsManager.toggleSelectAll()">Select All</button>
          <button id="removeSelectedFriendsBtn" onclick="window.friendsManager.removeSelected()" disabled>Remove Selected</button>
        </div>
        <div id="friendsList">
          ${result.friends.map(friend => `
            <div class="list-item" data-id="${friend.id}">
              <div class="list-item-left">
                <input type="checkbox" class="friend-checkbox" onchange="window.friendsManager.updateSelectedCount()">
                <img src="${friend.avatar}" alt="${friend.username}">
                <span>${friend.username}</span>
              </div>
              <div class="button-group">
                <button onclick="window.friendsManager.copyId('${friend.id}')" class="secondary-btn">Copy ID</button>
                <button onclick="window.friendsManager.removeFriend('${friend.id}')" class="danger-btn">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      this.contentArea.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }

  toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.friend-checkbox');
    const selectAllBtn = document.getElementById('selectAllFriendsBtn');
    const isSelectAll = selectAllBtn.textContent === 'Select All';
    
    checkboxes.forEach(checkbox => checkbox.checked = isSelectAll);
    selectAllBtn.textContent = isSelectAll ? 'Deselect All' : 'Select All';
    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.friend-checkbox:checked').length;
    const removeSelectedBtn = document.getElementById('removeSelectedFriendsBtn');
    removeSelectedBtn.disabled = selectedCount === 0;
    removeSelectedBtn.textContent = `Remove Selected (${selectedCount})`;
  }

  async copyId(id) {
    await copyToClipboard(id);
  }

  async removeFriend(friendId) {
    try {
      await window.electronAPI.deleteFriend(friendId);
      this.refreshFriendsList();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  }

  async removeSelected() {
    const selectedFriends = document.querySelectorAll('.friend-checkbox:checked');
    const total = selectedFriends.length;
    
    const { updateProgress, closeModal } = showProgressModal('Removing Friends', total);
    let completed = 0;

    for (const checkbox of selectedFriends) {
      const friendId = checkbox.closest('.list-item').dataset.id;
      try {
        await window.electronAPI.deleteFriend(friendId);
        completed++;
        updateProgress(completed);
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    }

    setTimeout(() => {
      closeModal();
      this.refreshFriendsList();
    }, 1000);
  }
}