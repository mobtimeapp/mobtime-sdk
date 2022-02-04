import test from "ava";
import sinon from "sinon";

import { Mobtime, Message } from "./index";
import { MockWebSocket } from "../testServer";

test("it connects to a timer", t => {
  const timer = new Mobtime("wss://localhost/test");
  timer.testing.setWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.testing.onSocketOpen();
  return connectionPromise.then(t.pass).catch(t.fail);
});

test("it detects the timer is new", async t => {
  const timer = new Mobtime("wss://localhost/test");
  timer.testing.setWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.testing.onSocketOpen();
  await connectionPromise;

  return timer
    .isNewTimer()
    .then(v => t.is(v, true))
    .catch(t.fail);
});

test("it detects the timer is not new", async t => {
  const timer = new Mobtime("wss://localhost/test");
  timer.testing.setWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.testing.onSocketOpen();

  await connectionPromise;

  timer.testing.onSocketMessage(
    JSON.stringify({
      type: Message.TIMER_OWNERSHIP,
      isOwner: false,
    }),
  );

  return timer
    .isNewTimer()
    .then(v => t.is(v, false))
    .catch(t.fail);
});

test.skip("it can insert a new member into an existing mob", async t => {
  MockWebSocket.prototype.send.resetHistory();
  const timer = new Mobtime("wss://localhost/test");
  timer.testing.setWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.testing.onSocketOpen();
  await connectionPromise;

  await timer.mobAdd('Bob');

  t.truthy(MockWebSocket.prototype.send.called());
});
