import OutputLog from "../Logging/OutputLog.js";
import FileLoader from "../FileProcessing/FileLoader.js";

import CameraControls from "../Inputs/CameraControls.js";
import ModelSelector from "../Inputs/ModelSelector.js";

import PreviewCanvas from "../3DStuff/PreviewCanvas.js";
import { Color, WebGLUtils } from "../3DStuff/WebGLUtils.js";
import GraphicsMath from "../3DStuff/GraphicsMath.js";
import Vec4 from "../3DStuff/Vec4.js";
import Camera from "../3DStuff/Camera.js";

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
    const ld_norm = light_direction.normalize();

    const light_uniform = gl.getUniformLocation(program, 'u_light_direction');
    gl.uniform3fv(light_uniform, new Float32Array([ld_norm.x, ld_norm.y, ld_norm.z]));
}

async function loadObjsList() {
    const file_list_path = './objs/kit/objs_list.files';
    const obj_prefix = './objs/kit/';

    const ret = await fetch(file_list_path);

    if (!ret.ok) {
        throw new Error('Failed to fetch file list.');
    }

    const text = await ret.text();
    const obj_list = [];

    text.split('\n').forEach((line) => {
        if (line !== '') {
            const obj_path = (obj_prefix + line).trim();
            obj_list.push(obj_path);
        }
    });

    return obj_list;
}

// ----------- GLOBAL PARAMETERS --------------
const FPS = 60;
const FPS_LIMIT = 1000 / FPS;

const CLEAR_COLOR = new Color(0.4, 0.4, 0.4, 1.0); // Clear color (60% gray)

let models_to_render = [];
let camera_controls_obj = null;

// ----------- MAIN FUNCTION --------------
async function main() {
    const log = initializeLog();

    // Initialize user inputs
    camera_controls_obj = new CameraControls(log);

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
    const fov = 60;
    const aspect_ratio = canvas.width / canvas.height;
    const near = 0.1;
    const far = 1000;
    setProjectionMatrix(fov, aspect_ratio, near, far, gl, program);

    // Set light direction
    const light_direction = new Vec4(0.5, -0.6, 1, 0); // Light direction
    setLightSource(light_direction, gl, program);

    // Creating camera
    const camera = new Camera(Vec4.createZeroPoint()); // By default, the camera is looking in the positive Z direction
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            camera.logCameraStats(log);
        }
    });


    // Load models list
    // const objs_list = await getObjsList();
    // console.log(objs_list);

    // Test code ----------------

    const objs_list = await loadObjsList();

    const ms = new ModelSelector(log, objs_list, v_shader, f_shader);

    // End of test code ----------------


    // ------------- Rendering setup -------------
    gl.enable(gl.DEPTH_TEST); // Enable depth test
    gl.enable(gl.CULL_FACE); // Enable face culling


    const callback = renderCallBack.bind(null, wgl_utils, gl, program, CLEAR_COLOR, camera);
    requestAnimationFrame(callback);
}

// ----------------- RENDER CALLBACK -----------------
function renderCallBack(wgl_utils, gl, program, clear_color, camera, s_time) {
    let camera_controls_output = camera_controls_obj.readCameraControls();

    if (camera_controls_output.status_active) {
        const rotation = camera_controls_output.controls_values.camera_rotation;
        const move = camera_controls_output.controls_values.camera_move;

        camera.move(move.direction, move.amount);

        if (rotation.x !== 0) {
            camera.rotate(-rotation.x, 'y');
        }

        if (rotation.y !== 0) {
            camera.rotate(-rotation.y, 'x');
        }
    }

    // Getting uniform locations
    const camera_uniform = gl.getUniformLocation(program, 'u_camera_matrix');
    const transformation_uniform = gl.getUniformLocation(program, 'u_model_matrix');
    const enable_v_color_uniform = gl.getUniformLocation(program, 'u_enable_vertex_color');
    const enable_m_color_uniform = gl.getUniformLocation(program, 'u_enable_material_color');
    const material_color = gl.getUniformLocation(program, 'u_material_color');

    // Set camera matrix (it will be the same for all objects to render, so we can set it here)
    const camera_matrix = camera.getCameraMatrix();
    gl.uniformMatrix4fv(camera_uniform, false, camera_matrix);

    wgl_utils.clearCanvas(clear_color, gl);

    for (let m in models_to_render) {
        const model = models_to_render[m];

        const objects = model.getRenderableObjects(); // Get renderable objects from model

        // Create transformation matrix for model
        // let object_transformation_matrix = GraphicsMath.createIdentityMatrix();

        // Apply rotation to model
        // TODO...
        // Apply scaling to model
        // TODO...
        // Apply translation to model
        // object_transformation_matrix = GraphicsMath.multiplyMatrices(GraphicsMath.createTranslationMatrix(cube_x, cube_y, cube_z), object_transformation_matrix);

        // Now we will apply this transformation matrix to the initial transformation matrix of the model
        // object_transformation_matrix = GraphicsMath.multiplyMatrices(object_transformation_matrix, model.getTransformationMatrix());

        // Set transformation matrix (since it's the same for all objects, we can set it here)
        // gl.uniformMatrix4fv(transformation_uniform, false, object_transformation_matrix);
        gl.uniformMatrix4fv(transformation_uniform, false, model.getTransformationMatrix());

        for (let o in objects) {
            let obj = objects[o];

            // Set object material settings
            const material = obj.getMaterial();
            if (material) {
                // Enable material color
                gl.uniform1f(enable_m_color_uniform, 1.0);
                // Disable vertex color
                gl.uniform1f(enable_v_color_uniform, 0.0);

                // Set material color
                gl.uniform3fv(material_color, new Float32Array(material.diffuse));
            } else {
                // Disable material color
                gl.uniform1f(enable_m_color_uniform, 0.0);
                // Enable vertex color
                gl.uniform1f(enable_v_color_uniform, 1.0);

                gl.uniform3fv(material_color, new Float32Array([1.0, 1.0, 1.0]));
            }

            // Set object VAO
            gl.bindVertexArray(obj.getVAO());

            // Render
            gl.drawArrays(gl.TRIANGLES, 0, obj.getVertexCount());
        }
    }

    const end = performance.now();
    const elapsed = end - s_time;

    const diff = FPS_LIMIT - elapsed;

    // Update FPS counter in HTML
    document.getElementById('fps_counter').innerText = `FPS: ${Math.round(1000 / (elapsed + diff))}`;

    const callback = () => {
        requestAnimationFrame(renderCallBack.bind(null, wgl_utils, gl, program, clear_color, camera));
    }

    if (diff > 0) {
        setTimeout(callback, diff);
    } else {
        callback();
    }
}

main();