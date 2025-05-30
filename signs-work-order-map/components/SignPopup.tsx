import { Popup } from "react-map-gl/mapbox";
import { Sign } from "@/components/Map";

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
      <div>
        <a
          href={`https://atd.knack.com/signs-markings#work-order-signs/view-work-orders-details-sign/${popupInfo?.workOrderId}/view-work-order-signs-location-details/${
            popupInfo.id
          }`}
          // ensure it doesn't open in the iframe
          target="_top"
        >
          Location Detail Page
        </a>
        <br />
        <span>Spatial ID: {popupInfo.spatialId}</span>
        <br />
        <span>Latitude: {popupInfo.lat}</span>
        <br />
        <span>Longitude: {popupInfo.lng}</span>
      </div>
    </Popup>
  );
}
