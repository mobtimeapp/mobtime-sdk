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
    this.WebSocket = WebSocket;

    this._resetCache();
    this._resetCallbacks();

    this._isNewTimerResolve = () => {};
    this._isNewTimerHandle = null;
    this._isNewTimerPromise = new Promise(resolve => {
      this._isNewTimerResolve = resolve;
    });
  }

  _setMockWebSocketClass(websocketClass) {
    this.WebSocket = websocketClass;
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
      this.socket = new this.WebSocket(this.mobtimeUrl);

      this.socket.on("open", () => {
        this.socket.send(JSON.stringify({ type: "client:new" }));
        this.asynchronouslyDetermineIfTimerIsNew();

        this.socket.on("message", data => {
          const message = JSON.parse(data);
          this._cacheHandler(message);
          const timer = JSON.parse(JSON.stringify(this.cache));
          for (const callback of this.callbacks[message.type] || []) {
            callback(message, timer);
          }
        });

        resolve();
      });

      this.socket.on("error", err => {
        if (this.socket) return;
        reject(err);
      });
    });
  }

  asynchronouslyDetermineIfTimerIsNew() {
    this._isNewTimerHandle = setTimeout(() => {
      this._setIsNewTimer(true);
    }, 500);
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
      this.socket.close();
    }
    this._resetCallbacks();
    this._resetCache();
  }

  _cacheHandler(message) {
    const { type, ...cache } = message;
    switch (type) {
      case MESSAGE_TYPES.TIMER_OWNERSHIP:
        this._setIsNewTimer(cache.isOwner);
        this.cache = {
          ...this.cache,
          ...cache
        };
        return;

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
    if (type === "*") {
      return Object.values(MESSAGE_TYPES).map(messageType => {
        return this.addMessageListener(messageType, callback);
      });
    }
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
