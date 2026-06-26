const assert = require("node:assert/strict");
const test = require("node:test");
const usersRoutes = require("../src/routes/users.routes");

function getRouteHandlerNames(path, method) {
  const layer = usersRoutes.stack.find(
      (item) => item.route?.path === path && item.route?.methods[method] === true
  );

  assert.ok(layer, `Route ${method.toUpperCase()} ${path} should exist`);

  return layer.route.stack.map((item) => item.handle.name);
}

test("GET / applies auth middleware before list controller", () => {
  const handlers = getRouteHandlerNames("/", "get");

  assert.deepEqual(handlers, ["requireAuth", "list"]);
});

test("GET /:id applies auth middleware before detail controller", () => {
  const handlers = getRouteHandlerNames("/:id", "get");

  assert.deepEqual(handlers, ["requireAuth", "detail"]);
});

test("POST / applies auth middleware before create controller", () => {
  const handlers = getRouteHandlerNames("/", "post");

  assert.deepEqual(handlers, ["requireAuth", "create"]);
});

test("PUT /:id applies auth middleware before update controller", () => {
  const handlers = getRouteHandlerNames("/:id", "put");

  assert.deepEqual(handlers, ["requireAuth", "update"]);
});
