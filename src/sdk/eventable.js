export class Eventable {
  /**
   * @constructor
   */
  constructor() {
    this.listeners = {};
  }

  /**
   * Start listening to an event
   * @param {string} type - the event string type
   * @param {function} callback - function to run when the event runs
   * @param {any} options - specify options, can be left undefined
   * @return {function} - cancel callback, stops listening to the event
   */
  on(type, callback, options) {
    this.listeners[type] = (this.listeners[type] || []).concat({
      callback,
      options: Eventable.listenerOptions(options),
    });
    return () => this.off(type, callback);
  }

  /**
   * Start listening to an event, stops listening after first time the callback is ran
   * @param {string} type - the event string type
   * @param {function} callback - function to run when the event runs
   * @param {any} options - specify options, can be left undefined
   * @return {function} - cancel callback, stops listening to the event
   */
  once(type, callback, options) {
    return this.on(
      type,
      payload => {
        callback(payload);
        return () => this.off(type, callback);
      },
      options,
    );
  }

  /**
   * Stop listening to an event
   * @param {string} type - the event string type
   * @param {function} callback - function to run when the event runs
   */
  off(type, callback) {
    this.listeners[type] = (this.listeners[type] || []).filter(
      listener => listener.callback !== callback,
    );
  }

  trigger(type, payload, parent, options = {}) {
    const source = (options && options.source) || "server";
    (this.listeners[type] || [])
      .filter(listener => !listener.source || source === listener.source)
      .map(listener => listener.callback(payload, parent, options))
      .filter(afterFn => typeof afterFn === "function")
      .forEach(afterFn => afterFn());
  }
}

Eventable.defaultListenerOptions = {
  source: null,
};

Eventable.listenerOptions = (options = {}) => ({
  ...Eventable.defaultListenerOptions,
  ...options,
});
