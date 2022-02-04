export class Socket {
  constructor(timerId, options) {
    const secure = (options && options.secure) || true;
    const domain = (options && options.domain) || 'mobti.me';
    this.uri = [
      secure ? 'wss://' : 'ws://',
      domain || 'mobti.me',
      '/',
      timerId,
    ].join('');
  }

  get socket() {
    return this._websocket;
  }

  set socket(_value) {}

  connect() {
    return Promise.reject(new Error('Socket.connect not implemented'));
  }

  disconnect() {
    throw new Error('Socket.disconnect not implemented');
  }

  send(_data) {
    return Promise.reject(new Error('Socket.send not implemented'));
  }

  on(_event, _callback) {
    throw new Error('Socket.on not implemented');
  }

  off(_event, _callback) {
    throw new Error('Socket.off not implemented');
  }
}
