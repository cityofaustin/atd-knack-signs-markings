"use client";
import { useEffect, useState } from "react";

interface MapBannerProps {
  text: string;
  onDismiss: () => void;
}

const FADE_DELAY_MS = 5000;
const FADE_DURATION_MS = 500;

export default function MapBanner({ text, onDismiss }: MapBannerProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setFading(false);
    const fadeTimer = setTimeout(() => setFading(true), FADE_DELAY_MS);
    const removeTimer = setTimeout(onDismiss, FADE_DELAY_MS + FADE_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [text, onDismiss]);

  return (
    <div
      className={`map-banner${fading ? " map-banner--fade" : ""}`}
      role="status"
    >
      <span>{text}</span>
      <button
        type="button"
        className="map-banner__close"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
