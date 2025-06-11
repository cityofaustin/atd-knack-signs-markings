"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { KnackRecord, Sign, KnackToIFrameMessage } from "@/types/map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";
import { formatSignsRecords } from "@/utils/mapUtils";



export default function Home() {
  const knackPayload = useIFrameMessenger();

  console.log(knackPayload);

  const location = knackPayload?.payload?.location; // turn this into a format location function
  // because we should zoom to location if it exists
  const signs = formatSignsRecords(knackPayload);
  console.log(signs);
  const messageType = knackPayload?.message;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map messageType={messageType} location={location} signs={signs} />
        </div>
      </main>
    </div>
  );
}
