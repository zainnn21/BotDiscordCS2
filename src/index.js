import dotenv from "dotenv";
dotenv.config();
import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import axios from "axios";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const CLIENT_ID = process.env.CLIENT_ID;

// Intents(Izin) yang  dibutuhkan bot discord
// izin akses server (Guilds)
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

//Get SteamID from input (URL, custom name, ID)
const getSteamID64 = async (input) => {
  if (!input) {
    throw new Error("Invalid input");
  }

  if (/^\d{17}$/.test(input)) {
    return input;
  }

  console.log("input", input);
  const vanityUrl = input.split("/").filter(Boolean).pop();
  const response = await axios.get(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${vanityUrl}`
  );

  if (response.data.response.success === 1) {
    return response.data.response.steamid;
  } else {
    throw new Error("Profile not found");
  }
};

//Get Player Summary Profile (name,avatar,etc)
const getPlayerSummary = async (steamID64) => {
  const response = await axios.get(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamID64}`
  );

  if (response.data.response.players.length > 0) {
    return response.data.response.players[0];
  } else {
    throw new Error("Player not found");
  }
};

//Get CS2 player stats
const getPlayerStats = async (steamID64) => {
  const appID = 730;
  const response = await axios.get(
    `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${STEAM_API_KEY}&steamid=${steamID64}&appid=${appID}`
  );
  if (!response.data.playerstats?.stats) {
    throw new Error(
      "Couldn't retrieve player stats. The profile might be private."
    );
  }
  const stats = {};
  response.data.playerstats.stats.forEach((stat) => {
    stats[stat.name] = stat.value;
  });
  return stats;
};

//Event Handler
//Event will run once when bot is successfully logged in and ready
client.once(Events.ClientReady, async () => {
  console.log("Bot Login as", client.user.tag);

  //Command Discord
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  const command = new SlashCommandBuilder()
    .setName("cs2stats")
    .setDescription("Get CS2 player stats")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription("URL Steam Profile, custom name, steamID64")
        .setRequired(true)
    );
  try {
    console.log("Registering command");
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [command.toJSON()],
    });
  } catch (e) {
    console.error("Failed to register commands: ", e);
  }
});

//event will run everytime there's interaction from user (slash command)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "cs2stats") {
    await interaction.deferReply();
    const userInput = interaction.options.getString("steamid");

    try {
      //get steamId from user input
      const steamID64 = await getSteamID64(userInput);
      //get player summary and stats
      const [summary, stats] = await Promise.all([
        getPlayerSummary(steamID64),
        getPlayerStats(steamID64),
      ]);

      //count stats
      const totalKills = stats.total_kills || 0;
      const totalDeaths = stats.total_deaths || 1;
      const kdRatio = (totalKills / totalDeaths).toFixed(2);
      const headshotKills = stats.total_kills_headshot || 0;
      const headshotPercentage =
        totalKills > 0
          ? ((headshotKills / totalKills) * 100).toFixed(2)
          : "0.00";

      //create embed
      const embed = new EmbedBuilder()
        .setColor(0x0e76a8)
        .setTitle(`CS2 Player Stats: ${summary.personaname}`)
        .setURL(summary.profileurl)
        .setThumbnail(summary.avatarfull)
        .addFields(
          { name: "Total Kills", value: totalKills.toString(), inline: true },
          { name: "Total Deaths", value: totalDeaths.toString(), inline: true },
          { name: "K/D Ratio", value: kdRatio.toString(), inline: true },
          {
            name: "Total Headshot Kills",
            value: headshotKills.toString(),
            inline: true,
          },
          {
            name: "Headshot Percentage",
            value: `${headshotPercentage}%`,
            inline: true,
          }
        )
        .setFooter({ text: `SteamID: ${steamID64}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      let errorMessage = "An unexpected error occurred.";
      if (e.isAxiosError && e.response?.status === 403) {
        errorMessage =
          "Could not fetch stats. The user's profile or game details are likely private.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      await interaction.editReply(`Error: ${errorMessage}`);
    }
  }
});

//Login Discord
client.login(DISCORD_TOKEN).then(() => {
  console.log("Login success!");
});
