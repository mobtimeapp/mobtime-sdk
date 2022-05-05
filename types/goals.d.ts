export class Goals extends Collection {
    constructor(mobtime: any, values: any, previousValues: any);
    replaceAll(goals: any): Goals;
    change(identifier: any, changeFn: any): Goals;
    add(text: any, id: any): Goals;
    rename(identifier: any, text: any): Goals;
    remove(identifier: any): Goals;
    move(identifier: any, index: any): Goals;
    complete(identifier: any, completed: any): Goals;
    prune(): Goals;
}
import { Collection } from "./collection.js";
