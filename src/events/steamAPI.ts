import axios from "axios";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

interface SteamStat {
  name: string;
  value: number;
}

export interface PlayerStats {
  [key: string]: number;
}

export interface PlayerSummary {
  personaname: string;
  profileurl: string;
  avatarfull: string;
  timecreated: number;
}

export interface PlayerBans {
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
}

export const getSteamID64 = async (input: string) => {
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
export const getPlayerSummary = async (
  steamID64: string
): Promise<PlayerSummary> => {
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
export const getPlayerStats = async (
  steamID64: string
): Promise<PlayerStats> => {
  const appID = 730;
  const response = await axios.get(
    `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${STEAM_API_KEY}&steamid=${steamID64}&appid=${appID}`
  );
  if (!response.data.playerstats?.stats) {
    throw new Error(
      "Couldn't retrieve player stats. The profile might be private."
    );
  }
  const stats: PlayerStats = {};
  response.data.playerstats.stats.forEach((stat: SteamStat) => {
    stats[stat.name] = stat.value;
  });
  return stats;
};

export const getPlayerBans = async (steamID64: string): Promise<PlayerBans> => {
  const response = await axios.get(
    `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamID64}`
  );
  if (response.data.players.length === 0) {
    throw new Error("Player not found");
  }
  return response.data.players[0];
};
