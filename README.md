# Aria2

Aria2 lib, see [aria2 document](https://aria2.github.io/manual/en/html/aria2c.html#methods) for more detail.

# Usage

```typescript
import { Aria2 } from '@iinfinity/aria2'

async function main() {
  const aria2 = new Aria2({
    host: 'localhost',
    port: 6800,
    secure: false,
    path: '/jsonrpc',
    secret: 'SECRET'
  });
  await aria2.connect();
  const gid = aria2.addUri('http://example.com/path/to/download.file');
  const tasks = aria2.tellActive();
  aria2.disconnect();
}

main();
```

# Change Log

## 0.1.3 => 0.1.4

- perf(aria2): 没必要继承 EventEmitter

## 0.1.2 => 0.1.3

- perf(model): 更正下数字类型，返回的都是字符串，但是得用数字呀

## 0.1.1 => 0.1.2

- fix: 啊哈，我忘了编译文件了 🤪

## 0.1.0 => 0.1.1

- perf(aria2): 首先尝试原生 WebSocket，如果不存在则使用 ws

# [THE MIT LICENSE](https://raw.githubusercontent.com/DevinDon/license/master/THE%20MIT%20LICENSE)

Copyright © 2018+ Devin Don

LICENSE: MIT

Click https://raw.githubusercontent.com/DevinDon/license/master/THE%20MIT%20LICENSE to view a copy of this license.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
