import JSZip from 'jszip'
// import {
//   IMechWeaponData,
//   IManufacturerData,
//   IFactionData,
//   ICoreBonusData,
//   IFrameData,
//   IMechSystemData,
//   IWeaponModData,
//   ITalentData,
//   IPilotEquipmentData,
//   IContentPackManifest,
//   ITagCompendiumData,
//   IContentPack,
//   INpcClassData,
//   INpcFeatureData,
//   INpcTemplateData,
//   ICompendiumItemData,
// } from '@/interface'
// import { IActionData } from '@/classes/Action'

const isValidManifest = function (obj) {
    return ('name' in obj &&
        typeof obj.name === 'string' &&
        'author' in obj &&
        typeof obj.author === 'string' &&
        'version' in obj &&
        typeof obj.version === 'string');
};

const readZipJSON = async function (zip, filename) {
    const file = zip.file(filename);
    if (!file)
        return null;
    const text = await file.async('text');
    return JSON.parse(text);
};

const getPackID = async function (manifest) {
    const enc = new TextEncoder();
    const signature = `${manifest.author}/${manifest.name}`;
    const hash = await crypto.subtle.digest('SHA-1', enc.encode(signature));
    return btoa(String.fromCharCode.apply(null, new Uint8Array(hash)));
};

async function getZipData(zip, filename) {
    let readResult;
    try {
        readResult = await readZipJSON(zip, filename);
    }
    catch (e) {
        console.error(`Error reading file ${filename} from package, skipping. Error follows:`);
        console.trace(e);
        readResult = null;
    }
    return readResult || [];
}

const parseContentPack = async function (binString) {
    const zip = await JSZip.loadAsync(binString);
    const manifest = await readZipJSON(zip, 'lcp_manifest.json');

    if (!manifest)
        throw new Error('Content pack has no manifest');
    if (!isValidManifest(manifest))
        throw new Error('Content manifest is invalid');

    const generateItemID = (type, name) => {
        const sanitizedName = name
            .replace(/[ \/-]/g, '_')
            .replace(/[^A-Za-z0-9_]/g, '')
            .toLowerCase();
        return `${manifest.item_prefix}__${type}_${sanitizedName}`;
    };

    function generateIDs(data, dataPrefix) {
        return data.map(x => (Object.assign(Object.assign({}, x), { id: x.id || generateItemID(dataPrefix, x.name) })));
    }

    const manufacturers = await getZipData(zip, 'manufacturers.json');
    const factions = await getZipData(zip, 'factions.json');
    const backgrounds = await getZipData(zip, 'backgrounds.json');
    const coreBonuses = generateIDs(await getZipData(zip, 'core_bonuses.json'), 'cb');
    const frames = generateIDs(await getZipData(zip, 'frames.json'), 'mf');
    const weapons = generateIDs(await getZipData(zip, 'weapons.json'), 'mw');
    const systems = generateIDs(await getZipData(zip, 'systems.json'), 'ms');
    const mods = generateIDs(await getZipData(zip, 'mods.json'), 'wm');
    const pilotGear = generateIDs(await getZipData(zip, 'pilot_gear.json'), 'pg');
    const talents = generateIDs(await getZipData(zip, 'talents.json'), 't');
    const tags = generateIDs(await getZipData(zip, 'tags.json'), 'tg');
    const npcClasses = (await readZipJSON(zip, 'npc_classes.json')) || [];
    const npcFeatures = (await readZipJSON(zip, 'npc_features.json')) || [];
    const npcTemplates = (await readZipJSON(zip, 'npc_templates.json')) || [];
    const actions = (await readZipJSON(zip, 'actions.json')) || [];
    const statuses = (await readZipJSON(zip, 'statuses.json')) || [];
    const environments = (await readZipJSON(zip, 'environments.json')) || [];
    const sitreps = (await readZipJSON(zip, 'sitreps.json')) || [];
    const tables = (await readZipJSON(zip, 'tables.json')) || [];
    const id = await getPackID(manifest);

    return {
        id,
        active: false,
        manifest,
        data: {
            manufacturers,
            factions,
            backgrounds,
            coreBonuses,
            frames,
            weapons,
            systems,
            mods,
            pilotGear,
            talents,
            tags,
            npcClasses,
            npcFeatures,
            npcTemplates,
            actions,
            statuses,
            environments,
            sitreps,
            tables,
        },
    };
};

export { parseContentPack };
