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
    message: any;
    /**
     * @private
     * @param {*} data
     * @param {*} options
     * @returns {void}
     */
    private _onMessage;
    state: {
        timer: {
            startedAt: any;
            duration: number;
        };
        goals: any[];
        mob: any[];
        settings: {
            mobOrder: string;
            duration: number;
        };
    };
    prevState: {
        timer: {
            startedAt: any;
            duration: number;
        };
        goals: any[];
        mob: any[];
        settings: {
            mobOrder: string;
            duration: number;
        };
    };
    recentIds: any;
    setState(state: any): void;
    /**
     * Tell mobtime how to connect the websocket
     *
     * @param {PromiseLike<Socket>} socketPromise
     * @return {PromiseLike<Mobtime>}
     */
    usingSocket(socketPromise: PromiseLike<Socket>): PromiseLike<Mobtime>;
    socket: Socket;
    _updateState(key: any, value: any): void;
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
    _onDisconnect(): void;
    _onConnect(): void;
    /**
     * Disconnect websocket
     */
    disconnect(): Mobtime;
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
