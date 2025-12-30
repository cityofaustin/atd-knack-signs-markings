import { useEffect, useMemo, useState, useCallback, startTransition } from "react";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import { LngLatBoundsLike } from "mapbox-gl";
import { Marker } from "react-map-gl/mapbox";
import { Sign, KnackToIFrameMessage, LatLon } from "@/types/map";
import { MAP_COORDINATE_PRECISION } from "@/config/map";
import {
  useSignAssetsFeatureService,
  convertGeoJSONToSigns,
} from "@/utils/agol";

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
    if (knackPayload?.message === "EDIT_LOCATION") {
      return [];
    }

    const locationId =
      knackPayload.message === "KNACK_LOCATION_DETAILS"
        ? knackPayload?.payload?.locationRecordId
        : null;

    // Knack will save undefined latitudes and longitudes, this filters those out.
    const signsArray: Sign[] = knackPayload.payload.records.reduce(
      (acc: Sign[], sign) => {
        if (sign.field_3300_raw.latitude && sign.field_3300_raw.longitude) {
          const newSign = {
            id: sign.id,
            lat: sign.field_3300_raw.latitude,
            lng: sign.field_3300_raw.longitude,
            spatialId: sign.field_3297,
            workOrderId: knackPayload.payload.workOrderId,
            isLocationDetailPage: sign.id === locationId,
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
    if (!knackPayload || knackPayload?.message !== "EDIT_LOCATION") {
      return null;
    }

    return {
      longitude: knackPayload.payload.location.longitude,
      latitude: knackPayload.payload.location.latitude,
    };
  }, [knackPayload]);

/**
 * Custom marker component for AGOL signs (yellow dots with black stroke)
 * Styles are defined in globals.scss (.agol-marker)
 */
const AGOLMarker = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => <div onClick={onClick} className="agol-marker" />;

/**
 * Helper function to log AGOL sign data to console
 */
const logAGOLSignData = (sign: Sign) => {
  console.group(`🟡 AGOL Sign Asset - ID: ${sign.spatialId}`);
  console.info(
    "📍 Location:",
    `${sign.lat.toFixed(MAP_COORDINATE_PRECISION)}, ${sign.lng.toFixed(MAP_COORDINATE_PRECISION)}`
  );
  console.groupEnd();
};

/**
 * Takes array of Signs and returns array of map markers, one marker per sign
 *
 * Marker color logic:
 * - Red: Location detail page sign (isLocationDetailPage = true)
 * - Default blue: Knack work order signs (source = "knack" or undefined)
 * - Yellow dot: AGOL signs (source = "agol", uses custom AGOLMarker component)
 *
 * Interaction logic:
 * - Knack signs: Show popup with work order info when clicked
 * - AGOL signs: Log data to console when clicked (handled by AGOLMarker)
 *
 * @param signs Array of Signs (can include both Knack and AGOL signs)
 * @param setPopupInfo State setter for popup display
 * @returns Array of Map Markers
 */
export const useCreateSignPins = (
  signs: Sign[],
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>
) =>
  useMemo(
    () =>
      signs.map(
        (sign: Sign) =>
          sign.lat &&
          sign.lng && (
            <Marker
              key={`marker-${sign.id}`}
              longitude={sign.lng}
              latitude={sign.lat}
              // Only override color for location detail page (red)
              // All other signs use default color (AGOL uses custom marker component anyway)
              color={sign.isLocationDetailPage ? "red" : undefined}
              onClick={(e) => {
                // Only handle clicks for non-AGOL signs here
                // AGOL signs are handled by their custom AGOLMarker component
                if (sign.source !== "agol") {
                  // If we let the click event propagates to the map, it will immediately close the popup
                  // with `closeOnClick: true`
                  e.originalEvent.stopPropagation();
                  setPopupInfo(sign);
                }
              }}
            >
              {/* Custom marker for AGOL signs */}
              {sign.source === "agol" && (
                <AGOLMarker
                  onClick={(e) => {
                    e.stopPropagation();
                    logAGOLSignData(sign);
                  }}
                />
              )}
            </Marker>
          )
      ),
    [signs, setPopupInfo]
  );

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
 * Custom hook to fetch AGOL sign assets based on map bounds
 * @param bounds Current map bounds
 * @param enabled Whether to fetch data (useful for disabling during initial load)
 * @returns Object containing AGOL signs, loading state, and error state
 */
export const useAGOLSignAssets = (
  bounds: { north: number; south: number; east: number; west: number } | null,
  enabled: boolean = true
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the feature service hook with GeoJSON accumulation
  const geojson = useSignAssetsFeatureService(
    bounds,
    enabled,
    setLoading,
    setError
  );

  // Convert GeoJSON to Sign array format for compatibility
  const { agolSigns, conversionError } = useMemo(() => {
    try {
      return { agolSigns: convertGeoJSONToSigns(geojson), conversionError: null };
    } catch (err) {
      console.error("Error converting AGOL GeoJSON to signs:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      return { agolSigns: [], conversionError: errorMessage };
    }
  }, [geojson]);

  // Handle conversion error in an effect to avoid setState during render
  // Using startTransition to mark this as a non-urgent update
  useEffect(() => {
    if (conversionError && !error) {
      startTransition(() => {
        setError(conversionError);
      });
    }
  }, [conversionError, error]);

  return {
    agolSigns,
    loading,
    error,
  };
};

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
