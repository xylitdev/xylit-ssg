import WebSocket, { WebSocketServer } from "ws";

export const createLivereload = ({ server, pathname = "/livereload" }) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", function upgrade(request, socket, head) {
    const url = new URL(request.url, "wss://base.url");

    if (url.pathname === pathname) {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  const clientScript = `(() => {
    const socket = new WebSocket(\`ws://\${location.host}${pathname}\`);
    socket.addEventListener("message", ({ data }) => {
      const detail = JSON.parse(data);

      if (detail.type === 'reload') return location.reload();

      const event = new CustomEvent("xylit:livereload", { detail });
      window.dispatchEvent(event);
    });
  })();`;

  return {
    inject(doc) {
      const node =
        doc.querySelector("head") ||
        doc.querySelector("body") ||
        doc.querySelector("html") ||
        doc;

      node.insertAdjacentHTML?.(
        "beforeend",
        `<script>${clientScript}</script>`
      );
    },
    send(type, payload) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type, payload }));
        }
      });
    },
  };
};
