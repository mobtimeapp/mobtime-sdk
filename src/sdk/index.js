export { Mobtime } from "./mobtime.js";
export { Message } from "./message.js";
export { Socket as BaseSocket } from "./socket.js";

export const nodeWebsocket = (timerId, options) =>
  import("./socket.node.js").then(({ Socket }) => new Socket(timerId, options));

export const browserWebsocket = (timerId, options) =>
  import("./socket.browser.js").then(
    ({ Socket }) => new Socket(timerId, options),
  );
