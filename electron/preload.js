const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  
  // Discord functions
  connectDiscord: (token) => ipcRenderer.invoke('discord:connect', token),
  getFriends: () => ipcRenderer.invoke('discord:getFriends'),
  deleteFriend: (friendId) => ipcRenderer.invoke('discord:deleteFriend', friendId),
  getServers: () => ipcRenderer.invoke('discord:getServers'),
  leaveServer: (serverId) => ipcRenderer.invoke('discord:leaveServer', serverId),
  getDMs: () => ipcRenderer.invoke('discord:getDMs'),
  getDMMessages: (channelId, beforeId) => ipcRenderer.invoke('discord:getDMMessages', channelId, beforeId),
  deleteDMMessage: (channelId, messageId) => ipcRenderer.invoke('discord:deleteDMMessage', channelId, messageId),
  closeDM: (channelId) => ipcRenderer.invoke('discord:closeDM', channelId),
});