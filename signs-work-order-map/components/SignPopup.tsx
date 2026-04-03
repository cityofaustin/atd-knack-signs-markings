import { Popup } from "react-map-gl/mapbox";
import { Sign, LocationMode } from "@/types/map";
import { KNACK_APP_URL } from "@/config/map";

interface SignPopupProps {
  popupInfo: Sign;
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>;
  locationMode?: LocationMode;
  onSelectExistingLocation?: (sign: Sign) => void;
}

export default function SignPopup({
  popupInfo,
  setPopupInfo,
  locationMode,
  onSelectExistingLocation,
}: SignPopupProps) {
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

  // Group identical sign messages and count occurrences:
  const signMessageCounts = new Map<string, number>();
  signMessagesList.forEach((message) => {
    const current = signMessageCounts.get(message) ?? 0;
    signMessageCounts.set(message, current + 1);
  });

  return (
    <Popup
      longitude={popupInfo.lng}
      latitude={popupInfo.lat}
      onClose={() => setPopupInfo(null)}
      closeOnClick={false}
      offset={[0, 6]}
      maxWidth="min(92vw, 320px)"
      className="sign-popup"
    >
      {isAGOLSign ? (
        <div className="sign-popup-agol nav-tile card border-0 fs-6">
          <div className="card-body p-2 d-flex flex-column sign-popup-agol__inner">
            {assetLocationId != null && (
              <div className="mb-0 mt-2 d-flex align-items-center flex-shrink-0">
                <span className="fw-bold me-2">Location ID</span>
                <span className="text-muted mb-0">
                  {String(assetLocationId)}
                </span>
              </div>
            )}
            {signMessagesList.length > 0 && (
              <div className="mt-2 sign-popup-agol__scroll">
                <ul className="list-group list-group-flush mb-0">
                  {Array.from(signMessageCounts.entries()).map(
                    ([message, count]) => (
                      <li
                        key={message}
                        className="list-group-item px-0 py-3 fs-6"
                      >
                        {message}
                        {count > 1 && (
                          <span className="badge border text-dark bg-light ms-2">
                            x {count}
                          </span>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {signMessagesList.length === 0 && assetLocationId == null && (
              <div className="text-muted flex-shrink-0">
                No additional information available
              </div>
            )}
            {locationMode === "select_existing" &&
              onSelectExistingLocation && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm w-100 mt-2 flex-shrink-0 sign-popup-agol__action"
                  onClick={() => {
                    onSelectExistingLocation(popupInfo);
                    setPopupInfo(null);
                  }}
                >
                  Add this Location
                </button>
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
