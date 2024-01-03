import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

type HandlerIntercept = (data: string | ArrayBuffer) => ArrayBuffer
type handlerLoad = (data: unknown) => void
type handlerProgress = (progress: number) => void
type handlerError = (err: unknown) => void


const fileLoader = new THREE.FileLoader()
fileLoader.setResponseType('arraybuffer')


class Interceptor {
    
    handler: HandlerIntercept

    constructor(handler: HandlerIntercept) {
        this.handler = handler
    }

    bind(asset: Asset | Asset[]) {
        if (asset instanceof Asset) {
            asset.interceptor = this
        }
        else {
            asset.forEach(_asset => {
                _asset.interceptor = this
            })
        }
        return this
    }
}


class Loader {

    _loader: THREE.Loader

    constructor(loader: THREE.Loader) {
        this._loader = loader
    }

    bind(asset: Asset | Asset[]) {
        if (asset instanceof Asset) {
            asset.loader = this
        }
        else {
            asset.forEach(_asset => {
                _asset.loader = this
            })
        }
        return this
    }
}


class Asset {

    uuid: string
    url: string
    loaded: number
    total: number
    interceptor?: Interceptor
    loader?: Loader
    receptionist?: Receptionist
    handlerLoad?: handlerLoad
    handlerProgress?: handlerProgress
    handlerError?: handlerError

    constructor(url: string) {
        this.uuid = uuidv4()
        this.url = url
        this.loaded = 0
        this.total = 0
    }

    _onLoad(buffer: string | ArrayBuffer) {
        if (this.loader instanceof Loader) {
            if (this.interceptor instanceof Interceptor) {
                buffer = this.interceptor.handler(buffer)
            }
            const blob = new Blob([buffer])
            const url = URL.createObjectURL(blob)
            this.loader._loader.load(url, (data: unknown) => {
                this.handlerLoad && this.handlerLoad(data)
                this.receptionist?._onLoad(data)
            })
        }
        else {
            this._onError(new Error('The asset is not bound to a threejs loader.'))
        }
    }

    _onProgress(event: ProgressEvent) {
        if (this.receptionist instanceof Receptionist) {
            if (!this.total) {
                this.total = event.total
                this.receptionist.addTotal(this.total)
            }
            this.receptionist.addLoaded(event.loaded - this.loaded)
            this.loaded = event.loaded

            this.handlerProgress && this.handlerProgress(event.loaded / event.total)
            this.receptionist._onProgress()
        }
    }

    _onError(err: unknown) {
        this.handlerError && this.handlerError(err)
        this.receptionist?._onError(err)
    }

    onLoad(onLoad: handlerLoad) {
        this.handlerLoad = onLoad
        return this
    }

    onProgress(onProgress: handlerProgress) {
        this.handlerProgress = onProgress
        return this
    }

    onError(onError: handlerError) {
        this.handlerError = onError
        return this
    }
}


class Receptionist {

    fileCount: number
    linkCount: number
    loaded: number
    total: number
    objects: unknown[]
    handlerLoad?: handlerLoad
    handlerProgress?: handlerProgress
    handlerError?: handlerError

    constructor() {
        this.loaded = 0
        this.total = 0
        this.fileCount = 0
        this.linkCount = 0
        this.objects = []
    }

    static createAsset(url: string) {
        return new Asset(url)
    }

    static createInterceptor(handler: HandlerIntercept) {
        return new Interceptor(handler)
    }

    static createLoader(loader: THREE.Loader) {
        return new Loader(loader)
    }

    _onLoad(data: unknown) {
        this.objects.push(data)
        if (this.objects.length === this.fileCount) {
            this.handlerLoad && this.handlerLoad(this.objects)
        }
    }

    _onProgress() {
        if (this.fileCount === this.linkCount) {
            const progress = this.loaded / this.total
            this.handlerProgress && this.handlerProgress(progress)
        }
    }

    _onError(err: unknown) {
        this.handlerError && this.handlerError(err)
    }

    addLoaded(loaded: number) {
        this.loaded += loaded
    }

    addTotal(total: number) {
        this.total += total
        this.linkCount++
    }

    load(asset: Asset | Asset[]) {
        const _load = (asset: Asset) => {
            asset.receptionist = this
            fileLoader.load(asset.url, asset._onLoad.bind(asset), asset._onProgress.bind(asset), asset._onError.bind(asset))
            this.fileCount++
        }
        if (asset instanceof Asset) {
            _load(asset)
        }
        else {
            asset.forEach(_asset => {
                _load(_asset)
            })
        }
        return this
    }

    onLoad(onLoad: handlerLoad) {
        this.handlerLoad = onLoad
        return this
    }

    onProgress(onProgress: handlerProgress) {
        this.handlerProgress = onProgress
        return this
    }
    
    onError(onError: handlerError) {
        this.handlerError = onError
        return this
    }
}


export default Receptionist