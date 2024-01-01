import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

type HandlerIntercept = (data: ArrayBuffer) => ArrayBuffer
type handlerLoad = (data: any) => void
type handlerProgress = (event: ProgressEvent) => void
type handlerError = (err: unknown) => void


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

    _loader: THREE.loader

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

    constructor(url: string) {
        this.uuid = uuidv4()
        this.url = url
        this.loaded = 0
        this.total = 0
    }

    _onLoad(data: ArrayBuffer) {
        if (this.interceptor instanceof Interceptor) {
            const _data = this.interceptor.handler(data)
            const blob = new Blob([_data])
            const url = URL.createObjectURL(blob)
            this.loader._loader.load(url, (data) => {
                console.log(4466622, data)
                this.receptionist._onLoad && this.receptionist._onLoad(data)
            })
        }
    }

    _onProgress(event: ProgressEvent) {
        if (!this.total) {
            this.total = event.total
            this.receptionist.addTotal(this.total)
        }
        this.receptionist.addLoaded(event.loaded - this.loaded)
        this.loaded = event.loaded
        this.receptionist._onProgress && this.receptionist._onProgress()
    }

    _onError(err: unknown) {
        this.receptionist._onError && this.receptionist._onError(err)
    }
}


class Receptionist extends THREE.FileLoader {

    loaded: number
    total: number
    handlerLoad?: handlerLoad
    handlerProgress?: handlerProgress
    handlerError?: handlerError

    constructor() {
        super()
        this.setResponseType('arraybuffer')
        this.loaded = 0
        this.total = 0
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

    addLoaded(loaded: number) {
        this.loaded += loaded
    }

    addTotal(total: number) {
        this.total += total
    }

    load(asset: Asset | Asset[]) {
        const _load = (asset: Asset) => {
            asset.receptionist = this
            console.log(asset)
            super.load(asset.url, asset._onLoad.bind(asset), asset._onProgress.bind(asset), asset._onError.bind(asset))
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

    _onLoad(data: string) {
        this.handlerLoad && this.handlerLoad(data)
    }

    _onProgress(event: ProgressEvent) {
        const progress = this.loaded / this.total
        this.handlerProgress && this.handlerProgress(progress)
    }

    _onError(err: unknown) {
        this.handlerError && this.handlerError()
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