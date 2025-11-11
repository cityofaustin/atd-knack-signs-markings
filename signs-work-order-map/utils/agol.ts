import { useEffect, useReducer, useRef } from "react";

/**
 * Provides a hook and supporting functions to query an AGOL feature service
 * given an input bbox. Uses GeoJSON format for better performance and
 * continuously accumulates features to avoid re-querying already loaded areas.
 *
 * Adapted from ATD MOPED project pattern:
 * https://github.com/cityofaustin/atd-moped/blob/ab2bc3eee7d4a35a6aa7c7fc162adede3fde4ec7/moped-editor/src/views/projects/projectView/ProjectComponents/utils/agol.js
 */

const AGOL_ENDPOINT =
  "https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services";

const DEFAULT_FEATURE_SERVICE_PARAMS = {
  where: "1=1",
  outFields: "*",
  geometryPrecision: 6,
  f: "pgeojson", // Use GeoJSON format for better performance
  returnGeometry: true,
  inSR: 4326,
  geometryType: "esriGeometryEnvelope",
  spatialRel: "esriSpatialRelEnvelopeIntersects",
};

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface AGOLFeature {
  type: "Feature";
  properties: {
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: AGOLFeature[];
}

interface FeatureAction {
  features: AGOLFeature[];
  featureIdProp: string;
}

interface UseFeatureServiceParams {
  name: string;
  layerId: number;
  bounds: MapBounds | null;
  isVisible: boolean;
  featureIdProp: string;
  setIsFetchingFeatures?: (loading: boolean) => void;
}

/**
 * Build query string for AGOL feature service request
 */
const getQueryString = (bounds: MapBounds): string => {
  const boundsArray = [bounds.west, bounds.south, bounds.east, bounds.north];
  const params = {
    ...DEFAULT_FEATURE_SERVICE_PARAMS,
    geometry: boundsArray.join(","),
  };

  return Object.entries(params)
    .map((param) => `${param[0]}=${encodeURIComponent(param[1])}`)
    .join("&");
};

/**
 * Remove duplicate features based on a unique property
 */
const deduplicateFeatures = (
  features: AGOLFeature[],
  featureIdProp: string
): AGOLFeature[] => {
  return features.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (f) => f.properties[featureIdProp] === value.properties[featureIdProp]
      )
  );
};

/**
 * Reducer to accumulate new features into the GeoJSON state
 * This prevents infinite recursion in useEffect when state depends on previous state
 */
const featureReducer = (
  geojson: FeatureCollection,
  action: FeatureAction
): FeatureCollection => {
  const currentFeatures = geojson.features.length > 0 ? geojson.features : [];
  const newFeatures = action.features.length > 0 ? action.features : [];

  const allFeatures = [...currentFeatures, ...newFeatures];
  const uniqueFeatures = deduplicateFeatures(allFeatures, action.featureIdProp);

  return {
    type: "FeatureCollection",
    features: uniqueFeatures,
  };
};

/**
 * Hook to query AGOL feature service for features within a bounding box
 * Continuously accumulates features into a single FeatureCollection for seamless map experience
 *
 * Key features:
 * - Persists already-queried features on the map
 * - Deduplicates overlapping query results
 * - Cancels in-flight requests when new ones are made
 * - Uses GeoJSON format for better performance
 *
 * Limitations:
 * - AGOL limits feature returns (typically 2k max)
 * - Memory usage can grow with extensive panning
 * - Should restrict queries to appropriate zoom levels
 */
export const useFeatureService = ({
  name,
  layerId,
  bounds,
  isVisible,
  featureIdProp,
  setIsFetchingFeatures,
}: UseFeatureServiceParams): FeatureCollection => {
  const [geojson, dispatchFeatureUpdate] = useReducer(featureReducer, {
    type: "FeatureCollection",
    features: [],
  });

  const controllerRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (!bounds || !isVisible) {
      return;
    }

    setIsFetchingFeatures?.(true);

    // Cancel any in-flight request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    const queryString = getQueryString(bounds);
    const url = `${AGOL_ENDPOINT}/${name}/FeatureServer/${layerId}/query?${queryString}`;

    console.log(
      `🔄 Fetching AGOL features from: ${name}/FeatureServer/${layerId}`
    );

    fetch(url, { signal: controllerRef.current?.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(`AGOL API error: ${data.error.message}`);
        }

        console.log(
          `✅ Fetched ${data.features?.length || 0} features from AGOL`
        );
        dispatchFeatureUpdate({
          features: data.features || [],
          featureIdProp,
        });
        setIsFetchingFeatures?.(false);
        controllerRef.current = undefined;
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.warn("🚫 AGOL fetch aborted by newer request");
        } else {
          console.error("❌ AGOL fetch error:", error);
        }
        setIsFetchingFeatures?.(false);
      });

    // Cleanup function
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [bounds, name, layerId, isVisible, featureIdProp, setIsFetchingFeatures]);

  return geojson;
};

/**
 * Hook specifically for Sign Assets Maintenance Public View
 * Provides a simplified interface for the signs application
 */
export const useSignAssetsFeatureService = (
  bounds: MapBounds | null,
  isVisible: boolean = true,
  setIsFetchingFeatures?: (loading: boolean) => void
): FeatureCollection => {
  return useFeatureService({
    name: "Sign_Assets_Maint_Public_View",
    layerId: 1,
    bounds,
    isVisible,
    featureIdProp: "OBJECTID_1",
    setIsFetchingFeatures,
  });
};

/**
 * Convert GeoJSON FeatureCollection to Sign array format for compatibility
 * with existing map components
 */
export const convertGeoJSONToSigns = (geojson: FeatureCollection) => {
  return geojson.features.map((feature, index) => ({
    id: `agol-${feature.properties.OBJECTID_1}`,
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    spatialId: feature.properties.OBJECTID_1,
    workOrderId: "",
    isLocationDetailPage: false,
    source: "agol" as const,
    attributes: feature.properties,
  }));
};

/**
 * Find a specific feature in the GeoJSON collection by ID
 */
export const findFeatureById = (
  geojson: FeatureCollection,
  featureId: string | number,
  idProperty: string = "OBJECTID_1"
): AGOLFeature | undefined => {
  return geojson.features.find(
    (feature) => feature.properties[idProperty] === featureId
  );
};
