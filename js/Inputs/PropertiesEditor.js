import DoLog from "../Logging/DoLog.js";
import GraphicsMath from "../3DStuff/GraphicsMath.js";

export default class PropertiesEditor extends DoLog {
	#properties_panel_div = null;

	static #position_prop = 'prop_position';
	static #rotation_prop = 'prop_rotation';
	static #scale_prop = 'prop_scale';
	static #texture_prop = 'prop_texture';

	constructor(log) {
		super(log, 'PropertiesEditor> ');
		this.#properties_panel_div = document.getElementById('model_properties');
	}

	/**
	 * Read the properties from the properties panel and return the equivalent transformation matrix.
	 * 
	 * @returns {Float32Array} - The transformation matrix.
	 */
	readTransformationsProperties() {
		const position = this.#readPosition();
		const rotation = this.#readRotation();
		const scale = this.#readScale();

		const s_r = GraphicsMath.multiplyMatrices(rotation, scale);
		const s_r_p = GraphicsMath.multiplyMatrices(position, s_r);

		return s_r_p;
	}

	#readPosition() {
		const position_ul = document.getElementById(PropertiesEditor.#position_prop);
		const p_x = parseFloat(position_ul.querySelector('.x').value);
		const p_y = parseFloat(position_ul.querySelector('.y').value);
		const p_z = parseFloat(position_ul.querySelector('.z').value);

		return GraphicsMath.createTranslationMatrix(p_x, p_y, p_z);
	}

	#readRotation() {
		const rotation_ul = document.getElementById(PropertiesEditor.#rotation_prop);

		const r_x = GraphicsMath.degToRad(parseFloat(rotation_ul.querySelector('.x').value));
		const r_y = GraphicsMath.degToRad(parseFloat(rotation_ul.querySelector('.y').value));
		const r_z = GraphicsMath.degToRad(parseFloat(rotation_ul.querySelector('.z').value));

		const rot_x_m = GraphicsMath.createRotationMatrix(r_x, 'x');
		const rot_y_m = GraphicsMath.createRotationMatrix(r_y, 'y');
		const rot_z_m = GraphicsMath.createRotationMatrix(r_z, 'z');

		const r_x_y = GraphicsMath.multiplyMatrices(rot_x_m, rot_y_m);
		const r_x_y_z = GraphicsMath.multiplyMatrices(r_x_y, rot_z_m);

		return r_x_y_z;
	}

	#readScale() {
		const scale_ul = document.getElementById(PropertiesEditor.#scale_prop);

		const s_x = parseFloat(scale_ul.querySelector('.x').value);
		const s_y = parseFloat(scale_ul.querySelector('.y').value);
		const s_z = parseFloat(scale_ul.querySelector('.z').value);

		return GraphicsMath.createScaleMatrix(s_x, s_y, s_z);
	}

}