import { Eventable } from './eventable.js';
import { Message } from './message.js';
import { composable, select, replace } from 'composable-state';
import { Mob } from './mob';
import { Goals } from './goals';

export const INITIAL_STATE = {
  timer: { startedAt: null, duration: 5 * 60 * 1000 },
  goals: [],
  mob: [],
  settings: { mobOrder: "Navigator,Driver", duration: 5 * 60 * 1000 },
};

export class Mobtime {
  constructor() {
    this.events = new Eventable();
    this.message = null;
    this._onMessage = this._onMessage.bind(this);
    this.state = { ...INITIAL_STATE };
    this.prevState = this.state;
    this.recentIds = Array.from({ length: 10 }, () => null);
  }

  usingSocket(socket) {
    return socket.connect().then(() => {
      this.socket = socket;
      return this;
    });
  }

  _mutateState(key, value) {
    this.prevState = this.state;
    this.state = composable(select(key, replace(value)));
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  mob() {
    return new Mob(this, this.state.mob, this.prevState.mob);
  }

  goals() {
    return new Goals(this, this.state.goals. this.prevState.goals);
  }

  settingsUpdate(settings) {
    const msg = Message.settingsUpdate(settings);
    this._onMessage(msg, { local: true });
    this.send(msg);
    return true;
  }

  timerStart(duration) {
    let timerDuration = duration || this.state.settings.duration;
    const msg = Message.timerStart(timerDuration);
    this._onMessage(msg, { local: true });
    this.send(msg);
    return true;
  }

  timerPause() {
    if (!this.state.timer.startedAt) return false;

    const timerDuration = Math.max(0, this.state.timer.duration - (Date.now() - this.state.timerStartedAt));
    const msg = Message.timerStart(timerDuration);
    this._onMessage(msg, { local: true });
    this.send(msg);
    return true;
  }

  timerComplete() {
    const msg = Message.timerComplete();
    this._onMessage(msg, { local: true });
    this.send(msg);
    return true;
  }

  _onMessage(data, { local }) {
    this.message = this.message
      ? this.message.chain(JSON.parse(data))
      : new Message(JSON.parse(data))

    const oldState = JSON.parse(JSON.stringify(this.state));

    Message.caseOf({
      [Message.MOB_UPDATE]: ({ mob }) => this._mutateState('mob', mob),
      [Message.GOALS_UPDATE]: ({ goals }) => this._mutateState('goals', goals),
      [Message.SETTINGS_UPDATE]: ({ settings }) => this._mutateState('settings', settings),
      [Message.TIMER_START]: ({ timerDuration }) => this._mutateState('timer', { duration: timerDuration, startedAt: Date.now() }),
      [Message.TIMER_UPDATE]: ({ timerStartedAt, timerDuration }) => this._mutateState('timer', { duration: timerDuration - (Date.now() - timerStartedAt), startedAt: timerStartedAt }),
      [Message.TIMER_PAUSE]: ({ timerDuration }) => this._mutateState('timer', { duration: timerDuration, startedAt: null }),
      [Message.TIMER_COMPLETE]: () => this._mutateState('timer', { duration: 0, startedAt: null }),
    }, this.message);

    const eventName = (name) => local ? `${name}.local` : name;

    if (this.recentIds.includes(this.message.id)) return;

    this.events.trigger(eventName('*'), this.message, this, oldState);
    this.events.trigger(eventName(this.message.type), this.message, this, oldState);
  }

  _onDisconnect() {
    this.socket.off('message', this._onMessage);
  }

  _onConnect() {
    this.socket.on('message', this._onMessage);
  }

  async connect() {
    this.socket = await this.makeSocket(this.timerId, this.options);
    this.socket.on('message', (data) => this._onMessage(data, { local: false }));
    return this;
  }

  async disconnect() {
    this.socket.close();
    this.socket = null;
    return this;
  }

  send(message) {
    const { id } = JSON.parse(message);
    this.recentIds.unshift(id);
    this.recentIds.pop();
    return this.socket.send(message);
  }

  findMessageWhere(findCb) {
    let message = this.message;
    while (message) {
      if (findCb(message)) {
        return message;
      }
      message = message.previousMessage;
    }
    return null;
  }

  waitForMessageType(type) {
    return new Promise((resolve) => {
      const cancel = this.events.on(type, (message) => {
        cancel();
        resolve(message);
      });
    });
  }

  ready() {
    return Promise.all([
      this.waitForMessageType(Message.MOB_UPDATE),
      this.waitForMessageType(Message.GOALS_UPDATE),
      this.waitForMessageType(Message.SETTINGS_UPDATE),
    ])
      .then(() => this);
  }
}

Mobtime.connect = (timerId, options) => {
  return (new Mobtime(timerId, options))
    .connect()
    .then(timer => timer.ready())
};
