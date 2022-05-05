export class Message {
    constructor({ id, type, ...payload }: {
        [x: string]: any;
        id: any;
        type: any;
    }, previousMessage: any);
    id: any;
    type: any;
    payload: {
        [x: string]: any;
    };
    previousMessage: any;
    json(): {
        id: any;
        type: any;
        payload: {
            [x: string]: any;
        };
    };
    detachHistory(): any;
    chain(message: any): Message;
}
export namespace Message {
    const MOB_UPDATE: string;
    const GOALS_UPDATE: string;
    const SETTINGS_UPDATE: string;
    const TIMER_START: string;
    const TIMER_UPDATE: string;
    const TIMER_PAUSE: string;
    const TIMER_COMPLETE: string;
    function id(): string;
    function mobUpdate(mob: any): string;
    function goalsUpdate(goals: any): string;
    function settingsUpdate(settings: any): string;
    function timerUpdate(timerDuration: any, now: any): string;
    function timerStart(timerDuration: any, now: any): string;
    function timerPause(timerDuration: any): string;
    function timerComplete(): string;
    function caseOf(typeFn: any, message: any): any;
}
