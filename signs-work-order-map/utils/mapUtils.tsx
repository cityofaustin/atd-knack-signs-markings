import { useEffect, useMemo, useState } from "react";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import { LngLatBoundsLike } from "mapbox-gl";
import { Marker } from "react-map-gl/mapbox";
import { Sign, KnackToIFrameMessage, LatLon } from "@/types/map";
import {
  MAP_COORDINATE_PRECISION,
  getSignPointStyleAtZoom,
} from "@/config/map";
import { useSignAssetsFeatureService } from "@/utils/agol";

/**
 * Takes array of Signs from knack payload and if signs exist, returns bounding box for signs
 * @param signs Array of Signs
 * @returns bbox extent in [minX, minY, maxX, maxY] order or undefined
 */
export const useFormatBounds = (signs: Sign[]): undefined | LngLatBoundsLike =>
  useMemo(() => {
    if (signs.length === 0) {
      return undefined;
    }
    const signLatLonArray = signs.map((sign: Sign) => [sign.lng, sign.lat]);

    const lineStringFeature =
      // if there is only one sign in the array, create the linestring for the bounding box using the one sign
      signLatLonArray.length < 2
        ? lineString([
            signLatLonArray[0],
            [signLatLonArray[0][0], signLatLonArray[0][1]],
          ])
        : lineString(signLatLonArray);

    const [minLng, minLat, maxLng, maxLat] = bbox(lineStringFeature);
    return [minLng, minLat, maxLng, maxLat];
  }, [signs]);

/**
 * Function that takes data from knack app and depending on message type, returns array of signs or empty array
 * @param knackPayload - message from Knack via IFrameMessage
 * @returns Array of Signs or empty array if no sign data
 */
export const useFormatSignsRecords = (
  knackPayload: KnackToIFrameMessage | null
): Sign[] =>
  useMemo(() => {
    if (!knackPayload) return [];
    if (knackPayload?.message === "OPEN_LOCATION_EDITOR") {
      return [];
    }

    if (
      knackPayload.message !== "LOAD_WORK_ORDER_DETAILS_PAGE" &&
      knackPayload.message !== "LOAD_WORK_ORDER_LOCATION_DETAILS_PAGE"
    ) {
      return [];
    }

    const records = knackPayload.payload?.records;
    if (!Array.isArray(records)) {
      return [];
    }

    const locationId =
      knackPayload.message === "LOAD_WORK_ORDER_LOCATION_DETAILS_PAGE"
        ? knackPayload.payload.locationRecordId
        : null;

    // Knack will save undefined latitudes and longitudes, this filters those out.
    const signsArray: Sign[] = records.reduce(
      (acc: Sign[], sign) => {
        if (sign.field_3300_raw.latitude && sign.field_3300_raw.longitude) {
          const assetLocationId = sign.field_4461_raw ?? sign.field_4461;
          const hasAssetLocationId =
            assetLocationId != null && String(assetLocationId).trim() !== "";
          const newSign: Sign = {
            id: sign.id,
            lat: sign.field_3300_raw.latitude,
            lng: sign.field_3300_raw.longitude,
            spatialId: sign.field_3297,
            workOrderId: knackPayload.payload.workOrderId,
            isLocationDetailPage: sign.id === locationId,
            isNewLocation: !hasAssetLocationId,
            ...(hasAssetLocationId
              ? { attributes: { ASSET_LOCATION_ID: assetLocationId } }
              : {}),
          };
          acc.push(newSign);
        }
        return acc;
      },
      []
    );

    return signsArray;
  }, [knackPayload]);

/**
 * Function that takes data from knack app and depending on message type, returns location
 * @param knackPayload - message from Knack via IFrameMessage
 * @returns LatLon object or null
 */
export const useFormatLocation = (
  knackPayload: KnackToIFrameMessage | null
): LatLon | null =>
  useMemo(() => {
    if (!knackPayload || knackPayload?.message !== "OPEN_LOCATION_EDITOR") {
      return null;
    }

    return {
      longitude: knackPayload.payload.location.longitude,
      latitude: knackPayload.payload.location.latitude,
    };
  }, [knackPayload]);

/**
 * Takes array of Knack Signs and returns array of map markers.
 * AGOL signs are rendered via a GeoJSON Layer in Map.tsx for performance.
 *
 * Point styling:
 * - Red dot: Location detail page sign (isLocationDetailPage = true)
 * - Yellow dot: Existing Knack work order sign
 * - Green dot with "NEW" label: Sign created via "Create Location" (no AGOL link)
 *
 * @param signs Array of Knack Signs
 * @param setPopupInfo State setter for popup display
 * @returns Array of Map Markers
 */
export const useCreateSignPins = (
  signs: Sign[],
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>,
  zoom: number
) =>
  useMemo(() => {
    const { diameter: pointSizePx, borderWidth: pointBorderPx } =
      getSignPointStyleAtZoom(zoom);

    return signs.map((sign: Sign) => {
        if (!sign.lat || !sign.lng) return null;
        const modifierClass = sign.isLocationDetailPage
          ? "work-order-sign-point--detail"
          : sign.isNewLocation
            ? "work-order-sign-point--new"
            : "work-order-sign-point--existing";
        return (
          <Marker
            key={`marker-${sign.id}`}
            longitude={sign.lng}
            latitude={sign.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(sign);
            }}
          >
            <div
              className={`work-order-sign-point ${modifierClass}`}
              style={{
                width: pointSizePx,
                height: pointSizePx,
                borderWidth: pointBorderPx,
              }}
              role="button"
              aria-label={
                sign.isNewLocation
                  ? "New work order sign location"
                  : "Work order sign location"
              }
            >
              {sign.isNewLocation && (
                <span className="work-order-sign-point__label">NEW</span>
              )}
            </div>
          </Marker>
        );
      });
  }, [signs, setPopupInfo, zoom]);

/**
 * @returns If geolocation permissions are on, return LatLon
 */
export const useGeoLocation = () => {
  const [geoLocation, setGeoLocation] = useState<LatLon | undefined>(undefined);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        setGeoLocation({
          latitude: +coords.latitude.toFixed(MAP_COORDINATE_PRECISION),
          longitude: +coords.longitude.toFixed(MAP_COORDINATE_PRECISION),
        });
      });
    }
  }, []);

  return geoLocation;
};

/**
 * Custom hook to fetch AGOL sign assets based on map bounds.
 * Returns GeoJSON for use with MapGL Source/Layer (single WebGL layer, better performance).
 *
 * @param bounds Current map bounds
 * @param enabled Whether to fetch data (useful for disabling during initial load)
 * @returns Object containing GeoJSON FeatureCollection, loading state, and error state
 */
export const useAGOLSignAssets = (
  bounds: { north: number; south: number; east: number; west: number } | null,
  enabled: boolean = true
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geojson = useSignAssetsFeatureService(
    bounds,
    enabled,
    setLoading,
    setError
  );

  return {
    agolSignsGeoJSON: geojson,
    featureCount: geojson.features.length,
    loading,
    error,
  };
};

/**
 * Converts a GeoJSON point feature from the AGOL layer (e.g. from map click) into a Sign
 * for use in the popup.
 *
 * @param feature Clicked GeoJSON point feature with AGOL properties (OBJECTID_1, etc.)
 * @returns Sign for popup, or null if feature is invalid
 */
export function agolFeatureToSign(feature: unknown): Sign | null {
  const f = feature as {
    properties?: Record<string, unknown> | null;
    geometry?: { type: string; coordinates?: unknown };
  };
  const { properties, geometry } = f;
  if (
    !geometry ||
    geometry.type !== "Point" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length < 2
  ) {
    return null;
  }
  if (!properties) return null;

  const [lng, lat] = geometry.coordinates as [number, number];
  const objectId = properties.OBJECTID_1;
  const spatialId =
    typeof objectId === "number" ? objectId : Number(objectId) || 0;

  return {
    id: `agol-${spatialId}`,
    lng,
    lat,
    spatialId,
    workOrderId: "",
    isLocationDetailPage: false,
    source: "agol",
    attributes: properties,
  };
}

type AgolFeature = {
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: number[] };
};

function normalizeAssetLocationId(id: unknown): string | null {
  if (id == null) return null;
  const normalized = String(id).trim();
  return normalized === "" ? null : normalized;
}

function isAgolPointFeature(
  feature: AgolFeature
): feature is AgolFeature & {
  geometry: { type: "Point"; coordinates: [number, number] };
} {
  return (
    feature.geometry.type === "Point" &&
    feature.geometry.coordinates.length >= 2
  );
}

function buildAgolIndexes(agolFeatures: ReadonlyArray<AgolFeature>) {
  const byLocationId = new Map<string, AgolFeature>();

  for (const feature of agolFeatures) {
    if (!isAgolPointFeature(feature)) continue;

    const locationId = normalizeAssetLocationId(
      feature.properties.ASSET_LOCATION_ID
    );
    if (locationId && !byLocationId.has(locationId)) {
      byLocationId.set(locationId, feature);
    }
  }

  return { byLocationId };
}

/**
 * For each Knack sign, find the corresponding AGOL feature and merge its
 * properties into the sign's `attributes`.
 *
 * Matched on ASSET_LOCATION_ID (Knack field_4461 / AGOL ASSET_LOCATION_ID).
 * Signs without a location ID are not merged (e.g. Create Location flow).
 *
 * Returns the enriched signs and matched AGOL `OBJECTID_1` values so the caller
 * can filter them out of the AGOL layer.
 */
export function enrichKnackSignsWithAgol(
  knackSigns: Sign[],
  agolFeatures: ReadonlyArray<AgolFeature>
): {
  enrichedSigns: Sign[];
  matchedAgolObjectIds: Set<unknown>;
} {
  const matchedAgolObjectIds = new Set<unknown>();
  const { byLocationId } = buildAgolIndexes(agolFeatures);

  const enrichedSigns = knackSigns.map((sign) => {
    const signLocationId = normalizeAssetLocationId(
      sign.attributes?.ASSET_LOCATION_ID
    );

    if (!signLocationId) return sign;

    const bestMatch = byLocationId.get(signLocationId);
    if (!bestMatch) return sign;

    matchedAgolObjectIds.add(bestMatch.properties.OBJECTID_1);

    return {
      ...sign,
      attributes: {
        ...bestMatch.properties,
        ...(sign.attributes ?? {}),
      },
    };
  });

  return { enrichedSigns, matchedAgolObjectIds };
}

/**
 * Helper function to get current map bounds from MapRef
 * @param mapRef Reference to the map instance
 * @returns Map bounds in lat/lon format or null if map not ready
 */
export const getMapBounds = (mapRef: React.RefObject<any>) => {
  if (!mapRef.current) return null;

  try {
    const bounds = mapRef.current.getBounds();
    return {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
  } catch (error) {
    console.error("Error getting map bounds:", error);
    return null;
  }
};
