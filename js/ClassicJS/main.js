import OutputLog from "../Logging/OutputLog.js";
import FileLoader from "../FileProcessing/FileLoader.js";

import CameraControls from "../Inputs/CameraControls.js";
import ModelCreatorMenu from "../Inputs/ModelCreatorMenu.js";
import ModelSelector from "../Inputs/ModelSelector.js";
import PropertiesEditor from "../Inputs/PropertiesEditor.js";
import { SceneLoaderSaver } from "../Inputs/SceneLoaderSaver.js";

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
    const enable_lighting_uniform = gl.getUniformLocation(program, 'u_enable_lighting');

    gl.uniform3fv(light_uniform, new Float32Array([ld_norm.x, ld_norm.y, ld_norm.z]));
    gl.uniform1i(enable_lighting_uniform, true);
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

function setupTextureUnit(gl, program, texture_unit_num) {
    // Get uniform location
    const texture_uniform = gl.getUniformLocation(program, 'u_texture');
    // Activate texture unit 0
    gl.activeTexture(gl.TEXTURE0 + texture_unit_num);

    gl.uniform1i(texture_uniform, texture_unit_num);
}


// ----------- GLOBAL PARAMETERS --------------
const FPS = 60;
const FPS_LIMIT = 1000 / FPS;
const CAMERA_SPEED = 6; // Camera speed (pixels per second)
const MODELS_CONFIGS = {
    generate_normals: true
};

const CLEAR_COLOR = new Color(0.4, 0.4, 0.4, 1.0); // Clear color (60% gray)

let models_to_render = [];

/** @type {OutputLog} */
let log = null;

let gl = null;
let program = null;
let wgl_utils = null;
let camera = null;
let camera_controls_obj = null;

/** @type {FileLoader} */
let file_loader = null;
/** @type {ModelCreatorMenu} */
let model_creator = null;
/** @type {ModelSelector} */
let model_selector = null;
/** @type {PropertiesEditor} */
let properties_editor = null;

// ----------- MAIN FUNCTION --------------
async function main() {
    log = initializeLog();

    // Initialize user inputs
    camera_controls_obj = new CameraControls(log);

    // Initializing FileLoader and WebGLUtils
    file_loader = new FileLoader(log);
    wgl_utils = new WebGLUtils(log);

    // WebGL initialization
    const canvas = document.getElementById('glcanvas');
    gl = wgl_utils.initializeWebGLContext(canvas);

    // Loading shaders code
    const v_shader = await file_loader.loadShader('shaders/VertexShader.glsl');
    const f_shader = await file_loader.loadShader('shaders/FragmentShader.glsl');

    log.success_log('main> Shaders code loaded.');

    // Creating shaders
    const vertex_shader = wgl_utils.createShader(gl.VERTEX_SHADER, v_shader);
    const fragment_shader = wgl_utils.createShader(gl.FRAGMENT_SHADER, f_shader);

    if (!vertex_shader || !fragment_shader) {
        throw new Error('Failed to create shaders.');
    }

    log.success_log('main> WebGL shaders created.');

    // Creating program
    program = wgl_utils.createProgram(vertex_shader, fragment_shader);

    if (!program) {
        throw new Error('Failed to create program.');
    }

    gl.useProgram(program);

    log.success_log('main> Program created.');

    // Creating perspective matrix
    const fov = 30;
    const aspect_ratio = canvas.width / canvas.height;
    const near = 0.1;
    const far = 1000;
    setProjectionMatrix(fov, aspect_ratio, near, far, gl, program);

    // Set light direction
    const light_direction = new Vec4(0.5, -0.6, 1, 0); // Light direction
    setLightSource(light_direction, gl, program);

    // Creating camera
    camera = new Camera(new Vec4(0, 0, -10, 1)); // By default, the camera is looking in the positive Z direction
    // Here I set that if the user presses the space bar, the camera stats will be logged
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            camera.logCameraStats(log);
        }
    });

    // Setup model creator menu
    const objs_list = await loadObjsList();
    model_creator = new ModelCreatorMenu(log, objs_list, v_shader, f_shader);
    properties_editor = new PropertiesEditor(log);
    model_selector = new ModelSelector(log, properties_editor, gl);
    const saver_loader = new SceneLoaderSaver(log, model_selector, MODELS_CONFIGS, gl, program);

    // ------------- Rendering setup -------------
    gl.enable(gl.DEPTH_TEST); // Enable depth test
    gl.enable(gl.CULL_FACE); // Enable face culling

    // Configure face culling
    gl.cullFace(gl.FRONT);

    // Setup texture unit
    setupTextureUnit(gl, program, 0);

    requestAnimationFrame(renderCallBack);
}

// ---------------------------------- RENDER CALLBACK ----------------------------------
async function renderCallBack(s_time) {
    let camera_controls_output = camera_controls_obj.readCameraControls();

    if (camera_controls_output.status_active) {
        const rotation = camera_controls_output.controls_values.camera_rotation;
        const move_dir = camera_controls_output.controls_values.camera_move_direction;

        camera.move(move_dir, CAMERA_SPEED / FPS);

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
    const material_color_uniform = gl.getUniformLocation(program, 'u_material_color');
    const global_color_uniform = gl.getUniformLocation(program, 'u_global_color');

    const enable_v_color_uniform = gl.getUniformLocation(program, 'u_enable_vertex_color');
    const enable_m_color_uniform = gl.getUniformLocation(program, 'u_enable_material_color');
    const enable_texture_uniform = gl.getUniformLocation(program, 'u_enable_texture');

    // Set camera matrix (it will be the same for all objects to render, so we can set it here)
    const camera_matrix = camera.getCameraMatrix();
    gl.uniformMatrix4fv(camera_uniform, false, camera_matrix);

    // Update models to render
    await updateModelsToRender();
    const selected_model = model_selector.getSelectedModelName();

    wgl_utils.clearCanvas(CLEAR_COLOR, gl);

    for (const model of models_to_render) {
        if (selected_model === model.getModelName()) {
            // If the user is selecting a model, we need to update its transformation matrix
            model.setTransformation(properties_editor.readTransformationsProperties());

            // Read texture properties panel
            const texture_properties = properties_editor.readTextureProperties();

            if (texture_properties.set_texture) {
                // Set texture
                await model.setTexture(texture_properties.image_path, texture_properties.image_id, gl);
            } else if (texture_properties.clear) {
                // Clear texture
                model.clearTexture(gl);
            }

            // Set global color for model
            model.setGlobalColor(texture_properties.color);
        }

        // Set transformation matrix (since it's the same for all objects, we can set it here)
        gl.uniformMatrix4fv(transformation_uniform, false, model.getTransformationMatrix());
        // Set global color
        gl.uniform4fv(global_color_uniform, model.getGlobalColor().getRGBA());
        // Set texture (if any)
        if (model.hasTexture()) {
            gl.uniform1i(enable_texture_uniform, true);
            // Enable material texture for rendering
            model.enableTexture(gl);
        } else {
            gl.uniform1i(enable_texture_uniform, false);
        }

        const objects = model.getRenderableObjects(); // Get renderable objects from model

        for (const obj of objects) {
            // Set object material settings
            const material = obj.getMaterial();

            // Enable material color, if the model has no texture
            if (!model.hasTexture()) {
                if ('diffuse' in material) {
                    // Disable vertex color
                    gl.uniform1i(enable_v_color_uniform, false);
                    // Enable material color
                    gl.uniform1i(enable_m_color_uniform, true);

                    // Set material color
                    gl.uniform3fv(material_color_uniform, new Float32Array(material.diffuse));
                } else {
                    // Disable material color
                    gl.uniform1i(enable_m_color_uniform, false);
                    // Enable vertex color (it has random colors by default)
                    gl.uniform1i(enable_v_color_uniform, true);
                }
            } else {
                // Disable material color
                gl.uniform1i(enable_m_color_uniform, false);
                // Disable vertex color
                gl.uniform1i(enable_v_color_uniform, false);
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
    document.getElementById('fps_counter').innerText = `FPS: ${Math.round(1000 / (elapsed + Math.abs(diff)))}`;

    const callback = () => {
        requestAnimationFrame(renderCallBack);
    }

    if (diff > 0) {
        setTimeout(callback, diff);
    } else {
        callback();
    }
}

async function updateModelsToRender() {
    // Check if there are new models to add to the scene
    if (model_creator.hasNewModels()) {
        const new_models_paths = model_creator.getNewModels();

        /** @type {Set<string>} */
        let loaded_paths;

        for (let mp of new_models_paths) {
            loaded_paths = model_selector.getLoadedModelsPaths();

            let nm = null;

            // Check if we already loaded this model
            if (loaded_paths.has(mp)) {
                // Model already loaded, let's duplicate it
                for (const m of models_to_render) {
                    if (m.getModelPath() === mp) {
                        nm = m.duplicateModel();
                        log.log('main> Model "' + m.getModelName() + '" duplicated.');
                        break;
                    }
                }
            } else {
                // Model not loaded, let's load it
                nm = await file_loader.load3DObject(mp, gl, program, MODELS_CONFIGS);
            }

            model_selector.addModelToList(nm);
        }
    }

    // Update models to render
    models_to_render = model_selector.get3DModelsList();
}


main();