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

  const content = document.createElement('div');
  content.className = 'modal-content';

  const titleEl = document.createElement('h2');
  titleEl.textContent = title;

  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';

  const progress = document.createElement('div');
  progress.className = 'progress';
  progress.style.width = '0%';

  const progressText = document.createElement('div');
  progressText.className = 'progress-text';
  progressText.textContent = `0/${total}`;

  progressBar.appendChild(progress);
  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(progressText);

  content.appendChild(titleEl);
  content.appendChild(progressContainer);
  modal.appendChild(content);

  document.body.appendChild(modal);

  return {
    updateProgress: (completed) => {
      const percent = (completed / total) * 100;
      progress.style.width = `${percent}%`;
      progressText.textContent = `${completed}/${total}`;
    },
    closeModal: () => modal.remove()
  };
};

export const showInfoModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content info-modal';

  const img = document.createElement('img');
  img.src = 'src/icons/app-icon.png';
  img.alt = 'App Icon';

  const title = document.createElement('h2');
  title.textContent = 'Discord Account Manager';

  const version = document.createElement('p');
  version.textContent = `Version 1.4.0`;

  const author = document.createElement('p');
  author.textContent = 'Created by Bherl1';

  const links = document.createElement('div');
  links.className = 'links';

  const githubLink = document.createElement('a');
  githubLink.href = 'https://github.com/Bherl1/DiscordAccMgr';
  githubLink.textContent = 'GitHub Repository';
  githubLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.electronAPI.openExternal(githubLink.href);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'secondary-btn';
  closeBtn.textContent = 'Close';

  closeBtn.style.marginTop = '10px';

  closeBtn.addEventListener('click', () => modal.remove());

  links.appendChild(githubLink);
  content.appendChild(img);
  content.appendChild(title);
  content.appendChild(version);
  content.appendChild(author);
  content.appendChild(links);
  content.appendChild(closeBtn);
  modal.appendChild(content);

  document.body.appendChild(modal);
};

export const showInputModal = (title, message) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const titleEl = document.createElement('h2');
    titleEl.textContent = title;

    const messageEl = document.createElement('p');
    messageEl.textContent = message;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'modal-input';

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (value) {
        resolve(value);
        modal.remove();
      }
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'secondary-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      resolve(null);
      modal.remove();
    });

    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(cancelBtn);

    content.appendChild(titleEl);
    content.appendChild(messageEl);
    content.appendChild(input);
    content.appendChild(buttonGroup);
    modal.appendChild(content);

    document.body.appendChild(modal);
    input.focus();
  });
};