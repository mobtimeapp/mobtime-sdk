export class Message {
  constructor({ type, ...payload }, previousMessage) {
    this.type = type;
    this.payload = payload;
    this.previousMessage = previousMessage;
  }

  removeHistory() {
    this.previousMessage = null;
  }

  chain(message) {
    return new Message(message, this, this.whenCallbacks);
  }
}

Message.TYPES = {
  CLIENT_NEW: "client:new",
  TIMER_OWNERSHIP: "timer:ownership",
  MOB_UPDATE: "mob:update",
  GOALS_UPDATE: "goals:update",
  SETTINGS_UPDATE: "settings:update",
};
