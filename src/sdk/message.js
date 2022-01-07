export class Message {
  constructor({ type, ...payload }, previousMessage) {
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

Message.mobUpdate = (mob) => JSON.stringify({
  type: Message.TYPES.MOB_UPDATE,
  mob,
});

Message.goalsUpdate = (goals) => JSON.stringify({
  type: Message.TYPES.GOALS_UPDATE,
  goals,
});

Message.settingsUpdate = (settings) => JSON.stringify({
  type: Message.TYPES.SETTINGS_UPDATE,
  settings
});

Message.timerStart = (timerDuration) => JSON.stringify({
  type: Message.TYPES.TIMER_START,
  timerDuration,
});

Message.timerPause = (timerDuration) => JSON.stringify({
  type: Message.TYPES.TIMER_PAUSE,
  timerDuration,
});

Message.timerComplete = () => JSON.stringify({
  type: Message.TYPES.TIMER_COMPLETE,
});

Message.TYPES = {
  MOB_UPDATE: "mob:update",
  GOALS_UPDATE: "goals:update",
  SETTINGS_UPDATE: "settings:update",
  TIMER_START: 'timer:start',
  TIMER_PAUSE: 'timer:pause',
  TIMER_COMPLETE: 'timer:complete',
};

Message.caseOf = (typeFn, message) => {
  const fn = typeFn[message.type] || typeFn._;
  if (!fn) return null;
  return fn(message.payload, message);
}
