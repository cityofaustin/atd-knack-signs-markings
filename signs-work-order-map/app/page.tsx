"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";
import { formatSignsRecords, formatLocation } from "@/utils/mapUtils";

export default function Home() {
  const knackPayload = useIFrameMessenger();

  console.log(knackPayload);

  const location = formatLocation(knackPayload);
  const signs = formatSignsRecords(knackPayload);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map location={location} signs={signs} />
        </div>
      </main>
    </div>
  );
}
