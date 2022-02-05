export class Commitable {
  constructor(mobtime, makeMessageFn) {
    this.mobtime = mobtime;
    this.makeMessageFn = makeMessageFn;
  }

  items() {
    throw new Error('<class>.items not implemented');
  }

  commit() {
    const msg = this.makeMessageFn(this.items());
    this.mobtime._onMessage(msg, { local: true });
    this.mobtime.send(msg);
  }
}
