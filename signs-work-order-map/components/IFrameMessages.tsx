import { useEffect } from "react";
import { getKnackHeaders } from "@/utils/utils";

function getSignsData(data) {
  const url = `https://api.knack.com/v1/scenes/${data.scene}/views/${
    data.view
  }/records?view-work-orders-details-sign_id=${data.id}`;

  fetch(url, getKnackHeaders(data.token, data.app_id))
  .then((res) => res.json())
  .then((res)=> console.log(res.records))

  return []
}

// should this be a component?
export default function IFrameMessages() {
  useEffect(() => {
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
      console.log(data)
      getSignsData(data)
    };
    window.addEventListener("message", consoleMessage);

    return () => {
      window.removeEventListener("message", consoleMessage);
    };
  }, []);

  window.top.postMessage("ready", "https://atd.knack.com/");

  // window.top.postMessage('reply', '*')
}
