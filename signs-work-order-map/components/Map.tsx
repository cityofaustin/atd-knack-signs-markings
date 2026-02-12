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
import FullscreenControl from "@/components/FullscreenControl";
import SignPopup from "./SignPopup";
import { MapStatusIndicator } from "./MapStatusIndicator";
import { sendLatLonToParent } from "@/utils/iFrameMessenger";
import { MapProps, LatLon, Sign } from "@/types/map";
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
  const [zoom, setZoom] = useState<number>(DEFAULT_MAP_PAN_ZOOM.zoom);
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

    sendLatLonToParent({ latitude, longitude });
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

    sendLatLonToParent({ latitude, longitude });
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
        sendLatLonToParent(mapLatLon);
      }}
    >
      {
        // red "add location" marker that is situated at center of map. This marker's location is
        // what is sent to knack in the LAT_LON_UPDATE payload message
        mapLatLon?.latitude &&
          mapLatLon?.longitude &&
          messageType !== "KNACK_LOCATION_DETAILS" && (
            <Marker
              longitude={mapLatLon.longitude}
              latitude={mapLatLon.latitude}
              color={"red"}
            />
          )
      }

      {signPins}

      {isZoomedInEnough && agolSignsGeoJSON.features.length > 0 && (
        <Source id={AGOL_SIGNS_SOURCE_ID} type="geojson" data={agolSignsGeoJSON}>
          <Layer {...AGOL_SIGNS_LAYER_STYLE} />
        </Source>
      )}

      {popupInfo && (
        <SignPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      )}

      {/* Status indicators for AGOL data */}
      {!isZoomedInEnough && (
        <MapStatusIndicator
          type="loading"
          message="Zoom in to view sign features"
          position={{ top: "10px", right: "10px" }}
        />
      )}
      {isZoomedInEnough && agolLoading && (
        <MapStatusIndicator type="loading" message="Loading sign assets..." />
      )}
      {isZoomedInEnough && agolError && (
        <MapStatusIndicator
          type="error"
          message={`Error loading signs: ${agolError}`}
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
      <FullscreenControl position="bottom-right" />
    </MapGL>
  );
}
