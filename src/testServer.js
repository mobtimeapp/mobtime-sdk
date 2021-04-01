import sinon from "sinon";

function MockWebSocket() {}
MockWebSocket.prototype.on = sinon.fake();
MockWebSocket.prototype.send = sinon.fake((data, options, callback) => {
  callback();
});
MockWebSocket.prototype.disconnect = sinon.fake();

export { MockWebSocket };
