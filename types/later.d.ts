export class Later {
    _resolve: () => void;
    _reject: () => void;
    _promise: any;
    resolve(value: any): void;
    reject(value: any): void;
    promise(): any;
    then(fn: any): any;
    catch(fn: any): any;
    finally(fn: any): any;
}
