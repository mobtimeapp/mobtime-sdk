import test from 'ava';
import sinon from 'sinon';

import { Mobtime } from './mobtime.js';

const createTestMobtime = (timerId, options) => {
  const events = {};

  const trigger = (eventName, payload) => {
    (events[eventName] || []).forEach((fn) => fn(payload));
  };

  const clientReceives = (type, payload) => {
    trigger('message', JSON.stringify({ type, payload }));
  };

  const socketRig = {
    on: sinon.fake((eventName, callback) => {
      events[eventName] = (events[eventName] || []).concat(callback);
    }),
    off: sinon.fake((eventName, callback) => {
      events[eventName] = (events[eventName] || []).filter((fn) => fn !== callback);
    }),
    close: sinon.fake(),
    send: sinon.fake(),
  };

  const makeTestSocket = sinon.fake(() => {
    return socketRig;
  });

  const client = new Mobtime(timerId, options);
  client.testSetMakeSocketFunction(makeTestSocket);

  return {
    client,
    clientReceives,
    socketRig,
    makeTestSocket,
  };
};

test('creates socket, and is chainable, and can be destructed', async (t) => {
  const { client, makeTestSocket } = createTestMobtime('test-timer');
  const instance = await client.connect();

  t.is(client, instance);
  t.truthy(makeTestSocket.calledWithExactly('test-timer', {}), 'make socket function called');

  await client.disconnect();
  t.is(client.socket, null);
});

test('on connect, it sends the connection message', async (t) => {
  const { client, socketRig } = createTestMobtime('test-timer');
  await client.connect();

  t.truthy(socketRig.send.calledWithExactly(JSON.stringify({ type: 'client:new' })), 'sends connection message');
});
