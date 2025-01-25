import OutputLog from "./OutputLog.js";
import {Color, WebGLUtils} from "./WebGLUtils.js";
import FileLoader from "./FileLoader.js";
import GraphicsMath from "./GraphicsMath.js";
import Vec4 from "./Vec4.js";
import Camera from "./Camera.js";

function initializeLog() {
    // Initializing log
    const log_div = document.getElementById('log_output');
    const log = new OutputLog(log_div);

    return log;
}

function setProjectionMatrix(fov, aspect_ratio, near, far, gl, program) {
    // Creating perspective matrix
    const perspective_matrix = GraphicsMath.createProjectionMatrix(fov, aspect_ratio, near, far);

    // Getting uniform location
    const pespective_uniform = gl.getUniformLocation(program, 'u_perspective_projection');

    // Binding
    gl.uniformMatrix4fv(pespective_uniform, true, perspective_matrix);
}

function setLightSource(light_direction, gl, program) {
    const light_uniform = gl.getUniformLocation(program, 'u_light_direction');
    gl.uniform3fv(light_uniform, light_direction);
}

function renderCallBack(models_to_render, wgl_utils, gl, program, clear_color, camera) {
    // Set camera matrix (it will be the same for all objects to render, so we can set it here)
    const camera_matrix = camera.getCameraMatrix();
    const camera_uniform = gl.getUniformLocation(program, 'u_camera_matrix');
    gl.uniformMatrix4fv(camera_uniform, true, camera_matrix);
    
    wgl_utils.clearCanvas(clear_color, gl);
    
    for (let m in models_to_render) {
        const model = models_to_render[m];
        const objects = model.getRenderableObjects(); // Get renderable objects from model
        const transformation_matrix = model.transformation_matrix; // Get transformation matrix from model

        // Set transformation matrix (since it's the same for all objects, we can set it here)
        const transformation_uniform = gl.getUniformLocation(program, 'u_model_matrix');
        gl.uniformMatrix4fv(transformation_uniform, true, transformation_matrix);

        for (let o in objects) {
            let obj = objects[o];
            console.log(obj);

            // Set object VAO
            gl.bindVertexArray(obj.vao);

            // Render
            gl.drawArrays(gl.TRIANGLES, 0, obj.vertex_count);
        }
    }
}

async function main() {
    const log = initializeLog();

    // Initializing FileLoader and WebGLUtils
    const fl = new FileLoader(log);
    const wgl_utils = new WebGLUtils(log);

    // WebGL initialization
    const canvas = document.getElementById('glcanvas');
    const gl = wgl_utils.initializeWebGLContext(canvas);

    
    // Loading shaders code
    const v_shader = await fl.loadShader('shaders/VertexShader.glsl');
    const f_shader = await fl.loadShader('shaders/FragmentShader.glsl');

    log.success_log('main> Shaders code loaded.');

    // Creating shaders
    const vertex_shader = wgl_utils.createShader(gl.VERTEX_SHADER, v_shader);
    const fragment_shader = wgl_utils.createShader(gl.FRAGMENT_SHADER, f_shader);
    
    if (!vertex_shader || !fragment_shader) {
        throw new Error('Failed to create shaders.');
    }
    
    log.success_log('main> Shaders created.');

    // Creating program
    const program = wgl_utils.createProgram(vertex_shader, fragment_shader);

    if (!program) {
        throw new Error('Failed to create program.');
    }

    gl.useProgram(program);
    
    log.success_log('main> Program created.');

    // Creating perspective matrix
    const fov = 90;
    const aspect_ratio = canvas.width / canvas.height;
    const near = 0.1;
    const far = 1000;
    setProjectionMatrix(fov, aspect_ratio, near, far, gl, program);

    // Set light direction
    const light_direction = new Float32Array([0, 0, 1]);
    setLightSource(light_direction, gl, program);

    // Set clear color to 80% gray
    const clear_color = new Color(0.2, 0.2, 0.2, 1.0);

    // Creating camera
    const camera = new Camera(new Vec4(50, 0, -50, 1));

    // Loading 3D object
    const model = await fl.load3DObject('objs/cube.obj', gl, program);
    let model_matrix = model.transformation_matrix;
    GraphicsMath.translateMatrix(model_matrix, +5, 0, 0);

    renderCallBack([model], wgl_utils, gl, program, clear_color, camera);
}

main();