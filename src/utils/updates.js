export async function checkForUpdates() {
    try {
        const updateInfo = await window.electronAPI.checkUpdates();

        if (updateInfo.hasUpdate) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            const content = document.createElement('div');
            content.className = 'modal-content update-modal';
            
            const title = document.createElement('h2');
            title.textContent = 'New Update Available';
            
            const message = document.createElement('p');
            message.textContent = `Version ${updateInfo.version} is now available.`;
            
            const actions = document.createElement('div');
            actions.className = 'update-actions';
            
            const installBtn = document.createElement('button');
            installBtn.textContent = 'Install Now';
            installBtn.addEventListener('click', () => {
                window.electronAPI.downloadUpdate(updateInfo.downloadUrl);
                modal.remove();
            });
            
            const laterBtn = document.createElement('button');
            laterBtn.textContent = 'Later';
            laterBtn.className = 'secondary-btn';
            laterBtn.addEventListener('click', () => modal.remove());
            
            actions.appendChild(installBtn);
            actions.appendChild(laterBtn);
            
            content.appendChild(title);
            content.appendChild(message);
            content.appendChild(actions);
            modal.appendChild(content);
            
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}