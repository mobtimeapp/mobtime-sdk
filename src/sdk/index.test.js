import test from "ava";

import { Mobtime } from "./index.js";
import { withTestSocket } from "../../support/socket.js";

test("it connects to a timer", t => {
  const timer = new Mobtime();
  const socket = withTestSocket(timer);

  const connectionPromise = timer.ready();
  socket.init();
  return connectionPromise.then(t.pass).catch(t.fail);
});
