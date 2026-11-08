// One map style for every map in the app: a light, minimal basemap that lets the pins stand out.
// CARTO's free basemaps need the attribution below and are meant for non-commercial use.
export const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const TILE_OPTIONS = {
  subdomains: "abcd",
  maxZoom: 20,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};
