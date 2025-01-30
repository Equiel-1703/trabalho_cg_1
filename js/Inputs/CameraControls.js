import DoLog from "../Logging/DoLog.js";
import Vec4 from "../3DStuff/Vec4.js";

export default class CameraControls extends DoLog {
	#thumbsticks_values = { camera_rotation: { x: 0, y: 0 }, camera_position: { x: 0, y: 0 } };
	#thumbsticks_active = false;

	#dpad_active = false;
	#dpad_value = 0;

	constructor(log) {
		super(log, 'CameraControls> ');

		this.#initializeThumbsticks();
		this.#initializeDPads();
	}

	readCameraControls() {
		let status_active = this.#thumbsticks_active || this.#dpad_active;

		const thumb_rot = this.#thumbsticks_values.camera_rotation;
		const thumb_pos = this.#thumbsticks_values.camera_position;

		const rotation_speed = (Math.PI / 180); // 1 degree in radians is the maximum rotation speed

		// Create the direction vectors
		let rotation_direction = new Vec4(thumb_rot.x, thumb_rot.y, 0, 1);
		let move_direction = new Vec4(thumb_pos.x, this.#dpad_value, (-thumb_pos.y), 1);

		// Normalize the direction vector if length is greater than 1.
		// This will allow smooth rotation if the thumbstick is not moved to the limit.
		const rotation_length = rotation_direction.length();
		const move_length = move_direction.length();
		if (rotation_length > 1) {
			rotation_direction = rotation_direction.normalize();
		}
		if (move_length > 1) {
			move_direction = move_direction.normalize();
		}

		const rotation_vector = rotation_direction.scale(rotation_speed);

		let controls_values = {
			camera_rotation: { x: rotation_vector.x, y: rotation_vector.y },
			camera_move_direction: move_direction
		};

		// Return the values
		return { status_active, controls_values };
	}

	#initializeThumbsticks() {
		const thumb_cam_rot = document.getElementById('thumb_btn_rotation');
		const thumb_cam_pos = document.getElementById('thumb_btn_position');

		const thumbs_btns = [thumb_cam_rot, thumb_cam_pos];

		let moving = false;
		let target_stick = null;

		let starting_pos = { x: 0, y: 0 };
		let starting_transform = { x: 0, y: 0 };

		const transform_limit = 35;
		const thumb_btn_transition = 'thumb_btn_transition';

		// Helper functions
		const set_thumb_translation = (x, y) => {
			target_stick.style.transform = `translate(${x}px, ${y}px)`;
		};
		const get_thumb_translation = () => {
			if (target_stick.style.transform.length > 0) {
				let transform_content = target_stick.style.transform.split('(')[1].split(')')[0].split(',');
				return { x: parseFloat(transform_content[0]), y: parseFloat(transform_content[1]) };
			} else {
				return { x: 0, y: 0 };
			}
		};

		// Events functions
		const evnt_mousedown = (e) => {
			target_stick = e.target;

			// Reset thumbsticks values
			this.#thumbsticks_values.camera_rotation = { x: 0, y: 0 };
			this.#thumbsticks_values.camera_position = { x: 0, y: 0 };

			target_stick.classList.remove(thumb_btn_transition);

			starting_pos = { x: e.x, y: e.y };
			starting_transform = get_thumb_translation();

			moving = true;
			this.#thumbsticks_active = true;
		};

		const evnt_mouseup = () => {
			if (target_stick) {
				target_stick.classList.add(thumb_btn_transition);
				set_thumb_translation(0, 0);

				// Reset thumbsticks values
				this.#thumbsticks_values.camera_rotation = { x: 0, y: 0 };
				this.#thumbsticks_values.camera_position = { x: 0, y: 0 };

				moving = false;
				this.#thumbsticks_active = false;
				target_stick = null;
			}
		};

		const evnt_mousemove = (e) => {
			if (moving) {
				const diff_x = e.x - starting_pos.x;
				const diff_y = e.y - starting_pos.y;

				let new_transform_x = starting_transform.x + diff_x;
				let new_transform_y = starting_transform.y + diff_y;

				if (Math.abs(new_transform_x) > transform_limit) {
					new_transform_x = Math.sign(new_transform_x) * transform_limit;
				}

				if (Math.abs(new_transform_y) > transform_limit) {
					new_transform_y = Math.sign(new_transform_y) * transform_limit;
				}

				set_thumb_translation(new_transform_x, new_transform_y);

				// Here we will convert the thumbstick values to a normalized range from -1 to 1
				const x_normalized = new_transform_x / transform_limit;
				const y_normalized = new_transform_y / transform_limit;

				if (target_stick === thumb_cam_rot) {
					this.#thumbsticks_values.camera_rotation = { x: x_normalized, y: y_normalized };
				} else {
					this.#thumbsticks_values.camera_position = { x: x_normalized, y: y_normalized };
				}
			}
		};

		// Adding events
		thumbs_btns.forEach((btn) => {
			btn.addEventListener('mousedown', evnt_mousedown);
		});

		document.addEventListener('mouseup', evnt_mouseup);
		document.addEventListener('mousemove', evnt_mousemove);

		this.LOG('Thumbsticks initialized', 'success');
	}

	#initializeDPads() {
		const up_id = 'dpad_up';
		const down_id = 'dpad_down';

		const dpad_up = document.getElementById(up_id);
		const dpad_down = document.getElementById(down_id);
		const dpads = [dpad_up, dpad_down];

		const dpad_pressed_src = './imgs/dpad_pressed.png';
		const dpad_released_src = './imgs/dpad.png';

		let target_dpad = null;

		const evnt_mousedown = (e) => {
			target_dpad = e.target;

			if (target_dpad.id === up_id) {
				this.#dpad_value = 1;
			} else if (target_dpad.id === down_id) {
				this.#dpad_value = -1;
			}

			this.#dpad_value;

			target_dpad.attributes.src.value = dpad_pressed_src;
			this.#dpad_active = true;
		}

		const evnt_mouseup = () => {
			this.#dpad_active = false;

			if (target_dpad) {
				target_dpad.attributes.src.value = dpad_released_src;
				this.#dpad_value = 0;

				target_dpad = null;
			}
		}

		for (let d in dpads) {
			dpads[d].addEventListener('mousedown', evnt_mousedown);
		}

		document.addEventListener('mouseup', evnt_mouseup);

		this.LOG('DPads initialized', 'success');
	}
}