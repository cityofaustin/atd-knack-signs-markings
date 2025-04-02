"use client";
import { useCallback, useState } from "react";
import styles from "./page.module.css";
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

export default function Home() {
  const onMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    // truncate values to our preferred precision
    const latitude = +e.viewState.latitude.toFixed(MAP_COORDINATE_PRECISION);
    const longitude = +e.viewState.longitude.toFixed(MAP_COORDINATE_PRECISION);
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
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <MapGL
            initialViewState={{
              latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
              longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
              zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
            }}
            {...DEFAULT_MAP_PARAMS}
            onMoveEnd={onMoveEnd}
          >
            <Marker
              longitude={mapLatLon.longitude}
              latitude={mapLatLon.latitude}
              // draggable
            />
            <GeocoderControl position="top-left" marker={true} />
          </MapGL>
        </div>
      </main>
    </div>
  );
}
