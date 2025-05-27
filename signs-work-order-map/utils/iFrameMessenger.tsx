"use client";
import { useEffect, useState } from "react";

type MessageToIframe = {
  message?: string;
  records?: [];
  location?: [];
};

export function useIFrameMessenger() {
  const [message, setMessage] = useState<MessageToIframe>({});

  useEffect(() => {
    const consoleMessage = (event: MessageEvent) => {
      if (
        event.data.source === "react-devtools-content-script" ||
        event.data.source === "react-devtools-bridge" ||
        event.data.source === "react-devtools-backend-manager"
      ) {
        return;
      }
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
