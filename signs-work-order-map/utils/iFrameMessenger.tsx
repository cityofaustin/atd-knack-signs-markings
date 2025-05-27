"use client";
import { useEffect, useState } from "react";

export function useIFrameMessenger() {
  const [message, setMessage] = useState({});
  if (!window) {
    console.log("no window");
    return message;
  }

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
      console.log(data);
      setMessage(data);
    };
    window.addEventListener("message", consoleMessage);

    return () => {
      window.removeEventListener("message", consoleMessage);
    };
  }, []);

  return message;
}
