function isDeleted(npc: any): boolean {
  if (!npc) return true;
  if (npc.isDeleted || npc.deleteTime) return true;
  if (npc.save && npc.save.deleteTime) return true;
  return false;
}

function npcsFromV2Backup(files: any[]): any[] {
  const npcFile = files.find(file => file && typeof file.filename === 'string' && file.filename.startsWith('npcs'));
  if (!npcFile) return [];
  const parsed = typeof npcFile.data === 'string' ? JSON.parse(npcFile.data) : npcFile.data;
  return Array.isArray(parsed) ? parsed : [];
}

function npcsFromV3Archive(archive: any): any[] {
  const collections = archive && archive.data && Array.isArray(archive.data.data) ? archive.data.data : [];
  const npcCollection = collections.find((c: any) => c && c.collection === 'npcs');
  return npcCollection && Array.isArray(npcCollection.items) ? npcCollection.items : [];
}

export function npcsFromCompconBackup(backup: any): any[] {
  const npcs = Array.isArray(backup) ? npcsFromV2Backup(backup) : npcsFromV3Archive(backup);
  return npcs.filter(npc => !isDeleted(npc));
}
