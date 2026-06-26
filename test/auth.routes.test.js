const assert = require("node:assert/strict");
const test = require("node:test");
const authRoutes = require("../src/routes/auth.routes");

function getRouteHandlerNames(path, method) {
  const layer = authRoutes.stack.find((item) => item.route?.path === path);

  assert.ok(layer, `Route ${path} should exist`);
  assert.equal(layer.route.methods[method], true);

  return layer.route.stack.map((item) => item.handle.name);
}

test("GET /me applies rate limiter before auth middleware", () => {
  const handlers = getRouteHandlerNames("/me", "get");

  assert.deepEqual(handlers, ["rateLimiter", "requireAuth", "me"]);
});

test("POST /refresh applies rate limiter before refresh controller", () => {
  const handlers = getRouteHandlerNames("/refresh", "post");

  assert.deepEqual(handlers, ["rateLimiter", "refresh"]);
});
