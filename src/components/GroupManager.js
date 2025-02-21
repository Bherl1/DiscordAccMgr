import { showProgressModal } from '../utils/ui.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { deleteDMMessages } from '../utils/messageDeleter.js';

export class GroupManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
    this.isDeleting = false;
    this.defaultGroupIcon = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#5865F2"/>
        <path d="M22 12C22 14.2091 20.2091 16 18 16C15.7909 16 14 14.2091 14 12C14 9.79086 15.7909 8 18 8C20.2091 8 22 9.79086 22 12Z" fill="white"/>
        <path d="M10 20C10 17.7909 11.7909 16 14 16H22C24.2091 16 26 17.7909 26 20V22C26 23.1046 25.1046 24 24 24H12C10.8954 24 10 23.1046 10 22V20Z" fill="white"/>
        <path d="M12 14C12 15.1046 11.1046 16 10 16C8.89543 16 8 15.1046 8 14C8 12.8954 8.89543 12 10 12C11.1046 12 12 12.8954 12 14Z" fill="white"/>
        <path d="M6 19.5C6 18.1193 7.11929 17 8.5 17H11.5C12.8807 17 14 18.1193 14 19.5V22C14 23.1046 13.1046 24 12 24H8C6.89543 24 6 23.1046 6 22V19.5Z" fill="white"/>
      </svg>
    `)}`;
  }

  async refreshGroupsList() {
    try {
      const result = await window.electronAPI.getGroups();
      if (!result.success) {
        this.contentArea.innerHTML = '<p class="error">Failed to load groups</p>';
        return;
      }

      this.contentArea.innerHTML = `
        <h2>Groups List</h2>
        <div class="actions-bar">
          <button id="selectAllGroupsBtn" onclick="window.groupManager.toggleSelectAll()">Select All</button>
          <button id="leaveSelectedGroupsBtn" onclick="window.groupManager.leaveSelectedGroups()" disabled>Leave Selected</button>
          <button id="deleteSelectedMessagesBtn" onclick="window.groupManager.deleteSelectedMessages()" disabled>Delete Selected Messages</button>
        </div>
        <div id="groupsList">
          ${result.groups.map(group => `
            <div class="list-item" data-id="${group.id}" data-name="${group.name}">
              <div class="list-item-left">
                <input type="checkbox" class="group-checkbox" onchange="window.groupManager.updateSelectedCount()">
                <div class="group-avatar${!group.icon || group.icon === '/discord.png' ? ' default-avatar' : ''}">
                  <img src="${group.icon === '/discord.png' ? this.defaultGroupIcon : group.icon}" 
                       alt="${group.name}"
                       onerror="this.src='${this.defaultGroupIcon}'">
                </div>
                <div class="group-info">
                  <span class="group-name">${group.name}</span>
                  <span class="group-members">${group.recipients} members</span>
                </div>
              </div>
              <div class="button-group">
                <button onclick="window.groupManager.copyId('${group.id}')" class="secondary-btn">Copy ID</button>
                <button onclick="window.groupManager.deleteMessages('${group.id}', '${group.name}')" class="secondary-btn">Delete Messages</button>
                <button onclick="window.groupManager.leaveGroup('${group.id}')" class="danger-btn">Leave</button>
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
    const checkboxes = document.querySelectorAll('.group-checkbox');
    const selectAllBtn = document.getElementById('selectAllGroupsBtn');
    const isSelectAll = selectAllBtn.textContent === 'Select All';
    
    checkboxes.forEach(checkbox => checkbox.checked = isSelectAll);
    selectAllBtn.textContent = isSelectAll ? 'Deselect All' : 'Select All';
    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.group-checkbox:checked').length;
    const leaveSelectedBtn = document.getElementById('leaveSelectedGroupsBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedMessagesBtn');
    
    leaveSelectedBtn.disabled = selectedCount === 0;
    deleteSelectedBtn.disabled;
    
    leaveSelectedBtn.textContent = `Leave Selected (${selectedCount})`;
    deleteSelectedBtn.textContent = `Delete Selected Messages (${selectedCount})`;
  }

  async copyId(id) {
    await copyToClipboard(id);
  }

  async deleteMessages(groupId, groupName, skipRefresh = false) {
    if (this.isDeleting) return;
    this.isDeleting = true;

    try {
      await deleteDMMessages({
        channelId: groupId,
        username: groupName,
        electronAPI: window.electronAPI,
        onComplete: () => {
          this.isDeleting = false;
          if (!skipRefresh) {
            this.refreshGroupsList();
          }
        },
        skipRefresh,
        isGroup: true // Important: indique que c'est un groupe
      });
    } catch (error) {
      console.error('Failed to delete messages:', error);
      this.isDeleting = false;
    }
  }

  async leaveGroup(groupId) {
    try {
      const result = await window.electronAPI.leaveGroup(groupId);
      if (result.success) {
        this.refreshGroupsList();
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  }

  async leaveSelectedGroups() {
    const selectedGroups = document.querySelectorAll('.group-checkbox:checked');
    const total = selectedGroups.length;
    let completed = 0;

    const { updateProgress, closeModal } = showProgressModal('Leaving Groups', total);

    for (const checkbox of selectedGroups) {
      const groupItem = checkbox.closest('.list-item');
      const groupId = groupItem.dataset.id;
      
      try {
        await window.electronAPI.leaveGroup(groupId);
        completed++;
        updateProgress(completed);
      } catch (error) {
        console.error('Failed to leave group:', error);
      }
    }

    setTimeout(() => {
      closeModal();
      this.refreshGroupsList();
    }, 1000);
  }

  async deleteSelectedMessages() {
    if (this.isDeleting) return;
    this.isDeleting = true;

    const selectedGroups = document.querySelectorAll('.group-checkbox:checked');
    const total = selectedGroups.length;
    let completed = 0;

    const { updateProgress, closeModal } = showProgressModal('Deleting Messages', total);

    for (const checkbox of selectedGroups) {
      const groupItem = checkbox.closest('.list-item');
      const groupId = groupItem.dataset.id;
      const groupName = groupItem.dataset.name;
      
      try {
        await this.deleteMessages(groupId, groupName, true);
        completed++;
        updateProgress(completed);
      } catch (error) {
        console.error('Failed to delete messages:', error);
      }
    }

    setTimeout(() => {
      closeModal();
      this.isDeleting = false;
      this.refreshGroupsList();
    }, 1000);
  }
}