"use client";
import { useEffect, useState, useCallback } from "react";
import { KnackToIFrameMessage, LatLon, LocationMode } from "@/types/map";

export function useIFrameMessenger() {
  const [message, setMessage] = useState<KnackToIFrameMessage | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://atd.knack.com") {
        return;
      }

      const data = JSON.parse(event?.data);
      // Skip non-map-data messages so they don't overwrite the active payload
      if (data.message === "SHOW_BANNER") return;
      setMessage(data as KnackToIFrameMessage);
    };
    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  return message;
}

/**
 * Listens for SHOW_BANNER postMessages from the Knack parent window.
 * Returns the banner text and a function to clear it.
 */
export function useBannerMessage() {
  const [bannerText, setBannerText] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://atd.knack.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.message === "SHOW_BANNER" && data.text) {
          setBannerText(data.text);
        }
      } catch {
        /* ignore non-JSON messages */
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const clearBanner = useCallback(() => setBannerText(null), []);

  return { bannerText, clearBanner };
}

export function sendLatLonToParent(coords: LatLon) {
  // send location to Knack
  window.parent.postMessage(
    { message: "LAT_LON_UPDATE", lat: coords.latitude, lng: coords.longitude },
    "https://atd.knack.com"
  );
}

export function sendExistingLocationToParent(
  coords: LatLon,
  assetLocationId: number | ""
) {
  // eslint-disable-next-line no-console
  console.log("Sending EXISTING_LOCATION_SELECTED message", {
    lat: coords.latitude,
    lng: coords.longitude,
    assetLocationId,
  });
  window.parent.postMessage(
    {
      message: "EXISTING_LOCATION_SELECTED",
      lat: coords.latitude,
      lng: coords.longitude,
      assetLocationId,
    },
    "https://atd.knack.com"
  );
}

export function sendLocationModeToParent(mode: LocationMode) {
  window.parent.postMessage(
    { message: "LOCATION_MODE_CHANGE", mode },
    "https://atd.knack.com"
  );
}

