import { Popup } from "react-map-gl/mapbox";
import { Sign } from "@/types/map";
import { KNACK_APP_URL } from "@/config/map";

interface SignPopupProps {
  popupInfo: Sign;
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>;
}

export default function SignPopup({ popupInfo, setPopupInfo }: SignPopupProps) {
  // Check if this is an AGOL sign
  const isAGOLSign = popupInfo.source === "agol";

  // Extract AGOL-specific fields
  const assetLocationId = isAGOLSign
    ? popupInfo.attributes?.ASSET_LOCATION_ID
    : null;
  const signMessagesAtLocation = isAGOLSign
    ? popupInfo.attributes?.SIGN_MESSAGES_AT_LOCATION
    : null;

  // Split sign messages by comma and filter out empty strings
  const signMessagesList = signMessagesAtLocation
    ? String(signMessagesAtLocation)
        .split(",")
        .map((msg) => msg.trim())
        .filter((msg) => msg.length > 0)
    : [];

  return (
    <Popup
      anchor="top"
      longitude={popupInfo.lng}
      latitude={popupInfo.lat}
      onClose={() => setPopupInfo(null)}
      offset={[-5, 1]}
      maxWidth="300px"
    >
      {isAGOLSign ? (
        // AGOL sign popup content with card styling
        <div className="h-100 nav-tile card border-0">
          <div className="card-body p-2">
            <div className="fw-bold fs-6 pb-2 border-bottom card-title h5">
              Existing sign details
            </div>
            {assetLocationId != null && (
              <div className="mb-0 mt-2 d-flex align-items-center">
                <span className="fw-bold me-2">Location ID:</span>
                <span className="text-muted mb-0">
                  {String(assetLocationId)}
                </span>
              </div>
            )}
            {signMessagesList.length > 0 && (
              <div className="mt-2">
                <div className="fw-bold mb-1">Exisiting signs:</div>
                <div className="text-muted">
                  {signMessagesList.map((message, index) => (
                    <div key={index}>
                      {message}
                      {index < signMessagesList.length - 1 && ","}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {signMessagesList.length === 0 && assetLocationId == null && (
              <div className="text-muted">
                No additional information available
              </div>
            )}
          </div>
        </div>
      ) : (
        // Knack sign popup content (existing behavior)
        <ul className="list-unstyled m-0">
          {!popupInfo.isLocationDetailPage && (
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
          <li>Latitude: {popupInfo.lat}</li>
          <li>Longitude: {popupInfo.lng}</li>
        </ul>
      )}
    </Popup>
  );
}
