"use client";
import { useEffect, useState } from "react";
import { KnackToIFrameMessage, LatLon } from "@/types/map";

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
    { message: "LAT_LON_FIELDS", lat: coords.latitude, lng: coords.longitude },
    "https://atd.knack.com"
  );
}
