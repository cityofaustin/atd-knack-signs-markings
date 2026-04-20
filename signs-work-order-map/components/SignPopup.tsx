import { Popup } from "react-map-gl/mapbox";
import { Sign, LocationMode } from "@/types/map";
import { KNACK_APP_URL } from "@/config/map";

interface SignPopupProps {
  popupInfo: Sign;
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>;
  locationMode?: LocationMode;
  onSelectExistingLocation?: (sign: Sign) => void;
}

/**
 * Parses the comma-separated SIGN_MESSAGES_AT_LOCATION value into a
 * de-duped map of message → count.
 */
function parseSignMessages(raw: unknown): Map<string, number> | null {
  if (raw == null) return null;
  const list = String(raw)
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  if (list.length === 0) return null;
  const counts = new Map<string, number>();
  list.forEach((msg) => counts.set(msg, (counts.get(msg) ?? 0) + 1));
  return counts;
}

function SignMessagesList({ raw }: { raw: unknown }) {
  const counts = parseSignMessages(raw);
  if (!counts) return null;
  return (
    <div className="mt-2 sign-popup-agol__scroll">
      <ul className="list-group list-group-flush mb-0">
        {Array.from(counts.entries()).map(([message, count]) => (
          <li key={message} className="list-group-item px-0 py-3 fs-6">
            {message}
            {count > 1 && (
              <span className="badge border text-dark bg-light ms-2">
                x {count}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SignPopup({
  popupInfo,
  setPopupInfo,
  locationMode,
  onSelectExistingLocation,
}: SignPopupProps) {
  const isAGOLSign = popupInfo.source === "agol";

  const assetLocationId = popupInfo.attributes?.ASSET_LOCATION_ID ?? null;
  const hasLocationId =
    assetLocationId != null && String(assetLocationId).trim() !== "";
  const signMessages = popupInfo.attributes?.SIGN_MESSAGES_AT_LOCATION ?? null;

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
      <div className="sign-popup-agol nav-tile card border-0 fs-6">
        <div className="card-body p-2 d-flex flex-column sign-popup-agol__inner">
          {/* Location Detail Page link — Knack signs only */}
          {!isAGOLSign && !popupInfo.isLocationDetailPage && (
            <div className="mt-2 flex-shrink-0">
              <a
                href={`${KNACK_APP_URL}#work-order-signs/view-work-orders-details-sign/${popupInfo.workOrderId}/view-work-order-signs-location-details/${popupInfo.id}`}
                target="_top"
              >
                Location Detail Page
              </a>
            </div>
          )}

          {/* Prefer Location ID; fall back to Spatial ID for Knack signs */}
          {hasLocationId ? (
            <div className="mb-0 mt-2 d-flex align-items-center flex-shrink-0">
              <span className="fw-bold me-2">Location ID</span>
              <span className="text-muted">{String(assetLocationId)}</span>
            </div>
          ) : (
            !isAGOLSign && (
              <div className="mb-0 mt-2 d-flex align-items-center flex-shrink-0">
                <span className="fw-bold me-2">Spatial ID</span>
                <span className="text-muted">{popupInfo.spatialId}</span>
              </div>
            )
          )}

          {/* Sign messages (AGOL-sourced, or merged into Knack pin) */}
          <SignMessagesList raw={signMessages} />

          {/* Empty state — only for pure AGOL signs with nothing to show */}
          {isAGOLSign && !signMessages && !hasLocationId && (
            <div className="text-muted flex-shrink-0">
              No additional information available
            </div>
          )}

          {/* "Add this Location" — only for AGOL signs in select_existing mode */}
          {isAGOLSign &&
            locationMode === "select_existing" &&
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
    </Popup>
  );
}
