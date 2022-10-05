import { Message } from "../src/sdk/message.js";
import { Socket as BaseSocket } from "../src/sdk/socket.js";
import { Eventable } from "../src/sdk/eventable.js";
import sinon from "sinon";

export class Socket extends BaseSocket {
  constructor(timerId, options) {
    super(timerId, options);
    this.sendInitialPayloads = this.sendInitialPayloads.bind(this);

    this.connect = sinon.fake(this.connect.bind(this));
    this.disconnect = sinon.fake(this.disconnect.bind(this));
    this.send = sinon.fake(this.send.bind(this));
    this.on = sinon.fake(this.on.bind(this));
    this.off = sinon.fake(this.off.bind(this));
  }

  connect() {
    this.events = new Eventable();
    setTimeout(this.sendInitialPayloads, 10);
    return Promise.resolve(this);
  }

  disconnect() {
    delete this.events;
  }

  send(data) {
    this.events.trigger("send", data);
    return Promise.resolve();
  }

  on(event, callback) {
    return this.events.on(event, callback);
  }

  off(event, callback) {
    return this.events.off(event, callback);
  }

  recv(data) {
    return this.trigger("message", data);
  }

  sendInitialPayloads() {
    this.recv(Message.mobUpdate([]));
    this.recv(Message.goalsUpdate([]));
    this.recv(
      Message.settingsUpdate({
        duration: 5 * 60 * 1000,
        mobOrder: "driver,navigator",
      }),
    );
  }
}

export const withTestSocket = mobtime => {
  const sendJson = json => mobtime._onMessage(json);
  const close = () => mobtime.trigger("close");
  const error = () => mobtime.trigger("error");
  const socket = {
    connect: sinon.fake(),
    close: sinon.fake(),
    send: sinon.fake(sendJson),
  };

  const init = () => {
    mobtime.trigger("message", Message.mobUpdate([]));
    mobtime.trigger("message", Message.goalsUpdate([]));
    mobtime.trigger(
      "message",
      Message.settingsUpdate({
        duration: 5 * 60 * 1000,
        mobOrder: "driver,navigator",
      }),
    );
  };

  mobtime.socket = socket;

  return {
    init,
    close,
    error,
    socket,
  };
};
