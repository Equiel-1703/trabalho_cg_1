import GraphicsMath from './GraphicsMath.js';
import Vec4 from './Vec4.js';

/**
 * Represents a Camera in 3D space.
 * @class
 */
export default class Camera {
    #location = Vec4.createZeroPoint();

    #target_direction = Vec4.createZeroPoint();
    #up_direction = Vec4.createZeroPoint();
    #right_direction = Vec4.createZeroPoint();

    #camera_matrix = GraphicsMath.createIdentityMatrix();

    #angle_x = 0;
    #angle_y = 0;
    #camera_rotation_matrix = GraphicsMath.createIdentityMatrix();

    #move_direction_world = Vec4.createZeroPoint();
    #move_amount = 0;

    constructor(location = Vec4.createZeroPoint()) {
        this.#location = location;

        this.#target_direction = new Vec4(0, 0, 1, 0);
        this.#up_direction = new Vec4(0, 1, 0, 0);
        this.#right_direction = new Vec4(1, 0, 0, 0);

        // Calculate the camera matrix
        this.#camera_matrix = this.#calculateCameraMatrix();
    }

    #calculateCameraMatrix() {
        const camera_matrix = [
            this.#right_direction.x, this.#right_direction.y, this.#right_direction.z, 0,
            this.#up_direction.x, this.#up_direction.y, this.#up_direction.z, 0,
            this.#target_direction.x, this.#target_direction.y, this.#target_direction.z, 0,
            0, 0, 0, 1
        ];

        return GraphicsMath.transposeMatrix(camera_matrix);
    }

    get location() {
        return this.#location;
    }

    get target_direction() {
        return this.#target_direction;
    }

    get up_direction() {
        return this.#up_direction;
    }

    get right_direction() {
        return this.#right_direction;
    }

    move(direction, amount) {
        this.#move_direction_world = direction;
        this.#move_amount = amount;

        const move = this.#move_direction_world.scale(this.#move_amount);

        this.#location = this.#location.add(move);
    }

    rotate(angle, axis) {
        if (axis === 'x') {
            this.#angle_x += angle;
        } else if (axis === 'y') {
            this.#angle_y += angle;
        }

        const rotation_x = GraphicsMath.createRotationMatrix(this.#angle_x, 'x');
        const rotation_y = GraphicsMath.createRotationMatrix(this.#angle_y, 'y');

        // Update the camera rotation matrix
        this.#camera_rotation_matrix = GraphicsMath.multiplyMatrices(rotation_x, rotation_y);
    }

    getCameraMatrix() {
        const camera_translation = GraphicsMath.createTranslationMatrix(-this.#location.x, -this.#location.y, -this.#location.z);
        const camera_transform = GraphicsMath.multiplyMatrices(this.#camera_rotation_matrix, camera_translation);

        const final_matrix = GraphicsMath.multiplyMatrices(this.#camera_matrix, camera_transform);

        return final_matrix;
    }

    logCameraStats(log) {
        log.log('Camera> Location: ' + this.#location.x + ', ' + this.#location.y + ', ' + this.#location.z);
        log.log('Camera> Target: ' + this.#target_direction.x + ', ' + this.#target_direction.y + ', ' + this.#target_direction.z);
        log.log('Camera> Up: ' + this.#up_direction.x + ', ' + this.#up_direction.y + ', ' + this.#up_direction.z);
        log.log('Camera> Right: ' + this.#right_direction.x + ', ' + this.#right_direction.y + ', ' + this.#right_direction.z);
    }
}