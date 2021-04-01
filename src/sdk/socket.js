import WebSocket from 'ws';

const makeWebsocketUri = (timerId, { secure, domain }) => {
  return [
    secure ? 'wss://' : 'ws://',
    domain || 'mobti.me',
    '/',
    timerId,
  ].join('');
};

export class Socket {
  static connect(timerId, { secure, domain }) {
    return new Promise((resolve, reject) => {
      const websocket = new WebSocket(makeWebsocketUri(timerId, { secure, domain }));
      websocket.on('error', reject);
      websocket.on('open', () => {
        websocket.off('error', reject);
        resolve(new Socket(websocket));
      });
    });
  }

  constructor(websocket) {
    this.websocket = websocket;
  }

  disconnect() {
    this.websocket.close();
    this.websocket = null;
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
