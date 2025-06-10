"use client";
import { useMemo } from "react";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { KnackRecord, Sign, KnackToIFrameMessage } from "@/types/map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";

const formatSignsRecords = (
  knackPayload: KnackToIFrameMessage | null
): Sign[] =>
  useMemo(() => {
    if (!knackPayload) return [];
    if (
      knackPayload?.message === "EDIT_LOCATION" ||
      knackPayload?.message === "KNACK_GEOLOCATION"
    ) {
      return [];
    }
    console.log(knackPayload?.payload?.records);
    return knackPayload.payload.records.map((sign) => ({
      id: sign.id,
      lat: sign.field_3300_raw.latitude,
      lng: sign.field_3300_raw.longitude,
      spatialId: sign.field_3297,
      workOrderId: knackPayload.payload.workOrderId,
    }));
  }, [knackPayload]);

export default function Home() {
  const knackPayload = useIFrameMessenger();
  // const knackPayload = testpayload;

  console.log(knackPayload);

  const location = knackPayload?.payload?.location;
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
