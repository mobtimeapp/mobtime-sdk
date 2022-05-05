export class Collection extends Commitable {
    constructor(mobtime: any, values: any, previousValues: any, makeMessageFn: any);
    _values: any;
    compareAgainst(previousValues: any): void;
    newIds: any;
    changedIds: any;
    _removedValues: any;
    items(): any[];
    newItems(): any;
    changedItems(): any;
    removedItems(): any[];
    /** @private */
    private _makeIsItem;
    findIndex(identifier: any): any;
    find(identifier: any): any;
    exists(identifier: any): boolean;
    change(identifier: any, changeFn: any): any;
    move(identifier: any, index: any): any[];
    remove(identifier: any): any;
}
import { Commitable } from "./commitable.js";
