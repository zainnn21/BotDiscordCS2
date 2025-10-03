import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import {
  getSteamID64,
  getPlayerStats,
  getPlayerSummary,
  PlayerStats,
  PlayerSummary,
} from "../events/steamAPI";
import { AxiosError } from "axios";

const cs2Stats = async (interaction: ChatInputCommandInteraction) => {
  const userInput = interaction.options.getString("steamid", true);

  try {
    //get steamId from user input
    const steamID64 = await getSteamID64(userInput);
    //get player summary and stats
    const [summary, stats]: [PlayerSummary, PlayerStats] = await Promise.all([
      getPlayerSummary(steamID64),
      getPlayerStats(steamID64),
    ]);

    //count stats
    const playTime = stats.total_time_played || 0;
    const hoursPlayed = (playTime / 3600).toFixed(2);
    const knifeKills = stats.total_kills_knife || 0;
    const totalKills = stats.total_kills || 0;
    const totalDeaths = stats.total_deaths || 1;
    const kdRatio = (totalKills / totalDeaths).toFixed(2);
    const headshotKills = stats.total_kills_headshot || 0;
    const headshotPercentage =
      totalKills > 0 ? ((headshotKills / totalKills) * 100).toFixed(2) : "0.00";

    //create embed
    const embed = new EmbedBuilder()
      .setColor(0x0e76a8)
      .setTitle(`CS2 Player Stats: ${summary.personaname}`)
      .setURL(summary.profileurl)
      .setThumbnail(summary.avatarfull)
      .addFields(
        { name: "Playtime", value: `${hoursPlayed} hours`, inline: true },
        { name: "Total Kills", value: totalKills.toString(), inline: true },
        { name: "Total Deaths", value: totalDeaths.toString(), inline: true },
        { name: "K/D Ratio", value: kdRatio.toString(), inline: true },
        { name: "Knife Kills", value: knifeKills.toString(), inline: true },
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

export default cs2Stats;
