import GraphicsMath from "../3DStuff/GraphicsMath.js";
import { Color } from "../3DStuff/WebGLUtils.js";

import DoLog from "../Logging/DoLog.js";

export default class PropertiesEditor extends DoLog {
	static #position_prop = 'prop_position';
	static #rotation_prop = 'prop_rotation';
	static #scale_prop = 'prop_scale';
	static #texture_prop = 'prop_texture';

	static #texture_color_input_id = 'texture_color';
	static #texture_color_opacity_input_id = 'texture_color_opacity';

	static #texture_image_input = 'texture_image_input';
	static #img_element_id = 'texture_img_element';
	static #texture_clear_btn_id = 'texture_clear_btn';
	static #default_img_src = 'imgs/img_icon.png';

	constructor(log) {
		super(log, 'PropertiesEditor> ');

		this.LOG('Initializing texture image input field.');

		const img_input = document.getElementById(PropertiesEditor.#texture_image_input);
		const clear_btn = document.getElementById(PropertiesEditor.#texture_clear_btn_id);

		const img_icon = document.getElementById(PropertiesEditor.#img_element_id);

		const img_input_change = (e) => {
			const input = e.target;

			if (input.files.length === 0) {
				return;
			} else {
				const file = input.files[0];

				// Free the previous image (if any)
				if (img_icon.src !== PropertiesEditor.#default_img_src) {
					URL.revokeObjectURL(img_icon.src);
				}
				// Load the new image 
				const img_content = URL.createObjectURL(file);

				img_icon.src = img_content;
			}
		};

		const clear_btn_click = () => {
			img_icon.src = PropertiesEditor.#default_img_src;
		};

		img_input.addEventListener('change', img_input_change);
		clear_btn.addEventListener('click', clear_btn_click);
	}

	/**
	 * Load object transformations into the input fields of the properties panel.
	 * 
	 * @param {Object} transformation_dict - The transformation dictionary containing translation, rotation and scale.
	 */
	loadPropertiesDictionary(properties_dict) {
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
	 * Read the texture properties from the properties panel.
	 * 
	 * @returns {Object} - A texture dictionary with the properties read from the panel, as follows:
	 * 	- {Image} image - An HTML image element containing the texture image.
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

		// Reading image
		const img_element = document.getElementById(PropertiesEditor.#img_element_id);

		let img_return = (img_element.src.endsWith(PropertiesEditor.#default_img_src)) ? null : img_element;

		// Return the image and color
		return { image: img_return, color: color_rgba };
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