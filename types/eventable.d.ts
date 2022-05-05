export class Eventable {
    listeners: {};
    /**
     * Start listening to an event
     * @param {string} type - the event string type
     * @param {function} callback - function to run when the event runs
     * @param {any} options - specify options, can be left undefined
     * @return {function} - cancel callback, stops listening to the event
     */
    on(type: string, callback: Function, options: any): Function;
    /**
     * Start listening to an event, stops listening after first time the callback is ran
     * @param {string} type - the event string type
     * @param {function} callback - function to run when the event runs
     * @param {any} options - specify options, can be left undefined
     * @return {function} - cancel callback, stops listening to the event
     */
    once(type: string, callback: Function, options: any): Function;
    /**
     * Stop listening to an event
     * @param {string} type - the event string type
     * @param {function} callback - function to run when the event runs
     */
    off(type: string, callback: Function): void;
    trigger(type: any, payload: any, parent: any, options?: {}): void;
}
export namespace Eventable {
    namespace defaultListenerOptions {
        const source: any;
    }
    function listenerOptions(options?: {}): {
        source: any;
    };
}
