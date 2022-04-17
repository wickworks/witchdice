
export const SQUAD_CLOCK_KEY = 'squad-clocks' // a summary for the squad data


export function saveSquadClockData(allSquadClocks) {
  localStorage.setItem(SQUAD_CLOCK_KEY, JSON.stringify(allSquadClocks));
}

export function loadSquadClockData(encounterID) {
  return localStorage.getItem(SQUAD_CLOCK_KEY);
}
