import test from "ava";

import { Mobtime } from "./mobtime.js";
import { Mob } from "./mob.js";
import { Goals } from "./goals.js";
import { Settings } from "./settings.js";
import { Timer } from "./timer.js";
import { Message } from "./message.js";
import { withTestSocket } from "../../support/socket.js";

test("creates instance, and is chainable, and can be destructed", async t => {
  const client = new Mobtime();
  const { init, socket } = withTestSocket(client);
  init();
  const instance = await client.ready();

  t.is(client, instance);

  client.disconnect();
  t.truthy(socket.close.called);
  t.is(client.socket, null);
});

test("can return a mob object", t => {
  const client = new Mobtime();

  t.truthy(client.mob() instanceof Mob);
});

test("can return a goals object", t => {
  const client = new Mobtime();

  t.truthy(client.goals() instanceof Goals);
});

test("can return a settings object", t => {
  const client = new Mobtime();

  t.truthy(client.settings() instanceof Settings);
});

test("can return a timer object", t => {
  const client = new Mobtime();

  t.truthy(client.timer() instanceof Timer);
});

test("async find a message", async t => {
  const messages = [
    { type: "foo" },
    { type: "bar" },
    { type: "fizz" },
    { type: "buzz" },
  ];

  const client = new Mobtime();
  messages.forEach(m => client._onMessage(JSON.stringify(m)));

  const message = await client.findMessageWhere(m => m.type === "bar");

  t.is(messages[1].type, message.type);
});
