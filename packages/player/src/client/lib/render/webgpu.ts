import xCloudPlayer from '../player'
import Overlay from './overlay'

export default class WebGpuComponent {
    private _player:xCloudPlayer

    private _element:HTMLCanvasElement | undefined
    private _overlay:Overlay
    private _isActive: boolean = true

    private _gpuReader:GPUCanvasContext | undefined
    private _gpuVideoTexture:GPUTexture | null = null
    private _gpuDevice:GPUDevice | null = null
    private _gpuContext:GPUCanvasContext | null = null
    private _gpuBindGroup:GPUBindGroup | null = null
    private _gpuPipeline:GPURenderPipeline | null = null
    private _gpuSampler:GPUSampler | null = null
    private _resizeObserver:ResizeObserver | null = null
    private _containerElement:HTMLElement | null = null

    constructor(player:any){
        this._player = player
        this._overlay = new Overlay(this, this._player)
    }

    create(stream:MediaStream) {
        const videoElement = document.createElement('canvas')
        console.log('Creating WebGPU canvas element for stream:', stream);

        // videoElement.srcObject = stream
        // videoElement.autoplay = true
        // videoElement.muted = true
        // videoElement.playsInline = true
        videoElement.width = 1920
        videoElement.height = 1080
        videoElement.style.willChange = 'contents'
        // videoElement.style.imageRendering = 'pixelated' // or 'crisp-edges' for faster rendering
        // videoElement.style.objectFit = 'contain'
        // videoElement.style.backgroundColor = 'black'
        // videoElement.style.touchAction = 'none'

        const that:WebGpuComponent = this

        navigator.gpu.requestAdapter().then((adapter:any) => {
            if (!adapter) {
                console.error('Failed to get GPU adapter');
                return;
            }
            console.log('WebGPU adapter:', adapter);
            adapter.requestDevice().then((device:any) => {
                const context = videoElement.getContext("webgpu");
                if (!context) {
                    console.error('Failed to get WebGPU context');
                    return;
                }
                const format = navigator.gpu.getPreferredCanvasFormat();
                context.configure({
                    device,
                    format,
                    alphaMode: 'opaque',
                    // Enable desynchronized mode for lower latency and reduced jitter
                    usage: GPUTextureUsage.RENDER_ATTACHMENT
                });

                this._gpuDevice = device
                this._gpuContext = context

                // Additional WebGPU setup and rendering logic would go here

                that._gpuVideoTexture = this._gpuDevice.createTexture({
                    size: [videoElement.width, videoElement.height],
                    format: "rgba8unorm",
                    usage: GPUTextureUsage.TEXTURE_BINDING |
                            GPUTextureUsage.COPY_DST |
                            GPUTextureUsage.RENDER_ATTACHMENT
                });

                const vertexModule = this._gpuDevice.createShaderModule({
                    code: `
                        struct VertexOutput {
                            @builtin(position) position: vec4<f32>,
                            @location(0) uv: vec2<f32>,
                        }

                        @vertex
                        fn main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
                            var pos = array<vec2<f32>, 4>(
                                vec2<f32>(-1.0, -1.0),
                                vec2<f32>( 1.0, -1.0),
                                vec2<f32>(-1.0,  1.0),
                                vec2<f32>( 1.0,  1.0)
                            );
                            var uv = array<vec2<f32>, 4>(
                                vec2<f32>(0.0, 1.0),
                                vec2<f32>(1.0, 1.0),
                                vec2<f32>(0.0, 0.0),
                                vec2<f32>(1.0, 0.0)
                            );
                            var output: VertexOutput;
                            output.position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
                            output.uv = uv[VertexIndex];
                            return output;
                        }
                    `
                });

                const fragmentModule = this._gpuDevice.createShaderModule({
                    code: `
                        @group(0) @binding(0) var myTexture: texture_2d<f32>;
                        @group(0) @binding(1) var mySampler: sampler;

                        @fragment
                        fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
                            return textureSample(myTexture, mySampler, uv);
                        }
                    `
                });

                // Render pipeline (vertex + fragment shader)
                this._gpuPipeline = this._gpuDevice.createRenderPipeline({
                    vertex: {
                        module: vertexModule,
                        entryPoint: "main"
                    },
                    fragment: {
                        module: fragmentModule,
                        entryPoint: "main",
                        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
                    },
                    primitive: { topology: "triangle-strip" },
                    layout: "auto",
                });

                // Create sampler once and reuse it
                this._gpuSampler = this._gpuDevice.createSampler({
                    magFilter: "linear",
                    minFilter: "linear",
                    addressModeU: "clamp-to-edge",
                    addressModeV: "clamp-to-edge",
                });

                // Process video frames from the MediaStream
                // console.log('Stream tracks:', stream);
                const track = stream.getVideoTracks()[0];
                const processor = new MediaStreamTrackProcessor({ track });
                this._gpuReader = processor.readable.getReader();

                this._gpuBindGroup = this._gpuDevice.createBindGroup({
                    layout: this._gpuPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: this._gpuVideoTexture.createView() },
                        { binding: 1, resource: this._gpuSampler },
                    ]
                });

                // Start loop?
                that.videoLoop();
            });
        });

        // console.log('WebGPU adapter:', adapter, navigator.gpu);
        // const device = adapter.requestDevice();
        // console.log('Device:', device);
        // const context = videoElement.getContext("webgpu");
        // console.log('Context:', context);

        // const format = navigator.gpu.getPreferredCanvasFormat();
        // context.configure({ device, format });

        // Rest

        const element = document.getElementById(this._player.getElementId())
        if(element === null) {return}

        this._element = videoElement
        this._containerElement = element
        element.appendChild(this._element)
        const isStatic = getComputedStyle(element).position === 'static' ? true : false
        if(isStatic === true){
            element.style.position = 'relative'
        }

        // Make canvas fill the container
        this._element.style.width = '100%'
        this._element.style.height = '100%'
        this._element.style.display = 'block'

        // Set up resize observer to handle canvas resizing
        this._resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas()
        })
        this._resizeObserver.observe(element)

        // Initial resize
        this.resizeCanvas()

        // this._element.requestVideoFrameCallback(this.processVideoMetadata.bind(this))
    }

    async processVideoData(timestamp?:number) {
        try {
            const { value: frame, done } = await this._gpuReader.read();
            if (done || !this._isActive) {
                return;
            }

            // Resize texture if video frame dimensions changed
            if (this._gpuVideoTexture && 
                (this._gpuVideoTexture.width !== frame.codedWidth || 
                 this._gpuVideoTexture.height !== frame.codedHeight)) {
                
                this._gpuVideoTexture.destroy();
                
                this._gpuVideoTexture = this._gpuDevice.createTexture({
                    size: [frame.codedWidth, frame.codedHeight],
                    format: "rgba8unorm",
                    usage: GPUTextureUsage.TEXTURE_BINDING |
                            GPUTextureUsage.COPY_DST |
                            GPUTextureUsage.RENDER_ATTACHMENT
                });

                // Recreate bind group with new texture
                this._gpuBindGroup = this._gpuDevice.createBindGroup({
                    layout: this._gpuPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: this._gpuVideoTexture.createView() },
                        { binding: 1, resource: this._gpuSampler },
                    ]
                });

                console.log(`Video texture resized to ${frame.codedWidth}x${frame.codedHeight}`);
            }

            const renderStartTime = performance.now();

            // Upload the video frame to GPU (non-blocking)
            this._gpuDevice.queue.copyExternalImageToTexture(
                { source: frame },
                { texture: this._gpuVideoTexture },
                [frame.codedWidth, frame.codedHeight]
            );

            // Render to canvas
            const commandEncoder = this._gpuDevice.createCommandEncoder();
            const passEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: this._gpuContext.getCurrentTexture().createView(),
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                }],
            });

            passEncoder.setPipeline(this._gpuPipeline);
            passEncoder.setBindGroup(0, this._gpuBindGroup);
            passEncoder.draw(4);
            passEncoder.end();

            this._gpuDevice.queue.submit([commandEncoder.finish()]);

            // Queue metadata frames
            this._player._channels.input.queueMetadataFrame({
                serverDataKey: frame.timestamp as number,
                firstFramePacketArrivalTimeMs: frame.timestamp as number,
                frameSubmittedTimeMs: frame.timestamp as number,
                frameDecodedTimeMs: frame.timestamp as number,
                frameRenderedTimeMs: renderStartTime,
            })

            frame.close();

        } catch (error) {
            console.error('Error processing video frame:', error);
        }

        // Immediately continue to next frame without waiting for vsync
        // This ensures we always render the latest frame with minimal latency
        if(this._isActive){
            this.videoLoop();
        }
    }

    videoLoop() {
        this.processVideoData();
    }

    resizeCanvas() {
        if (!this._element || !this._containerElement || !this._gpuContext || !this._gpuDevice) {
            return
        }

        // Get the display size (CSS pixels)
        const displayWidth = this._containerElement.clientWidth
        const displayHeight = this._containerElement.clientHeight

        // Get device pixel ratio for sharp rendering on high-DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1

        // Calculate the actual canvas size in device pixels
        const width = Math.floor(displayWidth * devicePixelRatio)
        const height = Math.floor(displayHeight * devicePixelRatio)

        // Check if canvas needs resizing
        if (this._element.width !== width || this._element.height !== height) {
            this._element.width = width
            this._element.height = height

            // Reconfigure the WebGPU context with the new size
            const format = navigator.gpu.getPreferredCanvasFormat()
            this._gpuContext.configure({ 
                device: this._gpuDevice, 
                format,
                alphaMode: 'opaque',
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            })

            console.log(`Canvas resized to ${width}x${height} (display: ${displayWidth}x${displayHeight}, DPR: ${devicePixelRatio})`)
        }
    }

    // processVideoMetadata(timestamp, data:VideoFrameCallbackMetadata) {
    //     if(this._element === undefined) {return}

    //     this._element.requestVideoFrameCallback(this.processVideoMetadata.bind(this))

    //     this._player._channels.input.queueMetadataFrame({
    //         serverDataKey: data.rtpTimestamp as number,
    //         firstFramePacketArrivalTimeMs: data.receiveTime as number,
    //         frameSubmittedTimeMs: data.receiveTime as number,
    //         frameDecodedTimeMs: data.expectedDisplayTime,
    //         frameRenderedTimeMs: data.expectedDisplayTime,
    //     })
    // }

    getElement(){
        return this._element
    }

    toggleDebugOverlay(){
        this._overlay.toggleDebug()
    }

    destroy(){
        const streamHolder = document.getElementById(this._player.getElementId())
        this._isActive = false
        const element = streamHolder?.querySelector('canvas')

        // Clean up GPU reader
        if(this._gpuReader){
            this._gpuReader.cancel();
            this._gpuReader = undefined;
        }

        if(this._resizeObserver){
            this._resizeObserver.disconnect()
            this._resizeObserver = null
        }

        if(this._gpuVideoTexture){
            this._gpuVideoTexture.destroy();
            this._gpuVideoTexture = null;
        }

        if(this._overlay !== undefined){
            this._overlay.destroy()
        }

        if(element){
            element.remove()
        }

        if(this._element){
            this._element.remove()
        }
    }
}