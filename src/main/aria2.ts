import { EventEmitter } from 'events';
// import * as WebSocket from 'ws';
import { Task } from './model';
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
      params: params.filter(v => v !== undefined)
    };

    if (this.option.secret) {
      base.params.unshift('token:' + this.option.secret);
    }

    return base;

  }

  private parse(event: MessageEvent) {
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
    try {
      this.socket.send(JSON.stringify(request));
    } catch (error) {
      pending?.reject(error);
    }
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
    // 这tm是不是有个 bug，为啥 if (WebSocket) 会报错？？？
    // 尝试使用原生 WebSocket
    try {
      this.socket = new WebSocket(this.url);
    } catch (error) {
      const WS = require('ws');
      this.socket = new WS(this.url);
    }
    this.socket.onmessage = event => this.parse(event);
    return new Promise((resolve, reject) => {
      this.socket.onopen = event => resolve(event);
      this.socket.onerror = event => reject(event);
    });
  }

  disconnect() {
    this.socket.close();
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri>
   *
   * `aria2.addUri([secret], uris[, options[, position]])`
   *
   * 添加若干个下载任务。
   *
   * @param {string[]} uris 下载任务链接，见官方文档。
   * @param {any} options 见官方文档，我也不知道是啥。
   * @param {number} position 我也不知道是啥，可能是插入顺序之类的。
   * @returns {Promise<string>} 返回任务的 GID。
   */
  async addUri(uris: string[], options?: any, position?: number): Promise<string> {
    const request = this.generate('addUri', [uris, options, position]);
    return this.send<string>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.addTorrent>
   *
   * `aria2.addTorrent([secret, ]torrent[, uris[, options[, position]]])`
   *
   * 添加种子任务，种子需要进行 Base64 编码。
   *
   * Add a torrent task, torrent file need to encode with base64.
   *
   * @param {string} torrent 种子文件，Base64 编码。
   * @param uris 不知道。
   * @param options 不知道。
   * @param position 不知道。
   * @returns {Promise<string>} 返回任务的 GID。
   */
  async addTorrent(torrent: string, uris?: string[], options?: any, position?: number): Promise<string> {
    const request = this.generate('addTorrent', [torrent, uris, options, position]);
    return this.send<string>(request);
  }

  /**
  * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.addMetalink>
  *
  * `aria2.addMetalink([secret, ]metalink[, options[, position]])`
  *
  * 添加磁力任务，磁力文件需要进行 Base64 编码。
  *
  * Add a metalink task, metalink file need to encode with base64.
  *
  * @param {string} metalink 磁力文件，Base64 编码。
  * @param options 不知道。
  * @param position 不知道。
  * @returns {Promise<string>} 返回任务的 GID。
  */
  async addMetalink(metalink: string, options?: any, position?: number): Promise<string> {
    const request = this.generate('addMetalink', [metalink, options, position]);
    return this.send<string>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.remove>
   *
   * `aria2.remove([secret, ]gid)`
   *
   * 移除指定的任务。
   *
   * @param {string} gid 任务的 GID。
   * @returns {Promise<string>} 返回被移除任务的 GID。
   */
  async remove(gid: string): Promise<string> {
    const request = this.generate('remove', [gid]);
    return this.send<string>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.pause>
   *
   * `aria2.pause([secret, ]gid)`
   *
   * 暂停指定的任务。
   *
   * @param {string} gid 任务的 GID。
   * @returns {Promise<string>} 返回被暂停任务的 GID。
   */
  async pause(gid: string): Promise<string> {
    const request = this.generate('pause', [gid]);
    return this.send<string>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.pauseAll>
   *
   * `aria2.pauseAll([secret])`
   *
   * 暂停所有任务。
   *
   * @returns {Promise<'OK'>} 返回 `OK`。
   */
  async pauseAll(): Promise<'OK'> {
    const request = this.generate('pauseAll');
    return this.send<'OK'>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.unpause>
   *
   * `aria2.unpause([secret, ]gid)`
   *
   * 继续指定的任务。
   *
   * @param {string} gid 任务的 GID。
   * @returns {Promise<string>} 返回被继续任务的 GID。
   */
  async unpause(gid: string): Promise<string> {
    const request = this.generate('unpause', [gid]);
    return this.send<string>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.unpauseAll>
   *
   * `aria2.unpauseAll([secret])`
   *
   * 继续所有任务。
   *
   * @returns {Promise<'OK'>} 返回 `OK`。
   */
  async unpauseAll(): Promise<'OK'> {
    const request = this.generate('unpauseAll');
    return this.send<'OK'>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellStatus>
   *
   * `aria2.tellStatus([secret, ]gid[, keys])`
   *
   * 获取任务详情。
   *
   * @param {string} gid 任务的 GID。
   * @param {[keyof Task]} keys 需要获取的属性名。
   * @returns {Promise<Task>} 返回任务详情。
   */
  async tellStatus(gid: string, keys?: [keyof Task]): Promise<Task> {
    const request = this.generate('tellStatus', [gid, keys]);
    return this.send<Task>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellActive>
   *
   * `aria2.tellActive([secret][, keys])`
   *
   * 获取所有正在进行的下载任务。
   *
   * @returns {Promise<Task[]>} 返回类型详见 `model` 源代码。
   */
  async tellActive(): Promise<Task[]> {
    const request = this.generate('tellActive');
    return this.send<Task[]>(request);
  }

  /**
   * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellWaiting>
   *
   * `aria2.tellWaiting([secret, ]offset, num[, keys])`
   *
   * 获取若干个已暂停的的任务。
   *
   * @param {number} offset 跳过几个任务。
   * @param {number} total 获取的任务总数。
   * @returns {Promise<Task[]>} 返回类型详见 `model` 源代码。
   */
  async tellWaiting(offset: number, total: number): Promise<Task[]> {
    const request = this.generate('tellWaiting', [offset, total]);
    return this.send<Task[]>(request);
  }

  /**
  * <https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellStopped>
  *
  * `aria2.tellStopped([secret, ]offset, num[, keys])`
  *
  * 获取若干个已停止的的任务。
  *
  * @param {number} offset 跳过几个任务。
  * @param {number} total 获取的任务总数。
  * @returns {Promise<Task[]>} 返回类型详见 `model` 源代码。
  */
  async tellStopped(offset: number, total: number): Promise<Task[]> {
    const request = this.generate('tellStopped', [offset, total]);
    return this.send<Task[]>(request);
  }

}
