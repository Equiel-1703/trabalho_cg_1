import GraphicsMath from "../3DStuff/GraphicsMath.js";
import { Color } from "../3DStuff/WebGLUtils.js";

import DoLog from "../Logging/DoLog.js";

export default class PropertiesEditor extends DoLog {
	static #position_prop = 'prop_position';
	static #rotation_prop = 'prop_rotation';
	static #scale_prop = 'prop_scale';

	static #texture_color_input_id = 'texture_color';
	static #texture_color_opacity_input_id = 'texture_color_opacity';

	static #texture_image_input = 'texture_image_input';
	static #img_element_id = 'texture_img_element';
	static #texture_clear_btn_id = 'texture_clear_btn';
	static #default_img_name = 'img_icon.png';
	static #default_img_src = 'imgs/' + PropertiesEditor.#default_img_name;

	// Flags to control texture loading
	/** @type {string} */
	#current_texture_id = '';
	/** @type {boolean} */
	#set_new_texture = false;
	/** @type {boolean} */
	#clear_texture = false;

	constructor(log) {
		super(log, 'PropertiesEditor> ');

		this.LOG('Initializing properties panel.');

		const img_input = document.getElementById(PropertiesEditor.#texture_image_input);
		const clear_btn = document.getElementById(PropertiesEditor.#texture_clear_btn_id);

		const img_icon = document.getElementById(PropertiesEditor.#img_element_id);

		const img_input_change = (e) => {
			const input = e.target;

			if (input.files.length === 0) {
				return;
			} else {
				/** @type {File} */
				const img_file = input.files[0];
				const new_img_id = img_file.name + String(img_file.size);

				// Check if the user selected the same image
				if (this.#current_texture_id === new_img_id) {
					this.LOG('The same texture image was selected: ' + img_file.name + ' (' + img_file.size + ' bytes).' + ' This will not be loaded again.', 'info');

					this.#clear_texture = false;
					this.#set_new_texture = false;

					return;
				}

				this.LOG('New texture image selected: ' + img_file.name + ' (' + img_file.size + ' bytes)');

				// Set the flags to load the new texture and return it to the caller
				this.#current_texture_id = new_img_id;
				this.#set_new_texture = true;
				this.#clear_texture = false;

				// Create a blob URL to the new image and set it to the image icon (this will be returned to the caller) 
				const img_blob_url = URL.createObjectURL(img_file);

				img_icon.src = img_blob_url;

				// Reset the input file element so the user can select another image with the same name (we distinguish them by size)
				input.value = '';
			}
		};

		img_input.addEventListener('change', img_input_change.bind(this));
		clear_btn.addEventListener('click', this.clearTexture.bind(this));

		// Load the default properties values
		this.clearProperties();

		this.LOG('Properties panel initialized.', 'success');
	}

	/**
	 * Load object transformations into the input fields of the properties panel.
	 * 
	 * @param {Object} transformation_dict - The transformation dictionary containing translation, rotation and scale.
	 */
	loadTransformationsProperties(properties_dict) {
		this.#loadPosition(properties_dict.translation);
		this.#loadRotation(properties_dict.rotation);
		this.#loadScale(properties_dict.scale);
	}

	/**
	 * Read the properties from the properties panel and return the equivalent transformation matrix.
	 * 
	 * @returns {Object} - A transformation dictionary with the properties read from the panel: translation, rotation and scale.
	 */
	readTransformationsProperties() {
		const position = this.#readPosition();
		const rotation = this.#readRotation();
		const scale = this.#readScale();

		return { translation: position, rotation: rotation, scale: scale };
	}

	/**
	 * Load the texture properties of a Model3D object into the properties panel.
	 * 
	 * @param {Object} texture_properties - The texture properties to load into the panel. It contains the following properties:
	 *  - {string} image_id - The id of the image element (name_of_img + size).
	 * 	- {string} image_path - The blob path to the image file.
	 * 	- {Color} color - The color the user choose in RGBA format.
	 */
	loadTextureProperties(texture_properties) {
		// Reset the input image and the current texture id
		this.#resetInputImage();

		// If an image is provided, load it into the image icon and update the current texture id
		if (texture_properties.image_path) {
			this.#setInputImage(texture_properties.image_path, texture_properties.image_id);
		}

		// Set flags to false (we don't want to clear the texture or set a new one)
		this.#clear_texture = false;
		this.#set_new_texture = false;

		// Load the color properties
		const color_input = document.getElementById(PropertiesEditor.#texture_color_input_id);
		const color_opacity_input = document.getElementById(PropertiesEditor.#texture_color_opacity_input_id);

		const color = texture_properties.color;

		const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
		const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
		const b = Math.round(color.b * 255).toString(16).padStart(2, '0');

		color_input.value = `#${r}${g}${b}`;
		color_opacity_input.value = color.a;
	}

	/**
	 * Read the texture properties from the properties panel.
	 * 
	 * @returns {Object} - A texture dictionary with the properties read from the panel, as follows:
	 * 	- {boolean} set_texture - A flag indicating whether the user wants to set a new texture
	 *  - {string} image_id - The id of the image element (name_of_img + size).
	 * 	- {string} image_path - A blob path pointing to the image selected by the user.
	 * 	- {boolean} clear - A flag indicating whether the user wants to clear the texture.
	 * 	- {Color} color - The color the user choose in RGBA format.
	 */
	readTextureProperties() {
		// Reading color
		const color_input = document.getElementById(PropertiesEditor.#texture_color_input_id);
		const color_opacity_input = document.getElementById(PropertiesEditor.#texture_color_opacity_input_id);

		const color_hex = color_input.value.substring(1);

		const r = parseInt(color_hex.substring(0, 2), 16) / 255;
		const g = parseInt(color_hex.substring(2, 4), 16) / 255;
		const b = parseInt(color_hex.substring(4, 6), 16) / 255;
		const a = parseFloat(color_opacity_input.value);

		const color_rgba = new Color(r, g, b, a);

		let img_path_return = '';

		// Only set the texture if we detect that the user selected a new image and doesn't want to clear it
		if (!this.#clear_texture && this.#set_new_texture) {
			// Let's get the image path from the image icon element
			const img_element = document.getElementById(PropertiesEditor.#img_element_id);
			img_path_return = img_element.src;
		}

		// Return the image, color and clear flag
		const properties = {
			set_texture: this.#set_new_texture,
			image_id: this.#current_texture_id,
			image_path: img_path_return,
			clear: this.#clear_texture,
			color: color_rgba
		};

		// Reset the flags for the next read
		this.#clear_texture = false;
		this.#set_new_texture = false;

		// Return the properties
		return properties;
	}

	/**
	 * Clear the texture image properties from the properties panel. This will reset the image icon.
	 * The clear_texture flag will be set to true, indicating to the Model3D object that the texture should be cleared.
	 *
	 */
	clearTexture() {
		// Reset the flags
		this.#clear_texture = true;
		this.#set_new_texture = false;
		this.#current_texture_id = '';

		// Reset the image icon
		const img_icon = document.getElementById(PropertiesEditor.#img_element_id);
		img_icon.src = PropertiesEditor.#default_img_src;

		const input_texture_img = document.getElementById(PropertiesEditor.#texture_image_input);
		input_texture_img.value = '';
	}

	clearProperties() {
		this.#loadPosition({ x: 0, y: 0, z: 0 });
		this.#loadRotation({ x: 0, y: 0, z: 0 });
		this.#loadScale({ x: 1, y: 1, z: 1 });

		// Reset the image icon
		const img_icon = document.getElementById(PropertiesEditor.#img_element_id);
		img_icon.src = PropertiesEditor.#default_img_src;

		// Reset the image input
		const input_texture_img = document.getElementById(PropertiesEditor.#texture_image_input);
		input_texture_img.value = '';

		// Reset the current texture id
		this.#current_texture_id = '';

		// Reset the flags
		this.#clear_texture = false;
		this.#set_new_texture = false;

		const color_input = document.getElementById(PropertiesEditor.#texture_color_input_id);
		const color_opacity_input = document.getElementById(PropertiesEditor.#texture_color_opacity_input_id);

		color_input.value = '#000000';
		color_opacity_input.value = 0.0;

		this.LOG('Default properties loaded.', 'info');
	}

	/**
	 * Reset the image icon to the default image and the current texture id.
	 */
	#resetInputImage() {
		const img_icon = document.getElementById(PropertiesEditor.#img_element_id);
		img_icon.src = PropertiesEditor.#default_img_src;

		this.#current_texture_id = '';
	}

	/**
	 * Receive an image element and set it to the input image element, updating the current texture id.
	 * 
	 * @param {string} image_path - The blob path to the image file.
	 * @param {string} image_id - The id of the image element
	 */
	#setInputImage(image_path, image_id) {
		const img_icon = document.getElementById(PropertiesEditor.#img_element_id);
		img_icon.src = image_path;

		this.#current_texture_id = image_id;
	}

	#readPosition() {
		const position_ul = document.getElementById(PropertiesEditor.#position_prop);

		const p_x = parseFloat(position_ul.querySelector('.x').value);
		const p_y = parseFloat(position_ul.querySelector('.y').value);
		const p_z = parseFloat(position_ul.querySelector('.z').value);

		return { x: p_x, y: p_y, z: p_z };
	}

	#readRotation() {
		const rotation_ul = document.getElementById(PropertiesEditor.#rotation_prop);

		const r_x = GraphicsMath.degToRad(parseFloat(rotation_ul.querySelector('.x').value));
		const r_y = GraphicsMath.degToRad(parseFloat(rotation_ul.querySelector('.y').value));
		const r_z = GraphicsMath.degToRad(parseFloat(rotation_ul.querySelector('.z').value));

		return { x: r_x, y: r_y, z: r_z };
	}

	#readScale() {
		const scale_ul = document.getElementById(PropertiesEditor.#scale_prop);

		const s_x = parseFloat(scale_ul.querySelector('.x').value);
		const s_y = parseFloat(scale_ul.querySelector('.y').value);
		const s_z = parseFloat(scale_ul.querySelector('.z').value);

		return { x: s_x, y: s_y, z: s_z };
	}

	#loadPosition(position) {
		const position_ul = document.getElementById(PropertiesEditor.#position_prop);

		position_ul.querySelector('.x').value = position.x;
		position_ul.querySelector('.y').value = position.y;
		position_ul.querySelector('.z').value = position.z;
	}

	#loadRotation(rotation) {
		const rotation_ul = document.getElementById(PropertiesEditor.#rotation_prop);

		rotation_ul.querySelector('.x').value = GraphicsMath.radToDeg(rotation.x);
		rotation_ul.querySelector('.y').value = GraphicsMath.radToDeg(rotation.y);
		rotation_ul.querySelector('.z').value = GraphicsMath.radToDeg(rotation.z);
	}

	#loadScale(scale) {
		const scale_ul = document.getElementById(PropertiesEditor.#scale_prop);

		scale_ul.querySelector('.x').value = scale.x;
		scale_ul.querySelector('.y').value = scale.y;
		scale_ul.querySelector('.z').value = scale.z;
	}
}