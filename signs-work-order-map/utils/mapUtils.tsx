import { useMemo } from "react";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import { Sign, KnackToIFrameMessage } from "@/types/map";
import { LngLatBoundsLike } from "mapbox-gl";

/**
 * Takes array of Signs and if signs exist, returns bounding box for signs
 * @param signs
 * @returns
 */
export const formatBounds = (signs: Sign[]): undefined | LngLatBoundsLike =>
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
export const formatSignsRecords = (
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
    return knackPayload.payload.records.map((sign) => ({
      id: sign.id,
      lat: sign.field_3300_raw.latitude,
      lng: sign.field_3300_raw.longitude,
      spatialId: sign.field_3297,
      workOrderId: knackPayload.payload.workOrderId,
    }));
  }, [knackPayload]);
