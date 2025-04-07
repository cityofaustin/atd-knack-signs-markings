"use client"
import styles from "./page.module.css";
import Map from "@/components/Map"

export default function Home() {
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
