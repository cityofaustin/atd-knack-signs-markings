"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";
import { useFormatSignsRecords, useFormatLocation } from "@/utils/mapUtils";

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
