import { ZipReader, Uint8ArrayReader, TextWriter } from "@zip.js/zip.js";

//import JSZip from "jszip"
//import {
//	IMechWeaponData,
//	IManufacturerData,
//	ICoreBonusData,
//	IFrameData,
//	IMechSystemData,
//	IWeaponModData,
//	ITalentData,
//	IPilotEquipmentData,
//	IContentPackManifest,
//	ITagCompendiumData,
//	IContentPack,
//	INpcClassData,
//	INpcFeatureData,
//	INpcTemplateData,
//	ICompendiumItemData,
//} from '@/interface'
//import { IActionData } from '@/classes/Action'
//import { IBackgroundData } from '@/classes/Background'
//import { IReserveData, ISkillData } from '@/classes/pilot/components'

const isValidManifest = function(obj) {
	console.log('checking manifest : ', obj, typeof obj);

	return (
		"name" in obj &&
		typeof obj.name === "string" &&
		"author" in obj &&
		typeof obj.author === "string" &&
		"version" in obj &&
		typeof obj.version === "string"
	)
}

//const readZipJSON = async function(zip, filename) {
//	const file = zip.file(filename)
//	if (!file) return null
//	const text = await file.async("text")
//	return JSON.parse(text)
//}

const getPackID = async function(manifest) {
	const enc = new TextEncoder()
	const signature = `${manifest.author}/${manifest.name}`
	const hash = await crypto.subtle.digest("SHA-1", enc.encode(signature))
	return btoa(String.fromCharCode.apply(null, new Uint8Array(hash)))
}

async function getZipData(zip, filename) {
	//console.log('getting ', filename, '::::::');

	let readResult
	try {
		const rawString = zip[filename]
		if (rawString) readResult = await JSON.parse(rawString)
	} catch (e) {
		console.error(
			`Error reading file ${filename} from package, skipping. Error follows:`
		)
		console.trace(e)
		readResult = null
	}
	//console.log('>>>>> ', readResult);

	return readResult || []
}

const parseZipBinaryString = async (binaryString) => {
    try {
        // Convert binary string to Uint8Array
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }

        // Create a ZIP reader
        const zipReader = new ZipReader(new Uint8ArrayReader(uint8Array));

        // Get file entries
        const entries = await zipReader.getEntries();

        // Read files into a dictionary
        const filesDict = {};
        for (const entry of entries) {
            if (!entry.directory) {
                // Read file as text (modify this if you need binary)
                const textWriter = new TextWriter();
                const content = await entry.getData(textWriter);
                filesDict[entry.filename] = content;
            }
        }

        // Close the zip reader
        await zipReader.close();

        return filesDict;
    } catch (error) {
        console.error("Error parsing ZIP binary string:", error);
        return null;
    }
};


const parseContentPack = async function(binString) {
	var zip = await parseZipBinaryString(binString)
	const manifest = JSON.parse(zip['lcp_manifest.json'])

	if (!manifest) throw new Error("Content pack has no manifest")
	if (!isValidManifest(manifest)) throw new Error("Content manifest is invalid")

	const generateItemID = (type, name) => {
		const sanitizedName = name
			.replace(/[ \/-]/g, "_")
			.replace(/[^A-Za-z0-9_]/g, "")
			.toLowerCase()
		return `${manifest.item_prefix}__${type}_${sanitizedName}`
	}

	function generateIDs(data, dataPrefix) {
		return data.map(x => ({
			...x,
			id: x.id || generateItemID(dataPrefix, x.name)
		}))
	}

	const manufacturers = await getZipData(zip, "manufacturers.json")
	const backgrounds = await getZipData(zip, "backgrounds.json")
	const coreBonuses = generateIDs(
	await getZipData(zip, "core_bonuses.json"),
		"cb"
	)
	const frames = generateIDs(await getZipData(zip, "frames.json"), "mf")
	const weapons = generateIDs(await getZipData(zip, "weapons.json"), "mw")
	const systems = generateIDs(await getZipData(zip, "systems.json"), "ms")
	const mods = generateIDs(await getZipData(zip, "mods.json"), "wm")
	const pilotGear = generateIDs(await getZipData(zip, "pilot_gear.json"), "pg")
	const talents = generateIDs(await getZipData(zip, "talents.json"), "t")
	const tags = generateIDs(await getZipData(zip, "tags.json"), "tg")
	const skills = generateIDs(await getZipData(zip, "skills.json"), "sk")

	const npcClasses = (await getZipData(zip, "npc_classes.json")) || []
	const npcFeatures = (await getZipData(zip, "npc_features.json")) || []
	const npcTemplates = (await getZipData(zip, "npc_templates.json")) || []

	const actions = (await getZipData(zip, "actions.json")) || []
	const statuses = (await getZipData(zip, "statuses.json")) || []
	const environments = (await getZipData(zip, "environments.json")) || []
	const sitreps = (await getZipData(zip, "sitreps.json")) || []
	const tables = (await getZipData(zip, "tables.json")) || []
	const bonds = (await getZipData(zip, "bonds.json")) || []
	const reserves = (await getZipData(zip, "reserves.json")) || []

	const id = await getPackID(manifest)

	return {
		id,
		active: false,
		manifest,
		data: {
			manufacturers,
			backgrounds,
			coreBonuses,
			frames,
			weapons,
			systems,
			mods,
			skills,
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
			bonds,
			reserves
		}
	}
}

export { parseContentPack }
