"use client";
import { useEffect, useState } from "react";

type MessageToIFrame = {
  message: string;
  records: [];
  location: [number, number];
};

export function useIFrameMessenger() {
  const [message, setMessage] = useState<MessageToIFrame | null>(null);

  useEffect(() => {
    const consoleMessage = (event: MessageEvent) => {
      if (
        event.data.source === "react-devtools-content-script" ||
        event.data.source === "react-devtools-bridge" ||
        event.data.source === "react-devtools-backend-manager"
      ) {
        return;
      }

      console.log(event.data)
      const data = JSON.parse(event.data);
      setMessage(data);
    };
    window.addEventListener("message", consoleMessage);

    return () => {
      window.removeEventListener("message", consoleMessage);
    };
  }, []);

  return message;
}
