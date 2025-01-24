export class Color {
    constructor(r, g, b, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

export class WebGLUtils {
    static log = null;
    static gl = null;

    static initializeWebGLContext(canvas, log) {
        this.log = log;

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

        this.gl = gl;
        return gl;
    }

    static clearCanvas(color, gl = this.gl) {
        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    static createShader(type, source, gl = this.gl, log = this.log) {
        let shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            log.error_log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    static createProgram(vertex_shader, fragment_shader, gl = this.gl, log = this.log) {
        const prg = gl.createProgram();

        gl.attachShader(prg, vertex_shader);
        gl.attachShader(prg, fragment_shader);

        gl.linkProgram(prg);
        if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
            log.error_log('An error occurred linking the program: ' + gl.getProgramInfoLog(prg));
            gl.deleteProgram(prg);
            return null;
        }

        gl.validateProgram(prg);
        if (!gl.getProgramParameter(prg, gl.VALIDATE_STATUS)) {
            log.error_log('An error occurred validating the program: ' + gl.getProgramInfoLog(prg));
            gl.deleteProgram(prg);
            return null;
        }

        log.success_log('The program was successfully created, linked and validated.');

        // Now we can detach and delete the shaders to free up memory in the GPU
        gl.detachShader(prg, vertex_shader);
        gl.detachShader(prg, fragment_shader);
        gl.deleteShader(vertex_shader);
        gl.deleteShader(fragment_shader);

        return prg;
    }
}