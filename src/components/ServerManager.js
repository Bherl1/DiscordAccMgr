import { getServersList, copyToClipboard } from '../utils/discord.js';

export class ServerManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
  }

  async refreshServersList() {
    try {
      const servers = await getServersList();
      
      this.contentArea.innerHTML = `
        <h2>Servers List</h2>
        <div class="actions-bar">
          <button id="selectAllServersBtn" onclick="window.serverManager.toggleSelectAllServers()">Select All</button>
          <button id="leaveSelectedServersBtn" onclick="window.serverManager.leaveSelectedServers()" disabled>Leave Selected</button>
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
    leaveSelectedBtn.disabled = selectedCount === 0;
    leaveSelectedBtn.textContent = `Leave Selected (${selectedCount})`;
  }

  async leaveSelectedServers() {
    const selectedServers = document.querySelectorAll('.server-checkbox:checked');
    const total = selectedServers.length;
    let completed = 0;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Leaving Servers</h2>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" style="width: 0%"></div>
          </div>
          <div class="progress-text">0/${total}</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    for (const checkbox of selectedServers) {
      const serverItem = checkbox.closest('.list-item');
      const serverId = serverItem.dataset.id;
      
      try {
        await window.electronAPI.leaveServer(serverId);
        completed++;
        
        const progress = (completed / total) * 100;
        modal.querySelector('.progress').style.width = `${progress}%`;
        modal.querySelector('.progress-text').textContent = `${completed}/${total}`;
        
        serverItem.remove();
      } catch (error) {
        console.error('Failed to leave server:', error);
      }
    }

    setTimeout(() => {
      modal.remove();
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