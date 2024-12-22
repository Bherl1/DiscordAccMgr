export const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  export const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };
  
  export const showProgressModal = (title, total) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${title}</h2>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" style="width: 0%"></div>
          </div>
          <div class="progress-text">0/${total}</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  
    const updateProgress = (completed) => {
      const progress = (completed / total) * 100;
      modal.querySelector('.progress').style.width = `${progress}%`;
      modal.querySelector('.progress-text').textContent = `${completed}/${total}`;
    };
  
    const closeModal = () => modal.remove();
  
    return { updateProgress, closeModal };
  };