import DoLog from "../Logging/DoLog.js";
import GraphicsMath from "../3DStuff/GraphicsMath.js";

export default class PropertiesEditor extends DoLog {
	static #position_prop = 'prop_position';
	static #rotation_prop = 'prop_rotation';
	static #scale_prop = 'prop_scale';
	static #texture_prop = 'prop_texture';

	constructor(log) {
		super(log, 'PropertiesEditor> ');
	}

	/**
	 * Load the transformations into the input fields of the properties panel.
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
	 * @returns {Object} - A transformation dictionary with the properties read from the panel.
	 */
	readTransformationsProperties() {
		const position = this.#readPosition();
		const rotation = this.#readRotation();
		const scale = this.#readScale();

		return { translation: position, rotation: rotation, scale: scale };
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