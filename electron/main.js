const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { Client } = require('discord.js-selfbot-v13');

let mainWindow;
let discordClient = null;
const tokensPath = path.join(app.getPath('userData'), 'saved_tokens.json');

// Ensure tokens file exists
if (!fs.existsSync(tokensPath)) {
  fs.writeFileSync(tokensPath, '[]', 'utf8');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#1a1b1e'
  });

  mainWindow.loadFile('./index.html');
}

// Window controls
ipcMain.on('window:minimize', () => mainWindow.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow.close());

ipcMain.handle('discord:getGroups', async () => {
  try {
    if (!discordClient || !discordClient.user) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const groups = Array.from(discordClient.channels.cache.values())
      .filter(channel => channel.type === 'GROUP_DM')
      .map(group => ({
        id: group.id,
        name: group.name || 'Unnamed Group',
        icon: group.iconURL() || '/discord.png',
        recipients: group.recipients.size
      }));

    return { 
      success: true, 
      groups 
    };
  } catch (error) {
    console.error('Get groups error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:leaveGroup', async (_, groupId) => {
  try {
    if (!discordClient || !discordClient.user) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const group = await discordClient.channels.fetch(groupId);
    if (!group || group.type !== 'GROUP_DM') {
      return {
        success: false,
        error: 'Invalid group'
      };
    }

    await group.delete();
    return { success: true };
  } catch (error) {
    console.error('Leave group error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:getGroupMessages', async (_, channelId, beforeId = null) => {
  try {
    if (!discordClient || !discordClient.token) {
      return { success: false, error: 'Not connected' };
    }

    // Utiliser l'API REST directement pour récupérer plus de messages
    const url = `https://discord.com/api/v9/channels/${channelId}/messages?limit=100${beforeId ? `&before=${beforeId}` : ''}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': discordClient.token,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      currentUserId: discordClient.user.id,
      messages: response.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        author: {
          id: msg.author.id
        }
      }))
    };
  } catch (error) {
    console.error('Get group messages error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:deleteGroupMessage', async (_, channelId, messageId) => {
  try {
    if (!discordClient || !discordClient.token) {
      return { success: false, error: 'Not connected' };
    }

    await axios.delete(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
      headers: {
        'Authorization': discordClient.token,
        'Content-Type': 'application/json'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Delete group message error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:muteServer', async (_, serverId) => {
  try {
    if (!discordClient || !discordClient.token) {
      return { success: false, error: 'Not connected' };
    }

    await axios.patch(`https://discord.com/api/v9/users/@me/guilds/${serverId}/settings`, {
      muted: true
    }, {
      headers: {
        'Authorization': discordClient.token,
        'Content-Type': 'application/json'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Mute server error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:unmuteServer', async (_, serverId) => {
  try {
    if (!discordClient || !discordClient.token) {
      return { success: false, error: 'Not connected' };
    }

    await axios.patch(`https://discord.com/api/v9/users/@me/guilds/${serverId}/settings`, {
      muted: false
    }, {
      headers: {
        'Authorization': discordClient.token,
        'Content-Type': 'application/json'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Unmute server error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:readAll', async () => {
  try {
    if (!discordClient || !discordClient.token) {
      return { success: false, error: 'Not connected' };
    }

    // Get all guilds
    const guilds = Array.from(discordClient.guilds.cache.values());
    
    // Mark each guild as read
    for (const guild of guilds) {
      try {
        await guild.markAsRead();
      } catch (error) {
        console.error(`Failed to mark guild ${guild.id} as read:`, error);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Read all error:', error);
    return { success: false, error: error.message };
  }
});

// External links
ipcMain.handle('app:openExternal', async (_, url) => {
  await shell.openExternal(url);
});

// Token management
ipcMain.handle('tokens:save', async (_, name, token) => {
  try {
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    if (tokens.some(t => t.name === name)) {
      return { success: false, error: 'A token with this name already exists' };
    }
    tokens.push({ name, token });
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('tokens:get', async () => {
  try {
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    return { success: true, tokens };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('tokens:delete', async (_, name) => {
  try {
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    const newTokens = tokens.filter(t => t.name !== name);
    fs.writeFileSync(tokensPath, JSON.stringify(newTokens, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check for updates
ipcMain.handle('app:checkUpdates', async () => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/Bherl1/DiscordAccMgr/refs/heads/main/package.json');
    const latestVersion = response.data.version;
    const currentVersion = require('../package.json').version;
    
    return {
      hasUpdate: latestVersion > currentVersion,
      version: latestVersion,
      downloadUrl: `https://github.com/Bherl1/DiscordAccMgr/releases/download/v${latestVersion}/DiscordAccManager-Setup.exe`
    };
  } catch (error) {
    console.error('Update check failed:', error);
    return { hasUpdate: false };
  }
});

// Download update
ipcMain.handle('app:downloadUpdate', async (_, url) => {
  require('electron').shell.openExternal(url);
});

// Discord handlers
ipcMain.handle('discord:connect', async (_, token) => {
  try {
    if (discordClient) {
      await discordClient.destroy();
    }
    
    discordClient = new Client({
      checkUpdate: false,
      fetchAllMembers: false,
    });
    
    await discordClient.login(token);
    
    return { 
      success: true, 
      username: discordClient.user.tag 
    };
  } catch (error) {
    console.error('Connection error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:getFriends', async () => {
  try {
    if (!discordClient || !discordClient.token) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const response = await axios.get('https://discord.com/api/v9/users/@me/relationships', {
      headers: {
        'Authorization': discordClient.token,
        'Content-Type': 'application/json'
      }
    });

    const friends = response.data
      .filter(relationship => relationship.type === 1)
      .map(friend => ({
        id: friend.user.id,
        username: friend.user.username,
        avatar: friend.user.avatar ? `https://cdn.discordapp.com/avatars/${friend.user.id}/${friend.user.avatar}.png` : '/discord.png'
      }));

    return { 
      success: true, 
      friends 
    };
  } catch (error) {
    console.error('Get friends error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:getDMs', async () => {
  try {
    if (!discordClient || !discordClient.user) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const dms = Array.from(discordClient.channels.cache.values())
      .filter(channel => channel.type === 'DM')
      .map(dm => ({
        id: dm.id,
        username: dm.recipient?.username || 'Unknown User',
        avatar: dm.recipient?.avatarURL() || '/discord.png'
      }));

    return { 
      success: true, 
      dms 
    };
  } catch (error) {
    console.error('Get DMs error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:getDMMessages', async (_, channelId, beforeId = null) => {
  try {
    if (!discordClient || !discordClient.user) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const channel = await discordClient.channels.fetch(channelId);
    if (!channel || channel.type !== 'DM') {
      return { 
        success: false, 
        error: 'Invalid DM channel' 
      };
    }

    const options = beforeId ? { before: beforeId, limit: 100 } : { limit: 100 };
    const messages = await channel.messages.fetch(options);
    
    return { 
      success: true, 
      messages: Array.from(messages.values()).map(msg => ({
        id: msg.id,
        content: msg.content,
        isDeletable: msg.author.id === discordClient.user.id && !msg.system
      }))
    };
  } catch (error) {
    console.error('Get DM messages error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:deleteDMMessage', async (_, channelId, messageId) => {
  try {
    if (!discordClient || !discordClient.user) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const channel = await discordClient.channels.fetch(channelId);
    if (!channel || channel.type !== 'DM') {
      return { 
        success: false, 
        error: 'Invalid DM channel' 
      };
    }

    const message = await channel.messages.fetch(messageId);
    await message.delete();

    return { success: true };
  } catch (error) {
    console.error('Delete DM message error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:closeDM', async (_, channelId) => {
  try {
    if (!discordClient || !discordClient.user) {
      return { 
        success: false, 
        error: 'Not connected to Discord' 
      };
    }

    const channel = await discordClient.channels.fetch(channelId);
    if (!channel || channel.type !== 'DM') {
      return { 
        success: false, 
        error: 'Invalid DM channel' 
      };
    }

    await channel.delete();
    return { success: true };
  } catch (error) {
    console.error('Close DM error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:deleteFriend', async (_, friendId) => {
  try {
    if (!discordClient || !discordClient.token) {
      return { success: false, error: 'Not connected to Discord' };
    }

    await axios.delete(`https://discord.com/api/v9/users/@me/relationships/${friendId}`, {
      headers: {
        'Authorization': discordClient.token,
        'Content-Type': 'application/json'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Delete friend error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:getServers', async () => {
  try {
    if (!discordClient || !discordClient.guilds) {
      return { 
        success: false, 
        error: 'Not connected' 
      };
    }

    const servers = Array.from(discordClient.guilds.cache.values())
      .filter(server => server && server.ownerId !== discordClient.user.id) // Exclure les serveurs dont l'utilisateur est propriétaire
      .map(server => ({
        id: server.id,
        name: server.name,
        icon: server.iconURL() || '/discord.png'
      }));

    return { 
      success: true, 
      servers 
    };
  } catch (error) {
    console.error('Get servers error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

ipcMain.handle('discord:leaveServer', async (_, serverId) => {
  try {
    if (!discordClient || !discordClient.guilds) {
      return { 
        success: false, 
        error: 'Not connected' 
      };
    }

    const guild = discordClient.guilds.cache.get(serverId);
    if (!guild) {
      return {
        success: false,
        error: 'Server not found'
      };
    }

    await guild.leave();
    return { success: true };
  } catch (error) {
    console.error('Leave server error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});