# CS2 Stats Discord Bot

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-7289DA?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)

A powerful and easy-to-use Discord bot for checking Counter-Strike 2 player statistics directly from your server. Built with Node.js and Discord.js, it integrates with the Steam Web API to provide accurate, up-to-date lifetime stats for any public Steam profile.

---

### 🎉 Invite Me!

Ready to analyze your stats? Add this bot to your Discord server!

[![Add to Discord](https://img.shields.io/badge/Add%20to%20Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1423470446720061582&permissions=83968&integration_type=0&scope=bot+applications.commands)

---

## 📸 Screenshot

![Bot Screenshot](https://imgur.com/7Hr9tU8.png)
![Bot Screenshot](https://imgur.com/2HLPPKV.png)

## ✨ Features

- 📊 **Detailed Player Stats:** Get a full summary of a player's performance, including K/D Ratio, Total Wins, Headshot Percentage, and more with the `/stats` command.
- 🔫 **Top Weapon Analysis:** View a player's top 5 most-used weapons, sorted by kills and including their accuracy with each using the `/weapons` command.
- 🔗 **Flexible Steam ID Input:** Accepts various formats, including full profile URLs, custom vanity URLs, and SteamID64.
- ✨ **Modern Slash Commands:** Utilizes Discord's native slash command interface for a seamless and intuitive user experience.
- 🖼️ **Rich Embeds:** Presents all data in clean, well-formatted Discord embeds.

## 🚀 Getting Started

Follow these instructions to get a local copy of the bot up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Git](https://git-scm.com/)
- A Discord Bot Token ([How to get one](https://discordjs.guide/preparations/setting-up-a-bot-application.html))
- A Steam Web API Key ([How to get one](https://steamcommunity.com/dev/apikey))
- Your Bot's Application ID (Client ID)

### ⚙️ Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/your-username/cs2-stats-bot.git](https://github.com/your-username/cs2-stats-bot.git)
    cd cs2-stats-bot
    ```

2.  **Install NPM packages:**

    ```sh
    bun install
    ```

3.  **Create and configure your environment file:**
    Create a file named `.env` in the root of the project and fill it with your credentials.

    ```env
    # .env file
    DISCORD_TOKEN="YOUR_DISCORD_BOT_TOKEN"
    STEAM_API_KEY="YOUR_STEAM_API_KEY"
    CLIENT_ID="YOUR_BOTS_APPLICATION_ID"
    ```

4.  **Run the bot:**
    ```sh
    bun dev
    ```
    Your bot should now be online and its slash commands registered!

## 🤖 Usage

Once the bot is running and invited to your server, you can use the following commands:

- `/stats steam_id:<your_steam_profile_url>`
  Displays a general statistics summary for the specified Steam profile.

- `/weapons steam_id:<your_steam_profile_url>`
  Shows the top 5 weapon statistics for the specified Steam profile.

## 🛠️ Tech Stack

- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment.
- **[Discord.js](https://discord.js.org/)** - The primary library for interacting with the Discord API.
- **[Axios](https://axios-http.com/)** - For making HTTP requests to the Steam API.
- **[Dotenv](https://www.npmjs.com/package/dotenv)** - For managing environment variables.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or want to add new features, feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---
