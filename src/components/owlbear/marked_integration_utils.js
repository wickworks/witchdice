import { capitalize } from '../../utils.js';
import OBR from "@owlbear-rodeo/sdk";

import allStatuses from '@massif/lancer-data/lib/statuses.json';

export const MARKED_METADATA_KEY = "com.battle-system.mark/metadata_marks"

const LANCER_GROUPS = [
  {
    "Num": "#1",
    "Name": "Conditions"
  },
  {
    "Num": "#2",
    "Name": "Statuses"
  },
  {
    "Num": "#3",
    "Name": "Extra"
  }
]

const LANCER_LABELS = allStatuses.map((status) => {
  return {
    "Id": status.icon,
    "Name": capitalize(status.name, true),
    "Color": "#ffffff",
    "Group": status.type == 'Condition' ? '#1' : '#2',
    "Active": 1,
    "Direction": status.type == 'Condition' ? 'Bottom' : 'Left'
  }
})



export const setupLancerStatusesPreset = () => {
  if (window.confirm('This will override all Marked! statuses with a preset for Lancer. Continue?')) {
    OBR.room.getMetadata().then(fullOwlbearMetadata => {
      const metadata = fullOwlbearMetadata[MARKED_METADATA_KEY]

      // preserve any other metadata we've saved (none atm) but clear out the room
      const metadataUpdate = {}
      metadataUpdate[MARKED_METADATA_KEY] = {
        saveData: {
          Groups: LANCER_GROUPS,
          Labels: LANCER_LABELS,
          Distance: 40,
          Opacity: 70
        }
      }

      console.log('metadataUpdate',metadataUpdate);
      OBR.room.setMetadata(metadataUpdate)

      // the refresh request will come through the normal metadata change mechanism
    })
    return true
  }
  return false
}
