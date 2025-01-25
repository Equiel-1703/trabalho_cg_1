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
    gl.uniformMatrix4fv(pespective_uniform, false, perspective_matrix);
}

function setLightSource(light_direction, gl, program) {
    const light_uniform = gl.getUniformLocation(program, 'u_light_direction');
    gl.uniform3fv(light_uniform, light_direction);
}

function renderCallBack(models_to_render, wgl_utils, gl, program, clear_color, camera, start) {
    // Reading inputs from user in HTML
    const cam_x = parseFloat(document.getElementById('cam_x').value);
    const cam_y = parseFloat(document.getElementById('cam_y').value);
    const cam_z = parseFloat(document.getElementById('cam_z').value);

    camera.location = new Vec4(cam_x, cam_y, cam_z, 1);
    camera.logCameraStats(console);

    // Set camera matrix (it will be the same for all objects to render, so we can set it here)
    const camera_matrix = GraphicsMath.transposeMatrix(camera.getCameraMatrix());
    const camera_uniform = gl.getUniformLocation(program, 'u_camera_matrix');
    gl.uniformMatrix4fv(camera_uniform, false, camera_matrix);
    
    wgl_utils.clearCanvas(clear_color, gl);
    
    for (let m in models_to_render) {
        const model = models_to_render[m];

        const objects = model.getRenderableObjects(); // Get renderable objects from model
        const transformation_matrix = GraphicsMath.transposeMatrix(model.transformation_matrix); // Get transformation matrix from model
        
        // Set transformation matrix (since it's the same for all objects, we can set it here)
        const transformation_uniform = gl.getUniformLocation(program, 'u_model_matrix');
        gl.uniformMatrix4fv(transformation_uniform, false, transformation_matrix);

        for (let o in objects) {
            let obj = objects[o];
            
            // Set object VAO
            gl.bindVertexArray(obj.vao);

            // Render
            gl.drawArrays(gl.TRIANGLES, 0, obj.vertex_count);
        }
    }

    let end = performance.now();
    const elapsed = end - start;
    
    const diff = 16.667 - elapsed; // 60 FPS
    
    // Update FPS counter in HTML
    document.getElementById('fps_counter').innerText = `FPS: ${Math.round(1000 / (elapsed + diff))}`;

    let start_2 = performance.now();
    
    const callback = renderCallBack.bind(null, models_to_render, wgl_utils, gl, program, clear_color, camera, start_2);

    if (diff > 0) {
        setTimeout(() => {
            requestAnimationFrame(callback, start_2);
        }, diff);
    } else {
        requestAnimationFrame(callback, start_2);
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
    const light_direction = new Float32Array([0, 0, 1]); // Light direction is in the +Z axis
    setLightSource(light_direction, gl, program);

    // Set clear color to 80% gray
    const clear_color = new Color(0.2, 0.2, 0.2, 1.0);

    // Creating camera
    const camera = new Camera(new Vec4(0, 0, 0, 1)); // By default, the camera is at (0, 0, 0) and looking in the positive Z direction

    // Loading 3D object
    const model = await fl.load3DObject('objs/cube.obj', gl, program);
    let model_matrix = model.transformation_matrix;
    GraphicsMath.translateMatrix(model_matrix, 0, 20, 50);

    // Rendering
    const models_to_render = [model];

    const start_render = performance.now();

    const render = renderCallBack.bind(null, models_to_render, wgl_utils, gl, program, clear_color, camera, start_render);
    requestAnimationFrame(render);
}

main();