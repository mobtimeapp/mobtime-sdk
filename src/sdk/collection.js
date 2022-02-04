export class Collection {
  constructor(values, previousValues, detectChangeFn) {
    this._values = values;
    this.compareAgainst(previousValues, detectChangeFn);
  }

  compareAgainst(previousValues, detectChangeFn) {
    this.newIds = values.reduce(
      ((memo, value) => previousValues.find(pv => pv.id === value.id) ? memo : [...memo, value.id]),
      [],
    );

    this.changedIds = values.reduce(
      ((memo, value) => previousValues.find(pv => pv.id === value.id && detectChangeFn(pv, value))
        ? [...memo, value.id]
        : memo
      ),
      [],
    );

    this._removedValues = previousValues.filter((pv) => !values.find(v => v.id === pv.id));
  }

  items() {
    return [...this._values];
  }

  newItems() {
    return this.newIds.map((id) => this._values[id]);
  }

  changedItems() {
    return this.changedIds.map((id) => this._values[id]);
  }

  removedItems() {
    return [...this._removedValues];
  }

  _makeIsItem(identifier) {
    return Number.isNumber(identifier)
      ? ((_value, index) => index === identifier)
      : (typeof identifier === 'function'
        ? identifier
        : ((value) => Object.keys(identifier).every(key => identifier[key] === value[key]))
      );
  }

  findIndex(identifier) {

    return this._values.findIndex(isItem);
  }

  find(identifier) {
    const index = this.findIndex(this._makeIsItem(identifier));
    return index === -1 ? null : this._values[index];
  }

  change(identifier, changeFn) {
    const isItem = this._makeIsItem(identifier);
    return this._values.map((value, index) => isItem(value, index) ? changeFn(value) : value);
  }

  move(identifier, index) {
    const sourceIndex = this.findIndex(identifier);
    const value = this._values[sourceIndex];
    const before = this._values.slice(0, index).filter((item, index) => !isItem(item, index));
    const after = this._values.slice(index + 1).filter((item, index) => !isItem(item, index));

    return [...before, value, ...after];
  }

  remove(identifier) {
    const isItem = this._makeIsItem(identifier);

    return this._values.filter((item, index) => !isItem(item, index));
  }

  commit(_mobtime) {
    return Promise.reject(new Error('Collection.commit not implemented'));
  }
}
