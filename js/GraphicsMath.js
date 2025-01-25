// This helper class only deals with 4x4 matrices and useful math functions for graphics

export default class GraphicsMath {
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
     * Multiplies two 4x4 matrices.
     *
     * @param {Float32Array} A - The first 4x4 matrix.
     * @param {Float32Array} B - The second 4x4 matrix.
     * @returns {Float32Array} The resulting 4x4 matrix after multiplication.
     */
    static multiplyMatrices(A, B) {
        let result = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 0;

                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += A[i * 4 + k] * B[k * 4 + j];
                }
            }
        }

        return result;
    }

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

    static translateMatrix(matrix, x, y, z) {
        // Line 0 column 3
        matrix[0 * 4 + 3] += x;
        // Line 1 column 3
        matrix[1 * 4 + 3] += y;
        // Line 2 column 3
        matrix[2 * 4 + 3] += z;
    }

    /**
     * Creates a projection matrix based on the given field of view, aspect ratio, and near/far clipping planes.
     *
     * @param {number} fov_angle - The field of view angle in degrees.
     * @param {number} aspect_ratio - The aspect ratio of the view (width/height).
     * @param {number} near_z - The distance to the near clipping plane.
     * @param {number} far_z - The distance to the far clipping plane.
     * @returns {Float32Array} A 4x4 projection matrix.
     */
    static createProjectionMatrix(fov_angle, aspect_ratio, near_z, far_z) {
        const fov = Math.tan(this.degToRad(fov_angle) / 2.0);

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