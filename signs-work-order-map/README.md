# Knack Geolocation Selector

This React app creates a geospatial picker that can display, drop, and edit location pins in the Knack Signs and Markings application. Data about the points is passed between the Knack app and the React app using iframe messaging.

Custom [javascript](https://github.com/cityofaustin/atd-knack-signs-markings/blob/21517-app-next/knack/index.js#L274) in the Knack application loads the iFrameMessenger script only on specific views.

- Work Orders Details Page - Viewer: view_2619 (scene 1028)
- Work Orders Details Page - Editable: view_2573 (scene 1028)
- Location Details Page - Viewer & Editable: view_2733 (scene 1039)
- Edit Location Page: view_2682 (scene 1061)

The iFrameMessenger script is in the `atd-knack-signs-markings` S3 bucket, in the staging folder. (There is no production folder.) The test Knack app loads **`iframeMapMessengerDev.js`** from that bucket; production uses **`iframeMapMessenger.js`**. Each script sets `nextAppUrl` to the React app that the iframe loads (Netlify deploy preview or localhost).

# Testing a deploy preview in the Knack test environment

To embed a Netlify deploy preview (ex: from a PR) in the Knack Signs and Markings **test** app, use the **`iframeMapMessengerDev.js`** file in S3 and point it at your preview URL.

1. **Set the deploy preview URL in the repo (optional but recommended)**  
   In your PR branch, edit `knack/iframeMapMessenger.js` and set the `nextAppUrl` constant (lines 10–11) to your deploy preview URL (ex: `https://deploy-preview-339--nextjs-knack-signs-markings.netlify.app`). This keeps version control in sync with what’s used in staging.

2. **Prepare the dev messenger file**  
   Download or copy `knack/iframeMapMessenger.js` and save it as **`iframeMapMessengerDev.js`** (with `nextAppUrl` set to your deploy preview URL).

3. **Upload to S3**  
   In [AWS S3](https://us-east-1.console.aws.amazon.com/s3/buckets/atd-knack-signs-markings?prefix=staging%2F&region=us-east-1&tab=objects), open the **atd-knack-signs-markings** bucket → **staging** prefix. Upload your **iframeMapMessengerDev.js** and replace the existing file (drag-and-drop and confirm).

4. **Confirm the file in S3**  
   Open the public URL and check that `nextAppUrl` is your deploy preview:  
   [https://atd-knack-signs-markings.s3.us-east-1.amazonaws.com/staging/iframeMapMessengerDev.js](https://atd-knack-signs-markings.s3.us-east-1.amazonaws.com/staging/iframeMapMessengerDev.js)  
   Knack will load this script and request your preview when the iframe loads.

5. **Open the Knack test app & sign in**  
   Go to the test instance, ex:  
   [https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs](https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs). Use test credentials (ex: GIS QA).

6. **Open an issued work order**

   - Go to the Signs | Work Orders list:  
     [https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs/](https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs/)
   - Filter by **Issued** (third row of buttons above the table), or use this URL:  
     [Work orders filtered by Issued](https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs/?view_2565_filters=%5B%7B%22text%22%3A%22Issued%22%2C%22field%22%3A%22field_3265%22%2C%22value%22%3A%22ISSUED%22%2C%22operator%22%3A%22is%22%7D%5D&view_2565_page=1)

7. **View the embedded map**  
   Click an issued work order to open its details page. Scroll down below the "Locations" section to see the embedded map.  
   If the map doesn’t load, check the Dev Console for syntax errors in the JS file or issues executing the JS file when Knack page loads **iframeMapMessengerDev.js**.

# Local Development

In order to develop locally, use a test application in Knack (ex: ["test-30-may-2024-signs-and-markings-operations"](https://atd.knack.com/test-30-may-2024-signs-and-markings-operations#work-order-signs/?view_2565_filters=%5B%7B%22text%22%3A%22Issued%22%2C%22field%22%3A%22field_3265%22%2C%22value%22%3A%22ISSUED%22%2C%22operator%22%3A%22is%22%7D%5D&view_2565_page=1)).

First-time setup: run `nvm use`, `nvm install-latest-npm`, `npm install`, and `cp env_template .env` (add your Mapbox token, ex: from 1Password). Then `npm run dev` to run the app at http://localhost:3000.

1. Set `nextAppUrl` to `"http://localhost:3000"` in **iframeMapMessenger.js**.
2. Copy `knack/iframeMapMessenger.js` to a file named **`iframeMapMessengerDev.js`**.
3. Upload **iframeMapMessengerDev.js** to the **atd-knack-signs-markings** S3 bucket under the **staging** prefix, replacing the existing file.  
   **Do not** change **iframeMapMessenger.js** in S3 (that is used for production).

## Developer toolbox and one-time benchmarking tools

- **Benchmark page (`/benchmark`)**: A developer-only page used to compare performance between rendering thousands of AGOL sign points as individual markers vs a single Mapbox circle layer.
- **Benchmark utilities**: Implemented in `toolbox/benchmark/benchmarkUtils.ts`. These utilities set globals on `window` (ex: `getBenchmarkResults`, `exportBenchmarkResults`) and should **not** be wired into Knack or any production user flows.

These tools are intended as **one-time / experimental** helpers to guide performance decisions. It is safe to refactor or remove them once they have served their purpose.
