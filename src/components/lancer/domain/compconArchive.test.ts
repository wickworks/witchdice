import { npcsFromCompconBackup } from './compconArchive';
import { parseCompconNpc } from './parseNpc';
import { v2Npcs, v3Npcs } from './__fixtures__/fixtures';

function v3Archive(items: any[]) {
  return {
    EXPORT_TYPE: 'Save COMP/CON Archive',
    data: {
      data: [
        { collection: 'pilots', items: [{ id: 'not-an-npc' }] },
        { collection: 'npcs', items },
        { collection: 'encounters', items: [] },
      ],
    },
  };
}

function v2Backup(npcs: any[]) {
  return [
    { filename: 'pilots_v2.json', data: JSON.stringify([]) },
    { filename: 'npcs_v2.json', data: JSON.stringify(npcs) },
  ];
}

describe('npcsFromCompconBackup', () => {
  it('reads NPCs out of a V3 archive and skips ones deleted via save.deleteTime', () => {
    const [live, deleted] = v3Npcs.map(f => JSON.parse(JSON.stringify(f.json)));
    live.save = { lastModified: 1, deleteTime: 0, created: 1 };
    deleted.save = { lastModified: 2, deleteTime: 2, created: 1 };

    const npcs = npcsFromCompconBackup(v3Archive([live, deleted]));
    expect(npcs.map(n => n.id)).toEqual([live.id]);
    expect(() => parseCompconNpc(npcs[0])).not.toThrow();
  });

  it('still reads the V2 array-of-files backup and skips V2-style deletions', () => {
    const [live, deleted] = v2Npcs.map(f => JSON.parse(JSON.stringify(f.json)));
    deleted.isDeleted = true;

    const npcs = npcsFromCompconBackup(v2Backup([live, deleted]));
    expect(npcs.map(n => n.id)).toEqual([live.id]);
    expect(() => parseCompconNpc(npcs[0])).not.toThrow();
  });

  it('returns an empty list for archives without an NPC collection', () => {
    expect(npcsFromCompconBackup({ EXPORT_TYPE: 'Save COMP/CON Archive', data: { data: [] } })).toEqual([]);
    expect(npcsFromCompconBackup([{ filename: 'pilots.json', data: '[]' }])).toEqual([]);
    expect(npcsFromCompconBackup(null)).toEqual([]);
  });
});
