"use client";
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import MapGL, {
  MapRef,
  Marker,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import GeocoderControl from "@/components/MapGeocoderControl";
import SignPopup from "./SignPopup";
import { MapProps, LatLon, Sign } from "@/types/map";
import { formatBounds } from "@/utils/mapUtils";
import {
  DEFAULT_MAP_PARAMS,
  DEFAULT_MAP_PAN_ZOOM,
  MAP_COORDINATE_PRECISION,
} from "@/config/map";

export default function Map({ location, signs, messageType }: MapProps) {
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
    // send location to Knack -- this shouldnt happen during certain views? or does it matter?
    window.parent.postMessage(
      { message: "LAT_LON_FIELDS", lat: latitude, lng: longitude },
      "*"
    );
  }, []);

  const [mapLatLon, setMapLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });

  const bounds = formatBounds(signs);

  const signPins = useMemo(
    () =>
      signs.map((sign: Sign) => (
        <Marker
          key={`marker-${sign.id}`}
          longitude={sign.lng}
          latitude={sign.lat}
          anchor="bottom"
          color={sign.locationDetailPage ? "red" : undefined}
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            console.log(sign);
            setPopupInfo(sign);
          }}
        />
      )),
    [signs]
  );

  useEffect(() => {
    if (!mapRef?.current || !bounds) {
      return;
    }
    mapRef.current.fitBounds(bounds, {
      padding: 100,
    });
  }, [bounds]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
        // bounds: bounds,
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
        // when do we show location vs signs? when there are no signs?
        /* {location?.latitude && location?.longitude && (
        <Marker latitude={location.latitude} longitude={location.longitude} />
      )} */
      }

      {popupInfo && (
        <SignPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      )}

      <GeocoderControl position="top-left" marker={true} />
    </MapGL>
  );
}
