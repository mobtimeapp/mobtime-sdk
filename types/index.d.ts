export { Mobtime } from "./mobtime.js";
export { Message } from "./message.js";
export { Socket as BaseSocket } from "./socket.js";
export function nodeWebsocket(timerId: any, options: any): Promise<import("./socket.node.js").Socket>;
export function browserWebsocket(timerId: any, options: any): Promise<import("./socket.browser.js").Socket>;
