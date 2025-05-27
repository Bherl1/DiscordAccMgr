import { getDMsList, copyToClipboard } from '../utils/discord.js';
import { deleteDMMessages } from '../utils/messageDeleter.js';
import { handleBulkDMActions } from '../utils/bulkDMHandler.js';

export class DMManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
    this.isDeleting = false;
  }

  async refreshDMsList() {
    try {
      const dms = await getDMsList();
      
      this.contentArea.innerHTML = `
        <h2>DMs List</h2>
        <div class="actions-bar">
          <button id="selectAllDMsBtn" onclick="window.dmManager.toggleSelectAllDMs()">Select All</button>
          <button id="deleteSelectedMessagesBtn" onclick="window.dmManager.deleteSelectedMessages()" disabled>Delete Selected Messages</button>
          <button id="closeSelectedDMsBtn" onclick="window.dmManager.closeSelectedDMs()" disabled>Close Selected DMs</button>
        </div>
        <div id="dmsList">
          ${dms.map(dm => `
            <div class="list-item" data-id="${dm.id}" data-username="${dm.username}">
              <div class="list-item-left">
                <input type="checkbox" class="dm-checkbox" onchange="window.dmManager.updateSelectedCount()">
                <img src="${dm.avatar}" alt="${dm.username}">
                <div class="user-info">
                  <span class="display-name">${dm.displayName}</span>
                  <span class="username">(${dm.username})</span>
                </div>
              </div>
              <div class="button-group">
                <button onclick="window.dmManager.copyToClipboard('${dm.id}')" class="secondary-btn">Copy ID</button>
                <button onclick="window.dmManager.deleteDMMessages('${dm.id}', '${dm.username}', false)" class="secondary-btn">Delete Messages</button>
                <button onclick="window.dmManager.deleteDMMessages('${dm.id}', '${dm.username}', true)" class="secondary-btn">Delete Oldest First</button>
                <button onclick="window.dmManager.closeDM('${dm.id}')" class="danger-btn">Close DM</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      this.contentArea.innerHTML = '<p class="error">Failed to load DMs</p>';
    }
  }

  toggleSelectAllDMs() {
    const checkboxes = document.querySelectorAll('.dm-checkbox');
    const selectAllBtn = document.getElementById('selectAllDMsBtn');
    const isSelectAll = selectAllBtn.textContent === 'Select All';
    
    checkboxes.forEach(checkbox => checkbox.checked = isSelectAll);
    selectAllBtn.textContent = isSelectAll ? 'Deselect All' : 'Select All';
    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.dm-checkbox:checked').length;
    const deleteSelectedBtn = document.getElementById('deleteSelectedMessagesBtn');
    const closeSelectedBtn = document.getElementById('closeSelectedDMsBtn');
    
    deleteSelectedBtn.disabled = selectedCount === 0;
    closeSelectedBtn.disabled = selectedCount === 0;
    
    deleteSelectedBtn.textContent = `Delete Selected Messages (${selectedCount})`;
    closeSelectedBtn.textContent = `Close Selected DMs (${selectedCount})`;
  }

  async deleteSelectedMessages() {
    if (this.isDeleting) return;
    this.isDeleting = true;

    try {
      const selectedDMs = Array.from(document.querySelectorAll('.dm-checkbox:checked')).map(checkbox => {
        const item = checkbox.closest('.list-item');
        return {
          id: item.dataset.id,
          username: item.dataset.username
        };
      });

      await handleBulkDMActions(selectedDMs, 'delete', window.electronAPI);
      this.refreshDMsList();
    } finally {
      this.isDeleting = false;
    }
  }

  async closeSelectedDMs() {
    if (this.isDeleting) return;
    this.isDeleting = true;

    try {
      const selectedDMs = Array.from(document.querySelectorAll('.dm-checkbox:checked')).map(checkbox => {
        const item = checkbox.closest('.list-item');
        return {
          id: item.dataset.id,
          username: item.dataset.username
        };
      });

      await handleBulkDMActions(selectedDMs, 'close', window.electronAPI);
      this.refreshDMsList();
    } finally {
      this.isDeleting = false;
    }
  }

  copyToClipboard = copyToClipboard;

  async deleteDMMessages(channelId, username, oldestFirst = false, skipRefresh = false) {
    if (this.isDeleting) return;
    this.isDeleting = true;

    try {
      await deleteDMMessages({
        channelId,
        username,
        electronAPI: window.electronAPI,
        onComplete: () => {
          this.isDeleting = false;
          if (!skipRefresh) {
            this.refreshDMsList();
          }
        },
        skipRefresh,
        oldestFirst
      });
    } catch (error) {
      console.error('Failed to delete messages:', error);
      this.isDeleting = false;
    }
  }

  async closeDM(channelId) {
    if (this.isDeleting) return;

    try {
      const result = await window.electronAPI.closeDM(channelId);
      if (result.success) {
        this.refreshDMsList();
      }
    } catch (error) {
      console.error('Failed to close DM:', error);
    }
  }
}