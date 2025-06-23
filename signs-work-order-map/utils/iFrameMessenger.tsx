"use client";
import { useEffect, useState } from "react";
import { KnackToIFrameMessage } from "@/types/map";

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
