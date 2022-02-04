import { Collection } from './collection.js';

export class Goals extends Collection {
  constructor(mobtime, values, previousValues) {
    super(
      values,
      previousValues,
      ((a, b) => a.name !== b.name),
    );
    this.mobtime = mobtime;
  }

  commit() {
    const msg = Message.mobGoals(this.items())
    this.mobtime._onMessage(msg, { local: true });
    this.mobtime.send(msg);
  }

  change(identifier, changeFn) {
    return new Goals(
      this.mobtime,
      super.change(identifier, changeFn),
      this.items(),
    );
  }

  add(text) {
    return new Goals(
      this.mobtime,
      this.items().concat({ id: Math.random().toString(36).slice(2), text, completed: false }),
      this.items(),
    );
  }

  rename(identifier, text) {
    return this.change(identifier, ((goal) => ({ ...goal, text })));
  }

  remove(identifier) {
    return new Goals(
      this.mobtime,
      super.remove(identifier),
      this.items(),
    );
  }

  move(identifier, index) {
    return new Goals(
      this.mobtime,
      super.move(identifier, index),
      this.items(),
    );
  }

  complete(identifier, completed) {
    return this.change(identifier, ((goal) => ({ ...goal, completed })));
  }

  prune() {
    return new Goals(
      this.mobtime,
      this.items().filter(g => !g.completed),
      this.items(),
    );
  }
}
