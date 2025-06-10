"use client";
import { useMemo } from "react";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { KnackRecord, Sign } from "@/types/map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";

const formatSignsRecords = (records: KnackRecord[] | undefined): Sign[] =>
  useMemo(() => {
    console.log(records);
    if (!records || records.length < 1) {
      return [];
    }
    return records.map((sign) => ({
      id: sign.id,
      lat: sign.field_3300_raw.latitude,
      lng: sign.field_3300_raw.longitude,
      spatialId: sign.field_3300_raw.longitude,
    }));
  }, [records]);

export default function Home() {
  const knackPayload = useIFrameMessenger();
  // const knackPayload = testpayload;

  console.log(knackPayload)

  const location = knackPayload?.payload?.location;
  const signs = formatSignsRecords(knackPayload?.payload?.records);
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
