import OutputLog from "./OutputLog.js";
import { Color, WebGLUtils } from "./WebGLUtils.js";
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
    const ld_norm = light_direction.normalize();

    const light_uniform = gl.getUniformLocation(program, 'u_light_direction');
    gl.uniform3fv(light_uniform, new Float32Array([ld_norm.x, ld_norm.y, ld_norm.z]));
}

let fps_limiter = 0;
function setFPSLimiter(fps_limit) {
    fps_limiter = 1000 / fps_limit;
}

let thumbsticks_values = { camera_rotation: { x: 0, y: 0 }, camera_position: { x: 0, y: 0 } };
let thumbsticks_active = false;
function initializeThumbsticks(log) {
    const thumb_cam_rot = document.getElementById('thumb_btn_rotation');
    const thumb_cam_pos = document.getElementById('thumb_btn_position');

    const thumbs_btns = [thumb_cam_rot, thumb_cam_pos];

    let moving = false;
    let target_stick = null;

    let starting_pos = { x: 0, y: 0 };
    let starting_transform = { x: 0, y: 0 };

    const transform_limit = 35;
    const thumb_btn_transition = 'thumb_btn_transition';

    // Helper functions
    const set_thumb_translation = (x, y) => {
        target_stick.style.transform = `translate(${x}px, ${y}px)`;
    };
    const get_thumb_translation = () => {
        if (target_stick.style.transform.length > 0) {
            let transform_content = target_stick.style.transform.split('(')[1].split(')')[0].split(',');
            return { x: parseFloat(transform_content[0]), y: parseFloat(transform_content[1]) };
        } else {
            return { x: 0, y: 0 };
        }
    };

    // Events functions
    const evnt_mousedown = (e) => {
        target_stick = e.target;

        // Reset thumbsticks values
        thumbsticks_values.camera_rotation = { x: 0, y: 0 };
        thumbsticks_values.camera_position = { x: 0, y: 0 };

        target_stick.classList.remove(thumb_btn_transition);

        starting_pos = { x: e.x, y: e.y };
        starting_transform = get_thumb_translation();

        log.log(`Mouse target: ${target_stick.id}`);
        log.log(`Starting transform: ${starting_transform.x}, ${starting_transform.y}`);
        log.log(`Starting position: ${starting_pos.x}, ${starting_pos.y}`);

        moving = true;
        thumbsticks_active = true;
    };

    const evnt_mouseup = () => {
        if (target_stick) {
            target_stick.classList.add(thumb_btn_transition);
            set_thumb_translation(0, 0);

            moving = false;
            thumbsticks_active = false;
            target_stick = null;
        }
    };

    const evnt_mousemove = (e) => {
        if (moving) {
            const diff_x = e.x - starting_pos.x;
            const diff_y = e.y - starting_pos.y;

            let new_transform_x = starting_transform.x + diff_x;
            let new_transform_y = starting_transform.y + diff_y;

            if (Math.abs(new_transform_x) > transform_limit) {
                new_transform_x = Math.sign(new_transform_x) * transform_limit;
            }

            if (Math.abs(new_transform_y) > transform_limit) {
                new_transform_y = Math.sign(new_transform_y) * transform_limit;
            }

            set_thumb_translation(new_transform_x, new_transform_y);

            // Here we will convert the thumbstick values to a normalized range from -1 to 1
            const x_normalized = new_transform_x / transform_limit;
            const y_normalized = new_transform_y / transform_limit;

            if (target_stick === thumb_cam_rot) {
                // If we are rotating the camera, the range will be in radians: (-PI/180, PI/180)
                thumbsticks_values.camera_rotation = { x: x_normalized * Math.PI / 180, y: y_normalized * Math.PI / 180 };
            } else {
                // If we are moving the camera, the range will be in the normalized range (-1, 1)
                thumbsticks_values.camera_position = { x: x_normalized, y: y_normalized };
            }
        }
    };

    // Adding events
    thumbs_btns.forEach((btn) => {
        btn.addEventListener('mousedown', evnt_mousedown);
    });

    document.addEventListener('mouseup', evnt_mouseup);
    document.addEventListener('mousemove', evnt_mousemove);
}

let dpad_active = false;
let dpad_value = 0;
function initializeDPads() {
    const up_id = 'dpad_up';
    const down_id = 'dpad_down';

    const dpad_up = document.getElementById(up_id);
    const dpad_down = document.getElementById(down_id);
    const dpads = [dpad_up, dpad_down];

    const dpad_pressed_src = './imgs/dpad_pressed.png';
    const dpad_released_src = './imgs/dpad.png';

    let target_dpad = null;

    const evnt_mousedown = (e) => {
        target_dpad = e.target;

        if (target_dpad.id === up_id) {
            dpad_value = 1;
        } else if (target_dpad.id === down_id) {
            dpad_value = -1;
        }

        target_dpad.attributes.src.value = dpad_pressed_src;
        dpad_active = true;
    }

    const evnt_mouseup = () => {
        dpad_active = false;

        if (target_dpad) {
            target_dpad.attributes.src.value = dpad_released_src;
            target_dpad = null;
        }
    }

    for (let d in dpads) {
        dpads[d].addEventListener('mousedown', evnt_mousedown);
    }

    document.addEventListener('mouseup', evnt_mouseup);
}

// ----------- APP PARAMETERS --------------
const FPS = 60;
let models_to_render = [];

// ----------- MAIN FUNCTION --------------
async function main() {
    const log = initializeLog();

    initializeThumbsticks(log);
    initializeDPads(log);

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

    // Set clear color to 60% gray
    const clear_color = new Color(0.4, 0.4, 0.4, 1.0);

    // Creating camera
    const camera = new Camera(Vec4.createZeroPoint()); // By default, the camera is looking in the positive Z direction
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            camera.logCameraStats(log);
        }
    });

    // Loading 3D objects
    const cube_model = await fl.load3DObject('objs/cube.obj', gl, program);
    const pyram_model = await fl.load3DObject('objs/triang_pyram.obj', gl, program);

    // Creating transformation matrix
    const scale = 10;
    let scale_matrix = GraphicsMath.createScaleMatrix(scale, scale, scale);
    let translation_matrix = GraphicsMath.createTranslationMatrix(-20, 0, 0);

    cube_model.setTransformationMatrix(scale_matrix);
    pyram_model.setTransformationMatrix(GraphicsMath.multiplyMatrices(translation_matrix, scale_matrix));

    // ------------- Rendering setup -------------
    setFPSLimiter(FPS); // Limiting to 60 FPS
    gl.enable(gl.DEPTH_TEST); // Enable depth test

    models_to_render = [cube_model, pyram_model]; // Models to render

    const start_render_time = performance.now();

    const render = renderCallBack.bind(null, wgl_utils, gl, program, clear_color, camera, start_render_time);
    requestAnimationFrame(render);
}


function renderCallBack(wgl_utils, gl, program, clear_color, camera, start) {
    const cube_x = parseFloat(document.getElementById('cube_x').value);
    const cube_y = parseFloat(document.getElementById('cube_y').value);
    const cube_z = parseFloat(document.getElementById('cube_z').value);

    let camera_position = camera.location;
    if (thumbsticks_active) {

        camera_position.x += thumbsticks_values.camera_position.x;
        camera_position.z += (- thumbsticks_values.camera_position.y);

        let rotation_x = thumbsticks_values.camera_rotation.x;
        let rotation_y = thumbsticks_values.camera_rotation.y;

        camera.rotate(-rotation_x, 'y');
        camera.rotate(-rotation_y, 'x');
    }

    if (dpad_active) {
        camera_position.y += dpad_value;
    }

    camera.location = new Vec4(camera_position.x, camera_position.y, camera_position.z, 1.0);

    // Set camera matrix (it will be the same for all objects to render, so we can set it here)
    const camera_matrix = camera.getCameraMatrix();
    const camera_uniform = gl.getUniformLocation(program, 'u_camera_matrix');
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
        const transformation_uniform = gl.getUniformLocation(program, 'u_model_matrix');
        // gl.uniformMatrix4fv(transformation_uniform, false, object_transformation_matrix);
        gl.uniformMatrix4fv(transformation_uniform, false, model.getTransformationMatrix());

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

    const diff = fps_limiter - elapsed;

    // Update FPS counter in HTML
    document.getElementById('fps_counter').innerText = `FPS: ${Math.round(1000 / (elapsed + diff))}`;

    let start_2 = performance.now();

    const callback = renderCallBack.bind(null, wgl_utils, gl, program, clear_color, camera, start_2);

    if (diff > 0) {
        setTimeout(() => {
            requestAnimationFrame(callback, start_2);
        }, diff);
    } else {
        requestAnimationFrame(callback, start_2);
    }

}

main();