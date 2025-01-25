import Vec4 from './Vec4.js';

/**
 * Represents a Camera in a 3D space.
 * 
 * @class
 * @classdesc This class handles the camera's location, target direction, up direction, and right direction in a 3D space.
 * 
 * @property {Vec4} location - The location of the camera.
 * @property {Vec4} target_direction - The target direction of the camera.
 * @property {Vec4} up_direction - The up direction of the camera.
 * @property {Vec4} right_direction - The right direction of the camera.
 * 
 * @constructor
 * @param {Vec4} location - The initial location of the camera.
 * @param {Vec4} [target=Vec4.zAxis()] - The initial target direction of the camera.
 * @param {Vec4} [up=Vec4.yAxis()] - The initial up direction of the camera.
 * 
 * @method get location - Get the location of the camera.
 * @returns {Vec4} The location of the camera.
 * 
 * @method get target_direction - Get the target direction of the camera.
 * @returns {Vec4} The target direction of the camera.
 * 
 * @method get up_direction - Get the up direction of the camera.
 * @returns {Vec4} The up direction of the camera.
 * 
 * @method get right_direction - Get the right direction of the camera.
 * @returns {Vec4} The right direction of the camera.
 * 
 * @method set location - Set the location of the camera.
 * @param {Vec4} value - The new location of the camera.
 * 
 * @method lookAt - Adjust the camera to look at a target point.
 * @param {Vec4} target_point - The point to look at.
 * 
 * @method getCameraMatrix - Get the camera matrix.
 * @returns {Array<number>} The camera matrix.
 * 
 * @method logCameraStats - Log the camera's statistics.
 * @param {Object} log - The logging object.
 */
export default class Camera {
    #location = Vec4.createZero();
    #target_direction = Vec4.createZero();
    #up_direction = Vec4.createZero();
    #right_direction = Vec4.createZero();

    constructor(location, target = Vec4.zAxis(), up = Vec4.yAxis()) {
        this.#location = location;
        this.#target_direction = target;
        this.#up_direction = up;

        this.#right_direction = this.#target_direction.crossProduct(this.#up_direction).normalize();
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

    set location(value) {
        this.#location = value;
    }

    lookAt(target_point) {
        this.#target_direction = target_point.normalize();
        this.#up_direction = new Vec4(this.#target_direction.y, -this.#target_direction.x, this.#target_direction.z, 1);
        this.#right_direction = this.#target_direction.crossProduct(this.#up_direction).normalize();
    }

    getCameraMatrix() {
        const camera_matrix = [
            this.#target_direction.x, this.#target_direction.y, this.#target_direction.z, -this.#location.x,
            this.#up_direction.x, this.#up_direction.y, this.#up_direction.z, -this.#location.y,
            this.#right_direction.x, this.#right_direction.y, this.#right_direction.z, -this.#location.z,
            0, 0, 0, 1
        ];

        return camera_matrix;
    }

    logCameraStats(log) {
        log.log('Camera> Location: ' + this.#location.x + ', ' + this.#location.y + ', ' + this.#location.z);
        log.log('Camera> Target: ' + this.#target_direction.x + ', ' + this.#target_direction.y + ', ' + this.#target_direction.z);
        log.log('Camera> Up: ' + this.#up_direction.x + ', ' + this.#up_direction.y + ', ' + this.#up_direction.z);
        log.log('Camera> Right: ' + this.#right_direction.x + ', ' + this.#right_direction.y + ', ' + this.#right_direction.z);
    }
}