import sinon from "sinon";

function MockWebSocket(url) {
  this._url = url;

  this.callbacks = {};
  const getCallbacksFor = type => {
    return this.callbacks[type] || [];
  };

  this.on = sinon.fake((type, callback) => {
    this.callbacks[type] = getCallbacksFor(type);
    this.callbacks[type].push(callback);
  });
  this.send = sinon.fake();
  this.disconnect = sinon.fake();

  this.emit = (type, event) => {
    getCallbacksFor(type).forEach(callback => callback(event));
  };
}

export { MockWebSocket };
