"use client";
import {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
  startTransition,
} from "react";
import MapGL, {
  MapRef,
  Marker,
  ViewStateChangeEvent,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  MapMouseEvent,
} from "react-map-gl/mapbox";
import GeocoderControl from "@/components/MapGeocoderControl";
import SignPopup from "./SignPopup";
import LocationModeToggle from "./LocationModeToggle";
import { MapStatusIndicator } from "./MapStatusIndicator";
import {
  sendLatLonToParent,
  sendExistingLocationToParent,
  sendLocationModeToParent,
} from "@/utils/iFrameMessenger";
import {
  getStoredLocationMode,
  setStoredLocationMode,
} from "@/utils/locationModeStorage";
import { MapProps, LatLon, Sign, LocationMode } from "@/types/map";
import {
  useCreateSignPins,
  useFormatBounds,
  useGeoLocation,
  useAGOLSignAssets,
  getMapBounds,
  agolFeatureToSign,
} from "@/utils/mapUtils";
import {
  DEFAULT_MAP_PARAMS,
  DEFAULT_MAP_PAN_ZOOM,
  MAP_COORDINATE_PRECISION,
  AGOL_SIGNS_MIN_ZOOM,
  AGOL_SIGNS_LAYER_ID,
  AGOL_SIGNS_SOURCE_ID,
  AGOL_SIGNS_LAYER_STYLE,
} from "@/config/map";

/**
 * @param signs Array of Signs from knack payload, or empty array
 * @param messageType String from knack payload
 */
export default function Map({ signs, messageType, editLocation }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<Sign | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>(
    getStoredLocationMode
  );

  // Sync parent Knack app with restored mode after iframe reload
  useEffect(() => {
    sendLocationModeToParent(locationMode);
  }, [locationMode]);

  const handleLocationModeChange = useCallback((mode: LocationMode) => {
    setLocationMode(mode);
    setStoredLocationMode(mode);
  }, []);

  const showLocationToggle =
    messageType === "WORK_ORDER_SIGNS" || messageType === "EDIT_LOCATION";
  const isCreateMode = locationMode === "create";

  const [mapLatLon, setMapLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [initialViewApplied, setInitialViewApplied] = useState(false);
  const [zoom, setZoom] = useState<number>(DEFAULT_MAP_PAN_ZOOM.zoom);
  const locationModeRef = useRef<LocationMode>(locationMode);
  locationModeRef.current = locationMode;

  const updateCenterMarker = useCallback((event: ViewStateChangeEvent) => {
    // truncate values to our preferred precision
    const latitude = +event.viewState.latitude.toFixed(
      MAP_COORDINATE_PRECISION
    );
    const longitude = +event.viewState.longitude.toFixed(
      MAP_COORDINATE_PRECISION
    );
    const currentZoom = event.viewState.zoom;

    setMapLatLon({
      latitude,
      longitude,
    });
    setZoom(currentZoom);

    if (locationModeRef.current === "create") {
      sendLatLonToParent({ latitude, longitude });
    }
  }, []);

  // Update map bounds when the map moves
  const updateMapBounds = useCallback(() => {
    const bounds = getMapBounds(mapRef);
    if (bounds) {
      setMapBounds(bounds);
    }
  }, []);

  // when geolocation icon is tapped, set lat/lon state and send location to knack
  const onGeolocate = useCallback((data: GeolocationPosition) => {
    // truncate values to our preferred precision
    const latitude = +data.coords.latitude.toFixed(MAP_COORDINATE_PRECISION);
    const longitude = +data.coords.longitude.toFixed(MAP_COORDINATE_PRECISION);
    setMapLatLon({
      latitude,
      longitude,
    });

    if (locationModeRef.current === "create") {
      sendLatLonToParent({ latitude, longitude });
    }
  }, []);

  const signLocationBounds = useFormatBounds(signs);
  const geoLocation = useGeoLocation();

  // Only fetch AGOL signs when zoomed in enough for performance
  const isZoomedInEnough = zoom >= AGOL_SIGNS_MIN_ZOOM;

  // Fetch AGOL sign assets as GeoJSON for Layer rendering
  const {
    agolSignsGeoJSON,
    loading: agolLoading,
    error: agolError,
  } = useAGOLSignAssets(
    mapBounds,
    mapLoaded && isZoomedInEnough
  );

  const knackSigns = useMemo(
    () => signs.map((sign) => ({ ...sign, source: "knack" as const })),
    [signs]
  );
  const signPins = useCreateSignPins(knackSigns, setPopupInfo);

  const handleMouseEnter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "pointer";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor = "";
    }
  }, []);

  const handleAGOLLayerClick = useCallback(
    (e: MapMouseEvent) => {
      if (!e.features || e.features.length === 0) return;
      const sign = agolFeatureToSign(e.features[0]);
      if (sign) setPopupInfo(sign);
    },
    [setPopupInfo]
  );

  const handleSelectExistingLocation = useCallback((sign: Sign) => {
    const assetLocationId = sign.attributes?.ASSET_LOCATION_ID;
    sendExistingLocationToParent(
      { latitude: sign.lat, longitude: sign.lng },
      assetLocationId != null ? Number(assetLocationId) : ""
    );
  }, []);

  /**
   * Derive the initial map center position based on editLocation or geoLocation.
   * This is used to sync the marker position with the map center.
   */
  const initialCenter = useMemo(() => {
    if (signs.length > 0) return null;
    if (editLocation?.latitude && editLocation?.longitude) {
      return {
        latitude: editLocation.latitude,
        longitude: editLocation.longitude,
      };
    }
    if (geoLocation?.latitude && geoLocation?.longitude) {
      return {
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
      };
    }
    return null;
  }, [editLocation, geoLocation, signs.length]);

  /**
   * Map jumpTo center useEffect
   * If there are no sign location pins and not editing an existing location,
   * center at geolocation.
   * If editing an existing location, center at that location.
   */
  useEffect(() => {
    if (!mapRef?.current || !initialCenter) {
      return;
    }

    mapRef.current.jumpTo({
      center: [initialCenter.longitude, initialCenter.latitude],
    });
  }, [initialCenter]);

  /**
   * Sync mapLatLon state with initialCenter when it changes.
   * This ensures the marker position matches the map center.
   * Using startTransition to mark this as a non-urgent update.
   */
  useEffect(() => {
    if (initialCenter) {
      startTransition(() => {
        setMapLatLon(initialCenter);
      });
    }
  }, [initialCenter]);

  /**
   * Zoom to bounding box containing sign location pins
   * and set "add location marker" coordinates to center
   */
  useEffect(() => {
    if (!mapRef?.current || !signLocationBounds) {
      return;
    }

    mapRef.current.fitBounds(signLocationBounds, {
      padding: 100,
      maxZoom: 16,
      duration: 0,
    });

    const { lng, lat } = mapRef.current.getCenter();
    setMapLatLon({
      latitude: +lat.toFixed(MAP_COORDINATE_PRECISION),
      longitude: +lng.toFixed(MAP_COORDINATE_PRECISION),
    });
  }, [signLocationBounds]);

  return (
    <div
      className="map-container-wrapper"
      style={{
        opacity: initialViewApplied ? 1 : 0,
        pointerEvents: initialViewApplied ? "auto" : "none",
      }}
    >
      <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      cooperativeGestures={true}
      {...DEFAULT_MAP_PARAMS}
      interactiveLayerIds={isZoomedInEnough ? [AGOL_SIGNS_LAYER_ID] : []}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDrag={updateCenterMarker}
      onZoom={updateCenterMarker}
      onClick={(e) => {
        if (e.features && e.features.length > 0) {
          handleAGOLLayerClick(e);
          return;
        }
        if (popupInfo) setPopupInfo(null);
      }}
      onMoveEnd={(e) => {
        updateCenterMarker(e);
        const moveEndZoom = e.viewState.zoom;
        setZoom(moveEndZoom);
        updateMapBounds();
      }}
      onLoad={(e) => {
        const map = e.target;
        const initialZoom = map.getZoom();
        setMapLoaded(true);
        setZoom(initialZoom);
        updateMapBounds();

        if (signLocationBounds) {
          map.fitBounds(signLocationBounds, {
            padding: 100,
            maxZoom: 16,
            duration: 0,
          });
          const { lng, lat } = map.getCenter();
          const center = {
            latitude: +lat.toFixed(MAP_COORDINATE_PRECISION),
            longitude: +lng.toFixed(MAP_COORDINATE_PRECISION),
          };
          setMapLatLon(center);
          sendLatLonToParent(center);
        } else if (initialCenter) {
          map.jumpTo({
            center: [initialCenter.longitude, initialCenter.latitude],
          });
          setMapLatLon(initialCenter);
          sendLatLonToParent(initialCenter);
        } else {
          sendLatLonToParent(mapLatLon);
        }

        setInitialViewApplied(true);
      }}
    >
      {mapLatLon?.latitude &&
        mapLatLon?.longitude &&
        messageType !== "KNACK_LOCATION_DETAILS" &&
        isCreateMode && (
          <Marker
            longitude={mapLatLon.longitude}
            latitude={mapLatLon.latitude}
            color={"red"}
          />
        )}

      {signPins}

      {isZoomedInEnough && agolSignsGeoJSON.features.length > 0 && (
        <Source id={AGOL_SIGNS_SOURCE_ID} type="geojson" data={agolSignsGeoJSON}>
          <Layer {...AGOL_SIGNS_LAYER_STYLE} />
        </Source>
      )}

      {popupInfo && (
        <SignPopup
          popupInfo={popupInfo}
          setPopupInfo={setPopupInfo}
          locationMode={locationMode}
          onSelectExistingLocation={handleSelectExistingLocation}
        />
      )}

      {showLocationToggle && (
        <LocationModeToggle
          mode={locationMode}
          onModeChange={handleLocationModeChange}
        />
      )}

      {/* Status indicators for AGOL data — pushed below the toggle when it's visible */}
      {!isZoomedInEnough && (
        <MapStatusIndicator
          type="loading"
          message="Zoom in to view sign features"
          position={{
            top: showLocationToggle ? "48px" : "10px",
            right: "10px",
          }}
        />
      )}
      {isZoomedInEnough && agolLoading && (
        <MapStatusIndicator
          type="loading"
          message="Loading sign assets..."
          position={{
            top: showLocationToggle ? "48px" : "10px",
            right: "10px",
          }}
        />
      )}
      {isZoomedInEnough && agolError && (
        <MapStatusIndicator
          type="error"
          message={`Error loading signs: ${agolError}`}
          position={{
            top: showLocationToggle ? "48px" : "10px",
            right: "10px",
          }}
        />
      )}

      <GeocoderControl position="top-left" setMapLatLon={setMapLatLon} />
      <GeolocateControl
        position="top-left"
        showUserLocation={false}
        fitBoundsOptions={{ maxZoom: 16, duration: 0 }}
        onGeolocate={onGeolocate}
      />
      <NavigationControl position="bottom-right" showCompass={false} />
    </MapGL>
    </div>
  );
}
