"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";
import { useFormatSignsRecords, useFormatLocation } from "@/utils/mapUtils";

const STANDALONE_TIMEOUT_MS = 3000;

// Dynamic import with SSR disabled to prevent Mapbox WebWorker transpilation issues
// See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className={styles.map} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="map-status-indicator map-status-indicator--loading">
        <span aria-hidden="true">⏳</span>
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

function LoadingOrStandalonePrompt({
  showStandalonePrompt,
  onRenderAnyway,
}: {
  showStandalonePrompt: boolean;
  onRenderAnyway: () => void;
}) {
  if (!showStandalonePrompt) {
    return (
      <div className="map-status-indicator map-status-indicator--loading">
        <span aria-hidden="true">⏳</span>
        <span>Loading locations...</span>
      </div>
    );
  }
  return (
    <div className="map-status-indicator map-status-indicator--loading" style={{ flexDirection: "column", gap: "12px", textAlign: "center" }}>
      <span>No Knack payload found.</span>
      <button
        type="button"
        onClick={onRenderAnyway}
        className="btn btn-primary btn-sm"
      >
        Render map anyway
      </button>
    </div>
  );
}

export default function Home() {
  const knackPayload = useIFrameMessenger();
  const editLocation = useFormatLocation(knackPayload);
  const signs = useFormatSignsRecords(knackPayload);

  const [showStandalonePrompt, setShowStandalonePrompt] = useState(false);
  const [standaloneOverride, setStandaloneOverride] = useState(false);

  useEffect(() => {
    if (knackPayload) return;
    const timer = setTimeout(() => setShowStandalonePrompt(true), STANDALONE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [knackPayload]);

  const shouldRenderMap = knackPayload !== null || standaloneOverride;

  if (!shouldRenderMap) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div
            className={styles.map}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <LoadingOrStandalonePrompt
              showStandalonePrompt={showStandalonePrompt}
              onRenderAnyway={() => setStandaloneOverride(true)}
            />
          </div>
        </main>
      </div>
    );
  }

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
