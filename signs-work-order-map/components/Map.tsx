"use client";
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import MapGL, {
  Marker,
  ViewStateChangeEvent,
  MapRef,
} from "react-map-gl/mapbox";
import GeocoderControl from "@/components/MapGeocoderControl";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import SignPopup from "./SignPopup";

import {
  DEFAULT_MAP_PARAMS,
  DEFAULT_MAP_PAN_ZOOM,
  MAP_COORDINATE_PRECISION,
} from "@/config/map";

interface LatLon {
  latitude: number;
  longitude: number;
}

interface MapProps {
  location: [number, number] | undefined;
  signs: any;
  messageType: string | undefined; // refine this more to only be one of the specific messages?
}

export interface Sign {
  id: string;
  lng: number;
  lat: number;
  spatialId: number;
  workOrderId: string;
}

export default function Map({ location, signs, messageType }: MapProps) {
  console.log("SIGNS ", signs);
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
    console.log(latitude, longitude);
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

  const signArray = useMemo(() => {
    return signs.map((sign: Sign) => [sign.lng, sign.lat]);
  }, [signs]);

  console.log(signArray, signArray.length, mapRef.current);

  // const onClick = (event) => {
  const lineStringFeature =
    signArray.length < 2
      ? lineString([signArray[0], [signArray[0][0], signArray[0][1]]])
      : lineString(signArray);

  console.log("feature", lineStringFeature);

  useEffect(() => {
    const [minLng, minLat, maxLng, maxLat] = bbox(lineStringFeature);
    console.log(minLat, minLng, maxLat, maxLng);

    mapRef.current?.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 40, duration: 1000 }
    );
  }, [mapRef, lineStringFeature]);
  // };

  const signPins = useMemo(
    () =>
      signs.map((sign: Sign) => (
        <Marker
          key={`marker-${sign.id}`}
          longitude={sign.lng}
          latitude={sign.lat}
          anchor="bottom"
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

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      {...DEFAULT_MAP_PARAMS}
      onDrag={onDrag}
      // onClick={onClick}
    >
      {/* <Marker
        longitude={mapLatLon.longitude}
        latitude={mapLatLon.latitude}
        // draggable
      /> */}

      {signPins}

      {/* {location && location[0] && (
        <Marker latitude={location[0]} longitude={location[1]} />
      )} */}

      {popupInfo && (
        <SignPopup popupInfo={popupInfo} setPopupInfo={setPopupInfo} />
      )}

      <GeocoderControl position="top-left" marker={true} />
    </MapGL>
  );
}
