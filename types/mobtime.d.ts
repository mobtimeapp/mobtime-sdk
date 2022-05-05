export namespace INITIAL_STATE {
    namespace timer {
        const startedAt: any;
        const duration: number;
    }
    const goals: any[];
    const mob: any[];
    namespace settings {
        export const mobOrder: string;
        const duration_1: number;
        export { duration_1 as duration };
    }
}
export class Mobtime extends Eventable {
    /** @private */
    private message;
    /** @private */
    private _onMessage;
    /** @private */
    private _state;
    /** @private */
    private prevState;
    /** @private */
    private recentIds;
    setState(state: any): void;
    get state(): any;
    /**
     * Tell mobtime how to connect the websocket
     *
     * @param {PromiseLike<Socket>} socketPromise
     * @return {PromiseLike<Mobtime>}
     */
    usingSocket(socketPromise: PromiseLike<Socket>): PromiseLike<Mobtime>;
    socket: Socket;
    /**
     * @private
     */
    private _updateState;
    /**
     * Get mob data
     *
     * @return {Mob}
     */
    mob(): Mob;
    /**
     * Get goals data
     *
     * @return {Goals}
     */
    goals(): Goals;
    /**
     * Get goals data
     *
     * @return {Settings}
     */
    settings(): Settings;
    /**
     * Get timer data
     *
     * @return {Timer}
     */
    timer(): Timer;
    /** @private */
    private _onDisconnect;
    /** @private */
    private _onConnect;
    /**
     * Disconnect websocket
     *
     * @return {void}
     */
    disconnect(): void;
    /**
     * Send a message to mobtime server
     * @param {string} message
     * @return {PromiseLike<null>}
     */
    send(message: string): PromiseLike<null>;
    findMessageWhere(findCb: any): any;
    /**
     * Wait for a message to be sent
     *
     * @param {string} type
     * @return {PromiseLike<Message>} - the message that was hit
     */
    waitForMessageType(type: string): PromiseLike<Message>;
    /**
     * Wait for first batch of updates from the server
     *
     * @return {PromiseLike<Mobtime>}
     */
    ready(): PromiseLike<Mobtime>;
}
import { Eventable } from "./eventable.js";
import { Socket } from "./socket.js";
import { Mob } from "./mob.js";
import { Goals } from "./goals.js";
import { Settings } from "./settings.js";
import { Timer } from "./timer.js";
import { Message } from "./message.js";
