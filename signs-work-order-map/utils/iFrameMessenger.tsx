"use client";
import { useEffect, useState } from "react";
import { KnackToIFrameMessage, LatLon, LocationMode } from "@/types/map";

export function useIFrameMessenger() {
  const [message, setMessage] = useState<KnackToIFrameMessage | null>(null);

  useEffect(() => {
    const consoleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://atd.knack.com") {
        return;
      }

      const data: KnackToIFrameMessage = JSON.parse(event?.data);
      setMessage(data);
    };
    window.addEventListener("message", consoleMessage);

    return () => {
      window.removeEventListener("message", consoleMessage);
    };
  }, []);

  return message;
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
  assetLocationId: string | number
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

