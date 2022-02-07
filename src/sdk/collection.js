import { Commitable } from "./commitable.js";

export class Collection extends Commitable {
  constructor(mobtime, values, previousValues, makeMessageFn) {
    super(mobtime, makeMessageFn);

    this._values = values;
    this.compareAgainst(previousValues);
  }

  compareAgainst(previousValues) {
    const detectChangeFn = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

    this.newIds = this._values.reduce(
      (memo, value) =>
        previousValues.find(pv => pv.id === value.id)
          ? memo
          : [...memo, value.id],
      [],
    );

    this.changedIds = this._values.reduce(
      (memo, value) =>
        previousValues.find(
          pv => pv.id === value.id && detectChangeFn(pv, value),
        )
          ? [...memo, value.id]
          : memo,
      [],
    );

    this._removedValues = previousValues.filter(
      pv => !this._values.find(v => v.id === pv.id),
    );
  }

  items() {
    return [...this._values];
  }

  newItems() {
    return this._values.filter(v => this.newIds.includes(v.id));
  }

  changedItems() {
    return this._values.filter(v => this.changedIds.includes(v.id));
  }

  removedItems() {
    return [...this._removedValues];
  }

  _makeIsItem(identifier) {
    return typeof identifier === "number"
      ? (_value, index) => index === identifier
      : typeof identifier === "function"
      ? identifier
      : value =>
          Object.keys(identifier).every(key => identifier[key] === value[key]);
  }

  findIndex(identifier) {
    return this._values.findIndex(this._makeIsItem(identifier));
  }

  find(identifier) {
    const index = this.findIndex(this._makeIsItem(identifier));
    return index === -1 ? null : this._values[index];
  }

  exists(identifier) {
    return this.findIndex(identifier) >= 0;
  }

  change(identifier, changeFn) {
    const isItem = this._makeIsItem(identifier);
    return this._values.map((value, index) =>
      isItem(value, index) ? changeFn(value) : value,
    );
  }

  move(identifier, index) {
    const sourceIndex = this.findIndex(identifier);
    const value = this._values[sourceIndex];
    const before = this._values
      .slice(0, index)
      .filter((item, index) => !isItem(item, index));
    const after = this._values
      .slice(index + 1)
      .filter((item, index) => !isItem(item, index));

    return [...before, value, ...after];
  }

  remove(identifier) {
    const isItem = this._makeIsItem(identifier);

    return this._values.filter((item, index) => !isItem(item, index));
  }

  commit(_mobtime) {
    return Promise.reject(new Error("Collection.commit not implemented"));
  }
}
