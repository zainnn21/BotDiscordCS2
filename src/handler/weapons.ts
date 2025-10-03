import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import {
  getSteamID64,
  getPlayerStats,
  getPlayerSummary,
  PlayerStats,
  PlayerSummary,
} from "../events/steamAPI";
import { processWeaponStats } from "../utils/processWeaponStats";
import { AxiosError } from "axios";

const weapons = async (interaction: ChatInputCommandInteraction) => {
  const userInput = interaction.options.getString("steamid", true);

  try {
    const steamID64 = await getSteamID64(userInput);
    const [summary, stats]: [PlayerSummary, PlayerStats] = await Promise.all([
      getPlayerSummary(steamID64),
      getPlayerStats(steamID64),
    ]);

    const topWeapons = processWeaponStats(stats);

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`CS2 Favorite Weapons: ${summary.personaname}`)
      .setURL(summary.profileurl)
      .setThumbnail(summary.avatarfull)
      .setDescription("5 highest kills and accuracy for each weapon.")
      .setTimestamp();

    if (topWeapons.length > 0) {
      topWeapons.forEach((weapon) => {
        embed.addFields({
          name: `🔫 ${weapon.name}`,
          value: `**Kills:** ${weapon.kills}\n**Accuracy:** ${weapon.accuracy}%`,
          inline: true,
        });
      });
    } else {
      embed.setDescription("No weapon stats found or profile is private.");
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: unknown) {
    console.error(error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof AxiosError && error.response?.status === 403) {
      errorMessage =
        "Could not fetch stats. The user's profile or game details are likely private.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    await interaction.editReply({
      content: `Error: ${errorMessage}`,
    });
  }
};

export default weapons;
