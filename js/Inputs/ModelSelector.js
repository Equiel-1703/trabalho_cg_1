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

	/** @type {HTMLUListElement} */
	#model_selector_ul = null;

	/** @type {PropertiesEditor} */
	#properties_editor = null;

	constructor(log, properties_editor) {
		super(log, 'ModelSelector> ');

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

		const model_name = e.target.textContent;

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

		// Create the list item <li>
		const li = document.createElement('li');
		const li_class = 'model_li';

		li.textContent = model_name;
		li.classList.add(li_class);

		// Add behavior to the list item when clicked (model selected)
		li.addEventListener('click', this.#modelSelected.bind(this));

		this.#model_selector_ul.appendChild(li);
	}

	/**
	 * Returns a list of all the 3D selectable models in the application.
	 * 
	 * @returns {Model3D[]} - The list of 3D models.
	 */
	get3DModelsList() {
		return Object.values(this.#models_mapping);
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