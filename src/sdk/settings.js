import { Message } from './message.js';
import { Commitable } from './commitable.js';
import { composable, select, replace } from 'composable-state';

export class Settings extends Commitable {
  constructor(mobtime, values, previousValues) {
    super(mobtime, Message.settingsUpdate);
    this._values = values;
    this._changedItems = Object.keys(this._values)
      .filter(key => this._values[key] !== previousValues[key])
      .map(key => ({ key, value: this._values[key], previous: previousValues[key] }));
    this.mobtime = mobtime;
  }

  items() {
    return { ...this._values };
  }

  changedItems() {
    return [...this._changedItems];
  }

  change(key, changeTo) {
    return new Settings(
      this.mobtime,
      composable(this.items(), select(key, replace(changeTo))),
      this.items(),
    );
  }

  setDuration(duration) {
    if (typeof duration !== 'number' || duration < 60000) {
      throw new Error('duration must be numeric milliseconds, and at least 1 minute (60000)')
    }
    return this.change('duration', Number(duration));
  }

  setMobOrder(mobOrder) {
    if (Array.isArray(mobOrder)) return this.setMobOrder(mobOrder.join(','));
    if (typeof mobOrder !== 'string') {
      throw new Error('mobOrder must be either an array of strings, or a string of comma separated mob positions');
    }
    return this.change('mobOrder', mobOrder);
  }
}
