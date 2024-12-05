import { createReadStream, readFileSync } from "node:fs";
import { Server } from "node:http";
import { join, resolve } from "node:path";

import mime from "mime";
import WebSocket, { WebSocketServer } from "ws";

import { createContext } from "./context.js";
import Page404 from "./page-404.js";
import Page500 from "./page-500.js";

const LiveScript = (() => {
  const template = readFileSync(
    resolve(import.meta.dirname, "./live.client.js"),
    { encoding: "utf-8" }
  );

  return config => {
    return template.replace(`/*INJECT_LIVE_CONFIG*/`, JSON.stringify(config));
  };
})();

export class LiveServer {
  #listeners = [];
  #server = new Server();
  #wss = new WebSocketServer({ noServer: true });
  #config = {
    port: 8080,
    pathname: "/livereload",
  };

  constructor(config) {
    Object.assign(this.#config, config);

    this.liveScript = LiveScript(this.#config);
    this.#server.on("upgrade", this.#onUpgrade);
    this.#server.on("request", this.#onRequest);
  }

  get base() {
    return new URL(`http://localhost:${this.#config.port}`);
  }

  #onRequest = async (req, res) => {
    const ctx = createContext(req, res);

    let response;

    for (const listener of this.#listeners) {
      try {
        response = await listener(ctx);

        if (response instanceof Response) {
          response = await ctx.sendResponse(response);
        }
      } catch (error) {
        console.error(error);

        const html = Page500({ error, liveScript: this.liveScript });
        return ctx.sendHtml(html, { status: 500 });
      }

      if (res.writableEnded) return;
      if (response) break;
    }

    if (!response) {
      const path = join(this.#config.root, req.url);
      const stream = createReadStream(path);

      ctx
        .sendStream(stream, { "Content-Type": mime.getType(path) })
        .catch(() => {
          const html = Page404({ liveScript: this.liveScript });
          return ctx.sendHtml(html, { status: 400 });
        });
    }
  };

  #onUpgrade = async (req, sock, head) => {
    const url = new URL(req.url, "wss://base.url");

    if (url.pathname === this.#config.pathname) {
      this.#wss.handleUpgrade(req, sock, head, ws => {
        this.#wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  };

  use(middleware) {
    this.#listeners.push(middleware);
  }

  send(eventType, payload) {
    this.#wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ eventType, payload }));
      }
    });
  }

  listen() {
    this.#server.listen(this.#config.port);
    console.log(`http://localhost:${this.#config.port}`);
  }
}
