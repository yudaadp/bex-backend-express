const assert = require("node:assert/strict");
const test = require("node:test");

process.env.AUTH_RATE_LIMIT_MAX = "1";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000 # previous value";

const app = require("../src/app");

function request(method, url) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      originalUrl: url,
      headers: {},
      connection: { remoteAddress: "127.0.0.1" },
      socket: { remoteAddress: "127.0.0.1" }
    };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return this.headers[name.toLowerCase()];
      },
      removeHeader(name) {
        delete this.headers[name.toLowerCase()];
      },
      end(body) {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: body ? body.toString() : ""
        });
      },
      write(body) {
        this.body = `${this.body || ""}${body}`;
      }
    };

    app.handle(req, res);
  });
}

test("GET /api/auth/me is rate limited before auth middleware", async () => {
  const first = await request("GET", "/api/auth/me");
  const second = await request("GET", "/api/auth/me");

  assert.equal(first.statusCode, 401);
  assert.equal(first.headers["x-ratelimit-limit"], "1");
  assert.equal(first.headers["x-ratelimit-remaining"], "0");
  assert.equal(second.statusCode, 429);
  assert.match(second.body, /Too many auth attempts/);
});
