"use client";
import { useCallback, useState } from "react";
import MapGL, { Marker, ViewStateChangeEvent } from "react-map-gl/mapbox";
import GeocoderControl from "@/components/MapGeocoderControl";

import {
  DEFAULT_MAP_PARAMS,
  DEFAULT_MAP_PAN_ZOOM,
  MAP_COORDINATE_PRECISION,
} from "@/config/map";

interface LatLon {
  latitude: number;
  longitude: number;
}

export default function Map({ data }) {
  console.log(data);
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
  }, []);

  const [mapLatLon, setMapLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });
  return (
    <MapGL
      initialViewState={{
        latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      {...DEFAULT_MAP_PARAMS}
      onDrag={onDrag}
    >
      {/* <Marker
        longitude={mapLatLon.longitude}
        latitude={mapLatLon.latitude}
        // draggable
      /> */}

      {data &&
        data.map((sign) => (
          <Marker
            key={sign.id}
            anchor="bottom"
            longitude={sign.lng}
            latitude={sign.lat}
            // coordinates={[sign.lng, sign.lat]}
            // onClick={() => this.signClick(sign.id)}
          />
        ))}
      {/* <img src="/icons8-marker-40.png" alt="blue marker" />
                        </Marker> */}

      <GeocoderControl position="top-left" marker={true} />
    </MapGL>
  );
}
