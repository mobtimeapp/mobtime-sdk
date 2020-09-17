import test from "ava";

import Mobtime, { MESSAGE_TYPES } from "./mobtime-sdk";
import { MockWebSocket } from "./testServer";

test("it connects to a timer", t => {
  const timer = new Mobtime("wss://localhost/test");
  timer._setMockWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.socket.emit("open");
  return connectionPromise.then(t.pass).catch(t.fail);
});

test("it detects the timer is new", async t => {
  const timer = new Mobtime("wss://localhost/test");
  timer._setMockWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.socket.emit("open");
  await connectionPromise;

  return timer
    .isNewTimer()
    .then(v => t.is(v, true))
    .catch(t.fail);
});

test("it detects the timer is not new", async t => {
  const timer = new Mobtime("wss://localhost/test");
  timer._setMockWebSocketClass(MockWebSocket);

  const connectionPromise = timer.connect();
  timer.socket.emit("open");

  await connectionPromise;

  timer.socket.emit(
    "message",
    JSON.stringify({
      type: MESSAGE_TYPES.TIMER_OWNERSHIP,
      isOwner: false
    })
  );

  return timer
    .isNewTimer()
    .then(v => t.is(v, false))
    .catch(t.fail);
});
