export class Eventable {
  constructor() {
    this.listeners = {};
  }

  on(type, callback) {
    this.listeners[type] = (this.listeners[type] || []).concat(callback);
    return () => this.off(type, callback);
  }

  once(type, callback) {
    return this.on(type, (payload) => {
      callback(payload);
      return () => this.off(type, callback);
    });
  }

  off(type, callback) {
    this.listeners[type] = (this.listeners[type] || []).filter((cb) => cb !== callback);
  }

  trigger(type, payload) {
    (this.listeners[type] || []).map((cb) => cb(payload))
      .filter((afterFn) => typeof afterFn === 'function')
      .forEach((afterFn) => afterFn());
  }
}
