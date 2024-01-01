<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Receptionist from "../package/index"


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


const monkey = Receptionist.createAsset('./monkey.glb')
const ball = Receptionist.createAsset('./ball.glb')

const interceptor = Receptionist.createInterceptor((data) => {
  return data
})
// interceptor.bind(monkey).bind(ball)
// or
interceptor.bind([ monkey, ball ])

const gltfLoader = new GLTFLoader()
const loader = Receptionist.createLoader(gltfLoader)
// loader.bind(monkey).bind(ball)
// or
loader.bind([ monkey, ball ])

const receptionist = new Receptionist()
receptionist
    .onLoad(data => {
      console.log(11111111, data)
      scene.add(data.scene)
    })
    .onProgress(event => {
      console.log(2222222, event)
    })
    .onError(err => {
      console.log(3333333, err)
    })

// receptionist.load(monkey).load(ball)
// or
receptionist.load([ monkey, ball ])

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
</script>

<template>
</template>

<style scoped>
</style>
