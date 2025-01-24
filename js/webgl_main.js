import OutputLog from "./OutputLog.js";
import {Color, WebGLUtils} from "./WebGLUtils.js";
import FileLoader from "./FileLoader.js";
import Object3D from "./Object3D.js";
import GraphicsMath from "./GraphicsMath.js";

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

// Binding projection matrix
const perspective_matrix = GraphicsMath.createProjectionMatrix(90, 1, 0.5, 1000);

const pespective_uniform = gl.getUniformLocation(program, 'perspective_projection');
gl.uniformMatrix4fv(pespective_uniform, true, perspective_matrix);

// Create example object
const triangle_vertices = new Float32Array([
    -0.5, -0.5, 1,
    0.5, -0.5, 1,
    0.5, 0.5, 1
]);

const triangle_indexes = new Uint16Array([
    0, 1, 2
]);

const triangle = new Object3D(triangle_vertices, triangle_indexes, gl, program);

// --------- Draw routine ------------

// Clear the canvas
WebGLUtils.clearCanvas(clear_color);

// Binding camera matrix
// todo

// Binding object transformation matrix
// todo

// Bind the VAO
gl.bindVertexArray(triangle.vao);

// Draw the object
gl.drawElements(gl.TRIANGLES, triangle.index_count, gl.UNSIGNED_SHORT, 0);