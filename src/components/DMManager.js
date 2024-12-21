import { ProgressBar } from './ProgressBar.js';

export class DMManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
    this.isDeleting = false;
    this.shouldStop = false;
  }

  async deleteDMMessages(channelId, username) {
    if (this.isDeleting) return;
    
    this.isDeleting = true;
    this.shouldStop = false;

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <h2>Deleting messages with ${username}</h2>
        <div id="progressContainer">
          <div class="message-counter">
            <span id="deletedCount">0</span> / <span id="totalCount">calculating...</span> messages
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Initialize progress bar
    const progressBar = new ProgressBar('progressContainer');
    progressBar.create();
    progressBar.show();

    // Handle cancel button
    progressBar.onCancel(() => {
      this.shouldStop = true;
    });

    try {
      let deletedCount = 0;
      let totalMessages = 0;
      let lastMessageId = null;

      // First pass to count messages
      while (true) {
        if (this.shouldStop) {
          throw new Error('Operation cancelled by user');
        }

        const result = await window.electronAPI.getDMMessages(channelId, lastMessageId);
        if (!result.success || !result.messages.length) break;

        const deletableMessages = result.messages.filter(msg => msg.isDeletable);
        totalMessages += deletableMessages.length;
        document.getElementById('totalCount').textContent = totalMessages.toString();
        
        lastMessageId = result.messages[result.messages.length - 1].id;
      }

      // Reset for deletion pass
      lastMessageId = null;

      // Second pass to delete messages
      while (true) {
        if (this.shouldStop) {
          throw new Error('Operation cancelled by user');
        }

        const result = await window.electronAPI.getDMMessages(channelId, lastMessageId);
        if (!result.success || !result.messages.length) break;

        for (const message of result.messages) {
          if (this.shouldStop) {
            throw new Error('Operation cancelled by user');
          }

          if (message.isDeletable) {
            await window.electronAPI.deleteDMMessage(channelId, message.id);
            deletedCount++;
            document.getElementById('deletedCount').textContent = deletedCount.toString();
            progressBar.update((deletedCount / totalMessages) * 100);
          }
        }

        lastMessageId = result.messages[result.messages.length - 1].id;
      }

      progressBar.update(100);
      setTimeout(() => {
        modalOverlay.remove();
        this.refreshDMsList();
      }, 1000);
    } catch (error) {
      const progressContainer = document.getElementById('progressContainer');
      progressContainer.innerHTML = `<p class="error">${error.message}</p>`;
      setTimeout(() => {
        modalOverlay.remove();
        this.refreshDMsList();
      }, 2000);
    } finally {
      this.isDeleting = false;
    }
  }

  async refreshDMsList() {
    try {
      const result = await window.electronAPI.getDMs();
      if (!result.success) {
        this.contentArea.innerHTML = `<p class="error">${result.error}</p>`;
        return;
      }

      if (!result.dms || !Array.isArray(result.dms)) {
        this.contentArea.innerHTML = '<p class="error">No DMs available</p>';
        return;
      }

      this.contentArea.innerHTML = `
        <h2>DMs List</h2>
        <div id="dmsList">
          ${result.dms.map(dm => `
            <div class="list-item">
              <div style="display: flex; align-items: center;">
                <img src="${dm.avatar}" alt="${dm.username}">
                <span>${dm.username}</span>
              </div>
              <div class="button-group">
                <button onclick="window.dmManager.deleteDMMessages('${dm.id}', '${dm.username}')" ${this.isDeleting ? 'disabled' : ''}>
                  Delete Messages
                </button>
                <button onclick="window.dmManager.closeDM('${dm.id}')" ${this.isDeleting ? 'disabled' : ''}>
                  Close DM
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      this.contentArea.innerHTML = '<p class="error">Failed to load DMs</p>';
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