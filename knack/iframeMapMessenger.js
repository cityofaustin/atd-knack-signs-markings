/**
 * This code is imported into the Knack app and executed as custom vanilla JS that interacts with the NextJS app
 * via iFrame messaging.
 *
 */

(function () {
  var myView = window.viewIdsArray.shift(0);

  // const nextAppUrl =
  // "https://deploy-preview-327--nextjs-knack-signs-markings.netlify.app/";
  const nextAppUrl = "http://localhost:3000";

  // Import jQuery into this file from CDN
  // https://stackoverflow.com/questions/34338411/how-to-import-jquery-using-es6-syntax
  var script = document.createElement("SCRIPT");
  script.src =
    "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js";
  script.type = "text/javascript";
  document.getElementsByTagName("head")[0].appendChild(script);

  // Create polling function for made sure jQuery is loaded and ready...
  var checkReady = function (callback) {
    if (window.jQuery) {
      callback(jQuery);
    } else {
      window.setTimeout(function () {
        checkReady(callback);
      }, 20);
    }
  };

  function getHeaders(userToken, appId) {
    return {
      "X-Knack-Application-Id": appId,
      "X-Knack-REST-API-KEY": "knack",
      Authorization: userToken,
      "content-type": "application/json",
    };
  }

  // Start polling...
  checkReady(function ($) {
    var $viewSelector = $(myView);

    // Add React app as iframe if iframe doesn't already exist
    if ($(myView + " #mapIFrame").length === 0) {
      https: $(
        `<iframe src=${nextAppUrl} frameborder="0" allow="geolocation" scrolling="yes" \
        id="mapIFrame" style="width: 100%;height: 523px;"></iframe>`
      ).appendTo($viewSelector);
    }

    /**
     * Posts message to specified iframe
     * @param {Object} message - payload to send to iframe
     * @param {*} iframe - iframe reference
     */
    function sendMessageToApp(message, iframe) {
      var stringifiedMessage = JSON.stringify(message);
      iframe.postMessage(stringifiedMessage, nextAppUrl);
    }

    // Listen for lat/lon changes
    // expects a message named "LAT_LON_FIELDS"
    // uses lat and lng from message to populate input fields in knack
    window.addEventListener("message", function (event) {
      if (event.origin !== nextAppUrl) {
        return;
      }
      var data = event.data;
      if (data.message === "LAT_LON_FIELDS") {
        console.log("received message ", data);
        var $latLonFields = $("#kn-input-field_3300");
        if (!!data.lat && !!data.lng) {
          $latLonFields.find("#latitude").val(data.lat);
          $latLonFields.find("[name='longitude']").val(data.lng);
        } else {
          console.error("Payload missing complete location data ", data);
        }
      }
    });

    // Location Details Page Maps
    function locationDetailsMapMessage(viewId) {
      var locationViewIFrame = $("#" + viewId + " #mapIFrame")[0].contentWindow;
      var urlArray = window.location.href.split("/");
      var recordId = urlArray[urlArray.length - 2];
      var workOrderId = urlArray[urlArray.length - 4];

      var headers = getHeaders(Knack.getUserToken(), Knack.application_id);
      var signsMarkerMessage = {
        message: "KNACK_LOCATION_DETAILS",
        payload: {
          records: [],
          location: {
            longitude: undefined,
            latitude: undefined,
          },
        },
      };

      // Request the location based on record ID
      console.log("Requesting records for location id ", recordId);
      $.ajax({
        url: `https://api.knack.com/v1/scenes/scene_1039/views/view_2733/records/${recordId}`,
        headers: headers,
      })
        .then(function (res) {
          var locationField = res["field_3300_raw"];
          signsMarkerMessage.payload.location.latitude =
            locationField?.latitude;
          signsMarkerMessage.payload.location.longitude =
            locationField?.longitude;
          signsMarkerMessage.payload.locationRecordId = recordId;
        })
        .then(function () {
          console.log("requesting records for work order id ", workOrderId);
          // Request the associated signs records
          $.ajax({
            url: `https://api.knack.com/v1/scenes/scene_1028/views/view_2573/records?view-work-orders-details-sign_id=${workOrderId}`,
            headers: headers,
          }).then(function (res) {
            var records = res.records;
            signsMarkerMessage.payload.records = records;
            signsMarkerMessage.payload.workOrderId = workOrderId;
            sendMessageToApp(signsMarkerMessage, locationViewIFrame);
          });
        })
        .fail(function (res) {
          console.error(res);
        });
    }

    /**
     * uses work order record ID to request signs and sends to iframe
     * @param {*} viewId
     */
    function workOrdersDetailsMapMessage(viewId) {
      var urlArray = window.location.href.split("/");
      var recordId = urlArray[urlArray.length - 2];
      var workOrderDetailsIFrame = $("#" + viewId + " #mapIFrame")[0]
        .contentWindow;
      var headers = getHeaders(Knack.getUserToken(), Knack.application_id);
      var view = myView.slice(1);

      console.log("requesting records for work order id ", recordId);
      $.ajax({
        url: `https://api.knack.com/v1/scenes/scene_1028/views/${view}/records?view-work-orders-details-sign_id=${recordId}`,
        headers: headers,
      })
        .then(function (res) {
          console.log("WORK ORDER SIGNS: ", res.records);
          var signsMarkerMessage = {
            message: "WORK_ORDER_SIGNS",
            payload: {
              records: res.records,
              workOrderId: recordId,
            },
          };
          sendMessageToApp(signsMarkerMessage, workOrderDetailsIFrame);
        })
        .fail(function (message) {
          console.error(message);
        });
    }

    function sendLocationMapMessage(viewId) {
      // Use crumbtrail to get Location record ID
      var crumbtrailArray = $(".kn-crumbtrail")
        .children()
        .last()
        .attr("href")
        .split("/");
      var recordId = crumbtrailArray[crumbtrailArray.length - 1].split("?")[0];
      var editLocationIframe = $("#view_2682 #mapIFrame")[0].contentWindow;

      var headers = getHeaders(Knack.getUserToken(), Knack.application_id);

      $.ajax({
        url: `https://api.knack.com/v1/scenes/scene_1061/views/view_2682/records/${recordId}`,
        headers: headers,
      })
        .then(function (res) {
          var locationField = res["field_3300_raw"];
          console.log("EDIT_LOCATION: ", locationField);
          var locationMessage = {
            message: "EDIT_LOCATION",
            payload: {
              location: {
                longitude: locationField?.longitude,
                latitude: locationField?.latitude,
              },
            },
          };
          sendMessageToApp(locationMessage, editLocationIframe);
        })
        .fail(function (message) {
          console.error(message);
        });
    }

    // Location Details Page - Editable
    $("#view_2609 #mapIFrame").on("load", function () {
      locationDetailsMapMessage("view_2609");
    });

    // Location Details Page - Viewer
    $("#view_2733 #mapIFrame").on("load", function () {
      locationDetailsMapMessage("view_2733");
    });

    // Work Order Details Page - Editable
    $("#view_2573 #mapIFrame").on("load", function () {
      workOrdersDetailsMapMessage("view_2573");
    });
    // Work Order Details Page - Viewable
    $("#view_2619 #mapIFrame").on("load", function () {
      workOrdersDetailsMapMessage("view_2619");
    });

    // Edit Location Page
    $("#view_2682 #mapIFrame").on("load", function () {
      sendLocationMapMessage("view_2682");
    });

  });
})();
