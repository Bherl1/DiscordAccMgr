// Utility functions for Discord operations
export const getFriendsList = async () => {
  const result = await window.electronAPI.getFriends();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.friends || [];
};

export const getServersList = async () => {
  const result = await window.electronAPI.getServers();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.servers || [];
};

export const getDMsList = async () => {
  const result = await window.electronAPI.getDMs();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.dms || [];
};

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