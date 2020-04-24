/**
 * 语法糖，创建一个空 Promise 对象，等待 resolve 被调用。
 *
 * 应当使用 new Pending().promise 获取 Promise 对象。
 */
export class Pending<T = any> {

  promise: Promise<T>;
  resolve!: (value?: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>(
      (resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      }
    );
  }

}
