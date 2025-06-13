import { Popup } from "react-map-gl/mapbox";
import { Sign } from "@/types/map";

interface SignPopupProps {
  popupInfo: Sign;
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>;
}

export default function SignPopup({ popupInfo, setPopupInfo }: SignPopupProps) {
  // prod has the font as bold, do we keep?
  return (
    <Popup
      anchor="top"
      longitude={popupInfo.lng}
      latitude={popupInfo.lat}
      onClose={() => setPopupInfo(null)}
      offset={[0, -20]}
    >
      <ul className="list-unstyled m-0">
        {!popupInfo.locationDetailPage && (
          <li>
            <a
            // TODO: update to prod url when testing is completed
              href={`https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs/view-work-orders-details-sign/${popupInfo?.workOrderId}/view-work-order-signs-location-details/${
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
        <li>Latitude: {popupInfo.lat}</li>
        <li>Longitude: {popupInfo.lng}</li>
      </ul>
    </Popup>
  );
}
