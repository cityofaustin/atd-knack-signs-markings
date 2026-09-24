"use client";
import { useEffect, useState } from "react";
import type { BannerVariant } from "@/utils/iFrameMessenger";

interface MapBannerProps {
  text: string;
  variant?: BannerVariant;
  onDismiss: () => void;
}

const FADE_DELAY_MS = 5000;
const FADE_DURATION_MS = 500;

export default function MapBanner({ text, variant = "success", onDismiss }: MapBannerProps) {
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

  const variantClass = variant === "error" ? " map-banner--error" : "";

  return (
    <div
      className={`map-banner${variantClass}${fading ? " map-banner--fade" : ""}`}
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
