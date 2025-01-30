import Model3D from "../3DStuff/Model3D";

export default class ModelSelector {
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

	constructor() {
		this.#model_selector_ul = document.getElementById('model_selector');
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

		// Add to the list
		this.#models_mapping[model_name] = model_element;

		// Create the list item <li>
		const li = document.createElement('li');
		const li_class = 'model';

		li.textContent = model_name;
		li.classList.add(li_class);

		li.addEventListener('click', (e) => {
			const target = e.target;
			const selected_model_name = target.textContent;

			console.log('Selected model:', selected_model_name);
		});

		this.#model_selector_ul.appendChild(li);
	}
}