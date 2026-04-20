export interface LatLon {
  latitude: number | undefined;
  longitude: number | undefined;
}

export type LocationMode = "create" | "select_existing";

/** Knack → iframe events: which page/view opened the map and what payload shape to expect */
export type KnackMapMessageType =
  | "LOAD_WORK_ORDER_LOCATION_DETAILS_PAGE"
  | "LOAD_WORK_ORDER_DETAILS_PAGE"
  | "OPEN_LOCATION_EDITOR";

export interface MapProps {
  editLocation?: LatLon | null;
  messageType?: KnackMapMessageType;
  signs: Sign[];
}

export interface Sign {
  id: string;
  lng: number;
  lat: number;
  spatialId: number;
  workOrderId: string;
  /** if the sign id matches the location record id, the payload came from the location details page */
  isLocationDetailPage: boolean;
  /** source of the sign data - 'knack' for existing data, 'agol' for ArcGIS Online */
  source?: "knack" | "agol";
  /** additional attributes from AGOL or other sources */
  attributes?: Record<string, unknown>;
}

export interface KnackRecord {
  /** spatial id */
  field_3297: number;
  /** spatial id raw format */
  field_3297_raw: number;
  /** address in string form */
  field_3300: string | undefined;
  /** address raw format  */
  field_3300_raw: {
    city: string | undefined;
    country: string | undefined;
    full: string | undefined;
    latitude: number | undefined;
    longitude: number | undefined;
    state: string | undefined;
    street: string | undefined;
    street2: string | null;
    zip: string | undefined;
  };
  /** created date */
  field_3302?: string;
  /** created date raw format */
  field_3302_raw?: {
    am_pm?: "AM" | "PM";
    date?: string;
    date_formatted?: string;
    hours?: string;
    iso_timestamp?: string;
    minutes?: string;
    proper_iso_timestamp?: string;
    proper_unix_timestamp?: number;
    time?: number;
    timestamp?: string;
    unix_timestamp?: number;
  };
  /** photo */
  field_3378?: string;
  /** photo raw format */
  field_3378_raw?: string;
  /** count of assets  */
  field_3425?: number;
  /** count of assets raw format*/
  field_3425_raw?: number;
  /** AGOL asset location ID (set when location was added from an AGOL feature) */
  field_4461?: string | number;
  field_4461_raw?: string | number;
  /** knack record id */
  id: string;
}

export type KnackToIFrameMessage =
  | {
      /** Work order → sign location details page (single location + its signs on the map) */
      message: "LOAD_WORK_ORDER_LOCATION_DETAILS_PAGE";
      payload: {
        records: KnackRecord[];
        location: {
          longitude: number | undefined;
          latitude: number | undefined;
        };
        workOrderId: string;
        locationRecordId: string;
      };
    }
  | {
      /** Work order details page (all signs for that work order) */
      message: "LOAD_WORK_ORDER_DETAILS_PAGE";
      payload: {
        records: KnackRecord[];
        workOrderId: string;
      };
    }
  | {
      /** Add / edit location form — map for placing the pin */
      message: "OPEN_LOCATION_EDITOR";
      payload: {
        location: {
          longitude: number | undefined;
          latitude: number | undefined;
        };
      };
    };
