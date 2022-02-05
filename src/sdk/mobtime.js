import { composable, select, replace } from 'composable-state';

import { Eventable } from './eventable.js';
import { Message } from './message.js';
import { Mob } from './mob.js';
import { Goals } from './goals.js';
import { Settings } from './settings.js';
import { Timer } from './timer.js';

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
      this.socket.on('message', this._onMessage);
      return this.ready();
    });
  }

  _mutateState(key, value) {
    this.prevState = this.state;
    this.state = composable(this.state, select(key, replace(value)));
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  mob() {
    return new Mob(this, this.state.mob, this.prevState.mob);
  }

  goals() {
    return new Goals(this, this.state.goals, this.prevState.goals);
  }

  settings() {
    return new Settings(this, this.state.settings, this.prevState.settings);
  }

  timer() {
    return new Timer(this, this.state.timer, this.prevState.timer);
  }

  _onMessage(data, options) {
    this.message = this.message
      ? this.message.chain(JSON.parse(data))
      : new Message(JSON.parse(data))

    const oldState = this.state;

    Message.caseOf({
      [Message.MOB_UPDATE]: ({ mob }) => this._mutateState('mob', mob),
      [Message.GOALS_UPDATE]: ({ goals }) => this._mutateState('goals', goals),
      [Message.SETTINGS_UPDATE]: ({ settings }) => this._mutateState('settings', settings),
      [Message.TIMER_START]: ({ timerDuration }) => this._mutateState('timer', { duration: timerDuration, startedAt: Date.now() }),
      [Message.TIMER_UPDATE]: ({ timerStartedAt, timerDuration }) => this._mutateState('timer', { duration: timerDuration - (Date.now() - timerStartedAt), startedAt: timerStartedAt }),
      [Message.TIMER_PAUSE]: ({ timerDuration }) => this._mutateState('timer', { duration: timerDuration, startedAt: null }),
      [Message.TIMER_COMPLETE]: () => this._mutateState('timer', { duration: 0, startedAt: null }),
    }, this.message);

    const eventName = (name) => name; // (options && options.local) ? `${name}.local` : name;

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
      const msg = this.findMessageWhere((message) => message.type === type);
      if (msg) {
        return resolve(msg);
      }
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
