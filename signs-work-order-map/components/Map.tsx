"use client";
import { useCallback, useState, useEffect, useRef } from "react";
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
export default function Map({ signs, messageType }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<Sign | null>(null);
  const onDrag = useCallback((event: ViewStateChangeEvent) => {
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

  const [mapLatLon, setMapLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });

  const bounds = useFormatBounds(signs);
  const signPins = useCreateSignPins(signs, setPopupInfo);
  const geoLocation = useGeoLocation();

  /**
   * If there are no sign location pins and we have a geolocation point center
   * map at geolocation. Set add location marker to same coordindates as geolocation
   */
  useEffect(() => {
    if (!mapRef?.current || signs.length > 0) {
      return;
    }
    if (geoLocation?.latitude && geoLocation?.longitude) {
      mapRef.current.jumpTo({
        center: [geoLocation?.longitude, geoLocation?.latitude],
      });

      setMapLatLon({
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
      });
    }
  }, [geoLocation, signs]);

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
      onDrag={onDrag}
      onLoad={() => {
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
              anchor="bottom"
              color={"red"}
              rotation={45} // trying this now to differentiate instead of pulse
            />
          )
      }

      {signPins}
      {popupInfo && (
        <SignPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
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
