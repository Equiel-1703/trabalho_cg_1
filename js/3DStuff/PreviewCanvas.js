import DoLog from '../Logging/DoLog.js';

import FileLoader from '../FileProcessing/FileLoader.js';

import { Color, WebGLUtils } from './WebGLUtils.js';
import GraphicsMath from './GraphicsMath.js';
import Camera from './Camera.js';
import Model3D from './Model3D.js';
import Object3D from './Object3D.js';
import Vec4 from './Vec4.js';


export default class PreviewCanvas extends DoLog {
	#canvasID = '';
	#canvas = null;

	#gl = null;
	#program = null;
	#wgl_utils = null;
	#camera = null;

	#file_loader = null;
	#model = null;

	#render_enabled = false;

	static #clearColor = new Color(1.0, 1.0, 1.0, 1.0); // White
	static #STARTING_CAMERA_LOCATION = new Vec4(0, 0, -10, 1);
	static #FPS = 30;
	static #fps_limit = 1000 / PreviewCanvas.#FPS;

	constructor(canvasID, vs, fs, log) {
		super(log, canvasID + '> ');

		this.#canvasID = canvasID;
		this.#canvas = document.getElementById(canvasID);

		this.#wgl_utils = new WebGLUtils(log);
		this.#file_loader = new FileLoader(log);

		this.#gl = this.#wgl_utils.initializeWebGLContext(this.#canvas);

		const vertex_shader = this.#wgl_utils.createShader(this.#gl.VERTEX_SHADER, vs);
		const fragment_shader = this.#wgl_utils.createShader(this.#gl.FRAGMENT_SHADER, fs);

		if (!vertex_shader || !fragment_shader) {
			throw new Error('Failed to create shaders.');
		}

		const program = this.#wgl_utils.createProgram(vertex_shader, fragment_shader);

		if (!program) {
			throw new Error('Failed to create program.');
		}
		this.#gl.useProgram(program);
		this.#program = program;

		// Creating camera
		this.#camera = new Camera(PreviewCanvas.#STARTING_CAMERA_LOCATION);

		const camera_uniform = this.#gl.getUniformLocation(program, 'u_camera_matrix');
		const camera_matrix = this.#camera.getCameraMatrix();
		this.#gl.uniformMatrix4fv(camera_uniform, false, camera_matrix);

		// Creating projection matrix
		const fov = 30;
		const aspect_ratio = this.#canvas.width / this.#canvas.height;
		const near = 0.1;
		const far = 100;
		const projection_matrix = GraphicsMath.createProjectionMatrix(fov, aspect_ratio, near, far);

		const projection_uniform = this.#gl.getUniformLocation(program, 'u_perspective_projection');
		this.#gl.uniformMatrix4fv(projection_uniform, false, projection_matrix);

		// Enable depth test and culling
		this.#gl.enable(this.#gl.DEPTH_TEST);
		this.#gl.enable(this.#gl.CULL_FACE);
	}

	async setModel(model_path) {
		this.#model = await this.#file_loader.load3DObject(model_path, this.#gl, this.#program);

		this.enableRender();
	}

	enableRender() {
		this.#render_enabled = true;
		requestAnimationFrame(this.renderLoop.bind(this));
	}

	disableRender() {
		this.#render_enabled = false;
	}

	renderLoop() {
		if (!this.#render_enabled) {
			return;
		}

		const start_time = performance.now();
		const program = this.#program;

		// Getting uniform locations
		const transformation_uniform = this.#gl.getUniformLocation(program, 'u_model_matrix');
		const enable_v_color_uniform = this.#gl.getUniformLocation(program, 'u_enable_vertex_color');
		const enable_m_color_uniform = this.#gl.getUniformLocation(program, 'u_enable_material_color');
		const material_color = this.#gl.getUniformLocation(program, 'u_material_color');

		// Set transformation matrix
		const model_matrix = this.#model.getTransformationMatrix();
		this.#gl.uniformMatrix4fv(transformation_uniform, false, model_matrix);

		// Clearing the canvas
		this.#wgl_utils.clearCanvas(PreviewCanvas.#clearColor, this.#gl);

		// Rendering the model
		const model_geometries = this.#model.getRenderableObjects();
		for (let i = 0; i < model_geometries.length; i++) {
			const geometry = model_geometries[i];

			const vao = geometry.getVAO();
			const material = geometry.getMaterial();

			if (material) {
				// Enable material color
				this.#gl.uniform1f(enable_m_color_uniform, 1.0);
				// Disable vertex color
				this.#gl.uniform1f(enable_v_color_uniform, 0.0);

				// Set material color
				this.#gl.uniform3fv(material_color, new Float32Array(material.diffuse));
			} else {
				// Disable material color
				this.#gl.uniform1f(enable_m_color_uniform, 0.0);
				// Enable vertex color
				this.#gl.uniform1f(enable_v_color_uniform, 1.0);

				this.#gl.uniform3fv(material_color, new Float32Array([1.0, 1.0, 1.0]));
			}

			this.#gl.bindVertexArray(vao);

			this.#gl.drawArrays(this.#gl.TRIANGLES, 0, geometry.getVertexCount());
		}

		const end_time = performance.now();
		const elapsed_time = end_time - start_time;
		const time_to_wait = PreviewCanvas.#fps_limit - elapsed_time;

		if (time_to_wait > 0) {
			setTimeout(() => requestAnimationFrame(this.renderLoop.bind(this)),
				time_to_wait);
		} else {
			requestAnimationFrame(this.renderLoop.bind(this));
		}

		// Log FPS
		// this.LOG(`FPS: ${Math.round(1000 / (elapsed_time + time_to_wait))}`);
	}
}