import WebSocket from "ws";
import { Later } from './later';

const makeId = () =>
  Math.random()
    .toString(36)
    .slice(2);

const MESSAGE_TYPES = {
  MOB_UPDATE: "mob:update",
  GOALS_UPDATE: "goals:update",
  SETTINGS_UPDATE: "settings:update",
};

function Mobtime(timerId, options = {}) {
  let _WebSocket = WebSocket;
  let _socket = null;
  let _isNewTimerHandle = null;
  let _isNewTimer = new Later();
  let _socketConnect = new Later();

  let callbacks = {};
  let state = {};

  const _resetState = () => {
    state = {
      timer: { startedAt: null, duration: 5 * 60 * 1000, accumulator: 0 },
      goals: [],
      mob: [],
      settings: { mobOrder: "Navigator,Driver", duration: 5 * 60 * 1000 },
    };
  };

  const _setState = nextState => {
    state = { ...state, ...nextState };
    return state;
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

  const _setWebSocketClass = WebSocketClass => {
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
    _send(JSON.stringify({ type: MESSAGE_TYPES.CLIENT_NEW }));
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
    console.warn(err);
    if (_socket) {
      return;
    }
    _socketConnect.reject(err);
  };

  const connect = () => {
    _socketConnect = new Later();
    _isNewTimer = new Later();

    _socket = new _WebSocket(getUrl("wss"));
    _socket.on("open", _socketOnOpen);
    _socket.on("message", _socketOnMessage);
    _socket.on("error", _socketOnError);

    return _socketConnect.promise();
  };

  const isNewTimer = () => _isNewTimer.promise();

  const disconnect = () => {
    if (_socket) {
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

  const _send = payload =>
    new Promise(resolve => {
      console.log(payload);
      _socket.send(JSON.stringify(payload), {}, (...args) => resolve(args));
    });

  // timer: { startedAt: null, duration: 5 * 60 * 1000, accumulator: 0 },
  // goals: [],
  // mob: [],
  // settings: { mobOrder: "Navigator,Driver", duration: 5 * 60 * 1000 },
  // isOwner: false,

  const mobSet = mob => {
    const s = _setState({ mob });
    return _send({
      type: MESSAGE_TYPES.MOB_UPDATE,
      mob: s.mob,
    });
  };

  const mobAdd = name => {
    const id = makeId();
    const { mob } = state;
    const member = { id, name };
    return mobSet(mob.concat(member)).then(() => member);
  };

  const mobRename = (id, name) => {
    const { mob } = state;
    const index = mob.findIndex(m => m.id === id);
    if (index === -1) {
      return Promise.reject("Unable to find id");
    }
    const before = mob.slice(0, index);
    const after = mob.slice(index + 1);
    const member = { id, name };

    return mobSet(before.concat(member).concat(after)).then(() => member);
  };

  const mobRemove = id => {
    const { mob } = state;
    return mobSet(mob.filter(m => m.id !== id));
  };

  const mobMoveIdToIndex = (id, initialDestIndex) => {
    const { mob } = state;
    const srcIndex = mob.findIndex(m => m.id === id);
    if (srcIndex === -1) {
      return 0;
    }
    const nextMob = mob.reduce((nextMobMemo, member, index) => {}, []);
    return mobSet(mob.filter(m => m.id !== id));
  };

  const goalSet = goals => {
    const s = _setState({ goals });
    return _send({
      type: MESSAGE_TYPES.GOALS_UPDATE,
      goals: s.goals,
    });
  };

  const goalAdd = text => {
    const id = makeId();
    const { goals } = state;
    const goal = { id, text, completed: false };
    return goalSet(goals.concat(goal)).then(() => goal);
  };

  _init();

  return {
    getUrl,
    connect,
    isNewTimer,
    disconnect,
    waitForMessageType,
    addMessageListener,
    removeMessageListener,
    mobSet,
    mobAdd,
    mobRename,
    mobRemove,
    mobMoveIdToIndex,
    goalSet,
    goalAdd,
    testing: {
      setWebSocketClass: _setWebSocketClass,
      onSocketOpen: _socketOnOpen,
      onSocketMessage: _socketOnMessage,
      onSocketError: _socketOnError,
    },
  };
}

export default Mobtime;
export { MESSAGE_TYPES };
