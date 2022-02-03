import { Eventable } from './eventable.js';
import { Message } from './message.js';
import { Socket } from './socket.js';

export const INITIAL_STATE = {
  timer: { startedAt: null, duration: 5 * 60 * 1000 },
  goals: [],
  mob: [],
  settings: { mobOrder: "Navigator,Driver", duration: 5 * 60 * 1000 },
};

export class Mobtime {
  constructor(timerId, options = {}) {
    this.timerId = timerId;
    this.options = options;
    this.socket = null;
    this.makeSocket = Socket.connect;
    this.events = new Eventable();
    this.message = null;
    this._onMessage = this._onMessage.bind(this);
    this.state = { ...INITIAL_STATE };
    this.recentIds = Array.from({ length: 10 }, () => null);
  }

  testSetMakeSocketFunction(makeSocket) {
    this.makeSocket = makeSocket;
  }

  _mutateState(key, value) {
    this.state[key] = value;
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  mobUpdate(mob) {
    const newMob = typeof mob === 'function'
      ? mob(this.getState().mob)
      : mob;
    const msg = Message.mobUpdate(newMob);
    this._onMessage(msg, { local: true });
    this.send(msg);
    return true;
  }

  mobRotate() {
    return this.mobUpdate((oldMob) => {
      const [first, ...mob] = oldMob;
      return [...mob, first];
    });
  }

  mobRandomize(count = 1) {
    if (count <= 1) return Promise.resolve(true);

    const promise = new Promise((resolve) => {
      resolve(this.mobUpdate((oldMob) => {
        return oldMob
          .map(m => ({ ...m, _sort: Math.random() }))
          .sort((a, b) => a._sort - b._sort)
          .map(({ _sort, ...mobber }) => mobber);
      }));
    });

    const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

    return promise  
      .then(() => delay())
      .then(() => this.mobRandomize(count - 1));
  }

  mobAdd(name) {
    const mobber = {
      name,
      id: Math.random().toString(36).slice(2),
    };

    return this.mobUpdate((mob) => mob.concat(mobber))
      && mobber;
  }

  mobMove(id, index) {
    return mobUpdate((mob) => {
      const mobber = mob.find(m => m.id === id);
      if (!mobber) return mob;

      const before = mob.slice(0, index).filter(m => m.id !== id);
      const after = mob.slice(index + 1).filter(m => m.id !== id);
      return [...before, mobber, ...after];
    });
  }

  mobRemove(id) {
    return mobUpdate((mob) => mob.filter(m => m.id !== id));
  }

  goalsUpdate(goals) {
    const newGoals = typeof goals === 'function'
      ? goals(this.getState().goals)
      : goals;
    const msg = Message.goalsUpdate(newGoals);
    this._onMessage(msg, { local: true });
    this.send(msg);
    return true;
  }

  goalMove(id, index) {
    return goalUpdate((goals) => {
      const goal = goals.find(g => g.id === id);
      if (!goal) return goals;

      const before = goals.slice(0, index).filter(g => g.id !== id);
      const after = goals.slice(index + 1).filter(g => g.id !== id);
      return [...before, goal, ...after];
    });
  }

  goalAdd(text) {
    const goal = {
      id: Math.random().toString(36).slice(2),
      text,
      completed: false,
    };

    return goalsUpdate((goals) => goals.concat(goal))
      && goal;
  }

  goalRemove(id) {
    return goalsUpdate((goals) => goals.filter(g => g.id !== id));
  }

  goalComplete(id, completed = true) {
    return goalsUpdate((goals) => goals.map(g => (g.id === id ? { ...g, completed } : g)));
  }

  goalsPrune() {
    return goalsUpdate((goals) => goals.filter(g => !g.completed));
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
      [Message.TYPES.MOB_UPDATE]: ({ mob }) => this._mutateState('mob', mob),
      [Message.TYPES.GOALS_UPDATE]: ({ goals }) => this._mutateState('goals', goals),
      [Message.TYPES.SETTINGS_UPDATE]: ({ settings }) => this._mutateState('settings', settings),
      [Message.TYPES.TIMER_START]: ({ timerDuration }) => this._mutateState('timer', { duration: timerDuration, startedAt: Date.now() }),
      [Message.TYPES.TIMER_UPDATE]: ({ timerStartedAt, timerDuration }) => this._mutateState('timer', { duration: timerDuration - (Date.now() - timerStartedAt), startedAt: timerStartedAt }),
      [Message.TYPES.TIMER_PAUSE]: ({ timerDuration }) => this._mutateState('timer', { duration: timerDuration, startedAt: null }),
      [Message.TYPES.TIMER_COMPLETE]: () => this._mutateState('timer', { duration: 0, startedAt: null }),
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
      this.waitForMessageType(Message.TYPES.MOB_UPDATE),
      this.waitForMessageType(Message.TYPES.GOALS_UPDATE),
      this.waitForMessageType(Message.TYPES.SETTINGS_UPDATE),
    ])
      .then(() => this);
  }
}

Mobtime.connect = (timerId, options) => {
  return (new Mobtime(timerId, options))
    .connect()
    .then(timer => timer.ready())
};
