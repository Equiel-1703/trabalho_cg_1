import OutputLog from "./OutputLog.js";
import {Color, WebGLUtils} from "./WebGLUtils.js";
import FileLoader from "./FileLoader.js";
import GraphicsMath from "./GraphicsMath.js";

// Initializing log
const log_div = document.getElementById('log_output');
const log = new OutputLog(log_div);

// Initializing FileLoader and WebGLUtils
const fl = new FileLoader(log);
const wgl_utils = new WebGLUtils(log);

// WebGL initialization
const canvas = document.getElementById('glcanvas');
const gl = wgl_utils.initializeWebGLContext(canvas);

// Setup canvas
let clear_color = new Color(0.8, 0.8, 0.8, 1.0);
wgl_utils.clearCanvas(clear_color);

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

// Now these configurations are saved in the VAO we can safely use the program and the VAO
gl.useProgram(program);

// Binding projection matrix
const perspective_matrix = GraphicsMath.createProjectionMatrix(90, 1, 0.5, 1000);

const pespective_uniform = gl.getUniformLocation(program, 'perspective_projection');
gl.uniformMatrix4fv(pespective_uniform, true, perspective_matrix);

// Create example object
const cube = await fl.load3DObject('objs/tinker.obj', gl, program);

// --------- Draw routine ------------

// Clear the canvas
wgl_utils.clearCanvas(clear_color);

// Binding camera matrix
// todo

// Binding object transformation matrix
// todo

// Bind the VAO
gl.bindVertexArray(cube.vao);

// Draw the object
gl.drawElements(gl.TRIANGLES, cube.index_count, gl.UNSIGNED_SHORT, 0);