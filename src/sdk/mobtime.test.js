import test from "ava";
import sinon from "sinon";

import { Mobtime } from "./mobtime.js";
import { withTestSocket } from "../../support/socket.js";

test("creates socket, and is chainable, and can be destructed", async t => {
  const client = new Mobtime();
  const socket = withTestSocket(client);
  socket.init();
  const instance = await client.ready();

  t.is(client, instance);
  t.truthy(
    makeTestSocket.calledWithExactly("test-timer", {}),
    "make socket function called",
  );

  await client.disconnect();
  t.is(client.socket, null);
});

test("on connect, it sends the connection message", async t => {
  const { client, socketRig } = createTestMobtime("test-timer");
  await client.connect();

  t.truthy(
    socketRig.send.calledWithExactly(JSON.stringify({ type: "client:new" })),
    "sends connection message",
  );
});
