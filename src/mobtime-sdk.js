import WebSocket from "ws";

const MESSAGE_TYPES = {
  TIMER_OWNERSHIP: "timer:ownership",
  MOB_UPDATE: "mob:update",
  GOALS_UPDATE: "goals:update",
  SETTINGS_UPDATE: "settings:update"
};

class Mobtime {
  constructor(mobtimeUrl) {
    this.mobtimeUrl = mobtimeUrl;
    this.socket = null;

    this._resetCache();
    this._resetCallbacks();

    this._isNewTimerResolve = () => {};
    this._isNewTimerHandle = null;
    this._isNewTimerPromise = new Promise(resolve => {
      this._isNewTimerResolve = resolve;
    });
  }

  _resetCallbacks() {
    this.callbacks = {
      [MESSAGE_TYPES.TIMER_OWNERSHIP]: [],
      [MESSAGE_TYPES.MOB_UPDATE]: [],
      [MESSAGE_TYPES.GOALS_UPDATE]: [],
      [MESSAGE_TYPES.SETTINGS_UPDATE]: []
    };
  }

  _resetCache() {
    this.cache = {
      goals: [],
      mob: [],
      settings: {},
      isOwner: false
    };
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.mobtimeUrl);

      socket.on("open", () => {
        socket.send(JSON.stringify({ type: "client:new" }));
        this._isNewTimerHandle = setTimeout(() => {
          console.log("isNewTimer timeout");
          this._setIsNewTimer(true);
        }, 500);
        this.socket = socket;

        socket.on("message", data => {
          const message = JSON.parse(data);
          this._cacheHandler(message);
          const timer = JSON.parse(JSON.stringify(this.cache));
          for (const callback of this.callbacks[message.type] || []) {
            callback(message, timer);
          }
        });

        resolve();
      });

      socket.on("error", err => {
        if (this.socket) return;
        reject(err);
      });
    });
  }

  _setIsNewTimer(value) {
    if (this._isNewTimerHandle === null) return;

    clearTimeout(this._isNewTimerHandle);
    this._isNewTimerHandle = null;
    this._isNewTimerResolve(value);
  }

  isNewTimer() {
    return this._isNewTimerPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this._resetCallbacks();
    this._resetCache();
  }

  _cacheHandler(message) {
    const { type, ...cache } = message;
    switch (type) {
      case MESSAGE_TYPES.TIMER_OWNERSHIP:
      case MESSAGE_TYPES.SETTINGS_UPDATE:
      case MESSAGE_TYPES.GOALS_UPDATE:
      case MESSAGE_TYPES.MOB_UPDATE:
        this._setIsNewTimer(false);
        this.cache = {
          ...this.cache,
          ...cache
        };
        return;

      default:
        return;
    }
  }

  addMessageListener(type, callback) {
    if (!(type in this.callbacks)) {
      return false;
    }

    this.callbacks[type].push(callback);

    return [type, callback];
  }

  removeMessageListener(type, callback) {
    if (Array.isArray(type)) return this.removeMessageListener(...type);
    if (!(type in this.callbacks)) return false;

    const index = this.callbacks[type].findIndex(callback);
    this.callbacks[type].splice(index, 1);

    return true;
  }
}

export default Mobtime;
export { MESSAGE_TYPES };
