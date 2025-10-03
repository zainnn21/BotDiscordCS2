import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import {
  getSteamID64,
  getPlayerStats,
  getPlayerSummary,
  PlayerStats,
  PlayerSummary,
  PlayerBans,
  getPlayerBans,
} from "../events/steamAPI";
import { AxiosError } from "axios";

const check = async (interaction: ChatInputCommandInteraction) => {
  const userInput = interaction.options.getString("steamid", true);

  try {
    //get steamId from user input
    const steamID64 = await getSteamID64(userInput);
    //get player summary and stats
    const [summary, stats, bans]: [PlayerSummary, PlayerStats, PlayerBans] =
      await Promise.all([
        getPlayerSummary(steamID64),
        getPlayerStats(steamID64),
        getPlayerBans(steamID64),
      ]);

    //count stats
    const playTime = stats.total_time_played || 0;
    const hoursPlayed = (playTime / 3600).toFixed(2);
    const totalKills: number = stats.total_kills || 0;
    const totalDeaths: number = stats.total_deaths || 1;
    const kdRatioNum: number = totalKills / totalDeaths;
    const kdRatio: string = kdRatioNum.toFixed(2);

    const headshotKills: number = stats.total_kills_headshot || 0;
    const headshotPercentageNum: number =
      totalKills > 0 ? (headshotKills / totalKills) * 100 : 0;
    const headshotPercentage: string = headshotPercentageNum.toFixed(2);

    const accountCreated = new Date(summary.timecreated * 1000).toUTCString();

    const totalShots: number = stats.total_shots_fired || 1;
    const totalHits: number = stats.total_shots_hit || 0;
    const accuracyNum: number = (totalHits / totalShots) * 100;
    const accuracy: string = accuracyNum.toFixed(2);

    let checkStatusac = "";
    let checkStatuskd = "";
    let checkStatushs = "";

    if (headshotPercentageNum >= 60) {
      checkStatushs = "❗Extrem";
    } else if (headshotPercentageNum >= 40) {
      checkStatushs = "Normal";
    } else {
      checkStatushs = "Bad";
    }

    if (kdRatioNum >= 1.9) {
      checkStatuskd = "❗Extrem";
    } else if (kdRatioNum >= 0.7) {
      checkStatuskd = "Normal";
    } else {
      checkStatuskd = "Bad";
    }

    if (accuracyNum >= 60) {
      checkStatusac = "❗Extrem";
    } else if (accuracyNum >= 35) {
      checkStatusac = "High";
    } else {
      checkStatusac = "Bad";
    }

    //check user ban status
    const vacStatus = bans.VACBanned ? "Banned" : "Not Banned";
    const CommunityBanned = bans.CommunityBanned ? "Banned" : "Not Banned";
    const EconomyBan = bans.EconomyBan === "none" ? "Not Banned" : "Banned";

    //create embed
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`Analysis Profile: ${summary.personaname}`)
      .setURL(summary.profileurl)
      .setThumbnail(summary.avatarfull)
      .addFields(
        // --- STATUS BAN SECTION ---
        { name: "\u200B", value: "**STATUS BAN**" },
        { name: "VAC Status: ", value: vacStatus, inline: true },
        { name: "Community Status: ", value: CommunityBanned, inline: true },
        { name: "Market Status: ", value: EconomyBan, inline: true },
        // --- STATS SECTION ---
        { name: "\u200B", value: "**STATS ANALYSIS**" },
        {
          name: "K/D Ratio",
          value: `${kdRatio.toString()}, ${checkStatuskd}`,
          inline: true,
        },
        {
          name: "Headshot %",
          value: `${headshotPercentage}% ${checkStatushs}`,
          inline: true,
        },
        {
          name: "Accuracy",
          value: `${accuracy}% ${checkStatusac}`,
          inline: true,
        },
        // --- STEAM ACCOUNT SECTION ---
        { name: "\u200B", value: "**STEAM ACCOUNT**" },
        { name: "Playtime", value: `${hoursPlayed} hours`, inline: true },
        { name: "Account Created", value: accountCreated, inline: true }
      )
      .setFooter({ text: `SteamID: ${steamID64}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (e: any) {
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
