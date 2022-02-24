import { Collection } from "./collection.js";
import { Message } from "./message.js";

export class Mob extends Collection {
  constructor(mobtime, values, previousValues) {
    super(mobtime, values, previousValues, Message.mobUpdate);
  }

  rotate() {
    const [first, ...trailing] = this.items();
    return new Mob(this.mobtime, [...trailing, first], this.items());
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

  replaceAll(mob) {
    return new Mob(this.mobtime, mob, this.items());
  }

  change(identifier, changeFn) {
    return new Mob(
      this.mobtime,
      super.change(identifier, changeFn),
      this.items(),
    );
  }

  add(name, id) {
    return this.exists({ id })
      ? this.change({ id }, m => ({ ...m, name }))
      : new Mob(
          this.mobtime,
          this.items().concat({
            id:
              id ||
              Math.random()
                .toString(36)
                .slice(2),
            name,
          }),
          this.items(),
        );
  }

  rename(identifier, text) {
    return this.change(identifier, goal => ({ ...goal, text }));
  }

  remove(identifier) {
    return new Mob(this.mobtime, super.remove(identifier), this.items());
  }

  move(identifier, index) {
    return new Mob(this.mobtime, super.move(identifier, index), this.items());
  }

  hasChanges() {
    const live = JSON.stringify(this.mobtime.mob().items());
    const current = JSON.stringify(this.items());
    return live !== current;
  }
}
