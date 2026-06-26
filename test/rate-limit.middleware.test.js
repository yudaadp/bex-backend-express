const assert = require("node:assert/strict");
const test = require("node:test");
const { createRateLimiter } = require("../src/middleware/rate-limit.middleware");

function createMockResponse(onJson) {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    set(name, value) {
      this.headers[name] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      onJson(this);
    }
  };
}

function runLimiter(limiter, request) {
  return new Promise((resolve) => {
    const response = createMockResponse(resolve);

    limiter(request, response, () => {
      resolve(response);
    });
  });
}

test("rate limiter returns 429 after max requests in the same window", async () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  const request = {
    ip: "127.0.0.1",
    method: "GET",
    baseUrl: "/api/auth",
    path: "/me"
  };

  const first = await runLimiter(limiter, request);
  const second = await runLimiter(limiter, request);
  const third = await runLimiter(limiter, request);

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal(third.statusCode, 429);
  assert.equal(third.body.message, "Too many requests, please try again later");
});

test("rate limiter uses method and path as part of the key", async () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });

  const first = await runLimiter(limiter, {
    ip: "127.0.0.1",
    method: "GET",
    baseUrl: "/api/auth",
    path: "/me"
  });
  const second = await runLimiter(limiter, {
    ip: "127.0.0.1",
    method: "POST",
    baseUrl: "/api/auth",
    path: "/login"
  });

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
});
