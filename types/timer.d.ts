export class Timer {
    constructor(mobtime: any, values: any, previousValues: any, msg: any);
    mobtime: any;
    _values: any;
    _previousValues: any;
    _msg: any;
    items(): any;
    commit(): void;
    change(key: any, changeTo: any, msg: any): Timer;
    remainingMilliseconds(): any;
    isRunning(): boolean;
    start(durationOverride: any): Timer;
    pause(): Timer;
    resume(): Timer;
    complete(): Timer;
}
