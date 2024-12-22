export class ProgressBar {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.progress = 0;
    this.isRunning = false;
    this.options = {
      width: options.width || '100%',
      height: options.height || '20px',
      backgroundColor: options.backgroundColor || '#2a2b2e',
      progressColor: options.progressColor || '#5865f2',
      showCancelButton: options.showCancelButton || false
    };
  }

  create() {
    this.wrapper = document.createElement('div');
    this.wrapper.style.width = this.options.width;
    this.wrapper.style.height = this.options.height;
    this.wrapper.style.backgroundColor = this.options.backgroundColor;
    this.wrapper.style.borderRadius = '4px';
    this.wrapper.style.overflow = 'hidden';
    this.wrapper.style.marginBottom = '10px';

    this.progressBar = document.createElement('div');
    this.progressBar.style.width = '0%';
    this.progressBar.style.height = '100%';
    this.progressBar.style.backgroundColor = this.options.progressColor;
    this.progressBar.style.transition = 'width 0.3s ease-out';

    this.progressText = document.createElement('div');
    this.progressText.style.textAlign = 'center';
    this.progressText.style.marginBottom = '10px';
    this.progressText.textContent = '0%';

    if (this.options.showCancelButton) {
      this.cancelButton = document.createElement('button');
      this.cancelButton.textContent = 'Cancel';
      this.cancelButton.className = 'cancel-button';
    }

    this.wrapper.appendChild(this.progressBar);
    this.container.appendChild(this.progressText);
    this.container.appendChild(this.wrapper);
    if (this.cancelButton) {
      this.container.appendChild(this.cancelButton);
    }
  }

  update(progress) {
    this.progress = Math.min(Math.max(progress, 0), 100);
    this.progressBar.style.width = `${this.progress}%`;
    this.progressText.textContent = `${Math.round(this.progress)}%`;
  }

  show() {
    this.isRunning = true;
    this.wrapper.style.display = 'block';
    if (this.cancelButton) {
      this.cancelButton.style.display = 'block';
    }
  }

  hide() {
    this.isRunning = false;
    this.wrapper.style.display = 'none';
    if (this.cancelButton) {
      this.cancelButton.style.display = 'none';
    }
  }

  onCancel(callback) {
    if (this.cancelButton) {
      this.cancelButton.onclick = () => {
        if (this.isRunning) {
          callback();
        }
      };
    }
  }

  setCancelButtonText(text) {
    if (this.cancelButton) {
      this.cancelButton.textContent = text;
    }
  }

  disableCancelButton() {
    if (this.cancelButton) {
      this.cancelButton.disabled = true;
    }
  }
}