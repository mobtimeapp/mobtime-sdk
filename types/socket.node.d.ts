export class Socket extends BaseSocket {
    websocket: any;
    on(event: any, callback: any): any;
    off(event: any, callback: any): any;
}
import { Socket as BaseSocket } from "./socket.js";
