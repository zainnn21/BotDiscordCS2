import dotenv from "dotenv";
dotenv.config();
import {
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
} from "discord.js";
;
import botReady from "./events/botReady";
import cs2StatsHandler from "./handler/cs2stats"
import weaponsHandler from "./handler/weapons";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Intents(Izin) yang  dibutuhkan bot discord
// izin akses server (Guilds)
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

//Event Handler
//Event will run once when bot is successfully logged in and ready
client.once(Events.ClientReady, async (readyClient) => {
  botReady(readyClient);
  console.log("Ready!");
});

//event will run everytime there's interaction from user (slash command)
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  //HANDLER FOR cs2stats
  if (interaction.commandName === "cs2stats") {
    await interaction.deferReply();
    cs2StatsHandler(interaction); 
  } else if (interaction.commandName === "weapons") {
    await interaction.deferReply();
    weaponsHandler(interaction);
  }
});

//Login Discord
client.login(DISCORD_TOKEN).then(() => {
  console.log("Login success!");
});
