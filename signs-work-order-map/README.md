# Knack Geolocation Selector

This React app creates a geospatial picker that can display, drop, and edit location pins in the Knack Signs and Markings application. Data about the points is passed between the Knack app and the React app using iframe messaging.

Custom (javascript)[https://github.com/cityofaustin/atd-knack-signs-markings/blob/21517-app-next/knack/index.js#L274] in the Knack application loads the iFrameMessenger script only on specific views.

Work Orders Details Page - Viewer: view_2619 (scene 1028)
Work Orders Details Page - Editable: view_2573 (scene 1028)
Location Details Page - Viewer & Editable: view_2733 (scene 1039)
Edit Location Page: view_2682 (scene 1061)

The iFrameMessenger script is in the `atd-knack-signs-markings` s3 bucket, in the staging folder. (There is no production folder.) The file is named `iframeMapMessenger.js`

The iFrameMessenger script has a (reference)[https://github.com/cityofaustin/atd-knack-signs-markings/blob/staging/knack/iframeMapMessenger.js#L37] to the deployed react app on netlify. To recap, custom js in Knack points to the iFrameMessenger script in s3 which in turn specifies which deployed react app contains the map.

# Local Development

In order to develop locally, use the "test-30-may-2024-signs-and-markings-operations" test application in Knack. That app uses the iFrameMessenger script in the file named `iframeMapMessengerDev.js`. If you want to work on the next js app locally while testing in the test Knack app, make a copy of the iframeMapMessenger.js file, save as `iframeMapMessengerDev.js` and update (this line)[https://github.com/cityofaustin/atd-knack-signs-markings/blob/staging/knack/iframeMapMessenger.js#L37] such that the nextAppUrl is `"http://localhost:3000";`. Sign into s3 and replace the file with your copy. \*\*Do not update `iframeMapMessenger.js` because that is production.

If this is your first time running locally, `nvm use` and `npm install` and `cp env_template .env`, fill out the mapbox token (look in 1Password).

Then `npm run dev` to get the app going on localhost:3000.
