// This helper class only deals with 4x4 matrices and useful math functions for graphics
export default class GraphicsMath {
    /**
     * Converts degrees to radians.
     *
     * @param {number} degrees - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180.0);
    }

    /**
     * Converts radians to degrees.
     *
     * @param {number} rad - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    static radToDeg(rad) {
        return rad * (180.0 / Math.PI);
    }

    /**
     * Creates and returns a 4x4 identity matrix.
     * 
     * An identity matrix is a square matrix with ones on the main diagonal and zeros elsewhere.
     * This function returns the identity matrix as a Float32Array.
     * 
     * @returns {Float32Array} A 4x4 identity matrix.
     */
    static createIdentityMatrix() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Creates a rotation matrix for a given angle and axis.
     *
     * @param {number} angle - The angle of rotation in radians.
     * @param {string} axis - The axis of rotation ('x', 'y', or 'z').
     * @returns {Float32Array} A 4x4 rotation matrix in column major order.
     */
    static createRotationMatrix(angle, axis) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);

        let matrix = GraphicsMath.createIdentityMatrix();

        if (axis === 'x') {
            matrix = new Float32Array([
                1, 0, 0, 0,
                0, c, -s, 0,
                0, s, c, 0,
                0, 0, 0, 1
            ]);
        } else if (axis === 'y') {
            matrix = new Float32Array([
                c, 0, s, 0,
                0, 1, 0, 0,
                -s, 0, c, 0,
                0, 0, 0, 1
            ]);
        } else if (axis === 'z') {
            matrix = new Float32Array([
                c, -s, 0, 0,
                s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }

        return GraphicsMath.transposeMatrix(matrix);
    }

    /**
     * Creates a translation matrix for the given x, y, and z values.
     * 
     * @param {number} x - The x translation value.
     * @param {number} y - The y translation value.
     * @param {number} z - The z translation value.
     * @returns {Float32Array} A 4x4 translation matrix in column major order.
     */
    static createTranslationMatrix(x, y, z) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    /**
     * Creates a scale matrix for the given x, y, and z values.
     * 
     * @param {number} x - The x scale value.
     * @param {number} y - The y scale value.
     * @param {number} z - The z scale value.
     * @returns {Float32Array} A 4x4 scale matrix in column major order.
     */
    static createScaleMatrix(x, y, z) {
        return new Float32Array([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Multiplies two 4x4 matrices.
     *
     * @param {Float32Array} A - The first 4x4 matrix in column major order.
     * @param {Float32Array} B - The second 4x4 matrix in column major order.
     * @returns {Float32Array} The resulting 4x4 matrix after multiplying A x B. The result is in column major order as well.
     */
    static multiplyMatrices(A, B) {
        let result = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[j * 4 + i] = 0;

                for (let k = 0; k < 4; k++) {
                    result[j * 4 + i] += A[k * 4 + i] * B[j * 4 + k];
                }
            }
        }

        return result;
    }

    /**
     * Transposes a 4x4 matrix.
     *
     * @param {Float32Array} matrix - The 4x4 matrix to transpose.
     * @returns {Float32Array} The transposed 4x4 matrix.
     */
    static transposeMatrix(matrix) {
        let result = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = matrix[j * 4 + i];
            }
        }

        return result;
    }

    /**
     * Translates a 4x4 matrix by the given x, y, and z values.
     * 
     * @param {Float32Array} matrix - The 4x4 matrix to translate in column major order.
     * @param {number} x - The x translation value.
     * @param {number} y - The y translation value.
     * @param {number} z - The z translation value.
     * @returns {Float32Array} The translated 4x4 matrix in column major order.
     */
    static translateMatrix(matrix, x, y, z) {
        let result = new Float32Array(matrix);

        result[12] += x;
        result[13] += y;
        result[14] += z;

        return result;
    }

    /**
     * Creates a projection matrix based on the given field of view, aspect ratio, and near/far clipping planes.
     *
     * @param {number} fov_angle - The field of view angle in degrees.
     * @param {number} aspect_ratio - The aspect ratio of the view (width/height).
     * @param {number} near_z - The distance to the near clipping plane.
     * @param {number} far_z - The distance to the far clipping plane.
     * @returns {Float32Array} A 4x4 projection matrix in column major order.
     */
    static createProjectionMatrix(fov_angle, aspect_ratio, near_z, far_z) {
        const fov = Math.tan(this.degToRad(fov_angle / 2.0));

        const A = (- far_z - near_z) / (near_z - far_z);
        const B = (2.0 * far_z * near_z) / (near_z - far_z);

        const proj_mat = new Float32Array([
            1.0 / (fov * aspect_ratio), 0, 0, 0,
            0, 1.0 / fov, 0, 0,
            0, 0, A, B,
            0, 0, 1.0, 0
        ]);

        return GraphicsMath.transposeMatrix(proj_mat);
    }
}