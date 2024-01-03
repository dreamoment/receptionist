<h1 align="center">receptionist</h1>

![](/docs/flow.drawio.png)

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
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Receptionist from '@dreamoment/receptionist'


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const ambientLight = new THREE.AmbientLight(0xffffff)
const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 1)
scene.add(ambientLight, directionalLight)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

camera.position.set(5, 5, 5)


// The models is simply encrypted
const monkey = Receptionist.createAsset('./monkey_encrypted.glb')
const ball = Receptionist.createAsset('./ball_encrypted.glb')
// monkey
//     .onLoad(data => {
//       console.log('data:', data)
//     })
//     .onProgress(progress => {
//       console.log(`progress: ${progress}`)
//     })
//     .onError(err => {
//       console.log(`error: ${err}`)
//     })
// ball
//     .onLoad(data => {
//       console.log('data:', data)
//     })
//     .onProgress(progress => {
//       console.log(`progress: ${progress}`)
//     })
//     .onError(err => {
//       console.log(`error: ${err}`)
//     })

// with interception
const interceptor = Receptionist.createInterceptor((buffer) => {
  let view = new Uint8Array(buffer)
  for (let i = 0; i < view.length; i++) {
    const item = 255 - view[i]
    view[i] = item
  }
  return view.buffer
})
interceptor.bind(monkey).bind(ball)
// or
// interceptor.bind([ monkey, ball ])

// without interception
// const monkey = Receptionist.createAsset('./monkey.glb')
// const ball = Receptionist.createAsset('./ball.glb')

const gltfLoader = new GLTFLoader()
const loader = Receptionist.createLoader(gltfLoader)
loader.bind(monkey).bind(ball)
// or
// loader.bind([ monkey, ball ])

const receptionist = new Receptionist()
receptionist
    .onLoad(data => {
      data.forEach((item) => {
        scene.add(item.scene)
      })
    })
    .onProgress(progress => {
      console.log(`progress: ${progress}`)
    })
    .onError(err => {
      console.log(`error: ${err}`)
    })

receptionist.load(monkey).load(ball)
// or
// receptionist.load([ monkey, ball ])

const animate = () => {
  controls.update()
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)

renderer.setAnimationLoop(animate)
```

## API

```
new receptionist()
```

### `static` createAsset

新建资产实例。

```
Receptionist.createAsset(url: string): Asset
```

### `static` createLoader

新建加载器实例。

```
Receptionist.createLoader(loader: THREE.Loader): Loader
```

### `static` createInterceptor

新建拦截器实例。

```
Receptionist.createInterceptor(handler: HandlerIntercept): Interceptor
```

### onLoad

监听所有资产的加载完成信息。

```
type handlerLoad = (data: unknown) => void

onLoad(onLoad: handlerLoad): this
```

### onProgress

监听所有资产的加载进度信息。

```
type handlerProgress = (progress: number) => void

onProgress(onProgress: handlerProgress): this
```

### onError

监听所有资产的错误信息。

```
type handlerError = (err: unknown) => void

onError(onError: handlerError): this
```

## Asset API

### onLoad

监听资产的加载完成信息。

```
type handlerLoad = (data: unknown) => void

onLoad(onLoad: handlerLoad): this
```

### onProgress

监听资产的加载进度信息。

```
type handlerProgress = (progress: number) => void

onProgress(onProgress: handlerProgress): this
```

### onError

监听资产的错误信息。

```
type handlerError = (err: unknown) => void

onError(onError: handlerError): this
```

## Loader API

### bind

绑定资产。在这些资产的加载流程中使用加载器。每个资产都应该绑定加载器。

```
bind(asset: Asset | Asset[]): this
```

## Interceptor API

### bind

绑定资产。是否要在这些资产的加载流程中使用拦截器。

```
bind(asset: Asset | Asset[]): this
```