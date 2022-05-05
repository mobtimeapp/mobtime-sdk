export class Mob extends Collection {
    constructor(mobtime: any, values: any, previousValues: any);
    rotate(): Mob;
    randomize(): Mob;
    replaceAll(mob: any): Mob;
    change(identifier: any, changeFn: any): Mob;
    add(name: any, id: any): Mob;
    rename(identifier: any, text: any): Mob;
    remove(identifier: any): Mob;
    move(identifier: any, index: any): Mob;
}
import { Collection } from "./collection.js";
