# Knack Geolocation Selector

This React app creates a geospatial picker that can display, drop, and edit location pins in the Knack Signs and Markings application. Data about the points is passed between the Knack app and the React app using iframe messaging.

## Local development

Clone this repo and create a feature branch

In `iFrameMapMessenger.js` of the new branch, update the iframe `src` to https://localhost:9001/

Push your branch to Github. This is necessary for the custom JS in Knack (stored in `/knack/index.js`) to load code that will point the Knack app to the locally hosted React app.

Working from a test instance of the Signs & Markings Knack application, update `production` in the `url` variable in `loadIframeMapMessenger()` to the name of your branch.

To start the React app, start the proxy by running:

### `npm run proxy`

and then, in a separate tab or terminal, start the React app by running:

### `npm start`

The proxy is necessary for the iFrame messages to push back and forth between the React app and Knack.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

