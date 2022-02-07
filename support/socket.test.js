import { BaseSocket, Message } from "../src/sdk/index.js";
import { Eventable } from "../src/sdk/eventable.js";

export class Socket extends BaseSocket {
  constructor(timerId, options) {
    super(timerId, options);
    this.sendInitialPayloads = this.sendInitialPayloads.bind(this);
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

Socket.use = (timerId = "") => Promise.resolve(new Socket(timerId));
