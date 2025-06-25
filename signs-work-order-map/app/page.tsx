"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";
import { useFormatSignsRecords, useFormatLocation } from "@/utils/mapUtils";

export default function Home() {
  const knackPayload = useIFrameMessenger();

  console.log(knackPayload);

  // const location = useFormatLocation(knackPayload);
  const signs = useFormatSignsRecords(knackPayload);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map signs={signs} messageType={knackPayload?.message}/>
        </div>
      </main>
    </div>
  );
}
