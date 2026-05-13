/**
 * This code is imported into the Knack app and executed as custom vanilla JS that interacts with the NextJS app
 * via iFrame messaging.
 *
 * The iframe is placed in a container BEFORE the Knack view (as a sibling, not
 * a child) so that when Knack re-renders the view (e.g. after adding a
 * location), the map iframe is outside the blast radius and survives intact.
 */

(function () {
  var myView = window.viewIdsArray.shift(0);

  // const nextAppUrl =
  //   "https://deploy-preview-339--nextjs-knack-signs-markings.netlify.app";
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

  /**
   * Adds a "Fullscreen" button that expands the map iframe to fill the browser
   * viewport via CSS (not the native Fullscreen API, which requires extra
   * permissions for cross-origin iframes). Pressing Esc exits fullscreen.
   *
   * Styles live in knack/index.css (`.map-fullscreen-btn`,
   * `body.map-iframe-fullscreen`, `.map-iframe-fullscreen__frame`).
   */
  function setupMapFullscreenToggle($iframe) {
    if (!$iframe || !$iframe.length) return;
    var $container = $iframe.parent();
    // Idempotent: iframe `load` can fire more than once per view.
    if ($container.find(".map-fullscreen-btn").length) return;

    // Anchor for the absolutely-positioned button.
    if ($container.css("position") === "static") {
      $container.css("position", "relative");
    }

    var $btn = $(
      '<button type="button" class="map-fullscreen-btn" ' +
        'aria-label="Toggle fullscreen map" ' +
        'aria-pressed="false" ' +
        'title="Toggle fullscreen">' +
        '<span aria-hidden="true">\u26F6</span>' +
        "</button>",
    );
    $container.append($btn);

    function exitFullscreen() {
      $("body").removeClass("map-iframe-fullscreen");
      $iframe.removeClass("map-iframe-fullscreen__frame");
      $btn.attr("aria-pressed", "false");
    }
    function enterFullscreen() {
      $("body").addClass("map-iframe-fullscreen");
      $iframe.addClass("map-iframe-fullscreen__frame");
      $btn.attr("aria-pressed", "true");
    }

    $btn.on("click", function () {
      if ($("body").hasClass("map-iframe-fullscreen")) {
        exitFullscreen();
      } else {
        enterFullscreen();
      }
    });

    // Allow Esc to exit. Namespaced so we can avoid duplicate bindings.
    $(document)
      .off("keydown.mapFullscreen")
      .on("keydown.mapFullscreen", function (e) {
        if (
          (e.key === "Escape" || e.keyCode === 27) &&
          $("body").hasClass("map-iframe-fullscreen")
        ) {
          exitFullscreen();
        }
      });
  }

  // Start polling...
  checkReady(function ($) {
    // --- Map container: a sibling BEFORE the Knack view ---
    // Because it's outside the view's DOM, Knack view re-renders don't touch it.
    var $container = $("#mapIFrameContainer");
    var $iframe;
    var isNewIframe = false;

    if ($container.length === 0) {
      isNewIframe = true;
      $container = $(
        '<div id="mapIFrameContainer" style="position:relative;"></div>',
      );
      $iframe = $(
        '<iframe src="' +
          nextAppUrl +
          '" frameborder="0" allow="geolocation; fullscreen" scrolling="yes" ' +
          'id="mapIFrame" style="width:100%;height:523px;"></iframe>',
      );
      $container.append($iframe);
      $(myView).before($container);
    } else {
      $iframe = $container.find("#mapIFrame");
    }

    // Move #lat-lon-form INSIDE the map container (after the iframe) so its
    // margin-top: -88px pulls it up into the map's visual area, not into
    // the gap between the map and the table.
    var $latLonForm = $("#lat-lon-form");
    if ($latLonForm.length && !$latLonForm.parent().is($container)) {
      $container.append($latLonForm);
    }

    // Stabilize layout during Knack table re-renders: give the view a
    // min-height so the page height doesn't collapse when Knack empties
    // and repopulates the table DOM.
    var $view = $(myView);
    if ($view.length) {
      var viewHeight = $view.outerHeight();
      if (viewHeight > 0) {
        $view.css("min-height", viewHeight + "px");
        setTimeout(function () {
          $view.css("min-height", "");
        }, 1000);
      }
    }

    // Always hide the ASSET_LOCATION_ID field — it is populated
    // programmatically and never needs to be visible to the user
    $("#kn-input-field_4461").closest(".kn-input").css({
      visibility: "hidden",
      height: 0,
      overflow: "hidden",
    });

    // Restore scroll position that was saved before form submission.
    // Delayed slightly so it runs after Knack finishes rebuilding the DOM.
    if (window.__mapScrollY != null) {
      var savedScroll = window.__mapScrollY;
      delete window.__mapScrollY;
      window.scrollTo(0, savedScroll);
      setTimeout(function () {
        window.scrollTo(0, savedScroll);
      }, 50);
      setTimeout(function () {
        window.scrollTo(0, savedScroll);
      }, 200);
    }

    /**
     * Shows a transient banner overlaying the top of the map.
     * Auto-fades after 5 seconds and is dismissable via the close button.
     */
    function showMapBanner(message) {
      $container.find(".map-banner").remove();
      var $banner = $(
        '<div class="map-banner">' +
          "<span>" + message + "</span>" +
          '<button type="button" class="map-banner__close" aria-label="Dismiss">&times;</button>' +
          "</div>",
      );
      $container.append($banner);

      function dismiss() {
        $banner.addClass("map-banner--fade");
        setTimeout(function () {
          $banner.remove();
        }, 500);
      }

      $banner.find(".map-banner__close").on("click", dismiss);
      setTimeout(dismiss, 5000);
    }

    // Show banner if a location was just added or removed
    if (window.__mapLocationAction) {
      var actionMsg = window.__mapLocationAction;
      delete window.__mapLocationAction;
      setTimeout(function () {
        showMapBanner(actionMsg);
      }, 300);
    }

    // Detect location removal via clicks on delete icons in the table
    if (!window.__mapDeleteBound) {
      window.__mapDeleteBound = true;
      $(document).on(
        "click",
        myView + " .kn-action-link, " + myView + " .fa-trash-o, " + myView + " .fa-times",
        function () {
          window.__mapLocationAction = "Location removed";
        },
      );
    }

    /**
     * Posts message to specified iframe
     * @param {Object} message - payload to send to iframe
     * @param {*} iframeWindow - iframe contentWindow reference
     */
    function sendMessageToApp(message, iframeWindow) {
      var stringifiedMessage = JSON.stringify(message);
      iframeWindow.postMessage(stringifiedMessage, nextAppUrl);
    }

    // Save scroll position and stabilize layout before any form submission
    if (!window.__mapSubmitScrollBound) {
      window.__mapSubmitScrollBound = true;
      $(document).on("click", "#lat-lon-form [type='submit']", function () {
        window.__mapScrollY = window.scrollY;
        window.__mapLocationAction = "Location added";
        var $v = $(myView);
        if ($v.length) {
          $v.css("min-height", $v.outerHeight() + "px");
        }
      });
    }

    // Listen for messages from the iframe (bind only once across re-runs)
    if (!window.__mapMessageListenerBound) {
      window.__mapMessageListenerBound = true;
      window.addEventListener("message", function (event) {
        if (event.origin !== nextAppUrl) {
          return;
        }
        var data = event.data;
        if (data.message === "LAT_LON_UPDATE") {
          console.log("knack received message ", data);
          var $latLonFields = $("#kn-input-field_3300");
          $latLonFields.find("#latitude").val(data.lat);
          $latLonFields.find("[name='longitude']").val(data.lng);
        }
        if (data.message === "EXISTING_LOCATION_SELECTED") {
          console.log("knack received existing location selection ", data);
          window.__mapScrollY = window.scrollY;
          window.__mapLocationAction = "Location added";
          var $v = $(myView);
          if ($v.length) {
            $v.css("min-height", $v.outerHeight() + "px");
          }
          var $latLonFields = $("#kn-input-field_3300");
          $latLonFields.find("#latitude").val(data.lat).trigger("change");
          $latLonFields
            .find("[name='longitude']")
            .val(data.lng)
            .trigger("change");
          $("#kn-input-field_4461")
            .find("input, select, textarea")
            .val(data.assetLocationId)
            .trigger("change");

          setTimeout(function () {
            var $submitBtn = $latLonFields
              .closest("form")
              .find("[type='submit']");
            if ($submitBtn.length) {
              console.log("Auto-submitting Add Location form");
              $submitBtn.trigger("click");
            }
          }, 300);
        }
        if (data.message === "LOCATION_MODE_CHANGE") {
          var $form = $("#lat-lon-form");
          if (data.mode === "select_existing") {
            $form.css("visibility", "hidden");
          } else {
            $form.css("visibility", "visible");
          }
        }
      });
    }

    // --- Data message functions ---
    // Fetch data from Knack API and forward to the iframe.

    function locationDetailsMapMessage() {
      var iframeWindow = $iframe[0].contentWindow;
      var urlArray = window.location.href.split("/");
      var recordId = urlArray[urlArray.length - 2];
      var workOrderId = urlArray[urlArray.length - 4];

      var headers = getHeaders(Knack.getUserToken(), Knack.application_id);
      var signsMarkerMessage = {
        message: "LOAD_WORK_ORDER_LOCATION_DETAILS_PAGE",
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
            sendMessageToApp(signsMarkerMessage, iframeWindow);
          });
        })
        .fail(function (res) {
          console.error(res);
        });
    }

    /**
     * Uses work order record ID to request signs and sends to iframe
     */
    function workOrdersDetailsMapMessage() {
      var urlArray = window.location.href.split("/");
      var recordId = urlArray[urlArray.length - 2];
      var iframeWindow = $iframe[0].contentWindow;
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
            message: "LOAD_WORK_ORDER_DETAILS_PAGE",
            payload: {
              records: res.records,
              workOrderId: recordId,
            },
          };
          sendMessageToApp(signsMarkerMessage, iframeWindow);
        })
        .fail(function (message) {
          console.error(message);
        });
    }

    function sendLocationMapMessage() {
      var crumbtrailArray = $(".kn-crumbtrail")
        .children()
        .last()
        .attr("href")
        .split("/");
      var recordId = crumbtrailArray[crumbtrailArray.length - 1].split("?")[0];
      var iframeWindow = $iframe[0].contentWindow;

      var headers = getHeaders(Knack.getUserToken(), Knack.application_id);

      $.ajax({
        url: `https://api.knack.com/v1/scenes/scene_1061/views/view_2682/records/${recordId}`,
        headers: headers,
      })
        .then(function (res) {
          var locationField = res["field_3300_raw"];
          console.log("OPEN_LOCATION_EDITOR: ", locationField);
          var locationMessage = {
            message: "OPEN_LOCATION_EDITOR",
            payload: {
              location: {
                longitude: locationField?.longitude,
                latitude: locationField?.latitude,
              },
            },
          };
          sendMessageToApp(locationMessage, iframeWindow);
        })
        .fail(function (message) {
          console.error(message);
        });
    }

    // --- Send data to iframe based on which Knack view is active ---
    // On first load this runs from the iframe's load event.
    // On subsequent Knack re-renders (script re-runs), the iframe is already
    // loaded so we send fresh data immediately — no reload needed.
    function sendViewData() {
      var viewId = myView.slice(1);
      if (viewId === "view_2609" || viewId === "view_2733") {
        locationDetailsMapMessage();
      } else if (viewId === "view_2573" || viewId === "view_2619") {
        workOrdersDetailsMapMessage();
        $("#lat-lon-form").css("visibility", "visible");
      } else if (viewId === "view_2682") {
        sendLocationMapMessage();
        $("#lat-lon-form").css("visibility", "visible");
      }
      setupMapFullscreenToggle($iframe);
    }

    if (isNewIframe) {
      $iframe.on("load", sendViewData);
    } else {
      sendViewData();
    }
  });
})();
