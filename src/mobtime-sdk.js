import WebSocket from "ws";

const MESSAGE_TYPES = {
  CLIENT_NEW: "client:new",
  TIMER_OWNERSHIP: "timer:ownership",
  MOB_UPDATE: "mob:update",
  GOALS_UPDATE: "goals:update",
  SETTINGS_UPDATE: "settings:update",
};

const deferredPromise = () => {
  let resolveFn = () => {};
  let rejectFn = () => {};
  const promise = new Promise((_resolve, _reject) => {
    resolveFn = _resolve;
    rejectFn = _reject;
  });

  return {
    promise,
    resolve: value => resolveFn(value),
    reject: err => rejectFn(err),
  };
};

function Mobtime(timerId, options = {}) {
  let _WebSocket = WebSocket;
  let _socket = null;
  let _isNewTimerHandle = null;
  let _isNewTimer = deferredPromise();
  let _socketConnect = deferredPromise();

  let callbacks = {};
  let state = {};

  const _resetState = () => {
    state = {
      timer: { startedAt: null, duration: 5 * 60 * 1000, accumulator: 0 },
      goals: [],
      mob: [],
      settings: { mobOrder: "Navigator,Driver", duration: 5 * 60 * 1000 },
      isOwner: false,
    };
  };

  const _setState = nextState => {
    state = { ...state, ...nextState };
  };

  const _resetCallbacks = () => {
    callbacks = {
      [MESSAGE_TYPES.TIMER_OWNERSHIP]: [],
      [MESSAGE_TYPES.MOB_UPDATE]: [],
      [MESSAGE_TYPES.GOALS_UPDATE]: [],
      [MESSAGE_TYPES.SETTINGS_UPDATE]: [],
    };
  };

  const addMessageListener = (type, callback) => {
    if (type === "*") {
      return Object.values(MESSAGE_TYPES).map(messageType => {
        return addMessageListener(messageType, callback);
      });
    }
    if (!(type in callbacks)) {
      return false;
    }

    callbacks[type].push(callback);

    return [type, callback];
  };

  const removeMessageListener = (type, callback) => {
    if (Array.isArray(type)) {
      return removeMessageListener(...type);
    }
    if (!(type in callbacks)) return false;

    const index = callbacks[type].findIndex(fn => fn === callback);

    callbacks[type].splice(index, 1);

    return true;
  };

  const _init = () => {
    _socket = null;

    _resetState();
    _resetCallbacks();
  };

  const testSetWebSocketClass = WebSocketClass => {
    _WebSocket = WebSocketClass;
  };

  const getUrl = protocol => {
    return `${protocol}${options.secure ? "s" : ""}://${
      options.domain
    }/${timerId}`;
  };

  const _setIsNewTimer = value => {
    if (_isNewTimerHandle === null) {
      return;
    }

    clearTimeout(_isNewTimerHandle);
    _isNewTimerHandle = null;
    _isNewTimer.resolve(value);
  };

  const _asynchronouslyDetermineIfTimerIsNew = () => {
    _isNewTimerHandle = setTimeout(() => {
      _setIsNewTimer(true);
    }, 500);
  };

  const _socketOnOpen = () => {
    _socket.send(JSON.stringify({ type: MESSAGE_TYPES.CLIENT_NEW }));
    _asynchronouslyDetermineIfTimerIsNew();
    _socketConnect.resolve();
  };

  const _messageHandler = message => {
    const { type, ...newState } = message;
    switch (type) {
      case MESSAGE_TYPES.TIMER_OWNERSHIP:
        _setIsNewTimer(newState.isOwner);
        _setState(newState);
        return;

      case MESSAGE_TYPES.SETTINGS_UPDATE:
      case MESSAGE_TYPES.GOALS_UPDATE:
      case MESSAGE_TYPES.MOB_UPDATE:
        _setIsNewTimer(false);
        _setState(newState);
        return;

      default:
        return;
    }
  };

  const _socketOnMessage = data => {
    const message = JSON.parse(data);
    _messageHandler(message);
    const timer = JSON.parse(JSON.stringify(state));
    for (const callback of callbacks[message.type] || []) {
      callback(message, timer);
    }
  };

  const _socketOnError = err => {
    if (socket) {
      return;
    }
    _socketConnect.reject(err);
  };

  const connect = () => {
    _socketConnect = deferredPromise();
    _isNewTimer = deferredPromise();

    _socket = new _WebSocket(getUrl("ws"));
    _socket.on("open", _socketOnOpen);
    _socket.on("message", _socketOnMessage);
    _socket.on("error", _socketOnError);

    return _socketConnect.promise;
  };

  const isNewTimer = () => _isNewTimer.promise;

  const disconnect = () => {
    if (socket) {
      _socket.close();
    }
    _init();
  };

  const waitForMessageType = (type, timeoutMilliseconds = 60000) => {
    return new Promise((resolve, reject) => {
      let timeout = null;
      let handler = () => {};

      handler = () => {
        removeMessageListener(type, handler);
        clearTimeout(timeout);

        resolve();
      };
      addMessageListener(type, handler);

      timeout = setTimeout(() => {
        removeMessageListener(type, handler);
        reject(new Error(`${type} message was not sent before timeout.`));
      }, timeoutMilliseconds);
    });
  };

  const send = payload => {
    return _socket.send(JSON.stringify(payload));
  };

  _init();

  return {
    testSetWebSocketClass,
    getUrl,
    connect,
    isNewTimer,
    disconnect,
    waitForMessageType,
    addMessageListener,
    removeMessageListener,
    send,
    $onSocketOpen: _socketOnOpen,
    $onSocketMessage: _socketOnMessage,
    $onSocketError: _socketOnError,
  };

  //mobUpdate(mob) {
  //this.send({type : MESSAGE_TYPES.MOB_UPDATE, mob});
  //this.state = {...this.state, mob};
  //}

  //mobAdd(name, id = Math.random().toString(36).slice(2)) {
  //return this.mobUpdate([...this.state.mob, {name, id} ]);
  //}
}

export default Mobtime;
export { MESSAGE_TYPES };
