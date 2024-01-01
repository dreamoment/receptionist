<h1 align="center">receptionist</h1>

![](/docs/flow.png)

语言: [English](README.md) | 中文简体

## receptionist 是什么 ?

`threejs`多功能文件加载器，它可以应对多种常见的业务场景，例如：
- 多文件下载，并获取总下载进度
- 下载数据不能被`threejs`加载器解析，需要预先处理。因为它们可能是加密的，甚至是压缩包

## 特性

- 轻量易用

- 多文件下载

- 数据预处理

- 对接`threejs`所有加载器

- 支持`typescript`

## 安装

```
npm i @dreamoment/receptionist
```

## 示例

```

```

## API

```
new receptionist(renderer: THREE.WebGLRenderer)
```

### update

更新内部状态。应该始终在渲染循环中被使用。

```
update(): void
```