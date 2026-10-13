/*! MemeReach Publisher SDK v0.1.0 | off-chain, sandbox-aware, no private credentials */
(function (global) {
  "use strict";
  function createMemeReach(config) {
    var endpoint = config && config.endpoint ? config.endpoint.replace(/\/$/, "") : "";
    var placementId = config && config.placementId;
    var container = typeof config.container === "string" ? document.querySelector(config.container) : config.container;
    var sandbox = Boolean(config && config.sandbox);
    var currentAd = null;
    function emit(eventType) {
      if (!currentAd || !endpoint) return Promise.resolve(null);
      var eventId = "mr_evt_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      return fetch(endpoint + "/api/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId: eventId, eventType: eventType, campaignId: currentAd.campaignId, placementId: placementId, requestId: currentAd.requestId, token: currentAd.placementToken, sandbox: sandbox }) }).catch(function () { return null; });
    }
    function render(ad) {
      if (!container || !ad) return;
      currentAd = ad;
      container.innerHTML = "";
      var label = document.createElement("span"); label.className = "memereach-sponsored"; label.textContent = "Sponsored";
      var title = document.createElement("a"); title.href = ad.clickUrl; title.rel = "sponsored noopener"; title.target = "_blank"; title.textContent = ad.headline; title.addEventListener("click", function () { emit("click"); });
      var description = document.createElement("p"); description.textContent = ad.description;
      container.append(label, title, description);
      emit("impression");
    }
    function request(context) {
      if (!endpoint || !placementId || !container) return Promise.resolve(null);
      var requestId = "mr_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      return fetch(endpoint + "/api/ad-request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ placementId: placementId, publisherDomain: location.hostname, category: config.category || "crypto", context: context || "", sandbox: sandbox, requestId: requestId }) }).then(function (response) { return response.ok ? response.json() : null; }).then(function (payload) { if (payload && payload.ad) render(payload.ad); return payload && payload.ad ? payload.ad : null; }).catch(function () { return null; });
    }
    return { request: request, reportConversion: function () { return emit("conversion"); }, destroy: function () { if (container) container.innerHTML = ""; currentAd = null; } };
  }
  global.MemeReach = { create: createMemeReach };
})(window);
