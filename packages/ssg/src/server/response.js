const statusText = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
};

export class StatusResponse extends Response {
  constructor(body, init) {
    super(body, {
      statusText: statusText[init?.status] ?? "",
      ...init,
    });
  }
}

export class HtmlResponse extends StatusResponse {
  constructor(body, init) {
    super(body, {
      ...init,
      headers: {
        "Content-Type": "text/html",
        ...init?.headers,
      },
    });
  }
}
