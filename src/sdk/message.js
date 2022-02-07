export class Message {
  constructor({ id, type, ...payload }, previousMessage) {
    this.id = id || Message.id();
    this.type = type;
    this.payload = payload;
    this.previousMessage = previousMessage;
  }

  json() {
    return {
      id: this.id,
      type: this.type,
      payload: this.payload,
    };
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

Message.MOB_UPDATE = "mob:update";
Message.GOALS_UPDATE = "goals:update";
Message.SETTINGS_UPDATE = "settings:update";
Message.TIMER_START = "timer:start";
Message.TIMER_UPDATE = "timer:update";
Message.TIMER_PAUSE = "timer:pause";
Message.TIMER_COMPLETE = "timer:complete";

Message.id = () =>
  Math.random()
    .toString(36)
    .slice(2);

Message.mobUpdate = mob =>
  JSON.stringify({
    id: Message.id(),
    type: Message.MOB_UPDATE,
    mob,
  });

Message.goalsUpdate = goals =>
  JSON.stringify({
    id: Message.id(),
    type: Message.GOALS_UPDATE,
    goals,
  });

Message.settingsUpdate = settings =>
  JSON.stringify({
    id: Message.id(),
    type: Message.SETTINGS_UPDATE,
    settings,
  });

Message.timerUpdate = (timerDuration, now) =>
  JSON.stringify({
    id: Message.id(),
    type: Message.TIMER_UPDATE,
    timerStartedAt: now || Date.now(),
    timerDuration,
  });

Message.timerStart = (timerDuration, now) =>
  JSON.stringify({
    id: Message.id(),
    type: Message.TIMER_START,
    timerStartedAt: now || Date.now(),
    timerDuration,
  });

Message.timerPause = timerDuration =>
  JSON.stringify({
    id: Message.id(),
    type: Message.TIMER_PAUSE,
    timerDuration,
  });

Message.timerComplete = () =>
  JSON.stringify({
    id: Message.id(),
    type: Message.TIMER_COMPLETE,
  });

Message.caseOf = (typeFn, message) => {
  const fn = typeFn[message.type] || typeFn._;
  if (!fn) return null;
  return fn(message.payload, message);
};
