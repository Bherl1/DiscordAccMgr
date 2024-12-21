// Utility functions for Discord operations
export const getFriendsList = async () => {
  const result = await window.electronAPI.getFriends();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.friends || [];
};

export const getDMsList = async () => {
  const result = await window.electronAPI.getDMs();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.dms || [];
};

export const deleteFriend = async (friendId) => {
  const result = await window.electronAPI.deleteFriend(friendId);
  if (!result.success) {
    throw new Error(result.error);
  }
};

export const getServersList = async () => {
  const result = await window.electronAPI.getServers();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.servers || [];
};

export const leaveServer = async (serverId) => {
  const result = await window.electronAPI.leaveServer(serverId);
  if (!result.success) {
    throw new Error(result.error);
  }
};