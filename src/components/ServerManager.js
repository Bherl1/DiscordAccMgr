import { getServersList, copyToClipboard } from '../utils/discord.js';
import { showNotification, showProgressModal } from '../utils/ui.js';

export class ServerManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
  }

  async muteServer(serverId) {
    try {
      await window.electronAPI.muteServer(serverId);
      this.refreshServersList();
    } catch (error) {
      console.error('Failed to mute server:', error);
    }
  }
  
  async unmuteServer(serverId) {
    try {
      await window.electronAPI.unmuteServer(serverId);
      this.refreshServersList();
    } catch (error) {
      console.error('Failed to unmute server:', error);
    }
  }
  
  async muteSelectedServers() {
    const selectedServers = document.querySelectorAll('.server-checkbox:checked');
    const total = selectedServers.length;
    let completed = 0;
  
    const { updateProgress, closeModal } = showProgressModal('Muting Servers', total);
  
    for (const checkbox of selectedServers) {
      const serverItem = checkbox.closest('.list-item');
      const serverId = serverItem.dataset.id;
      
      try {
        await window.electronAPI.muteServer(serverId);
        completed++;
        updateProgress(completed);
      } catch (error) {
        console.error('Failed to mute server:', error);
      }
    }
  
    setTimeout(() => {
      closeModal();
      this.refreshServersList();
    }, 1000);
  }
  
  async refreshServersList() {
    try {
      const servers = await getServersList();
      
      this.contentArea.innerHTML = `
        <h2>Servers List</h2>
        <div class="actions-bar">
          <button id="selectAllServersBtn" onclick="window.serverManager.toggleSelectAllServers()">Select All</button>
          <button id="leaveSelectedServersBtn" onclick="window.serverManager.leaveSelectedServers()" disabled>Leave Selected</button>
          <button id="muteSelectedServersBtn" onclick="window.serverManager.muteSelectedServers()" disabled>Mute Selected</button>
          <button id="readAllBtn" onclick="window.serverManager.readAll()">Read All</button>
        </div>
        <div id="serversList">
          ${servers.map(server => `
            <div class="list-item" data-id="${server.id}">
              <div class="list-item-left">
                <input type="checkbox" class="server-checkbox" onchange="window.serverManager.updateSelectedServersCount()">
                <img src="${server.icon}" alt="${server.name}">
                <span>${server.name}</span>
              </div>
              <div class="button-group">
                <button onclick="window.serverManager.copyToClipboard('${server.id}')" class="secondary-btn">Copy ID</button>
                <button onclick="window.serverManager.muteServer('${server.id}')" class="secondary-btn">Mute</button>
                <button onclick="window.serverManager.leaveServer('${server.id}')" class="danger-btn">Leave</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      this.contentArea.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
  
  async readAll() {
    try {
      const result = await window.electronAPI.readAll();
      if (result.success) {
        showNotification('Marked all as read!');
      } else {
        showNotification('Failed to mark all as read');
      }
    } catch (error) {
      console.error('Read all error:', error);
      showNotification('Failed to mark all as read');
    }
  }


  toggleSelectAllServers() {
    const checkboxes = document.querySelectorAll('.server-checkbox');
    const selectAllBtn = document.getElementById('selectAllServersBtn');
    const isSelectAll = selectAllBtn.textContent === 'Select All';
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = isSelectAll;
    });
    
    selectAllBtn.textContent = isSelectAll ? 'Deselect All' : 'Select All';
    this.updateSelectedServersCount();
  }

  updateSelectedServersCount() {
    const selectedCount = document.querySelectorAll('.server-checkbox:checked').length;
    const leaveSelectedBtn = document.getElementById('leaveSelectedServersBtn');
    const muteSelectedBtn = document.getElementById('muteSelectedServersBtn');
    
    leaveSelectedBtn.disabled = selectedCount === 0;
    muteSelectedBtn.disabled = selectedCount === 0;
    
    leaveSelectedBtn.textContent = `Leave Selected (${selectedCount})`;
    muteSelectedBtn.textContent = `Mute Selected (${selectedCount})`;
  }

  async leaveSelectedServers() {
    const selectedServers = document.querySelectorAll('.server-checkbox:checked');
    const total = selectedServers.length;
    let completed = 0;

    const { updateProgress, closeModal } = showProgressModal('Leaving Servers', total);

    for (const checkbox of selectedServers) {
      const serverItem = checkbox.closest('.list-item');
      const serverId = serverItem.dataset.id;
      
      try {
        await window.electronAPI.leaveServer(serverId);
        completed++;
        updateProgress(completed);
        serverItem.remove();
      } catch (error) {
        console.error('Failed to leave server:', error);
      }
    }

    setTimeout(() => {
      closeModal();
      this.refreshServersList();
    }, 1000);
  }

  copyToClipboard = copyToClipboard;

  async leaveServer(serverId) {
    try {
      await window.electronAPI.leaveServer(serverId);
      this.refreshServersList();
    } catch (error) {
      console.error('Failed to leave server:', error);
    }
  }
}