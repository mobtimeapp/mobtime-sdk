export class Later {
  constructor() {
    this._resolve = () => {};
    this._reject = () => {};
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value) {
    this._resolve(value);
  }

  reject(value) {
    this._reject(value);
  }

  promise() {
    return this._promise;
  }

  then(fn) {
    return this._promise.then(fn);
  }

  catch(fn) {
    return this._promise.catch(fn);
  }

  finally(fn) {
    return this._promise.finally(fn);
  }
}
