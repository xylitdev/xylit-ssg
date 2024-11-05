(LIVE => {
  const socket = new WebSocket(`ws://${location.host}${LIVE.pathname}`);
  socket.addEventListener("message", ({ data }) => {
    const detail = JSON.parse(data);

    if (detail.eventType === "reload") return location.reload();

    const event = new CustomEvent("xylit:livereload", { detail });
    window.dispatchEvent(event);
  });
})(/*INJECT_LIVE_CONFIG*/);
