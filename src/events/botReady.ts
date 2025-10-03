import {
  Client,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  throw new Error("Missing environment variables DISCORD_TOKEN or CLIENT_ID");
}

const botReady = async (readyClient: Client) => {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  //Command /cs2stats
  const statsCommand = new SlashCommandBuilder()
    .setName("cs2stats")
    .setDescription("Get CS2 player stats")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription("URL Steam Profile, custom name, steamID64")
        .setRequired(true)
    );
  commands.push(statsCommand.toJSON());

  //Command /weapons
  const weaponsCommand = new SlashCommandBuilder()
    .setName("weapons")
    .setDescription("Get CS2 favorite weapons")
    .addStringOption((option) =>
      option
        .setName("steamid")
        .setDescription("URL Steam Profile, custom name, steamID64")
        .setRequired(true)
    );
  commands.push(weaponsCommand.toJSON());
  try {
    console.log("Registering command");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  } catch (e) {
    console.error("Failed to register commands: ", e);
  }
};

export default botReady;
