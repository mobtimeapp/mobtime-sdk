export class Message {
  constructor({ id, type, ...payload }, previousMessage) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this.previousMessage = previousMessage;
  }

  detachHistory() {
    const prev = this.prevoiusMessage;
    this.previousMessage = null;
    return prev;
  }

  chain(message) {
    return new Message(message, this);
  }
}

Message.id = () => Math.random().toString(36).slice(2);

Message.mobUpdate = (mob) => JSON.stringify({
  id: Message.id(),
  type: Message.TYPES.MOB_UPDATE,
  mob,
});

Message.goalsUpdate = (goals) => JSON.stringify({
  id: Message.id(),
  type: Message.TYPES.GOALS_UPDATE,
  goals,
});

Message.settingsUpdate = (settings) => JSON.stringify({
  id: Message.id(),
  type: Message.TYPES.SETTINGS_UPDATE,
  settings
});

Message.timerStart = (timerDuration) => JSON.stringify({
  id: Message.id(),
  type: Message.TYPES.TIMER_START,
  timerDuration,
});

Message.timerPause = (timerDuration) => JSON.stringify({
  id: Message.id(),
  type: Message.TYPES.TIMER_PAUSE,
  timerDuration,
});

Message.timerComplete = () => JSON.stringify({
  id: Message.id(),
  type: Message.TYPES.TIMER_COMPLETE,
});

Message.TYPES = {
  MOB_UPDATE: "mob:update",
  GOALS_UPDATE: "goals:update",
  SETTINGS_UPDATE: "settings:update",
  TIMER_START: 'timer:start',
  TIMER_UPDATE: 'timer:update',
  TIMER_PAUSE: 'timer:pause',
  TIMER_COMPLETE: 'timer:complete',
};

Message.caseOf = (typeFn, message) => {
  const fn = typeFn[message.type] || typeFn._;
  if (!fn) return null;
  return fn(message.payload, message);
}
