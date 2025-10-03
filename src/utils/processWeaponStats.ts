import { PlayerStats } from "../events/steamAPI";

interface WeaponStat {
  name: string;
  kills: number;
  accuracy: string;
}

export const processWeaponStats = (stats: PlayerStats): WeaponStat[] => {
  const weaponData: WeaponStat[] = [];
  const excludedKeys: string[] = [
    "knife_fight",
    "hegrenade",
    "molotov",
    "taser",
    "headshot",
    "enemy_weapon",
    "enemy_blinded",
    "against_zoomed_sniper",
  ];

  // Loop through the stats object
  for (const key in stats) {
    if (
      key.startsWith("total_kills_") &&
      !excludedKeys.some((ex) => key.includes(ex))
    ) {
      const weaponName: string = key.substring("total_kills_".length);
      const kills: number = stats[key] || 0;
      const shots: number = stats[`total_shots_${weaponName}`] || 1;
      const hits: number = stats[`total_hits_${weaponName}`] || 0;

      const accuracy: string = ((hits / shots) * 100).toFixed(2);

      weaponData.push({
        name: weaponName.toUpperCase(),
        kills: kills,
        accuracy: accuracy,
      });
    }
  }

  // sort weapons by kills from highest to lowest
  weaponData.sort((a, b) => b.kills - a.kills);

  // get top 5 weapon
  return weaponData.slice(0, 5);
};
