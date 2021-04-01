import { Eventable } from './eventable.js';
import { Message } from './message.js';
import { Socket } from './socket.js';

export class Mobtime {
  constructor(timerId, options = {}) {
    this.timerId = timerId;
    this.options = options;
    this.socket = null;
    this.makeSocket = Socket.connect;
    this.events = new Eventable();
    this.message = new Message({ type: null, payload: null });
    this._onMessage = this._onMessage.bind(this);
  }

  testSetMakeSocketFunction(makeSocket) {
    this.makeSocket = makeSocket;
  }

  _onMessage(data) {
    this.message = this.message.chain(JSON.parse(data));
    this.events.trigger(this.message.type, this.message);
  }

  _onDisconnect() {
    this.socket.off('message', this._onMessage);
  }

  _onConnect() {
    this.socket.on('message', this._onMessage);
  }

  async connect() {
    this.socket = await this.makeSocket(this.timerId, this.options);
    return this;
  }

  send(type, payload) {
    return this.socket.send(JSON.stringify({ ...payload, type }));
  }

  waitForMessage(type, callback) {
    return this.events.once(type, callback);
  }

  on(type, callback) {
    return this.events.on(type, callback);
  }

  off(type, callback) {
    return this.events.off(type, callback);
  }
}
