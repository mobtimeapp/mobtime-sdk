import WebSocket from 'ws';
import { Socket as BaseSocket } from './socket.js';

export class Socket extends BaseSocket {
  constructor(timerId, options) {
    super(timerId, options);

    this.messageBuffer = [];
  }

  connect() {
    if (this.websocket) {
      this.disconnect();
    }

    return new Promise((resolve, reject) => {
      const websocket = new WebSocket(this.uri);

      websocket.on('close', reject);
      websocket.on('error', reject);

      websocket.on('open', () => {
        websocket.off('close', reject);
        websocket.off('error', reject);

        this.websocket = websocket;

        return resolve(this);
      });
    });
  }

  disconnect() {
    if (!this.websocket) return;

    this.websocket.close();
    delete this.websocket;
  }

  send(data) {
    return new Promise((resolve) => {
      this.websocket.send(data, {}, resolve);
    });
  }

  on(event, callback) {
    return this.websocket.on(event, callback);
  }

  off(event, callback) {
    return this.websocket.off(event, callback);
  }
}

