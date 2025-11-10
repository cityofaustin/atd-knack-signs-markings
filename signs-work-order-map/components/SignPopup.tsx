import { Popup } from "react-map-gl/mapbox";
import { Sign } from "@/types/map";
import { KNACK_APP_URL } from "@/config/map";

interface SignPopupProps {
  popupInfo: Sign;
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>;
}

export default function SignPopup({ popupInfo, setPopupInfo }: SignPopupProps) {
  const isAGOLSign = popupInfo.source === "agol";

  return (
    <Popup
      anchor="top"
      longitude={popupInfo.lng}
      latitude={popupInfo.lat}
      onClose={() => setPopupInfo(null)}
      offset={[0, -20]}
    >
      <ul className="list-unstyled m-0">
        <li>
          <strong>Source:</strong>{" "}
          {isAGOLSign ? "AGOL Sign Asset" : "Knack Work Order"}
        </li>

        {!popupInfo.isLocationDetailPage && !isAGOLSign && (
          <li>
            <a
              href={`${KNACK_APP_URL}#work-order-signs/view-work-orders-details-sign/${popupInfo?.workOrderId}/view-work-order-signs-location-details/${
                popupInfo.id
              }`}
              // ensure it doesn't open in the iframe
              target="_top"
            >
              Location Detail Page
            </a>
          </li>
        )}

        <li>Spatial ID: {popupInfo.spatialId}</li>
        <li>Latitude: {popupInfo.lat.toFixed(6)}</li>
        <li>Longitude: {popupInfo.lng.toFixed(6)}</li>

        {isAGOLSign && popupInfo.attributes && (
          <>
            <li>
              <hr className="my-2" />
            </li>
            <li>
              <strong>AGOL Attributes:</strong>
            </li>
            {Object.entries(popupInfo.attributes)
              .filter(([key]) => key !== "OBJECTID_1") // Don't show OBJECTID_1 since we show it as Spatial ID
              .slice(0, 5) // Limit to first 5 attributes to keep popup manageable
              .map(([key, value]) => (
                <li key={key} style={{ fontSize: "0.9em" }}>
                  {key}: {value?.toString() || "N/A"}
                </li>
              ))}
          </>
        )}
      </ul>
    </Popup>
  );
}
