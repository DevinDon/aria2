import { Aria2, Option } from '../main';

describe('Hello, world!', () => {

  let aria2: Aria2;

  beforeAll(done => {
    const option: Option = {
      host: 'localhost',
      port: 6800,
      secure: false,
      path: '/jsonrpc'
    };
    aria2 = new Aria2(option);
    done();
  });

  // it('should say `Hello, world!`', done => {
  //   expect(hello('world')).toEqual('Hello, world!');
  //   done();
  // });

  // it('should async say `Hello, world!`', async done => {
  //   expectAsync(asyncHello('world')).toBeResolvedTo('Hello, world!');
  //   done();
  // });

});
