import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import {
  getSteamID64,
  getPlayerStats,
  getPlayerSummary,
  getPlayerBans,
  PlayerStats,
  PlayerSummary,
  PlayerBans,
} from "../events/steamAPI";
import { AxiosError } from "axios";

const BANNED_STATUS = "Banned";
const NOT_BANNED_STATUS = "Not Banned";

async function fetchCheckData(steamID64: string) {
  return Promise.all([
    getPlayerSummary(steamID64),
    getPlayerStats(steamID64),
    getPlayerBans(steamID64),
  ]);
}

function processCheckData(
  summary: PlayerSummary,
  stats: PlayerStats,
  bans: PlayerBans
) {
  const totalKills = stats.total_kills || 0;
  const totalDeaths = stats.total_deaths || 1;
  const kdRatioNum = totalKills / totalDeaths;

  const headshotKills = stats.total_kills_headshot || 0;
  const headshotPercentageNum =
    totalKills > 0 ? (headshotKills / totalKills) * 100 : 0;

  const totalShots = stats.total_shots_fired || 1;
  const totalHits = stats.total_shots_hit || 0;
  const accuracyNum = (totalHits / totalShots) * 100;

  return {
    hoursPlayed: (stats.total_time_played / 3600).toFixed(2),
    kdRatio: kdRatioNum.toFixed(2),
    headshotPercentage: headshotPercentageNum.toFixed(2),
    accuracy: accuracyNum.toFixed(2),
    accountCreated: new Date(summary.timecreated * 1000).toUTCString(),
    checkStatuskd:
      kdRatioNum >= 1.9 ? "❗Extrem" : kdRatioNum >= 0.7 ? "Normal" : "Bad",
    checkStatushs:
      headshotPercentageNum >= 60
        ? "❗Extrem"
        : headshotPercentageNum >= 40
        ? "Normal"
        : "Bad",
    checkStatusac:
      accuracyNum >= 60 ? "❗Extrem" : accuracyNum >= 35 ? "High" : "Bad",
    vacStatus: bans.VACBanned ? BANNED_STATUS : NOT_BANNED_STATUS,
    communityBanned: bans.CommunityBanned ? BANNED_STATUS : NOT_BANNED_STATUS,
    economyBan: bans.EconomyBan !== "none" ? BANNED_STATUS : NOT_BANNED_STATUS,
  };
}

function buildCheckEmbed(
  summary: PlayerSummary,
  processedData: ReturnType<typeof processCheckData>,
  steamID64: string
) {
  const isBanned = [
    processedData.vacStatus,
    processedData.communityBanned,
    processedData.economyBan,
  ].includes(BANNED_STATUS);

  return new EmbedBuilder()
    .setColor(isBanned ? "#FF0000" : "#00FF00")
    .setTitle(`Analysis Profile: ${summary.personaname}`)
    .setURL(summary.profileurl)
    .setThumbnail(summary.avatarfull)
    .addFields(
      { name: "\u200B", value: "**STATUS BAN**" },
      { name: "VAC Status: ", value: processedData.vacStatus, inline: true },
      {
        name: "Community Status: ",
        value: processedData.communityBanned,
        inline: true,
      },
      {
        name: "Market Status: ",
        value: processedData.economyBan,
        inline: true,
      },
      { name: "\u200B", value: "**STATS ANALYSIS**" },
      {
        name: "K/D Ratio",
        value: `${processedData.kdRatio}, ${processedData.checkStatuskd}`,
        inline: true,
      },
      {
        name: "Headshot %",
        value: `${processedData.headshotPercentage}% ${processedData.checkStatushs}`,
        inline: true,
      },
      {
        name: "Accuracy",
        value: `${processedData.accuracy}% ${processedData.checkStatusac}`,
        inline: true,
      },
      { name: "\u200B", value: "**STEAM ACCOUNT**" },
      {
        name: "Playtime",
        value: `${processedData.hoursPlayed} hours`,
        inline: true,
      },
      {
        name: "Account Created",
        value: processedData.accountCreated,
        inline: true,
      }
    )
    .setFooter({ text: `SteamID: ${steamID64}` })
    .setTimestamp();
}

const check = async (interaction: ChatInputCommandInteraction) => {
  const userInput = interaction.options.getString("steamid", true);

  try {
    const steamID64 = await getSteamID64(userInput);
    const [summary, stats, bans] = await fetchCheckData(steamID64);

    const processedData = processCheckData(summary, stats, bans);
    const embed = buildCheckEmbed(summary, processedData, steamID64);

    await interaction.editReply({ embeds: [embed] });
  } catch (e: unknown) {
    console.error(e);
    let errorMessage = "An unexpected error occurred.";
    if (e instanceof AxiosError && e.response?.status === 403) {
      errorMessage =
        "Could not fetch stats. The user's profile or game details are likely private.";
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }
    await interaction.editReply(`Error: ${errorMessage}`);
  }
};

export default check;
