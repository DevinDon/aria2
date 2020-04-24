import { Pending } from '../main';

describe('Pending should work fine.', () => {

  let pending: Pending<any>;
  let promise: Promise<any>;
  let resolve: (value?: any | PromiseLike<any>) => void;
  let reject: (reason?: any) => void;

  beforeEach(() => {
    pending = new Pending();
    promise = pending.promise;
    resolve = pending.resolve;
    reject = pending.reject;
  });

  it('class Pending should instance of `Promise`', done => {
    expect(promise).toBeInstanceOf(Promise);
    done();
  });

  it('class Pending should resolve `OK`', done => {
    resolve('OK');
    expectAsync(promise).toBeResolvedTo('OK');
    done();
  });

  it('class Pending should reject `NO`', done => {
    reject('NO');
    expectAsync(promise).toBeRejectedWith('NO');
    done();
  });

});
