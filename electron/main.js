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
    width: 1200,
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

    // Use the REST API to remove friend since the client method is not available
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
      .filter(server => server)
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