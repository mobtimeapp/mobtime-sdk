import { Socket as BaseSocket } from './socket.js';

export class Socket extends BaseSocket {
  constructor(timerId, options) {
    super(timerId, options);
  }

  connect() {
    if (this.websocket) {
      this.disconnect();
    }

    return new Promise((resolve, reject) => {
      const websocket = new window.WebSocket(this.uri);

      websocket.addEventListener('close', reject);
      websocket.addEventListener('error', reject);

      websocket.addEventListener('open', () => {
        websocket.removeEventListener('close', reject);
        websocket.removeEventListener('error', reject);

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
    this.websocket.send(data);
    return Promise.resolve();
  }

  on(event, callback) {
    return this.websocket.addEventListener(event, callback);
  }

  off(event, callback) {
    return this.websocket.removeEventListener(event, callback);
  }
}
