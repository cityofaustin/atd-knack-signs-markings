"use client";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";
import { useFormatSignsRecords, useFormatLocation } from "@/utils/mapUtils";

// Dynamic import with SSR disabled to prevent Mapbox WebWorker transpilation issues
// See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className={styles.map}>Loading map...</div>,
});

export default function Home() {
  const knackPayload = useIFrameMessenger();

  const editLocation = useFormatLocation(knackPayload);
  const signs = useFormatSignsRecords(knackPayload);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map
            signs={signs}
            messageType={knackPayload?.message}
            editLocation={editLocation}
          />
        </div>
      </main>
    </div>
  );
}
