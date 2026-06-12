declare module '@svg-maps/france.regions' {
  export interface MapLocation {
    id: string;
    name: string;
    path: string;
  }

  interface FranceRegionsMap {
    label: string;
    viewBox: string;
    locations: MapLocation[];
  }

  const map: FranceRegionsMap;
  export default map;
}
