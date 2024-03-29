import { composable, select, replace } from "composable-state";

import { Eventable } from "./eventable.js";
import { Message } from "./message.js";
import { Mob } from "./mob.js";
import { Goals } from "./goals.js";
import { Settings } from "./settings.js";
import { Timer } from "./timer.js";
import { Socket } from "./socket.js"; // eslint-disable-line no-unused-vars

export const INITIAL_STATE = {
  timer: { startedAt: null, duration: 5 * 60 * 1000 },
  goals: [],
  mob: [],
  settings: { mobOrder: "Navigator,Driver", duration: 5 * 60 * 1000 },
};

export class Mobtime extends Eventable {
  constructor() {
    super();

    /** @private */
    this.message = null;
    /** @private */
    this._onMessage = this._onMessage.bind(this);
    /** @private */
    this._state = { ...INITIAL_STATE };
    /** @private */
    this.prevState = this.state;
    /** @private */
    this.recentIds = Array.from({ length: 10 }, () => null);

    this.on("message", this._onMessage);
  }

  setState(state) {
    this.prevState = this._state;
    this._state = state;
  }

  get state() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Tell mobtime how to connect the websocket
   *
   * @param {PromiseLike<Socket>} socketPromise
   * @return {PromiseLike<Mobtime>}
   */
  async usingSocket(socketPromise) {
    const socket = await socketPromise;
    await socket.connect();
    this.socket = socket;
    this.socket.on("message", message => this.trigger("message", message));
    this.socket.on("close", () => this.trigger("close"));
    this.socket.on("error", () => this.trigger("error"));
    return this.ready();
  }

  /**
   * @private
   */
  _updateState(key, value) {
    this.setState(composable(this.state, select(key, replace(value))));
  }

  /**
   * Get mob data
   *
   * @return {Mob}
   */
  mob() {
    return new Mob(this, this.state.mob, this.prevState.mob);
  }

  /**
   * Get goals data
   *
   * @return {Goals}
   */
  goals() {
    return new Goals(this, this.state.goals, this.prevState.goals);
  }

  /**
   * Get settings data
   *
   * @return {Settings}
   */
  settings() {
    return new Settings(this, this.state.settings, this.prevState.settings);
  }

  /**
   * Get timer data
   *
   * @return {Timer}
   */
  timer() {
    return new Timer(this, this.state.timer, this.prevState.timer);
  }

  /** @private */
  _onMessage(event, options) {
    const json =
      typeof event === "string" ? JSON.parse(event) : JSON.parse(event.data);

    const source = (options && options.source) || "server";
    const now = Date.now();

    this.message = this.message ? this.message.chain(json) : new Message(json);

    Message.caseOf(
      {
        [Message.MOB_UPDATE]: ({ mob }) => this._updateState("mob", mob),
        [Message.GOALS_UPDATE]: ({ goals }) =>
          this._updateState("goals", goals),
        [Message.SETTINGS_UPDATE]: ({ settings }) =>
          this._updateState("settings", settings),
        [Message.TIMER_START]: ({ timerDuration, startedAt }) =>
          this._updateState("timer", {
            duration: timerDuration,
            startedAt: startedAt || now,
          }),
        [Message.TIMER_UPDATE]: ({ timerStartedAt, timerDuration }) =>
          this._updateState("timer", {
            duration: timerDuration,
            startedAt: timerStartedAt || now,
          }),
        [Message.TIMER_PAUSE]: ({ timerDuration }) =>
          this._updateState("timer", {
            duration: timerDuration,
            startedAt: null,
          }),
        [Message.TIMER_COMPLETE]: () =>
          this._updateState("timer", { duration: 0, startedAt: null }),
      },
      this.message,
    );

    if (this.recentIds.includes(this.message.id)) {
      return;
    }

    this.trigger("*", this.message, this, { source });
    this.trigger(this.message.type, this.message, this, { source });
  }

  /** @private */
  // _onDisconnect() {
  //   this.socket.off("message", this._onMessage);
  // }

  /** @private */
  // _onConnect() {
  //   this.socket.on("message", this._onMessage);
  // }

  /**
   * Disconnect websocket
   *
   * @return {void}
   */
  disconnect() {
    this.socket.close();
    this.socket = null;
    return this;
  }

  /**
   * Send a message to mobtime server
   * @param {string} message
   * @return {PromiseLike<null>}
   */
  send(message) {
    const { id } = JSON.parse(message);
    this.recentIds.unshift(id);
    this.recentIds.pop();
    return this.socket.send(message);
  }

  /**
   * Find a message using a callback
   * @param {function} callback
   * @return {PromiseLike<Message|null>}
   */
  findMessageWhere(findCb, initialMessage = null) {
    const message = initialMessage || this.message;
    if (!message) return Promise.reject("Unable to find message");

    if (!findCb(message)) {
      return new Promise(resolve =>
        resolve(this.findMessageWhere(findCb, message.previousMessage)),
      );
    }

    return Promise.resolve(message);
  }

  /**
   * Wait for a message to be sent
   *
   * @param {string} type
   * @return {PromiseLike<Message>} - the message that was hit
   */
  waitForMessageType(type) {
    return new Promise(resolve => {
      let isResolved = false;
      const resolveMessage = message => {
        if (isResolved) return;
        isResolved = true;
        resolve(message);
      };

      const cancel = this.on(type, message => {
        cancel();
        resolveMessage(message);
      });

      this.findMessageWhere(message => message.type === type)
        .then(resolveMessage)
        .catch(e => {
          if (e !== "Unable to find message") {
            throw e;
          }
        });
    });
  }

  /**
   * Wait for first batch of updates from the server
   *
   * @return {PromiseLike<Mobtime>}
   */
  async ready() {
    await Promise.all([
      this.waitForMessageType(Message.MOB_UPDATE),
      this.waitForMessageType(Message.GOALS_UPDATE),
      this.waitForMessageType(Message.SETTINGS_UPDATE),
    ]);
    return this;
  }
}
