# CHANGELOG

## 0.2.0 => 0.2.1

- feat(aria2): extend `EventEmitter`

## 0.1.4 => 0.2.0

- perf(aria2): 当调用 `connect` 时再设置连接信息

## 0.1.3 => 0.1.4

- perf(aria2): 没必要继承 EventEmitter

## 0.1.2 => 0.1.3

- perf(model): 更正下数字类型，返回的都是字符串，但是得用数字呀

## 0.1.1 => 0.1.2

- fix: 啊哈，我忘了编译文件了 🤪

## 0.1.0 => 0.1.1

- perf(aria2): 首先尝试原生 WebSocket，如果不存在则使用 ws
