(function () {
  var myView = window.viewIdsArray.shift(0);

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

  function AutozoomSendMessageToApp(message) {
    var iframe = document.getElementById("mapIFrame").contentWindow;
    const stringifiedMessage = JSON.stringify(message);
    console.log("autozoom message to app ", message.message);
    iframe.postMessage(stringifiedMessage, "*");
  }

  // Start polling...
  checkReady(function ($) {
    var $viewSelector = $(myView);

    // Add React app as iframe if iframe doesn't already exist
    if ($(myView + " #mapIFrame").length === 0) {
      https: $(
        // '<iframe src="https://atd-knack-signs-markings.netlify.app/" frameborder="0" scrolling="yes" id="mapIFrame" \
        '<iframe src="http://localhost:3000/" frameborder="0" scrolling="yes" id="mapIFrame" \
      style="width: 100%;height: 523px;"></iframe>'
      ).appendTo($viewSelector);
    }

    function sendMessageToApp(message, iframe) {
      var stringifiedMessage = JSON.stringify(message);
      console.log("iFrameMessage to app", message);
      iframe.postMessage(stringifiedMessage, "*");
    }

    // Listen for lat/lon changes
    // expects a message named "LAT_LON_FIELDS"
    // uses lat and lng from message to populate input fields in knack
    window.addEventListener("message", function (event) {
      if (event.data.source === "react-devtools-content-script") {
        return;
      }
      var data = event.data;
      if (data.message === "LAT_LON_FIELDS") {
        var $latLonFields = $("#kn-input-field_3300");

        $latLonFields.find("#latitude").val(data.lat);
        $latLonFields.find("[name='longitude']").val(data.lng);
      }
    });

    // Location Details Page Maps
    function locationDetailsMapMessage(viewId) {
      var locationViewIFrame = $("#" + viewId + " #mapIFrame")[0].contentWindow;
      var urlArray = window.location.href.split("/");
      var recordId = urlArray[urlArray.length - 2];
      var workOrderId = urlArray[urlArray.length - 4];

      var markerMessage = {
        message: "KNACK_LOCATION_DETAILS",
        view: "view_2733",
        scene: "scene_1039",
        token: Knack.getUserToken(),
        app_id: Knack.application_id,
        id: recordId,
        workOrderScene: "scene_1028",
        workOrderId: workOrderId,
        workOrderView: "view_2573",
      };

      sendMessageToApp(markerMessage, locationViewIFrame);
    }
    // Location Details Page - Editable
    $("#view_2609 #mapIFrame").on("load", function () {
      locationDetailsMapMessage("view_2609");
    });

    // Location Details Page - Viewer
    $("#view_2733 #mapIFrame").on("load", function () {
      locationDetailsMapMessage("view_2733");
    });

    // Work Orders Details Page Maps
    function workOrdersDetialsMapMessage(viewId) {
      var urlArray = window.location.href.split("/");
      var recordId = urlArray[urlArray.length - 2];
      var workOrderDetailsIFrame = $("#" + viewId + " #mapIFrame")[0]
        .contentWindow;
      var headers = getHeaders(Knack.getUserToken(), Knack.application_id);
      var view = myView.slice(1);

      var markerMessage = {
        message: "SIGNS_API_REQUEST",
        view: myView.slice(1),
        scene: "scene_1028",
        token: Knack.getUserToken(),
        app_id: Knack.application_id,
        id: recordId,
      };

      $.ajax({
        url: `https://api.knack.com/v1/scenes/scene_1028/views/${view}/records?view-work-orders-details-sign_id=${recordId}`,
        headers: headers,
      }).then(function (res) {
        var records = res.records;
        console.log("internal ajax call ", records);
        var signsmarkerMessage = {
          message: "WORK_ORDER_SIGNS",
          records: records,
        };
        sendMessageToApp(signsmarkerMessage, workOrderDetailsIFrame);
      });

      sendMessageToApp(markerMessage, workOrderDetailsIFrame);
    }
    // Work Order Details Page - Editable
    $("#view_2573 #mapIFrame").on("load", function () {
      workOrdersDetialsMapMessage("view_2573");
    });
    // Work Order Details Page - Viewable
    $("#view_2619 #mapIFrame").on("load", function () {
      workOrdersDetialsMapMessage("view_2619");
    });

    // Edit Location Page
    $("#view_2682 #mapIFrame").on("load", function () {
      // Use crumbtrail to get Location record ID
      var crumbtrailArray = $(".kn-crumbtrail")
        .children()
        .last()
        .attr("href")
        .split("/");
      var recordId = crumbtrailArray[crumbtrailArray.length - 1].split("?")[0];
      var editLocationIframe = $("#view_2682 #mapIFrame")[0].contentWindow;

      var markerMessage = {
        message: "EDIT_SIGNS_API_REQUEST",
        scene: "scene_1061",
        view: "view_2682",
        token: Knack.getUserToken(),
        app_id: Knack.application_id,
        id: recordId,
      };
      sendMessageToApp(markerMessage, editLocationIframe);
    });

    // Get the current location from browser.
    navigator.geolocation.getCurrentPosition(function (position) {
      // create message object for React App
      const geolocationMessage = {
        message: "KNACK_GEOLOCATION",
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      // sends geolocation once the iframe is loaded
      $("#mapIFrame").on("load", function () {
        AutozoomSendMessageToApp(geolocationMessage);
      });
    });
  });
})();
