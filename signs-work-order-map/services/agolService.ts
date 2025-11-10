/**
 * Service for fetching sign assets from ArcGIS Online (AGOL) Feature Layer
 */

export interface AGOLSignAsset {
  attributes: {
    OBJECTID_1: number;
    [key: string]: any;
  };
  geometry: {
    x: number;
    y: number;
    spatialReference?: {
      wkid: number;
    };
  };
}

export interface AGOLQueryResponse {
  features: AGOLSignAsset[];
  exceededTransferLimit?: boolean;
  spatialReference?: {
    wkid: number;
  };
}

export interface MapBounds {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/**
 * Configuration for AGOL service
 */
const AGOL_CONFIG = {
  // Base URL for the Sign Assets Maintenance feature layer
  BASE_URL:
    "https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/Sign_Assets_Maint/FeatureServer/1",

  // Token for authentication (optional - leave empty for public layers)
  TOKEN: process.env.NEXT_PUBLIC_AGOL_TOKEN || "",

  // Default spatial reference system (Texas State Plane Central)
  DEFAULT_SR: 4326, // Use WGS84 for input coordinates, let AGOL handle the conversion

  // Maximum number of records to fetch
  MAX_RECORD_COUNT: 8000,

  // Default output fields (you can expand this based on your needs)
  DEFAULT_OUT_FIELDS: "*", // Get all fields, or specify specific ones like 'OBJECTID_1,SIGN_TYPE,INSTALL_DATE'

  // Whether to require authentication (set to false for public layers)
  REQUIRE_AUTH: true,
};

/**
 * No coordinate conversion needed - we'll use WGS84 (EPSG:4326) directly
 * and let AGOL handle any necessary coordinate transformations
 */

/**
 * Convert map bounds from lat/lon to the format expected by AGOL
 * Using WGS84 coordinates directly - AGOL will handle coordinate transformation
 */
export function convertBoundsForAGOL(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}): MapBounds {
  // Use lat/lon coordinates directly (WGS84 / EPSG:4326)
  return {
    xmin: bounds.west, // longitude
    ymin: bounds.south, // latitude
    xmax: bounds.east, // longitude
    ymax: bounds.north, // latitude
  };
}

/**
 * Build query parameters for AGOL feature layer request
 */
function buildQueryParams(
  bounds: MapBounds,
  options: {
    outFields?: string;
    maxRecordCount?: number;
    resultOffset?: number;
    where?: string;
  } = {}
): URLSearchParams {
  const params = new URLSearchParams();

  // Format geometry as envelope
  const geometry = `${bounds.xmin},${bounds.ymin},${bounds.xmax},${bounds.ymax}`;

  params.set("f", "json"); // Use JSON format instead of PBF for easier parsing
  params.set("geometry", geometry);
  params.set("geometryType", "esriGeometryEnvelope");
  params.set("spatialRel", "esriSpatialRelIntersects");
  params.set("where", options.where || "1=1");
  params.set("outFields", options.outFields || AGOL_CONFIG.DEFAULT_OUT_FIELDS);
  params.set("returnGeometry", "true");
  params.set("maxRecordCountFactor", "4");
  params.set("resultOffset", (options.resultOffset || 0).toString());
  params.set(
    "resultRecordCount",
    (options.maxRecordCount || AGOL_CONFIG.MAX_RECORD_COUNT).toString()
  );
  params.set("orderByFields", "OBJECTID_1 ASC");
  params.set("inSR", AGOL_CONFIG.DEFAULT_SR.toString()); // Input spatial reference
  params.set("outSR", "4326"); // Output in WGS84 for easy use in web maps

  // Add token if available and authentication is required
  if (AGOL_CONFIG.REQUIRE_AUTH && AGOL_CONFIG.TOKEN) {
    params.set("token", AGOL_CONFIG.TOKEN);
  }

  return params;
}

/**
 * Fetch sign assets from AGOL feature layer for the given map bounds
 */
export async function fetchSignAssets(
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  },
  options: {
    outFields?: string;
    maxRecordCount?: number;
    where?: string;
  } = {}
): Promise<AGOLSignAsset[]> {
  try {
    // Convert bounds to AGOL format (WGS84)
    const agolBounds = convertBoundsForAGOL(bounds);

    // Build query parameters
    const queryParams = buildQueryParams(agolBounds, options);

    // Construct the full URL
    const url = `${AGOL_CONFIG.BASE_URL}/query?${queryParams.toString()}`;

    console.log("Fetching sign assets from AGOL:", url);

    // Make the request
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AGOLQueryResponse = await response.json();

    // Check for errors in the response
    if ("error" in data) {
      const errorData = data as any;

      // Handle token required error specifically
      if (
        errorData.error.code === 499 ||
        errorData.error.message === "Token Required"
      ) {
        throw new Error(
          "This AGOL feature layer requires authentication. " +
            "Either set NEXT_PUBLIC_AGOL_TOKEN in your environment or " +
            "contact your ArcGIS administrator to make the layer publicly accessible."
        );
      }

      throw new Error(`AGOL API error: ${errorData.error.message}`);
    }

    console.log(`Fetched ${data.features?.length || 0} sign assets from AGOL`);

    return data.features || [];
  } catch (error) {
    console.error("Error fetching sign assets from AGOL:", error);
    throw error;
  }
}

/**
 * Convert AGOL sign asset to a format compatible with your existing Sign interface
 */
export function convertAGOLAssetToSign(
  asset: AGOLSignAsset,
  index: number
): {
  id: string;
  lng: number;
  lat: number;
  spatialId: number;
  workOrderId: string;
  isLocationDetailPage: boolean;
  source: "agol";
  attributes: any;
} {
  // Coordinates should already be in WGS84 (lat/lon) due to outSR=4326 parameter
  const lat = asset.geometry.y;
  const lon = asset.geometry.x;

  return {
    id: `agol-${asset.attributes.OBJECTID_1}`,
    lng: lon,
    lat: lat,
    spatialId: asset.attributes.OBJECTID_1,
    workOrderId: "", // AGOL assets don't have work order IDs
    isLocationDetailPage: false,
    source: "agol",
    attributes: asset.attributes, // Store all AGOL attributes for popup display
  };
}

/**
 * Fetch and convert sign assets for use in your map component
 */
export async function fetchSignAssetsForMap(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}): Promise<
  Array<{
    id: string;
    lng: number;
    lat: number;
    spatialId: number;
    workOrderId: string;
    isLocationDetailPage: boolean;
    source: "agol";
    attributes: any;
  }>
> {
  const assets = await fetchSignAssets(bounds);
  return assets.map((asset, index) => convertAGOLAssetToSign(asset, index));
}
