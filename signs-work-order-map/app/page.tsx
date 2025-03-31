"use client"; // why is it telling me to do this
import { useCallback } from "react";
import styles from "./page.module.css";
import MapGL, { ViewStateChangeEvent } from "react-map-gl/mapbox";

import GeocoderControl from "@/components/MapGeocoderControl";

import { DEFAULT_MAP_PARAMS, DEFAULT_MAP_PAN_ZOOM } from "@/config/map";

export default function Home() {
  const onMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    // truncate values to our preferred precision // store as var?
    const latitude = +e.viewState.latitude.toFixed(8);
    const longitude = +e.viewState.longitude.toFixed(8);
    console.log(latitude, longitude);
    // setMapLatLon({
    //   latitude,
    //   longitude,
    // });
  }, []);

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
            {/* do i include the marker here */}
            <GeocoderControl position="top-left" marker={true} />
          </MapGL>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
