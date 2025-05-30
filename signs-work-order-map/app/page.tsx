"use client";
import styles from "./page.module.css";
import Map from "@/components/Map";
import { useIFrameMessenger } from "@/utils/iFrameMessenger";

const testpayload = {
  location: [],
  message: "WORK_ORDER_SIGNS",
  records: [
    {
      field_3297: 202,
      field_3297_raw: 202,
      field_3300: "4702 Oldfort Hill Dr<br />Austin, Texas 78723",
      field_3300_raw: {
        city: "Austin",
        country: "United States",
        full: "4702 Oldfort Hill Dr Austin, Texas 78723",
        latitude: 30.286771,
        longitude: -97.675177,
        state: "Texas",
        street: "4702 Oldfort Hill Dr",
        street2: null,
        zip: "78723",
      },
      field_3301:
        '<span class="5d13ae66d3186524eaea0b20">Librado Murrieta</span>',
      field_3301_raw: [
        { id: "5d13ae66d3186524eaea0b20", identifier: "Librado Murrieta" },
      ],
      field_3302: "08/01/2019",
      field_3302_raw: {
        am_pm: "AM",
        date: "08/01/2019",
        date_formatted: "08/01/2019",
        hours: "12",
        iso_timestamp: "2019-08-01T00:00:00.000Z",
        minutes: "00",
        proper_iso_timestamp: "2019-08-01T05:00:00.000Z",
        proper_unix_timestamp: 1564635600000,
        time: 0,
        timestamp: "08/01/2019 12:00 am",
        unix_timestamp: 1564617600000,
      },
      field_3378: "",
      field_3378_raw: "",
      field_3425: 1,
      field_3425_raw: 1,
      id: "5d433cc8b760fc0011a42f77",
    },
  ],
};

const formatSignsRecords = (records) => {
  console.log(records);
  return records.map((sign) => {
    const signObj = {};
    signObj["id"] = sign.id;
    signObj["lat"] = sign.field_3300_raw.latitude;
    signObj["lng"] = sign.field_3300_raw.longitude;
    signObj["spatialId"] = sign.field_3297;
    return signObj;
  });
};

export default function Home() {
  //const knackPayload = useIFrameMessenger();
  const knackPayload = testpayload;
  console.log(testpayload);

  const location = knackPayload?.location;
  const signs = formatSignsRecords(knackPayload.records);
  const messageType = knackPayload?.message;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.map}>
          <Map messageType={messageType} location={location} signs={signs} />
        </div>
      </main>
    </div>
  );
}
