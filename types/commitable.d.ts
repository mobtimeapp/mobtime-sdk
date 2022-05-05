export class Commitable {
    constructor(mobtime: any, makeMessageFn: any);
    mobtime: any;
    makeMessageFn: any;
    /**
     * Get the items that can be committed
     *
     * @returns {Array|Object}
     */
    items(): any[] | any;
    /**
     * Detect if any changes have occured
     *
     * @returns {Boolean}
     */
    hasChanges(): boolean;
    /**
     *
     *
     */
    commit(): void;
}
