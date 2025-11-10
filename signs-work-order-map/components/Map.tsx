"use client";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import MapGL, {
  MapRef,
  Marker,
  ViewStateChangeEvent,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/mapbox";
import GeocoderControl from "@/components/MapGeocoderControl";
import SignPopup from "./SignPopup";
import { sendLatLonToParent } from "@/utils/iFrameMessenger";
import { MapProps, LatLon, Sign } from "@/types/map";
import {
  useCreateSignPins,
  useFormatBounds,
  useGeoLocation,
  useAGOLSignAssets,
  getMapBounds,
} from "@/utils/mapUtils";
import {
  DEFAULT_MAP_PARAMS,
  DEFAULT_MAP_PAN_ZOOM,
  MAP_COORDINATE_PRECISION,
} from "@/config/map";

/**
 *
 * @param signs Array of Signs from knack payload, or empty array
 * @param messageType String from knack payload
 * @returns
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
  const updateCenterMarker = useCallback((event: ViewStateChangeEvent) => {
    // truncate values to our preferred precision
    const latitude = +event.viewState.latitude.toFixed(
      MAP_COORDINATE_PRECISION
    );
    const longitude = +event.viewState.longitude.toFixed(
      MAP_COORDINATE_PRECISION
    );
    setMapLatLon({
      latitude,
      longitude,
    });

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

  const bounds = useFormatBounds(signs);
  const geoLocation = useGeoLocation();

  // Fetch AGOL sign assets based on current map bounds
  const {
    agolSigns,
    loading: agolLoading,
    error: agolError,
  } = useAGOLSignAssets(
    mapBounds,
    mapLoaded // Only fetch when map is loaded
  );

  // Combine Knack signs with AGOL signs
  const allSigns = useMemo(() => {
    // Mark Knack signs with source
    const knackSigns = signs.map((sign) => ({
      ...sign,
      source: "knack" as const,
    }));
    return [...knackSigns, ...agolSigns];
  }, [signs, agolSigns]);

  const signPins = useCreateSignPins(allSigns, setPopupInfo);

  /**
   * Map jumpTo center useEffect
   * If there are no sign location pins and not editing an existing location,
   * center at geolocation.
   * If editing an existing location, center at that location.
   * Set add location marker to same coordinates as center
   */
  useEffect(() => {
    if (!mapRef?.current || signs.length > 0) {
      return;
    }

    if (editLocation?.latitude && editLocation?.longitude) {
      mapRef.current.jumpTo({
        center: [editLocation?.longitude, editLocation?.latitude],
      });

      setMapLatLon({
        latitude: editLocation.latitude,
        longitude: editLocation.longitude,
      });
    } else if (geoLocation?.latitude && geoLocation?.longitude) {
      mapRef.current.jumpTo({
        center: [geoLocation?.longitude, geoLocation?.latitude],
      });

      setMapLatLon({
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
      });
    }
  }, [geoLocation, signs, messageType, editLocation]);

  /**
   * Zoom to bounding box containing location pins
   * and set "add location marker" coordinates to center
   */
  useEffect(() => {
    if (!mapRef?.current || !bounds) {
      return;
    }

    mapRef.current.fitBounds(bounds, {
      padding: 100,
      maxZoom: 16,
      duration: 0,
    });

    const { lng, lat } = mapRef.current.getCenter();
    setMapLatLon({
      latitude: +lat.toFixed(MAP_COORDINATE_PRECISION),
      longitude: +lng.toFixed(MAP_COORDINATE_PRECISION),
    });
  }, [bounds]);

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
      onDrag={updateCenterMarker}
      onZoom={updateCenterMarker}
      onMoveEnd={(e) => {
        updateCenterMarker(e);
        updateMapBounds();
      }}
      onLoad={() => {
        setMapLoaded(true);
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
      {popupInfo && (
        <SignPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      )}

      {/* Loading indicator for AGOL data */}
      {agolLoading && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          Loading sign assets...
        </div>
      )}

      {/* Error indicator for AGOL data */}
      {agolError && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 0, 0, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          Error loading signs: {agolError}
        </div>
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
  );
}
