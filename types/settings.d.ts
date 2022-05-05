export class Settings extends Commitable {
    constructor(mobtime: any, values: any, previousValues: any);
    _values: any;
    _changedItems: {
        key: string;
        value: any;
        previous: any;
    }[];
    changedItems(): {
        key: string;
        value: any;
        previous: any;
    }[];
    replaceAll(settings: any): Settings;
    change(key: any, changeTo: any): Settings;
    setDuration(duration: any): Settings;
    setMobOrder(mobOrder: any): any;
}
import { Commitable } from "./commitable.js";
