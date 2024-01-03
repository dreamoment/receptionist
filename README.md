<h1 align="center">receptionist</h1>

![](/docs/flow.drawio.png)

Language: English | [中文简体](README_zh_cn.md)

## What is receptionist ?

`threejs` multi-function file loader that can handle a variety of common business scenarios, such as:
- Download multiple files and get the total download progress.
- Download data cannot be parsed by `threejs` loader and needs to be pre-processed. Because they could be encrypted or even compressed.
## Features

- lightweight and easy to use

- multi-file download

- data preprocessing

- interface with all loaders in `threejs`

- support `typescript`

## Install

```
npm i @dreamoment/receptionist
```

## Examples

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

Create a new asset instance.

```
Receptionist.createAsset(url: string): Asset
```

### `static` createLoader

新建加载器实例
Create a new loader instance.

```
Receptionist.createLoader(loader: THREE.Loader): Loader
```

### `static` createInterceptor

Create a new interceptor instance.

```
Receptionist.createInterceptor(handler: HandlerIntercept): Interceptor
```

### onLoad

Listening for the load completion messages for all assets.

```
type handlerLoad = (data: unknown) => void

onLoad(onLoad: handlerLoad): this
```

### onProgress

Listening for the load progress messages for assets.

```
type handlerProgress = (progress: number) => void

onProgress(onProgress: handlerProgress): this
```

### onError

Listening for the error messages for all assets.

```
type handlerError = (err: unknown) => void

onError(onError: handlerError): this
```

## Asset API

### onLoad

Listening for the load completion messages for this asset.

```
type handlerLoad = (data: unknown) => void

onLoad(onLoad: handlerLoad): this
```

### onProgress

Listening for the load progress messages for this asset.

```
type handlerProgress = (progress: number) => void

onProgress(onProgress: handlerProgress): this
```

### onError

Listening for the error messages for this asset.

```
type handlerError = (err: unknown) => void

onError(onError: handlerError): this
```

## Loader API

### bind

Bind assets. Use loaders in the loading process for these assets. Each asset should be bound with a loader.

```
bind(asset: Asset | Asset[]): this
```

## Interceptor API

### bind

Bind assets. Whether to use interceptors in the loading process for these assets.

```
bind(asset: Asset | Asset[]): this
```