// One map style for every map in the app: OpenStreetMap's standard tiles. They need no API key.
// The "uv-tiles" class (see globals.css) softens their colours so the pins stand out.
// Please keep the attribution, and keep traffic modest: https://operations.osmfoundation.org/policies/tiles/
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_OPTIONS = {
  maxZoom: 19,
  className: "uv-tiles",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
