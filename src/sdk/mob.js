import { Collection } from './collection.js';

export class Mob extends Collection {
  constructor(mobtime, values, previousValues) {
    super(
      values,
      previousValues,
      ((a, b) => a.name !== b.name),
    );
    this.mobtime = mobtime;
  }

  commit() {
    const msg = Message.mobUpdate(this.items())
    this.mobtime._onMessage(msg, { local: true });
    this.mobtime.send(msg);
  }

  rotate() {
    const [first, ...trailing] = this.items();
    return new Mob(
      this.mobtime,
      [...trailing, first],
      this.items(),
    );
  }

  randomize() {
    return new Mob(
      this.mobtime,
      this.items()
        .map(m => ({ ...m, _sort: Math.random() }))
        .sort((a, b) => a._sort - b._sort)
        .map(({ _sort, ...mobber }) => mobber),
      this.items(),
    );
  }

  change(identifier, changeFn) {
    return new Mob(
      this.mobtime,
      super.change(identifier, changeFn),
      this.items(),
    );
  }

  add(name) {
    return new Mob(
      this.mobtime,
      this.items().concat({ id: Math.random().toString(36).slice(2), name }),
      this.items(),
    );
  }

  rename(identifier, text) {
    return this.change(identifier, ((goal) => ({ ...goal, text })));
  }

  remove(identifier) {
    return new Mob(
      this.mobtime,
      super.remove(identifier),
      this.items(),
    );
  }

  move(identifier, index) {
    return new Mob(
      this.mobtime,
      super.move(identifier, index),
      this.items(),
    );
  }
}
