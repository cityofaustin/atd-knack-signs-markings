import "mapbox-gl/dist/mapbox-gl.css";
import type { CircleLayerSpecification } from "mapbox-gl";
// import { SymbolLayerSpecification, RasterLayerSpecification } from "mapbox-gl";

// // The Nearmap API key is managed by CTM. Contact help desk for maintenance and troubleshooting.
// const NEARMAP_KEY = process.env.NEXT_PUBLIC_NEARMAP_KEY;
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// TODO: update to prod url when testing is completed
// export const KNACK_APP_URL = 'http://atd.knack.com/signs-markings'
export const KNACK_APP_URL =
  "https://atd.knack.com/test-30-may-2024-signs-and-markings-operations";

export const MAP_COORDINATE_PRECISION = 8;

export const DEFAULT_MAP_PAN_ZOOM = {
  latitude: 30.28,
  longitude: -97.7506,
  zoom: 17,
};

export const SIGN_LOCATION_BOUNDS_FIT_OPTIONS = {
  padding: 100,
  maxZoom: 16,
  duration: 0,
} as const;

/**
 * Minimum zoom level required to display AGOL sign assets
 * Zoom levels below this threshold will hide signs to improve performance
 */
export const AGOL_SIGNS_MIN_ZOOM = 15.5;

/** Touch-friendly sign size; stops match AGOL_SIGNS_LAYER_STYLE below */
const SIGN_POINT_SIZE = {
  zMin: 15,
  zMax: 20,
  radius: [6, 18],
  stroke: [1, 4],
} as const;

/** Size between "zoomed out" and "zoomed in" values for the current map zoom */
function scaleSignPointByZoom(
  zoom: number,
  sizeWhenZoomedOut: number,
  sizeWhenZoomedIn: number
): number {
  const { zMin, zMax } = SIGN_POINT_SIZE;
  const blend = Math.max(0, Math.min(1, (zoom - zMin) / (zMax - zMin)));
  return sizeWhenZoomedOut + (sizeWhenZoomedIn - sizeWhenZoomedOut) * blend;
}

/** Knack pin dimensions at zoom — kept in sync with cyan AGOL circles */
export function getSignPointStyleAtZoom(zoom: number) {
  const borderWidth = Math.round(
    scaleSignPointByZoom(
      zoom,
      SIGN_POINT_SIZE.stroke[0],
      SIGN_POINT_SIZE.stroke[1]
    )
  );
  const radius = scaleSignPointByZoom(
    zoom,
    SIGN_POINT_SIZE.radius[0],
    SIGN_POINT_SIZE.radius[1]
  );
  return {
    diameter: Math.round(radius * 2 + borderWidth * 2),
    borderWidth,
  };
}

/** Mapbox source and layer ids for the AGOL signs GeoJSON layer */
export const AGOL_SIGNS_SOURCE_ID = "agol-signs";
export const AGOL_SIGNS_LAYER_ID = "agol-signs-layer";

/**
 * Mapbox circle layer style for AGOL sign points.
 * Single WebGL layer for performance; radius grows with zoom for touch targets.
 */
export const AGOL_SIGNS_LAYER_STYLE: CircleLayerSpecification = {
  id: AGOL_SIGNS_LAYER_ID,
  type: "circle",
  source: AGOL_SIGNS_SOURCE_ID,
  paint: {
    // Interpolate radius by zoom so points get larger
    // (and easier to tap) as you zoom in.
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      SIGN_POINT_SIZE.zMin,
      SIGN_POINT_SIZE.radius[0],
      SIGN_POINT_SIZE.zMax,
      SIGN_POINT_SIZE.radius[1],
    ],
    "circle-color": "#00FFFF",
    "circle-stroke-color": "#FFFFFF",
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      SIGN_POINT_SIZE.zMin,
      SIGN_POINT_SIZE.stroke[0],
      SIGN_POINT_SIZE.zMax,
      SIGN_POINT_SIZE.stroke[1],
    ],
  },
};

export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-99, 29],
  [-96, 32],
];

export const DEFAULT_MAP_PARAMS = {
  touchPitch: false,
  dragRotate: false,
  boxZoom: false,
  mapboxAccessToken: MAPBOX_TOKEN,
  maxBounds: MAP_MAX_BOUNDS,
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
};

/*
 * copied from VZ, keeping for future work
 */

// interface Layers {
//   aerials: RasterLayerSpecification;
//   streetLabels: SymbolLayerSpecification;
// }

// const LAYERS: Layers = {
//   aerials: {
//     id: "simple-tiles",
//     type: "raster",
//     source: "raster-tiles",
//   },
//   streetLabels: {
//     // borrowed from mapbox mapbox streets v11 style
//     id: "street-labels",
//     type: "symbol",
//     metadata: {
//       "mapbox:featureComponent": "road-network",
//       "mapbox:group": "Road network, road-labels",
//     },
//     source: "composite",
//     "source-layer": "road",
//     minzoom: 12,
//     filter: [
//       "all",
//       ["has", "name"],
//       [
//         "match",
//         ["get", "class"],
//         [
//           "motorway",
//           "trunk",
//           "primary",
//           "secondary",
//           "tertiary",
//           "street",
//           "street_limited",
//         ],
//         true,
//         false,
//       ],
//     ],
//     layout: {
//       "text-size": [
//         "interpolate",
//         ["linear"],
//         ["zoom"],
//         10,
//         [
//           "match",
//           ["get", "class"],
//           ["motorway", "trunk", "primary", "secondary", "tertiary"],
//           10,
//           9,
//         ],
//         18,
//         [
//           "match",
//           ["get", "class"],
//           ["motorway", "trunk", "primary", "secondary", "tertiary"],
//           16,
//           14,
//         ],
//       ],
//       "text-max-angle": 30,
//       "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
//       "symbol-placement": "line",
//       "text-padding": 1,
//       "text-rotation-alignment": "map",
//       "text-pitch-alignment": "viewport",
//       "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
//       "text-letter-spacing": 0.01,
//     },
//     paint: {
//       "text-color": "#fff",
//       "text-halo-color": "#000",
//       "text-halo-width": 1,
//     },
//   },
// };

// export const LOCATION_MAP_CONFIG = {
//   mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
//   sources: {
//     aerials: {
//       id: "raster-tiles",
//       type: "raster",
//       tiles: [
//         `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${NEARMAP_KEY}`,
//       ],
//       tileSize: 256,
//     },
//   },
//   layers: LAYERS,
// };
