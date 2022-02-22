
export function getStat(key, npc) {
  let stat = npc.stats[key]
  if (npc.stats.overrides && npc.stats.overrides[key] > 0) {
    stat = npc.stats.overrides[key]
  } else if (npc.stats.bonuses) {
    stat += npc.stats.bonuses[key] || 0
  }
  return stat
}
