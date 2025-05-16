import { useEffect } from "react";
import { getKnackHeaders } from "@/utils/utils";

function getSignsData(data) {
  const url = `https://api.knack.com/v1/scenes/${data.scene}/views/${
    data.view
  }/records?view-work-orders-details-sign_id=${data.id}`;

  fetch(url, getKnackHeaders(data.token, data.app_id))
    .then((res) => res.json())
    .then((res) => console.log(res.records));

  return [];
}

export function useIFrameMessenger() {
  useEffect(() => {
    if (!window) {
      return
    }
    // without this line, I cant get the nextjs app to receive messages
    window.top.postMessage("ready", "https://atd.knack.com/");
    const consoleMessage = (event) => {
      if (
        event.data.source === "react-devtools-content-script" ||
        event.data.source === "react-devtools-bridge" ||
        event.data.source === "react-devtools-backend-manager"
      ) {
        return;
      }
      const data = JSON.parse(event.data);
      console.log(data.message);
      console.log(data);
      // this is only for the signs data
      getSignsData(data);
    };
    window.addEventListener("message", consoleMessage);

    return () => {
      window.removeEventListener("message", consoleMessage);
    };
  }, []);
}
