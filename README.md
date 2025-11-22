# ` 🎮 `︲Documentation: Discord Account Manager

---

This repository presents a powerful and intuitive desktop application built with **Electron.js** to efficiently manage your Discord account.
You'll learn how to **install the application**, **manage your servers and friends**, and **delete messages in bulk** with just a few clicks.

---

> [!IMPORTANT]
> **Discord Account Manager** is currently in active development.
> Updates and new features are added regularly.
> - ⚠️ **Use this tool responsibly and in compliance with Discord's Terms of Service.**

---

## `📑`︲Table of Contents (click to access the desired section directly)

1. [`📘`︲Introduction.](#introduction)
   * [`❔`︲Project Overview.](#project-overview)
   * [`✨`︲Main Features.](#main-features)
   * [`🧰`︲Technologies Used.](#technologies)

2. [`🛠️`︲Prerequisites and Installation.](#prerequisites-installation)
   * [`📋`︲System Requirements.](#system-requirements)
   * [`⬇️`︲Repository Cloning.](#repository-cloning)
   * [`📦`︲Dependencies Installation.](#dependencies-installation)

3. [`🚀`︲Launching the Application.](#launching-application)
   * [`💻`︲Development Mode.](#development-mode)
   * [`📦`︲Precompiled Executable (Windows).](#precompiled-executable)

4. [`⚙️`︲Using the Application.](#using-application)
   * [`🌐`︲Server Management.](#server-management)
   * [`👥`︲Friend Management.](#friend-management)
   * [`🗑️`︲Bulk Message Deletion.](#message-deletion)

5. [`🤝`︲Contributing to the Project.](#contributing)
   * [`🔧`︲How to Contribute.](#how-to-contribute)
   * [`💡`︲Improvement Ideas.](#improvement-ideas)

6. [`📚`︲Additional Information.](#additional-information)
   * [`📄`︲License.](#license)
   * [`🔗`︲Useful Links.](#useful-links)
   * [`🙏`︲Acknowledgments.](#acknowledgments)

---

<a id="introduction"></a>
# `📘`︲Introduction.

---

<a id="project-overview"></a>
### `❔`︲Project Overview.

> [!NOTE]
> **Discord Account Manager** is a desktop application designed to simplify the management of your Discord account.
> Whether you're an administrator, moderator, or regular user, this tool allows you to perform complex actions with just a few clicks.
> The goal is to save you time and optimize the management of your servers, friends, and messages.

![Discord Account Manager](https://img.shields.io/badge/Project%20Status-Active-brightgreen)

---

<a id="main-features"></a>
### `✨`︲Main Features.

> [!TIP]
> **Discover the features that make Discord Account Manager unique:**

| Feature | Description |
|---------|-------------|
| `🌐`︲ **Server Management** | Add, manage, or leave Discord servers easily |
| `👥`︲ **Friend Management** | Organize your friends list: add, remove, search |
| `🗑️`︲ **Message Deletion** | Delete multiple messages in bulk (servers or DMs) |
| `🎨` ︲**Intuitive Interface** | Elegant UI that simplifies complex Discord actions |
| `⚡` ︲**Cross-Platform** | Compatible with Windows, macOS, Linux (source compilation) |
| `🪶` ︲**Lightweight and Fast** | Optimized for smooth performance |

---

<a id="technologies"></a>
### `🧰`︲Technologies Used.

> [!IMPORTANT]
> Project technology stack:
> - `⚡`︲**Frontend:** Electron.js ︲[`🌐`](https://www.electronjs.org/)
> - `💻`︲**Backend:** Node.js ︲[`🌐`](https://nodejs.org/)
> - `🤖`︲**Discord API:** Discord.js-Selfbot-V13 ︲[`🌐`](https://www.npmjs.com/package/discord.js-selfbot-v13)
> - `📦`︲**Package Manager:** npm ︲[`🌐`](https://npmjs.com/)
> - `🔨`︲**Build Tools:** Electron-builder

---

<a id="prerequisites-installation"></a>
# `🛠️`︲Prerequisites and Installation.

---

<a id="system-requirements"></a>
## `📋`︲System Requirements.

> [!NOTE]
> Before running **Discord Account Manager** locally, make sure you have the following installed:

### `📦`︲Required Software.

* `💚` ︲**Node.js:** LTS version recommended ︲[`🌐`](https://nodejs.org/)
* `📦` ︲**npm:** Provided with Node.js (package manager)
* `💻` ︲**Git:** To clone the repository ︲[`🌐`](https://git-scm.com/)

---

### `✅`︲Installation Verification.

To check if Node.js and npm are installed:

```bash
node -v
npm -v
```

> [!TIP]
> If these commands display version numbers, you're ready to continue!

---

<a id="repository-cloning"></a>
## `⬇️`︲Repository Cloning.

---

1️⃣︲**Clone the GitHub repository.**

```bash
git clone https://github.com/Bherl1/DiscordAccMgr.git
```

---

2️⃣︲**Navigate to the project folder.**

```bash
cd DiscordAccMgr
```
---

Project Structure Overview : 
  
 ```
├── electron/
├── images/
├── src/
├── LICENSE
├── README.md
├── index.html
├── package-lock.json
└── package.json
  ```

---

<a id="dependencies-installation"></a>
## `📦`︲Dependencies Installation.

---

> [!NOTE]
> This step downloads and installs all Node.js modules required to run the application.

---

1️⃣︲**Install npm dependencies.**

```bash
npm install
```

> [!TIP]
> 💡 This command may take a few minutes during the first installation.
> All dependencies will be installed in the `node_modules/` folder.

---

2️⃣︲**Installation Verification.**

Once completed, verify that the `node_modules/` folder has been created:

On Linux/MacOS:
```bash
ls -la
```
On Windows:
```batch
dir
```

---

<a id="launching-application"></a>
# `🚀`︲Launching the Application.

---

<a id="development-mode"></a>
## `💻`︲Development Mode.

---

> [!NOTE]
> Development mode allows you to launch the application with automatic reload when modifying the code.

---

1️⃣︲**Launch the application in dev mode.**

```bash
npm run start
```

---

2️⃣︲**Electron Window.**

An Electron window will automatically open with the running application.

<details>
  <summary><strong>📸︲Application Screenshots</strong></summary>
  
  **Direct Messages Manager:**
  ![Dm Manager](./images/1.png)
  
  **Server Manager:**
  ![Server Manager](./images/2.png)
  
  **Friends Manager:**
  ![Friends Manager](./images/3.png)
</details>

> [!TIP]
> Use `Ctrl + Shift + I` (or `Cmd + Option + I` on macOS) to open developer tools.

---

<a id="precompiled-executable"></a>
## `📦`︲Precompiled Executable (Windows).

---

> [!TIP]
> For Windows users, a precompiled `.exe` file is available for installation without configuration!

---

### `⬇️`︲Download.

1️⃣︲**Access the releases page.**

Go to the **[`📦` Releases](https://github.com/Bherl1/DiscordAccMgr/releases)** page

---

2️⃣︲**Download the .exe file.**

* Download the latest version of the `.exe` file
* No Node.js or npm installation required

---

3️⃣︲**Launch the application.**

Double-click the `.exe` file to launch the application.

> [!WARNING]
> **Windows Defender may display a warning during the first launch.**
> This is normal for unsigned applications. Click "More info" then "Run anyway".

---

<a id="using-application"></a>
# `⚙️`︲Using the Application.

---

> [!NOTE]
> This section details the main features of **Discord Account Manager** and how to use them effectively.

---

<a id="server-management"></a>
## `🌐`︲Server Management.

---

### `📋`︲Available Features.

| Action | Description |
|--------|-------------|
| `👁️`︲ **View** | Display all your Discord servers |
| `➕` ︲**Join** | Join a new server via invitation |
| `🚪` ︲**Leave** | Leave servers you no longer want |
| `🔍`︲ **Search** | Quickly find a specific server |

---

### `🎯`︲Usage.

1️⃣︲**Access the server manager.**

* Launch the application
* Select the "Server Manager" tab

---

2️⃣︲**Perform actions.**

* Use the buttons to join or leave servers
* The list updates automatically

<details>
  <summary><strong>📸︲Server Manager Interface</strong></summary>
  
  ![Server Manager](./images/2.png)
</details>

---

<a id="friend-management"></a>
## `👥`︲Friend Management.

---

### `📋`︲Available Features.

| Action | Description |
|--------|-------------|
| `👁️`︲ **List** | Display all your Discord friends |
| `➕` ︲**Add** | Send a friend request |
| `❌` ︲**Remove** | Remove a friend from your list |
| `🔍` ︲**Search** | Find a friend quickly |

---

### `🎯`︲Usage.

1️⃣︲**Access the friends manager.**

* Launch the application
* Select the "Friends Manager" tab

---

2️⃣︲**Manage your friends list.**

* Add new friends by entering their username
* Remove contacts you no longer want to keep

<details>
  <summary><strong>📸︲Friends Manager Interface</strong></summary>
  
  ![Friends Manager](./images/3.png)
</details>

---

<a id="message-deletion"></a>
## `🗑️`︲Bulk Message Deletion.

---

> [!WARNING]
> **Warning: Message deletion is irreversible!**
> Make sure you really want to delete the messages before confirming the action.

---

### `📋`︲Available Features.

| Action | Description |
|--------|-------------|
| `🗑️` ︲**Delete DM** | Delete all messages from a conversation |
| `🗑️` ︲**Delete Server** | Delete your messages in a server |
| `🔢` ︲**Selection** | Choose the number of messages to delete |

---

### `🎯`︲Usage.

1️⃣︲**Access the message manager.**

* Launch the application
* Select the "DM Manager" tab

---

2️⃣︲**Configure deletion.**

* Select the targeted conversation or server
* Define the number of messages to delete
* Confirm the action

---

3️⃣︲**Process Monitoring.**

* A progress bar displays during deletion
* The operation may take time depending on the number of messages

> [!TIP]
> Discord limits the deletion rate to prevent spam.
> The application automatically respects these limits to avoid temporary bans.

<details>
  <summary><strong>📸︲DM Manager Interface</strong></summary>
  
  ![Dm Manager](./images/1.png)
</details>

---

<a id="contributing"></a>
# `🤝`︲Contributing to the Project.

---

<a id="how-to-contribute"></a>
## `🔧`︲How to Contribute.

---

> [!NOTE]
> Community contributions are welcome!
> Here's how to participate in the development of **Discord Account Manager**.

---

### `📝`︲Contribution Process.

1️⃣︲**Fork the repository.**

Click the "Fork" button on GitHub to create your own copy of the project.

---

2️⃣︲**Create a branch.**

```bash
git checkout -b feature/your-feature
```

---

3️⃣︲**Make your modifications.**

* Modify the code
* Test your changes locally
* Ensure the code follows the existing style

---

4️⃣︲**Commit the changes.**

```bash
git commit -am 'Add my new feature'
```

---

5️⃣︲**Push to your fork.**

```bash
git push origin feature/your-feature
```

---

6️⃣︲**Create a Pull Request.**

Open a Pull Request on GitHub with a detailed description of your modifications.

> [!TIP]
> The clearer and more detailed your description, the easier it will be to accept your contribution!

---

<a id="improvement-ideas"></a>
## `💡`︲Improvement Ideas.

---

> [!NOTE]
> Here are some future feature ideas you could contribute to:

### `🚀`︲Features to Develop.

| Feature | Description | Priority |
|---------|-------------|----------|
| `🔄`︲ **Multi-Account** | Easily switch between multiple Discord accounts | `🔴`︲ High |
| `📺`︲ **Channel Management** | Manage channels (mute, delete, etc.) | `🟡`︲ Medium |
| `🔍`︲ **Advanced Search** | Powerful message search before deletion | `🟡`︲ Medium |
| `🍎` ︲**macOS Support** | Native compilation for macOS | `🟢`︲ Low |
| `🐧`︲ **Linux Support** | Native compilation for Linux | `🟢`︲ Low |
| `🌙`︲ **Dark Mode** | Complete dark theme for the interface | `🟡`︲ Medium |

---

<a id="additional-information"></a>
# `📚`︲Additional Information.

---

<a id="license"></a>
## `📄`︲License.

---

> [!NOTE]
> This project is distributed under the **MIT License**.
> See the [`📄` LICENSE](LICENSE) file for more details.

### `✅`︲Summary:

* `✅` ︲Commercial use allowed
* `✅` ︲Modification allowed
* `✅` ︲Distribution allowed
* `✅` ︲Private use allowed
* `⚠️` ︲No warranty provided

---

<a id="useful-links"></a>
## `🔗`︲Useful Links.

---

| Resource | Link |
|----------|------|
| `🐛` ︲**Bug Tracker** | [`🌐`︲Report a Bug](https://github.com/Bherl1/DiscordAccMgr/issues) |
| `📦` ︲**Releases** | [`🌐`︲Download](https://github.com/Bherl1/DiscordAccMgr/releases) |
| `💻` ︲**Source Code** | [`🌐`︲GitHub](https://github.com/Bherl1/DiscordAccMgr) |

---

<a id="acknowledgments"></a>
## `🙏`︲Acknowledgments.

---

> [!NOTE]
> We thank the following libraries and tools that made this project possible:

### `🧰`︲Main Dependencies.

* `⚡`︲**Electron.js** - Desktop application framework ︲[`🌐`](https://www.electronjs.org/)
* `🤖`︲**Discord.js-Selfbot-V13** - Discord API library ︲[`🌐`](https://www.npmjs.com/package/discord.js-selfbot-v13)
* `💚`︲**Node.js** - JavaScript runtime environment ︲[`🌐`](https://nodejs.org/)
* `📦`︲**npm** - Node.js package manager ︲[`🌐`](https://npmjs.com/)

---

### `💖`︲Thanks to the Community!

A big **thank you** for your interest in **Discord Account Manager**!
We hope this tool improves your Discord experience.

> [!TIP]
> If you like this project, don't hesitate to give it a ⭐ on GitHub!

---

## `🛟`︲Support & Feedback.

---

> [!NOTE]
> If you encounter problems or have suggestions for improvement:

### `📬`︲How to Contact Us.

1️⃣︲**Report a Bug.**

Open an issue in the [`🐛` Issues](https://github.com/Bherl1/DiscordAccMgr/issues) section

---

3️⃣︲**Suggest a Feature.**

Create an issue with the `enhancement` tag on GitHub.

---

> [!TIP]
> **Discord Account Manager** is in active development and your feedback is valuable to improve the application!

---
