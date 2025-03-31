"use client"; // why is it telling me to do this
import styles from "./page.module.css";
import MapGL from "react-map-gl/mapbox";

import GeocoderControl from "@/components/MapGeocoderControl";

import { DEFAULT_MAP_PARAMS, DEFAULT_MAP_PAN_ZOOM } from "@/config/map";

export default function Home() {
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
          >
            <GeocoderControl position="top-left" marker={true} />
          </MapGL>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
