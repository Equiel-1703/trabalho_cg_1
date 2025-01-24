import OutputLog from "./OutputLog.js";
import {Color, WebGLUtils} from "./WebGLUtils.js";
import FileLoader from "./FileLoader.js";
import Object3D from "./Object3D.js";

// Initializing log
const log_div = document.getElementById('log_output');
const log = new OutputLog(log_div);

// WebGL initialization
const canvas = document.getElementById('glcanvas');
const gl = WebGLUtils.initializeWebGLContext(canvas, log);

// Setup canvas
let clear_color = new Color(0.8, 0.8, 0.8, 1.0);
WebGLUtils.clearCanvas(clear_color);

// Loading shaders code
const v_shader = await FileLoader.loadShader('shaders/VertexShader.glsl');
const f_shader = await FileLoader.loadShader('shaders/FragmentShader.glsl');

log.log('Shaders code loaded.');

// Creating shaders
const vertex_shader = WebGLUtils.createShader(gl.VERTEX_SHADER, v_shader);
const fragment_shader = WebGLUtils.createShader(gl.FRAGMENT_SHADER, f_shader);

if (!vertex_shader || !fragment_shader) {
    throw new Error('Failed to create shaders.');
}

log.log('Shaders created.');

// Creating program
const program = WebGLUtils.createProgram(vertex_shader, fragment_shader);

if (!program) {
    throw new Error('Failed to create program.');
}

log.log('Program created.');

// Now these configurations are saved in the VAO we can safely use the program and the VAO
gl.useProgram(program);

// Create example object
const triangle_vertices = new Float32Array([
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.0, 0.5, 0.0
]);

const triangle_indexes = new Uint16Array([
    0, 1, 2
]);

const triangle = new Object3D(triangle_vertices, triangle_indexes, gl, program);

// --------- Draw routine ------------

// Clear the canvas
WebGLUtils.clearCanvas(clear_color);

// Bind the VAO
gl.bindVertexArray(triangle.vao);

// Draw the object
gl.drawElements(gl.TRIANGLES, triangle_indexes.length, gl.UNSIGNED_SHORT, 0);