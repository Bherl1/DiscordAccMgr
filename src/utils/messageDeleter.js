import { ProgressBar } from '../components/ProgressBar.js';

export async function deleteDMMessages({
  channelId,
  username,
  electronAPI,
  onComplete = () => {},
  skipRefresh = false,
  isGroup = false,
  oldestFirst = false
}) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal-content">
      <h2>Deleting messages ${isGroup ? 'in' : 'with'} ${username}</h2>
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
    let hasMore = true;
    let currentUserId = null;
    let deletableMessages = [];

    // First pass: collect all deletable messages
    while (hasMore && !shouldStop) {
      const result = isGroup 
        ? await electronAPI.getGroupMessages(channelId, lastMessageId)
        : await electronAPI.getDMMessages(channelId, lastMessageId);

      if (!result.success || !result.messages.length) {
        hasMore = false;
        continue;
      }

      // Store the current user ID for later use
      if (!currentUserId && result.currentUserId) {
        currentUserId = result.currentUserId;
      }

      const messages = result.messages;
      const newDeletableMessages = messages.filter(msg => {
        if (isGroup) {
          // Pour les groupes, vérifier que le message est à nous
          if (msg.author.id !== currentUserId) {
            return false;
          }

          // Vérifier si c'est un message valide qu'on peut supprimer
          return (
            // Messages texte normaux
            (typeof msg.content === 'string' && msg.content.trim().length > 0) ||
            // Messages avec attachments (images, fichiers, etc)
            (msg.attachments && msg.attachments.length > 0) ||
            // Messages avec embeds (liens enrichis, médias, etc)
            (msg.embeds && msg.embeds.length > 0) ||
            // Messages vocaux
            msg.type === 'VOICE_MESSAGE'
          );
        } else {
          return msg.isDeletable;
        }
      });
      
      deletableMessages = [...deletableMessages, ...newDeletableMessages];
      totalMessages = deletableMessages.length;
      document.getElementById('totalCount').textContent = totalMessages.toString();
      
      if (messages.length < 100) {
        hasMore = false;
      } else {
        lastMessageId = messages[messages.length - 1].id;
      }

      await new Promise(resolve => setTimeout(resolve, 250));
    }

    if (shouldStop) {
      throw new Error('Operation cancelled');
    }

    if (totalMessages === 0) {
      throw new Error('No messages to delete');
    }

    // Sort messages based on deletion order preference
    if (oldestFirst) {
      deletableMessages.reverse();
    }

    // Second pass: delete collected messages
    for (const message of deletableMessages) {
      if (shouldStop) break;

      try {
        if (isGroup) {
          await electronAPI.deleteGroupMessage(channelId, message.id);
        } else {
          await electronAPI.deleteDMMessage(channelId, message.id);
        }
        
        deletedCount++;
        document.getElementById('deletedCount').textContent = deletedCount.toString();
        progressBar.update((deletedCount / totalMessages) * 100);

        // Gestion intelligente du rate limit
        if (deletedCount % 5 === 0) {
          // Pause plus longue tous les 5 messages pour éviter le rate limit
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          // Pause normale entre les messages
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        
        if (error.response) {
          if (error.response.status === 429) {
            // Rate limit atteint
            const retryAfter = parseInt(error.response.headers?.['retry-after']) || 5;
            const waitTime = (retryAfter * 1000) + 1000;
            
            // Attendre le temps demandé + 1 seconde
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Réessayer de supprimer le message
            try {
              if (isGroup) {
                await electronAPI.deleteGroupMessage(channelId, message.id);
              } else {
                await electronAPI.deleteDMMessage(channelId, message.id);
              }
              deletedCount++;
              document.getElementById('deletedCount').textContent = deletedCount.toString();
              progressBar.update((deletedCount / totalMessages) * 100);
            } catch (retryError) {
              if (retryError.response?.status !== 403) {
                console.error('Failed to delete message after retry:', retryError);
              }
            }
          } else if (error.response.status === 403) {
            // Message système ou autre erreur de permission, on continue
            continue;
          }
        }
        
        // Pause supplémentaire après une erreur
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    }

    if (!shouldStop) {
      progressBar.update(100);
    }
  } catch (error) {
    console.error('Delete messages error:', error);
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    setTimeout(() => {
      modalOverlay.remove();
      onComplete();
    }, 1000);
  }
}