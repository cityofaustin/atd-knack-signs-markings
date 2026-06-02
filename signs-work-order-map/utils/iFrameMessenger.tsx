"use client";
import { useEffect, useState, useCallback } from "react";
import { KnackToIFrameMessage, LatLon, LocationMode } from "@/types/map";

const KNACK_TO_IFRAME_MESSAGE_TYPES = [
  "LOAD_WORK_ORDER_LOCATION_DETAILS_PAGE",
  "LOAD_WORK_ORDER_DETAILS_PAGE",
  "OPEN_LOCATION_EDITOR",
] as const;

function parseMessageEventData(data: unknown): unknown {
  if (data == null) return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (typeof data === "object") return data;
  return null;
}

function isKnackToIFrameMessage(value: unknown): value is KnackToIFrameMessage {
  if (!value || typeof value !== "object" || !("message" in value)) {
    return false;
  }
  const { message } = value as { message: unknown };
  return (
    typeof message === "string" &&
    (KNACK_TO_IFRAME_MESSAGE_TYPES as readonly string[]).includes(message)
  );
}

export function useIFrameMessenger() {
  const [message, setMessage] = useState<KnackToIFrameMessage | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://atd.knack.com") {
        return;
      }

      const parsed = parseMessageEventData(event.data);
      if (!isKnackToIFrameMessage(parsed)) {
        return;
      }

      setMessage(parsed);
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return message;
}

export type BannerVariant = "success" | "error";

/**
 * Listens for SHOW_BANNER postMessages from the Knack parent window.
 * Returns the banner text, variant, and a function to clear it.
 */
export function useBannerMessage() {
  const [banner, setBanner] = useState<{
    text: string;
    variant: BannerVariant;
  } | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://atd.knack.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data.message === "SHOW_BANNER" && data.text) {
          setBanner({
            text: data.text,
            variant: data.variant === "error" ? "error" : "success",
          });
        }
      } catch {
        /* ignore non-JSON messages */
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const clearBanner = useCallback(() => setBanner(null), []);

  return { banner, clearBanner };
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

