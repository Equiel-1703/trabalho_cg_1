import DoLog from '../Logging/DoLog.js';

import PreviewCanvas from '../3DStuff/PreviewCanvas.js';

export default class ModelCreatorMenu extends DoLog {
	#models_path_list = [];
	#models_start_index = 0;

	#displayed_models_path = [];
	#preview_canvas = [];

	static #MODEL_CREATOR_TAB_ID = 'model_creator';
	static #CANVAS_PREVIEW_IDS = ['mc_1', 'mc_2', 'mc_3', 'mc_4'];
	static #NUM_CANVAS_PREVIEW = ModelCreatorMenu.#CANVAS_PREVIEW_IDS.length;

	#created_models = [];

	constructor(log, models_path_list, vs, fs) {
		super(log, 'ModelCreatorMenu> ');

		this.#models_path_list = models_path_list;

		this.#initializePreviewCanvas(vs, fs);
		this.#fillDisplayedModelsPath();

		this.#initializeButtonsListeners();

		const ms = document.getElementById(ModelCreatorMenu.#MODEL_CREATOR_TAB_ID);
		const objserver_callback = this.#observerCallback.bind(this);
		const observer = new MutationObserver(objserver_callback);

		observer.observe(ms, {
			attributes: true,
			attributeFilter: ['style']
		});
	}

	getNewModels() {
		const cm = this.#created_models;

		this.#created_models = []; // Once read, clear the list

		return cm;
	}

	hasNewModels() {
		return this.#created_models.length > 0;
	}

	#initializeButtonsListeners() {
		const back_button_id = 'models_back';
		const next_button_id = 'models_next';

		const back_button = document.getElementById(back_button_id);
		const next_button = document.getElementById(next_button_id);

		const click_next = () => {
			this.#rollDisplayedModels();
			this.#fillDisplayedModelsPath();
			this.#startRendering();
		};

		const click_back = () => {
			this.#rollBackDisplayedModels();
			this.#fillDisplayedModelsPath();
			this.#startRendering();
		};

		back_button.addEventListener('click', click_back);
		next_button.addEventListener('click', click_next);
	}

	#initializePreviewCanvas(vs, fs) {
		const canvas_click = (e) => {
			const canvas_id = e.target.id;

			const index = ModelCreatorMenu.#CANVAS_PREVIEW_IDS.indexOf(canvas_id);
			const model_path = this.#displayed_models_path[index];

			this.LOG('Selected model: ' + model_path, 'info');
			this.#created_models.push(model_path);
		}

		for (let i = 0; i < ModelCreatorMenu.#NUM_CANVAS_PREVIEW; i++) {
			const preview_canvas = new PreviewCanvas(ModelCreatorMenu.#CANVAS_PREVIEW_IDS[i], vs, fs, this.outputLog);

			preview_canvas.getCanvasElement().addEventListener('click', canvas_click);

			this.#preview_canvas.push(preview_canvas);
		}
	}

	#fillDisplayedModelsPath() {
		const start_index = this.#models_start_index;
		const end_index = start_index + ModelCreatorMenu.#NUM_CANVAS_PREVIEW;

		this.#displayed_models_path = this.#models_path_list.slice(start_index, end_index);
	}

	#rollDisplayedModels() {
		this.#models_start_index += ModelCreatorMenu.#NUM_CANVAS_PREVIEW;

		const list_length = this.#models_path_list.length;
		const start_index = this.#models_start_index;

		if (start_index >= list_length) {
			this.#models_start_index = 0;
		}
	}

	#rollBackDisplayedModels() {
		this.#models_start_index -= ModelCreatorMenu.#NUM_CANVAS_PREVIEW;

		const start_index = this.#models_start_index;

		if (start_index <= 0) {
			this.#models_start_index = this.#models_path_list.length - ModelCreatorMenu.#NUM_CANVAS_PREVIEW;
		}
	}

	#startRendering() {
		for (let i = 0; i < ModelCreatorMenu.#NUM_CANVAS_PREVIEW; i++) {
			const model_path = this.#displayed_models_path[i];
			const preview_canvas = this.#preview_canvas[i];

			preview_canvas.setModel(model_path);
		}
	}

	#stopRendering() {
		for (let i = 0; i < ModelCreatorMenu.#NUM_CANVAS_PREVIEW; i++) {
			const preview_canvas = this.#preview_canvas[i];

			preview_canvas.disableRender();
		}
	}

	#observerCallback(mutationsList) {
		for (let mutation of mutationsList) {
			if (mutation.type === 'attributes') {
				switch (mutation.attributeName) {
					case 'style':
						const model_creator_tab = mutation.target;

						if (model_creator_tab.style.display === 'block') {
							this.#startRendering(); // Model selector tab is visible
						} else if (model_creator_tab.style.display === 'none') {
							this.#stopRendering(); // Model selector tab is hidden
						}
						break;
					default:
						break;
				}
			}
		}
	}
}