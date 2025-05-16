"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";

export default function Home() {
  const knackMessage = useIFrameMessenger();

  const knackData = knackMessage.records;

  const signsObjects =
    knackData && knackData.map(sign => {
        const signObj = {};
        signObj["id"] = sign.id;
        signObj["lat"] = sign.field_3300_raw.latitude;
        signObj["lng"] = sign.field_3300_raw.longitude;
        signObj["spatialId"] = sign.field_3297;
        return signObj;
      });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map data={signsObjects}/>
        </div>
      </main>
    </div>
  );
}
