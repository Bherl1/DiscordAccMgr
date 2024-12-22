import { deleteDMMessages } from './messageDeleter.js';

export async function handleBulkDMActions(selectedDMs, action, electronAPI) {
  const total = selectedDMs.length;
  let completed = 0;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${action === 'delete' ? 'Deleting Messages' : 'Closing DMs'}</h2>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
        <div class="progress-text">Processing DM ${completed + 1}/${total}</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const updateProgress = () => {
    completed++;
    const progress = (completed / total) * 100;
    modal.querySelector('.progress').style.width = `${progress}%`;
    modal.querySelector('.progress-text').textContent = 
      completed < total ? `Processing DM ${completed + 1}/${total}` : 'Completed';
  };

  try {
    for (const dm of selectedDMs) {
      if (action === 'delete') {
        await deleteDMMessages({
          channelId: dm.id,
          username: dm.username,
          electronAPI,
          skipRefresh: true // Important: skip refresh for each individual DM
        });
      } else if (action === 'close') {
        await electronAPI.closeDM(dm.id);
      }
      updateProgress();
    }
  } finally {
    setTimeout(() => modal.remove(), 1000);
  }
}