import { useMemo } from "react";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import { LngLatBoundsLike } from "mapbox-gl";
import { Marker } from "react-map-gl/mapbox";
import { Sign, KnackToIFrameMessage, LatLon } from "@/types/map";

/**
 * Takes array of Signs and if signs exist, returns bounding box for signs
 * @param signs
 * @returns bbox extent in [minX, minY, maxX, maxY] order or undefined
 */
export const useFormatBounds = (signs: Sign[]): undefined | LngLatBoundsLike =>
  useMemo(() => {
    if (signs.length === 0) {
      return undefined;
    }
    const signLatLonArray = signs.map((sign: Sign) => [sign.lng, sign.lat]);

    const lineStringFeature =
      // if there is only one sign in the array, create the linestring for the bounding box using the one sign
      signLatLonArray.length < 2
        ? lineString([
            signLatLonArray[0],
            [signLatLonArray[0][0], signLatLonArray[0][1]],
          ])
        : lineString(signLatLonArray);

    const [minLng, minLat, maxLng, maxLat] = bbox(lineStringFeature);
    return [minLng, minLat, maxLng, maxLat];
  }, [signs]);

/**
 * Function that takes data from knack app and depending on message type, returns array of signs or empty array
 * @param knackPayload - message from Knack via IFrameMessage
 * @returns Array of Signs or empty array if no sign data
 */
export const useFormatSignsRecords = (
  knackPayload: KnackToIFrameMessage | null
): Sign[] =>
  useMemo(() => {
    if (!knackPayload) return [];
    if (
      knackPayload?.message === "EDIT_LOCATION" ||
      knackPayload?.message === "KNACK_GEOLOCATION"
    ) {
      return [];
    }

    const locationId =
      knackPayload.message === "KNACK_LOCATION_DETAILS"
        ? knackPayload?.payload?.locationRecordId
        : null;

    return knackPayload.payload.records.map((sign) => ({
      id: sign.id,
      lat: sign.field_3300_raw.latitude,
      lng: sign.field_3300_raw.longitude,
      spatialId: sign.field_3297,
      workOrderId: knackPayload.payload.workOrderId,
      locationDetailPage: sign.id === locationId,
    }));
  }, [knackPayload]);

/**
 * Function that takes data from knack app and depending on message type, returns location
 * @param knackPayload - message from Knack via IFrameMessage
 * @returns LatLon object
 */
export const useFormatLocation = (
  knackPayload: KnackToIFrameMessage | null
): LatLon =>
  useMemo(() => {
    if (!knackPayload || knackPayload?.message === "WORK_ORDER_SIGNS") {
      return { longitude: undefined, latitude: undefined };
    }

    if (knackPayload.message === "KNACK_GEOLOCATION") {
      return {
        longitude: knackPayload.payload.geolocation.longitude,
        latitude: knackPayload.payload.geolocation.latitude,
      };
    }

    return {
      longitude: knackPayload.payload.location.longitude,
      latitude: knackPayload.payload.location.latitude,
    };
  }, [knackPayload]);

/**
 * Takes array of Signs and returns array of map markers, one marker per sign
 * If the sign id matches the location detail page id, render the marker as red
 * otherwise, use default color
 * @param signs
 * @returns Array of Map Markers
 */
export const useCreateSignPins = (
  signs: Sign[],
  setPopupInfo: React.Dispatch<React.SetStateAction<Sign | null>>
) =>
  useMemo(
    () =>
      signs.map((sign: Sign) => (
        <Marker
          key={`marker-${sign.id}`}
          longitude={sign.lng}
          latitude={sign.lat}
          anchor="bottom"
          color={sign.locationDetailPage ? "red" : undefined}
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            console.log(sign);
            setPopupInfo(sign);
          }}
        />
      )),
    [signs, setPopupInfo]
  );
