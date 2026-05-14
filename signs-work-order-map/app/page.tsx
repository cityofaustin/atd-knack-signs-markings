"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { useIFrameMessenger, useBannerMessage } from "@/utils/iFrameMessenger";
import { useFormatSignsRecords, useFormatLocation } from "@/utils/mapUtils";

const STANDALONE_TIMEOUT_MS = 3000;

// Dynamic import with SSR disabled to prevent Mapbox WebWorker transpilation issues
// See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className={styles.map}>
      <div className="map-status-indicator map-status-indicator--loading">
        <span aria-hidden="true">⏳</span>
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

/**
 * Shows a loading state while waiting for the Knack iframe to receive a work-order payload.
 * If the payload never arrives (timeout), shows an inline prompt — not a modal — with
 * “Render map anyway” so the map can still load for local dev or when embedded messaging fails.
 */
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
    <div
      className={`map-status-indicator map-status-indicator--loading map-status-indicator--column`}
    >
      <span>No work order locations found.</span>
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
  const { bannerText, clearBanner } = useBannerMessage();

  const [showStandalonePrompt, setShowStandalonePrompt] = useState(false);
  const [standaloneOverride, setStandaloneOverride] = useState(false);

  useEffect(() => {
    if (knackPayload) return;
    const timer = setTimeout(
      () => setShowStandalonePrompt(true),
      STANDALONE_TIMEOUT_MS
    );
    return () => clearTimeout(timer);
  }, [knackPayload]);

  const shouldRenderMap = knackPayload !== null || standaloneOverride;

  if (!shouldRenderMap) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.map}>
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
            bannerText={bannerText}
            onBannerDismiss={clearBanner}
          />
        </div>
      </main>
    </div>
  );
}
