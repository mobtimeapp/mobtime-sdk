import { Collection } from './collection.js';
import { Message } from './message.js';

export class Goals extends Collection {
  constructor(mobtime, values, previousValues) {
    super(
      mobtime,
      values,
      previousValues,
      Message.goalsUpdate,
    );
  }

  change(identifier, changeFn) {
    return new Goals(
      this.mobtime,
      super.change(identifier, changeFn),
      this.items(),
    );
  }

  add(text, id) {
    return new Goals(
      this.mobtime,
      this.items().concat({ id: id || Math.random().toString(36).slice(2), text, completed: false }),
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
