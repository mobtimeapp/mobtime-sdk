import { Message } from './message.js';
import { composable, select, replace } from 'composable-state';

export class Timer {
  constructor(mobtime, values, previousValues, msg) {
    this.mobtime = mobtime;
    this._values = values;
    this._previousValues = previousValues;
    this._msg = msg;
  }

  items() {
    return { ...this._values };
  }

  commit() {
    this.mobtime._onMessage(this._msg, { local: true });
    this.mobtime.send(this._msg);
  }

  change(key, changeTo, msg) {
    return new Timer(
      this.mobtime,
      composable(this.items(), select(key, replace(changeTo))),
      this.items(),
      msg || this._msg,
    );
  }

  remainingMilliseconds() {
    if (!this._values.startedAt && this._values.duration > 0) return this._values.duration;
    if (!this._values.startedAt) return this.mobtime.settings().items().duration;
    if (this._values.duration < 1) return 0;

    const diff = Date.now() - this._values.startedAt;
    const remaining = this._values.duration - diff;
    return remaining > 0
      ? remaining
      : this.mobtime.settings().items().duration;
  }

  isRunning() {
    return this.remainingMilliseconds > 0;
  }

  start(durationOverride) {
    const duration = durationOverride || this.mobtime.settings().items().duration;
    const now = Date.now();

    return this
      .change('duration', duration)
      .change('startedAt', now, Message.timerStart(duration, now))
  }

  pause() {
    const duration = this.remainingMilliseconds();
    return this
      .change('duration', duration)
      .change('startedAt', null, Message.timerPause(duration));
  }

  resume() {
    const remainingMilliseconds = this.remainingMilliseconds();
    if (remainingMilliseconds === 0) return this;
    return this.start(remainingMilliseconds);
  }

  complete() {
    return this
      .change('duration', null)
      .change('startedAt', null, Message.timerComplete());
  }
}
