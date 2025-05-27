"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";

export default function Home() {
  const knackMessage = useIFrameMessenger();

  console.log(knackMessage)

  const location = knackMessage.location;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map location={location} />
        </div>
      </main>
    </div>
  );
}
