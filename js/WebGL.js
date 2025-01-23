export default class WebGL {
    constructor(canvas, log) {
        this.canvas = canvas;
        this.log = log;
        this.gl = this.#initializeWebGLContext(canvas);
    }

    #initializeWebGLContext(canvas) {
        const log = this.log;

        let gl = canvas.getContext('webgl2');

        if (!gl) {
            log.warning_log('WebGL2 not supported, falling back on experimental-webgl.');
            gl = canvas.getContext('experimental-webgl');

            if (!gl) {
                log.error_log('Your browser does not support WebGL2.');
                throw new Error('WebGL2 not supported.');
            }
        }

        log.success_log('WebGL2 is supported and the context was created.');

        return gl;
    }

    clearCanvas(color) {
        const gl = this.gl;

        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }


}