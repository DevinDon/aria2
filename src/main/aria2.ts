import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { Pending } from './pending';

export interface Option {
  host: string;
  port?: number;
  secure: boolean;
  path: string;
  secret?: string;
}

export interface JSONRPCRequest<T = any[]> {
  id: number;
  jsonrpc: string;
  method: string;
  params: T;
}

export interface JSONRPCResponse<T = any> {
  id: number;
  jsonrpc: string;
  result: T;
  error?: string;
}

export type Method = 'addUri' | 'addTorrent' | 'addMetalink'
  | 'remove' | 'forceRemove' | 'pause'
  | 'pauseAll' | 'forcePause' | 'forcePauseAll'
  | 'unpause' | 'unpauseAll' | 'tellStatus'
  | 'getUris' | 'getFiles' | 'getPeers'
  | 'getServers' | 'tellActive' | 'tellWaiting'
  | 'tellStopped' | 'changePosition' | 'changeUri'
  | 'getOption' | 'changeOption' | 'getGlobalOption'
  | 'changeGlobalOption' | 'getGlobalStat' | 'purgeDownloadResult'
  | 'removeDownloadResult' | 'getVersion' | 'getSessionInfo'
  | 'shutdown' | 'forceShutdown' | 'saveSession'
  | 'multicall' | 'listMethods' | 'listNotifications';

/**
 * 首先调用 `connect` 方法进行连接。
 *
 * First, call `connect` method to connect to Aria2RPC.
 */
export class Aria2 extends EventEmitter {

  private url: string;
  private socket!: WebSocket;
  private id: number = 0;
  private map: Map<number, Pending> = new Map();

  constructor(private option: Option) {
    super();
    this.url = `ws${option.secure ? 's' : ''}://${option.host}${option.port ? ':' : ''}${option.port || ''}${option.path}`;
  }

  private generate(method: Method, params: any[] = []) {

    this.map.set(++this.id, new Pending());

    const base: JSONRPCRequest = {
      jsonrpc: '2.0',
      method: 'aria2.' + method,
      id: this.id,
      params: params.filter(v => v)
    };

    if (this.option.secret) {
      base.params.unshift('token:' + this.option.secret);
    }

    return base;

  }

  private parse(event: WebSocket.MessageEvent) {
    const data: JSONRPCResponse = JSON.parse(event.data.toString());
    const pending = this.map.get(data.id);
    if (data.error) {
      // console.error(data.error, data);
      pending?.reject(data.error);
    } else {
      pending?.resolve(data.result);
    }
  }

  /**
   * 发送数据，并返回一个空 Promise 等待服务器响应。
   *
   * Send JSONRPCRequest and return an empty Promise to wait response.
   *
   * @param {JSONRPCRequest} request 待发送的数据，包含所有信息。
   * Data will be send.
   * @returns {T} 一个被保存在 `this.map` 中的空 Promise，使用 `await` 等待服务器响应。
   * An empty promise which is saved in `this.map`, just await it.
   */
  private async send<T = any>(request: JSONRPCRequest): Promise<T> {
    const pending = this.map.get(request.id);
    this.socket.send(JSON.stringify(request), error => error && pending?.reject(error));
    return pending?.promise;
  }

  /**
   * 异步函数，使用 `await` 等待连接结果。
   *
   * 如果没有异常，即连接成功。
   *
   * Async function, use `await` to get connection result.
   *
   * It will return nothing when success.
   */
  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = event => this.parse(event);
    return new Promise((resolve, reject) => {
      this.socket.onopen = event => resolve(event);
      this.socket.onerror = event => reject(event);
    });
  }

  disconnect() {
    this.socket.close(0);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri>
   *
   * `aria2.addUri(uris[, options[, position]])`
   */
  async addUri(uris: string[], options?: any, position?: number) {
    const request = this.generate('addUri', [uris, options, position]);
    // console.log(request);
    return this.send<string>(request);
  }

  async tellActive() {
    const request = this.generate('tellActive');
    return this.send<string[]>(request);
  }

}
