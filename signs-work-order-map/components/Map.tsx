"use client";
import { useCallback, useState, useEffect, useRef } from "react";
import MapGL, {
  MapRef,
  Marker,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import GeocoderControl from "@/components/MapGeocoderControl";
import { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import SignPopup from "./SignPopup";
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

export default function Map({ location, signs }: MapProps) {
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
    // send location to Knack
    window.parent.postMessage(
      { message: "LAT_LON_FIELDS", lat: latitude, lng: longitude },
      "https://atd.knack.com"
    );
  }, []);

  const [mapLatLon, setMapLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });

  const bounds = useFormatBounds(signs);
  const signPins = useCreateSignPins(signs, setPopupInfo);
  const geoLocation = useGeoLocation();

  /**
   * If there are no location pins and we have a geolocation point
   * center map at geolocation
   */
  useEffect(() => {
    if (!mapRef?.current || signs.length > 0) {
      return;
    }
    if (geoLocation?.latitude && geoLocation.longitude) {
      mapRef.current.jumpTo({
        center: [geoLocation?.longitude, geoLocation?.latitude],
      });
    }
  }, [geoLocation, signs]);

  /**
   * Zoom to bounding box containing location pins
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
    >
      {signs.length < 1 && mapLatLon?.latitude && mapLatLon?.longitude && (
        <Marker
          longitude={mapLatLon.longitude}
          latitude={mapLatLon.latitude}
          // draggable
          //red?
        />
      )}

      {signPins}

      {
        // the add location marker, work will be completed in a following PR
        location?.latitude && location?.longitude && (
          <Marker latitude={location.latitude} longitude={location.longitude} />
        )
      }

      {popupInfo && (
        <SignPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      )}

      <GeocoderControl position="top-left" marker={true} />
      <GeolocateControl
        position="top-left"
        showUserLocation={false}
        fitBoundsOptions={{ maxZoom: 16, duration: 0 }}
      />
      <NavigationControl position="bottom-right" showCompass={false} />
    </MapGL>
  );
}
