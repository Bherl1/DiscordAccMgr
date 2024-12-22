// Update token list with icons
export function updateTokensList(tokens, handlers) {
  const tokenManagement = document.getElementById('tokenManagement');
  if (!tokenManagement) return;

  if (tokens.length === 0) {
    tokenManagement.innerHTML = '';
    return;
  }

  const tokenElements = tokens.map(t => {
    const div = document.createElement('div');
    div.className = 'token-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = t.name;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const useBtn = document.createElement('button');
    useBtn.className = 'secondary-btn';
    useBtn.innerHTML = `
      Use
    `;
    useBtn.addEventListener('click', () => handlers.useToken(t.token));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'danger-btn';
    deleteBtn.innerHTML = `
      Delete
    `;
    deleteBtn.addEventListener('click', () => handlers.deleteToken(t.name));

    buttonGroup.appendChild(useBtn);
    buttonGroup.appendChild(deleteBtn);

    div.appendChild(nameSpan);
    div.appendChild(buttonGroup);

    return div;
  });

  tokenManagement.innerHTML = '';
  tokenElements.forEach(el => tokenManagement.appendChild(el));
}

export function updateFriendsList(friends, handlers) {
  const friendsList = document.getElementById('friendsList');
  if (!friendsList) return;

  const friendElements = friends.map(friend => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.dataset.id = friend.id;

    // Create left side
    const leftDiv = document.createElement('div');
    leftDiv.className = 'list-item-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'friend-checkbox';
    checkbox.addEventListener('change', handlers.updateCount);

    const img = document.createElement('img');
    img.src = friend.avatar;
    img.alt = friend.username;

    const span = document.createElement('span');
    span.textContent = friend.username;

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(img);
    leftDiv.appendChild(span);

    // Create button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'secondary-btn';
    copyBtn.textContent = 'Copy ID';
    copyBtn.addEventListener('click', () => handlers.copyId(friend.id));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'danger-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => handlers.removeFriend(friend.id));

    buttonGroup.appendChild(copyBtn);
    buttonGroup.appendChild(removeBtn);

    div.appendChild(leftDiv);
    div.appendChild(buttonGroup);

    return div;
  });

  friendsList.innerHTML = '';
  friendElements.forEach(el => friendsList.appendChild(el));
}