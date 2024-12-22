import { ProgressBar } from '../components/ProgressBar.js';

export async function deleteDMMessages({
  channelId,
  username,
  electronAPI,
  onComplete = () => {},
  skipRefresh = false
}) {
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

  const progressBar = new ProgressBar('progressContainer', {
    showCancelButton: true
  });
  progressBar.create();
  progressBar.show();

  let shouldStop = false;
  progressBar.onCancel(() => {
    shouldStop = true;
    progressBar.setCancelButtonText('Cancelling...');
    progressBar.disableCancelButton();
  });

  try {
    let deletedCount = 0;
    let totalMessages = 0;
    let lastMessageId = null;

    // First pass: count messages
    while (!shouldStop) {
      const result = await electronAPI.getDMMessages(channelId, lastMessageId);
      if (!result.success || !result.messages.length) break;

      const deletableMessages = result.messages.filter(msg => msg.isDeletable);
      totalMessages += deletableMessages.length;
      document.getElementById('totalCount').textContent = totalMessages.toString();
      
      if (result.messages.length < 100) break;
      lastMessageId = result.messages[result.messages.length - 1].id;
    }

    if (shouldStop) {
      throw new Error('Operation cancelled');
    }

    // Reset for deletion pass
    lastMessageId = null;

    // Second pass: delete messages
    while (!shouldStop) {
      const result = await electronAPI.getDMMessages(channelId, lastMessageId);
      if (!result.success || !result.messages.length) break;

      for (const message of result.messages) {
        if (shouldStop) break;

        if (message.isDeletable) {
          await electronAPI.deleteDMMessage(channelId, message.id);
          deletedCount++;
          document.getElementById('deletedCount').textContent = deletedCount.toString();
          progressBar.update((deletedCount / totalMessages) * 100);
        }
      }

      if (result.messages.length < 100) break;
      lastMessageId = result.messages[result.messages.length - 1].id;
    }

    if (!shouldStop) {
      progressBar.update(100);
    }
  } catch (error) {
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    setTimeout(() => {
      modalOverlay.remove();
      onComplete();
    }, 1000);
  }
}