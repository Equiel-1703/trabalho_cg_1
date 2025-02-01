import Model3D from "../3DStuff/Model3D.js";

import DoLog from "../Logging/DoLog.js";
import FileLoader from "../FileProcessing/FileLoader.js";
import ModelSelector from "./ModelSelector.js";
import { Color } from "../3DStuff/WebGLUtils.js";

export class Scene {
	constructor() {
		this.models = [];
	}

	addModel(model_path, model_name, transformation_dict, global_color) {
		const model = {
			model_path: model_path,
			model_name: model_name,
			transformation_dict: transformation_dict,
			global_color: { r: global_color.r, g: global_color.g, b: global_color.b, a: global_color.a }
		}

		this.models.push(model);
	}

	getJSON() {
		return JSON.stringify(this.models, null, 4);
	}
}

export class SceneLoaderSaver extends DoLog {
	static #save_scene_button_id = 'save_scene_btn';
	static #load_scene_input_id = 'load_scene_input';

	/** @type {WebGL2RenderingContext} */
	#gl = null;
	/** @type {WebGLProgram} */
	#program = null;

	/** @type {ModelSelector} */
	#model_selector = null;

	/**
	 * @param {DoLog} log - The logger object in which this object will log messages.
	 * @param {ModelSelector} model_selector - The model selector object responsible for managing the models in the scene.
	 * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context from which the models are being rendered.
	 * @param {WebGLProgram} program - The WebGL program object used to render the models.
	 */
	constructor(log, model_selector, gl, program) {
		super(log, 'SceneLoaderSaver> ');

		const save_scene_input = document.getElementById(SceneLoaderSaver.#save_scene_button_id);
		const load_scene_input = document.getElementById(SceneLoaderSaver.#load_scene_input_id);

		this.#model_selector = model_selector;
		this.#gl = gl;
		this.#program = program;

		const save_scene_click = () => {
			const scene_json = this.saveScene(this.#model_selector.get3DModelsList());

			const blob = new Blob([scene_json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = 'scene.json';
			a.click();

			URL.revokeObjectURL(url);
		}

		save_scene_input.addEventListener('click', save_scene_click);
		load_scene_input.addEventListener('change', this.#loadScene.bind(this));
	}

	async #loadScene(e) {
		const file = e.target.files[0];
		const file_loader = new FileLoader(this.outputLog);

		if (file) {
			const file_reader = new FileReader();

			file_reader.onload = async (e) => {
				const loaded_models_paths = [];
				const scene_json = e.target.result;
				const scene = JSON.parse(scene_json);

				try {
					this.#model_selector.clear3DModelsList();

					for (const m of scene) {
						let model = null;

						if (loaded_models_paths.includes(m.model_path)) {
							// Model already loaded, duplicate it
							const models_loaded = this.#model_selector.get3DModelsList();
							const original_model = models_loaded.find((model) => model.getModelPath() === m.model_path);
							model = original_model.duplicateModel();
						} else {
							// Model not loaded yet
							model = await file_loader.load3DObject(m.model_path, this.#gl, this.#program);
							loaded_models_paths.push(m.model_path);
						}

						model.renameModel(m.model_name);
						model.setTransformation(m.transformation_dict);
						model.setGlobalColor(new Color(m.global_color.r, m.global_color.g, m.global_color.b, m.global_color.a));

						this.#model_selector.addModelToList(model);
					}
				} catch (error) {
					this.LOG('Error loading scene: ' + error);
				}
			}

			file_reader.readAsText(file);
		}


	}

	/**
	 * Save the scene to a JSON file.
	 * 
	 * @param {Model3D[]} models_list - List of models to save.
	 */
	saveScene(models_list) {
		const scene = new Scene();

		for (const m of models_list) {
			scene.addModel(m.getModelPath(), m.getModelName(), m.getTransformationDict(), m.getGlobalColor());
		}

		return scene.getJSON();
	}

}