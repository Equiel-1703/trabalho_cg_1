import DoLog from "../Logging/DoLog.js";

import Model3D from "../3DStuff/Model3D.js";

import PropertiesEditor from "./PropertiesEditor.js";

export default class ModelSelector extends DoLog {
	/** @type {string} */
	#selected_model_name = null;

	/** 
	 * Maps models names to their respective 3D models.
	 * 
	 * @type {Object}
	 */
	#models_mapping = {};

	/** @type {Set} */
	#loaded_models_paths = new Set();

	/** @type {HTMLUListElement} */
	#model_selector_ul = null;

	/** @type {PropertiesEditor} */
	#properties_editor = null;

	/** @type  {WebGL2RenderingContext} */
	#gl = null;

	/**
	 * @param {DoLog} log - The logger object in which this object will log messages.
	 * @param {PropertiesEditor} properties_editor - The properties editor object where the model properties will be displayed and edited.
	 * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context where the models are being rendered and selected.
	 */
	constructor(log, properties_editor, gl) {
		super(log, 'ModelSelector> ');

		this.#gl = gl;
		this.#model_selector_ul = document.getElementById('model_selector');
		this.#properties_editor = properties_editor;
	}

	/**
	 * Event handler for when a model is selected from the list.
	 * 
	 * @param {MouseEvent} e - The event object.
	 */
	#modelSelected(e) {
		const li_class = 'model_li';
		const li_selected_class = 'model_selected';

		const model_name = e.target.textContent.slice(0, -1); // Remove the 'X' of the delete button

		this.LOG('Selected model: ' + model_name);

		// Unselect the previous model
		if (this.#selected_model_name !== null) {
			const prev_li = document.querySelector(`.${li_class}.${li_selected_class}`);
			prev_li.classList.remove(li_selected_class);
		}

		e.target.classList.add(li_selected_class);

		// Set the properties editor to reflect the selected model transformations and texture properties
		const model = this.#models_mapping[model_name];
		this.#properties_editor.loadTransformationsProperties(model.getTransformationDict());
		this.#properties_editor.loadTextureProperties(model.getTextureProperties());

		// Select the new model
		this.#selected_model_name = model_name;
	}

	/**
	 * Create the delete button for the model list.
	 * 
	 * @returns {HTMLButtonElement} - The delete button.
	 */
	#createDeleteButton() {
		const button = document.createElement('button');
		button.textContent = 'X';
		button.classList.add('small_round_btn');

		button.addEventListener('click', this.#deleteModel.bind(this));

		return button;
	}

	/**
	 * Event handler for when a model is deleted from the list.
	 * 
	 * @param {MouseEvent} e - The event object
	 */
	#deleteModel(e) {
		e.stopPropagation();
		e.target.parentElement.remove();

		const model_name = e.target.parentElement.textContent.slice(0, -1); // Remove the 'X' of the delete button
		const model = this.#models_mapping[model_name];
		const model_path = model.getModelPath();

		if (model_name === this.#selected_model_name) {
			this.#selected_model_name = null;
		}

		// Delete the model object
		model.deleteModel(this.#gl);

		// Clear the properties editor pane
		this.#properties_editor.clearProperties();

		// Delete the model from the mapping
		delete this.#models_mapping[model_name];

		// Update loaded models paths set if necessary
		if (!Model3D.checkIfModelHasDuplicates(model_path)) {
			this.#loaded_models_paths.delete(model_path);
		}
	}

	/**
	 * Add a model to the list of selectable models.
	 * 
	 * @param {Model3D} model_element - The model element to add to the list.
	 */
	addModelToList(model_element) {
		// Get the model name
		let model_name = model_element.getModelName();

		// Check if name is already in the list
		if (model_name in this.#models_mapping) {
			// Find a unique name
			let i = 1;
			while ((model_name + '_' + i) in this.#models_mapping) {
				i++;
			}

			model_name += '_' + i;
			model_element.renameModel(model_name); // Rename the model
		}

		// Add model to the mapping
		this.#models_mapping[model_name] = model_element;
		// Add the model path to the set of loaded models paths
		this.#loaded_models_paths.add(model_element.getModelPath());

		// Create the list item <li> for the selectable models list in the menu
		const li = document.createElement('li');
		const li_class = 'model_li';

		li.classList.add(li_class);
		li.textContent = model_name;

		// Add behavior to the list item when clicked (model selected)
		li.addEventListener('click', this.#modelSelected.bind(this));

		// Append the list item to the list of models
		this.#model_selector_ul.appendChild(li);

		// Add the delete button to the list item
		li.appendChild(this.#createDeleteButton());
	}

	/**
	 * Returns a list of all the 3D selectable models in the application. This is used for rendering the scene.
	 * 
	 * @returns {Model3D[]} - The list of 3D models.
	 */
	get3DModelsList() {
		return Object.values(this.#models_mapping);
	}

	/**
	 * Returns a set of all the paths of the loaded models. This is used for checking if a model is already loaded.
	 * 
	 * @returns {Set} - The set of unique paths of the loaded models.
	 */
	getLoadedModelsPaths() {
		return this.#loaded_models_paths;
	}


	/**
	 * Clear the list of all selectable models. It will delete ALL the loaded models in the process.
	 */
	clear3DModelsList() {
		for (const model_name in this.#models_mapping) {
			const model = this.#models_mapping[model_name];
			model.deleteModel(this.#gl);
		}

		this.#models_mapping = {};
		this.#loaded_models_paths.clear();
		this.#selected_model_name = null;
		this.#model_selector_ul.innerHTML = '';
	}

	/**
	 * Returns the selected model name.
	 * 
	 * @returns {string} - The selected model name.
	 */
	getSelectedModelName() {
		return this.#selected_model_name;
	}
}