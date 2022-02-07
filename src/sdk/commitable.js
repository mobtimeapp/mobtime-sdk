export class Commitable {
  constructor(mobtime, makeMessageFn) {
    this.mobtime = mobtime;
    this.makeMessageFn = makeMessageFn;
  }

  /**
   * Get the items that can be committed
   *
   * @returns {Array|Object}
   */
  items() {
    throw new Error("<class>.items not implemented");
  }

  /**
   *
   *
   */
  commit() {
    const msg = this.makeMessageFn(this.items());
    this.mobtime._onMessage(msg, { source: "local" });
    this.mobtime.send(msg);
  }
}
