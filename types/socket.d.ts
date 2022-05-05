export class Socket {
    constructor(timerId: any, options: any);
    uri: string;
    set socket(arg: any);
    get socket(): any;
    connect(): any;
    disconnect(): void;
    send(_data: any): any;
    on(_event: any, _callback: any): void;
    off(_event: any, _callback: any): void;
}
