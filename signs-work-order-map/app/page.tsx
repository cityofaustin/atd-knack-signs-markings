"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { iFrameMessenger } from "@/utils/iFrameMessenger";

export default function Home() {
  iFrameMessenger();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map />
        </div>
      </main>
    </div>
  );
}
