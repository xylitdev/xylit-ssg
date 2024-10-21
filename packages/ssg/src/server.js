import { createReadStream, readFileSync } from "node:fs";
import { Server } from "node:http";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";

import { HTMLRewriter } from "htmlrewriter";
import mime from "mime";
import WebSocket, { WebSocketServer } from "ws";

import { exec } from "./runtime.js";
import { fileExists } from "./utils/fs.js";

const liveScriptTemplate = readFileSync(
  resolve(import.meta.dirname, "./server/live.client.js"),
  { encoding: "utf-8" }
);

const createLiveScript = config => {
  return liveScriptTemplate.replace(
    `/*INJECT_LIVE_CONFIG*/`,
    JSON.stringify(config)
  );
};

const create500Response = async () => {
  const { doc } = await exec(
    resolve(import.meta.dirname, "./server/server-500.ssg.js")
  );

  return new Response(doc.toString(), {
    status: 500,
    statusText: "Internal Server Error",
    headers: { "Content-Type": "text/html" },
  });
};

const create404Response = async () => {
  const { doc } = await exec(
    resolve(import.meta.dirname, "./server/server-404.ssg.js")
  );

  return new Response(doc.toString(), {
    status: 404,
    statusText: "Not Found",
    headers: { "Content-Type": "text/html" },
  });
};

const createFileResponse = async filename => {
  if (!(await fileExists(filename))) return;

  const stream = createReadStream(filename);

  return new Response(stream, {
    headers: { "Content-Type": mime.getType(filename) },
  });
};

export class LiveServer {
  constructor(config) {
    this.wss = new WebSocketServer({ noServer: true });
    this.server = new Server();
    this.requestHandlers = new Set();
    this.pathname = "/livereload";
    this.port = 8080;

    Object.assign(this, config);

    this.server.on("upgrade", this.onUpgrade);
    this.server.on("request", this.onRequest);
    this.liveScript = createLiveScript({ pathname: this.pathname });
  }

  async runRequestHandlers(req, res) {
    for (const handler of this.requestHandlers) {
      const response = await handler(req, res);

      if (response) return response;
    }
  }

  onRequest = async (req, res) => {
    const filename = join(this.root, req.url);
    const rewriter = new HTMLRewriter();

    rewriter.on("head", {
      element: element => {
        element.append(`<script>${this.liveScript}</script>`, { html: true });
      },
    });

    let response;

    try {
      response =
        (await this.runRequestHandlers(req, { rewriter })) ||
        (await createFileResponse(filename)) ||
        (await create404Response());
    } catch (err) {
      console.error(err);

      response =
        (await this.onRequestError?.(req, err, { rewriter })) ||
        (await create500Response(err));
    }

    if (response.headers.get("Content-Type") === "text/html") {
      response = rewriter.transform(response);
    }

    res.writeHead(response.status, response.statusText, response.headers);
    Readable.fromWeb(response.body).pipe(res);
  };

  onUpgrade = async (req, sock, head) => {
    const url = new URL(req.url, "wss://base.url");

    if (url.pathname === this.pathname) {
      this.wss.handleUpgrade(req, sock, head, ws => {
        this.wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  };

  addRequestHandler(handler) {
    this.requestHandlers.add(handler);
  }

  removeRequestHandler(handler) {
    this.requestHandlers.delete(handler);
  }

  send(eventType, payload) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ eventType, payload }));
      }
    });
  }

  listen() {
    this.server.listen(this.port);
    console.log(`http://localhost:${this.port}`);
  }
}
